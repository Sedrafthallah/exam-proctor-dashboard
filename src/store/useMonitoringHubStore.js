import { create } from "zustand";
import { message } from "antd";
import {
  bindHubHandlers,
  getMonitoringConnection,
  hubInvoke,
  startConnection,
  stopConnection,
} from "../api/signalrClient";
import { getIceServers } from "../api/iceServersApi";
import { rejectMessage } from "../utils/streamWatchCopy";

/** Module-scoped PC — not held in Zustand to avoid re-render storms. */
let peerConnection = null;
let pendingRemoteIce = [];
let pendingOffer = null;
let lifecycleBound = false;
/** Ignores stale connect() failures from React Strict Mode double-invoke. */
let connectEpoch = 0;

async function closePeerConnection({ clearPending = true } = {}) {
  if (clearPending) {
    pendingRemoteIce = [];
    pendingOffer = null;
  }
  const pc = peerConnection;
  peerConnection = null;
  if (!pc) return;
  try {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    await pc.close();
  } catch {
    /* ignore */
  }
}

const useMonitoringHubStore = create((set, get) => ({
  connectionState: "disconnected",
  joinedExamSessionId: null,
  /** Record of connected studentSessionId → true */
  connectedStudentSessionIds: {},
  activeWatch: null,
  remoteStream: null,
  lastReject: null,

  isStudentHubOnline: (studentSessionId) => {
    const id = Number(studentSessionId);
    return !!get().connectedStudentSessionIds[id];
  },

  connect: async () => {
    const handlerMap = {
      StudentHubPresenceSnapshot: (payload) => {
        const ids = payload?.connectedStudentSessionIds ?? [];
        const next = {};
        for (const id of ids) next[Number(id)] = true;
        set({ connectedStudentSessionIds: next });
      },
      StudentHubConnected: (payload) => {
        const id = Number(payload?.studentSessionId);
        if (!Number.isFinite(id)) return;
        set((s) => ({
          connectedStudentSessionIds: {
            ...s.connectedStudentSessionIds,
            [id]: true,
          },
        }));
      },
      StudentHubDisconnected: (payload) => {
        const id = Number(payload?.studentSessionId);
        if (!Number.isFinite(id)) return;
        set((s) => {
          const next = { ...s.connectedStudentSessionIds };
          delete next[id];
          return { connectedStudentSessionIds: next };
        });
        const watch = get().activeWatch;
        if (watch && Number(watch.studentSessionId) === id) {
          void get().endWatch({ reason: "student_disconnected" });
        }
      },
      StreamOffer: (payload) => {
        void get()._handleOffer(payload);
      },
      IceCandidate: (payload) => {
        void get()._handleRemoteIce(payload);
      },
      StreamWatchEnded: (payload) => {
        const watch = get().activeWatch;
        if (!watch) return;
        if (
          payload?.watchId &&
          String(payload.watchId) !== String(watch.watchId)
        ) {
          return;
        }
        void get().endWatch({ silent: true, skipHub: true });
        message.info("Live watch ended.");
      },
      StreamWatchRejected: (payload) => {
        const code = payload?.code;
        message.error(rejectMessage(code, payload?.message));
        set({ lastReject: payload ?? null });
        void get().endWatch({ silent: true, skipHub: true });
      },
    };

    set({ connectionState: "connecting" });
    const epoch = ++connectEpoch;
    try {
      // Start first so a Strict Mode rebuild yields the live connection,
      // then attach handlers / lifecycle to that instance.
      await startConnection();
      if (epoch !== connectEpoch) return;

      const conn = getMonitoringConnection();
      bindHubHandlers(handlerMap);

      if (!lifecycleBound) {
        lifecycleBound = true;
        conn.onreconnecting(() => set({ connectionState: "reconnecting" }));
        conn.onreconnected(async () => {
          set({ connectionState: "connected" });
          const sessionId = get().joinedExamSessionId;
          if (sessionId != null) {
            try {
              await hubInvoke("JoinSession", Number(sessionId));
            } catch (e) {
              console.warn("Re-JoinSession failed", e);
            }
          }
        });
        conn.onclose(() => {
          lifecycleBound = false;
          set({
            connectionState: "disconnected",
            connectedStudentSessionIds: {},
          });
          void get().endWatch({ silent: true, skipHub: true });
        });
      }

      set({ connectionState: "connected" });
    } catch (e) {
      if (epoch !== connectEpoch) return;
      console.error("MonitoringHub connect failed", e);
      set({ connectionState: "disconnected" });
      throw e;
    }
  },

  disconnect: async () => {
    const sessionId = get().joinedExamSessionId;
    if (sessionId != null) {
      try {
        await hubInvoke("LeaveSession", Number(sessionId));
      } catch {
        /* ignore */
      }
    }
    await get().endWatch({ silent: true, skipHub: true });
    await stopConnection();
    set({
      connectionState: "disconnected",
      joinedExamSessionId: null,
      connectedStudentSessionIds: {},
    });
  },

  joinExamSession: async (examSessionId) => {
    const id = Number(examSessionId);
    if (!Number.isFinite(id)) return;

    if (get().connectionState !== "connected") {
      await get().connect();
    }

    const previous = get().joinedExamSessionId;
    if (previous != null && previous !== id) {
      try {
        await hubInvoke("LeaveSession", Number(previous));
      } catch {
        /* ignore */
      }
      await get().endWatch({ silent: true });
      set({ connectedStudentSessionIds: {} });
    }

    await hubInvoke("JoinSession", id);
    set({ joinedExamSessionId: id });
  },

  leaveExamSession: async () => {
    const id = get().joinedExamSessionId;
    if (id == null) return;
    await get().endWatch({ silent: true });
    try {
      await hubInvoke("LeaveSession", Number(id));
    } catch {
      /* ignore */
    }
    set({ joinedExamSessionId: null, connectedStudentSessionIds: {} });
  },

  startWatch: async (studentSessionId) => {
    const sid = Number(studentSessionId);
    if (!Number.isFinite(sid)) {
      message.error("Invalid student session.");
      return;
    }

    if (get().connectionState !== "connected") {
      message.warning("Hub is not connected.");
      return;
    }

    if (!get().isStudentHubOnline(sid)) {
      message.warning("Student is offline on the hub.");
      return;
    }

    if (get().activeWatch) {
      await get().endWatch({ silent: true });
    }

    set({
      activeWatch: {
        watchId: null,
        studentSessionId: sid,
        peerState: "connecting",
      },
      remoteStream: null,
      lastReject: null,
    });

    try {
      const [result, iceServers] = await Promise.all([
        hubInvoke("RequestStreamWatch", sid),
        getIceServers(),
      ]);
      const watchId = result?.watchId ?? result?.WatchId;
      if (!watchId) {
        throw new Error("Missing watchId");
      }

      // Publish watchId before PC setup so early StreamOffer/ICE can match.
      set({
        activeWatch: {
          watchId,
          studentSessionId: sid,
          peerState: "connecting",
        },
      });

      // Close any leftover PC without dropping a queued offer for this watch.
      await closePeerConnection({ clearPending: false });

      const pc = new RTCPeerConnection({
        iceServers,
        sdpSemantics: "unified-plan",
      });
      peerConnection = pc;

      pc.addTransceiver("video", { direction: "recvonly" });

      pc.ontrack = (event) => {
        const stream =
          event.streams?.[0] ?? new MediaStream([event.track]);
        set({ remoteStream: stream });
      };

      pc.onicecandidate = (event) => {
        const watch = get().activeWatch;
        if (!watch?.watchId) return;
        // Skip end-of-candidates (null) — Flutter native RTCIceCandidate
        // crashes on NSNull sdp/sdpMid.
        if (!event.candidate?.candidate) return;
        void hubInvoke("IceCandidate", {
          watchId: watch.watchId,
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid ?? null,
          sdpMLineIndex: event.candidate.sdpMLineIndex ?? null,
        }).catch((err) => console.warn("IceCandidate send failed", err));
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") {
          set((s) =>
            s.activeWatch
              ? {
                  activeWatch: { ...s.activeWatch, peerState: "live" },
                }
              : {},
          );
        } else if (state === "failed" || state === "disconnected") {
          set((s) =>
            s.activeWatch
              ? {
                  activeWatch: { ...s.activeWatch, peerState: "failed" },
                }
              : {},
          );
        }
      };

      if (
        pendingOffer &&
        String(pendingOffer.watchId) === String(watchId)
      ) {
        const offer = pendingOffer;
        pendingOffer = null;
        await get()._handleOffer(offer);
      }
    } catch (e) {
      console.error("startWatch failed", e);
      await get().endWatch({ silent: true, skipHub: true });
      if (e?.message !== "HUB_NOT_CONNECTED") {
        message.error("Could not start live watch.");
      }
    }
  },

  _handleOffer: async (payload) => {
    const watch = get().activeWatch;
    if (!watch?.watchId || !payload?.watchId) return;
    if (String(payload.watchId) !== String(watch.watchId)) return;

    const pc = peerConnection;
    if (!pc) {
      pendingOffer = payload;
      return;
    }

    try {
      await pc.setRemoteDescription({
        type: payload.sdpType || "offer",
        sdp: payload.sdp,
      });

      for (const ice of pendingRemoteIce) {
        try {
          if (ice?.candidate == null && ice?.sdpMid == null) {
            await pc.addIceCandidate(null);
          } else {
            await pc.addIceCandidate(ice);
          }
        } catch (err) {
          console.warn("Queued ICE apply failed", err);
        }
      }
      pendingRemoteIce = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await hubInvoke("StreamAnswer", {
        watchId: watch.watchId,
        sdp: answer.sdp,
        sdpType: answer.type || "answer",
      });
    } catch (e) {
      console.error("handleOffer failed", e);
      set((s) =>
        s.activeWatch
          ? { activeWatch: { ...s.activeWatch, peerState: "failed" } }
          : {},
      );
      message.error("Failed to negotiate the live stream.");
    }
  },

  _handleRemoteIce: async (payload) => {
    const watch = get().activeWatch;
    if (!watch?.watchId || !payload?.watchId) return;
    if (String(payload.watchId) !== String(watch.watchId)) return;

    const candidateInit =
      payload.candidate == null &&
      payload.sdpMid == null &&
      payload.sdpMLineIndex == null
        ? null
        : {
            candidate: payload.candidate ?? undefined,
            sdpMid: payload.sdpMid ?? undefined,
            sdpMLineIndex: payload.sdpMLineIndex ?? undefined,
          };

    const pc = peerConnection;
    if (!pc || !pc.remoteDescription) {
      pendingRemoteIce.push(candidateInit);
      return;
    }

    try {
      await pc.addIceCandidate(candidateInit);
    } catch (e) {
      console.warn("addIceCandidate failed", e);
    }
  },

  endWatch: async ({ silent = false, skipHub = false, reason } = {}) => {
    const watch = get().activeWatch;
    const watchId = watch?.watchId;

    await closePeerConnection();
    set({ activeWatch: null, remoteStream: null });

    if (!skipHub && watchId) {
      try {
        await hubInvoke("EndStreamWatch", watchId);
      } catch (e) {
        console.warn("EndStreamWatch failed", e);
      }
    }

    if (!silent && reason) {
      message.info(`Watch ended (${reason}).`);
    }
  },
}));

export default useMonitoringHubStore;
