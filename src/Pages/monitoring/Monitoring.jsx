import { useEffect, useMemo, useState } from "react";
import { theme, Flex, Select, Spin, message, Modal, Input } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import StudentStatusGrid from "../../MyComponents/monitoring/StudentStatusGrid";
import AlertFeed from "../../MyComponents/monitoring/AlertFeed";
import HubConnectionBadge from "../../MyComponents/monitoring/HubConnectionBadge";
import WatchStreamModal from "../../MyComponents/monitoring/WatchStreamModal";
import useSessionStore from "../../store/useSessionStore";
import useAlertsStore from "../../store/useAlertsStore";
import useAuthStore from "../../store/useAuthStore";
import useMonitoringHubStore from "../../store/useMonitoringHubStore";
import useMonitoringRosterStore from "../../store/useMonitoringRosterStore";
import { ALERT_TYPE_CONFIG } from "../../utils/alertUtils";
import { ALERT_TYPE_MAP } from "../../utils/alertMappers";
import { PRESENCE_REFRESH_INTERVAL_MS } from "../../utils/monitoringHealth";

/** Survives React Strict Mode remount so we don't abort SignalR negotiate. */
let hubMountGeneration = 0;

function promptText({ title, placeholder, okText, danger = false }) {
  return new Promise((resolve) => {
    let value = "";
    Modal.confirm({
      title,
      content: (
        <Input.TextArea
          rows={3}
          placeholder={placeholder}
          onChange={(e) => {
            value = e.target.value;
          }}
          autoFocus
        />
      ),
      okText,
      okButtonProps: danger ? { danger: true } : undefined,
      onOk: () => {
        const trimmed = value.trim();
        if (!trimmed) {
          message.error("Please enter a non-empty value.");
          return Promise.reject();
        }
        resolve(trimmed);
      },
      onCancel: () => resolve(null),
    });
  });
}

export default function Monitoring() {
  const { token } = theme.useToken();
  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const alerts = useAlertsStore((state) => state.alerts);
  const fetchAlertsForSession = useAlertsStore(
    (state) => state.fetchAlertsForSession,
  );
  const dismissAlertApi = useAlertsStore((state) => state.dismissAlertApi);
  const warnAlertApi = useAlertsStore((state) => state.warnAlertApi);
  const escalateAlertApi = useAlertsStore((state) => state.escalateAlertApi);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const accessToken = useAuthStore((state) => state.accessToken);

  const connectionState = useMonitoringHubStore((s) => s.connectionState);
  const connectedStudentSessionIds = useMonitoringHubStore(
    (s) => s.connectedStudentSessionIds,
  );
  const activeWatch = useMonitoringHubStore((s) => s.activeWatch);
  const remoteStream = useMonitoringHubStore((s) => s.remoteStream);
  const connect = useMonitoringHubStore((s) => s.connect);
  const disconnect = useMonitoringHubStore((s) => s.disconnect);
  const joinExamSession = useMonitoringHubStore((s) => s.joinExamSession);
  const startWatch = useMonitoringHubStore((s) => s.startWatch);
  const endWatch = useMonitoringHubStore((s) => s.endWatch);

  const rosterStudents = useMonitoringRosterStore((s) => s.studentsBySessionId);
  const loadingSessionId = useMonitoringRosterStore((s) => s.loadingSessionId);
  const fetchSessionStudents = useMonitoringRosterStore(
    (s) => s.fetchSessionStudents,
  );

  const canAct = hasPermission("MonitorExamSession");

  const activeSessions = sessions.filter(
    (session) => String(session.status ?? "").toUpperCase() === "ACTIVE",
  );
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const selectedSession =
    activeSessions.find((s) => s.id === selectedSessionId) ??
    activeSessions[0] ??
    null;

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Hub lifecycle — defer disconnect past Strict Mode double-invoke.
  useEffect(() => {
    if (!accessToken) return undefined;

    const gen = ++hubMountGeneration;
    let cancelled = false;

    (async () => {
      try {
        await connect();
      } catch {
        if (!cancelled && gen === hubMountGeneration) {
          message.warning(
            "Could not connect to the monitoring hub. Sign out and back in as admin, then reopen Live Monitoring.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      window.setTimeout(() => {
        if (gen === hubMountGeneration) {
          void disconnect();
        }
      }, 0);
    };
  }, [accessToken, connect, disconnect]);

  // REST roster + session alert prefetch.
  useEffect(() => {
    if (!selectedSession?.id) return;

    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          fetchSessionStudents(selectedSession.id),
          fetchAlertsForSession(selectedSession.id),
        ]);
      } catch (e) {
        if (!cancelled) {
          message.error(
            e?.message === "NOT_ASSIGNED"
              ? "You are not assigned to this exam session."
              : "Failed to load monitoring roster.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSession?.id, fetchSessionStudents, fetchAlertsForSession]);

  // Presence safety net: REST re-fetch so lastHeartbeatAtUtc cannot freeze if a
  // hub StudentStatusChanged is missed (hub push remains the primary path).
  useEffect(() => {
    if (!selectedSession?.id) return undefined;

    const sessionId = selectedSession.id;
    const id = window.setInterval(() => {
      void fetchSessionStudents(sessionId, { silent: true }).catch(() => {});
    }, PRESENCE_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [selectedSession?.id, fetchSessionStudents]);

  // Join hub session group once connected.
  useEffect(() => {
    if (!selectedSession?.id || connectionState !== "connected") return;

    let cancelled = false;
    (async () => {
      try {
        await joinExamSession(selectedSession.id);
      } catch (e) {
        if (!cancelled) {
          message.error(
            e?.message === "NOT_ASSIGNED"
              ? "You are not assigned to this exam session."
              : "Failed to join the monitoring hub session.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSession?.id, connectionState, joinExamSession]);

  const sessionOptions = activeSessions.map((session) => ({
    value: session.id,
    label: `${session.sessionTitle} · ${session.courseCode}`,
  }));

  const sessionAlerts = alerts
    .filter(
      (alert) =>
        selectedSession?.id != null &&
        Number(alert.sessionId) === Number(selectedSession.id),
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const rosterSessionId = selectedSession?.id;
  const monitoringStudents = useMemo(() => {
    if (rosterSessionId == null) return [];
    const rows = rosterStudents[String(rosterSessionId)] ?? [];
    return rows.map((row) => {
      const sid = Number(row.studentSessionId);
      const studentAlerts = sessionAlerts.filter(
        (alert) =>
          Number(alert.studentSessionId) === sid ||
          alert.studentId === row.studentId ||
          alert.student === row.studentName,
      );
      const latestType = row.latestAlertType;
      const mappedLatestType =
        latestType &&
        (ALERT_TYPE_MAP[latestType] ??
          (ALERT_TYPE_CONFIG[latestType] ? latestType : null));
      const latestAlert =
        studentAlerts[0] ??
        (mappedLatestType ? { type: mappedLatestType } : null);

      return {
        studentSessionId: sid,
        studentId: row.studentId,
        name: row.studentName,
        studentName: row.studentName,
        id: row.studentNumber,
        studentNumber: row.studentNumber,
        status: row.status,
        loginAt: row.loginAt,
        pipelineStatus: row.pipelineStatus,
        lastHeartbeatAtUtc: row.lastHeartbeatAtUtc,
        alertCount: row.openAlertCount || studentAlerts.length,
        latestAlert,
        hubOnline: !!connectedStudentSessionIds[sid],
        watchBusy:
          activeWatch != null &&
          Number(activeWatch.studentSessionId) !== sid &&
          activeWatch.peerState !== "failed",
      };
    });
  }, [
    rosterSessionId,
    rosterStudents,
    sessionAlerts,
    connectedStudentSessionIds,
    activeWatch,
  ]);

  const watchedStudent = monitoringStudents.find(
    (s) =>
      activeWatch &&
      Number(s.studentSessionId) === Number(activeWatch.studentSessionId),
  );

  const handleDismiss = async (alert) => {
    const success = await dismissAlertApi(alert.id);
    if (success) {
      message.success(`Alert dismissed for ${alert.student}.`);
    }
  };

  const handleWarn = async (alert) => {
    const text = await promptText({
      title: `Warn ${alert.student}`,
      placeholder: "Warning message shown on the student exam screen",
      okText: "Send warning",
    });
    if (!text) return;

    const result = await warnAlertApi(alert.id, text);
    if (result.success) {
      message.success(result.message || `Warning sent to ${alert.student}.`);
    } else {
      message.error(result.error);
    }
  };

  const handleEscalate = async (alert) => {
    const reason = await promptText({
      title: `Terminate ${alert.student}'s attempt?`,
      placeholder: "Reason for termination (required)",
      okText: "Escalate & terminate",
      danger: true,
    });
    if (!reason) return;

    const result = await escalateAlertApi(alert.id, reason);
    if (result.success) {
      message.success(result.message || `Session terminated for ${alert.student}.`);
      void fetchSessionStudents(selectedSession.id).catch(() => {});
    } else {
      message.error(result.error);
    }
  };

  const handleWatch = (student) => {
    if (!canAct) return;
    if (
      activeWatch &&
      Number(activeWatch.studentSessionId) === Number(student.studentSessionId)
    ) {
      return;
    }
    void startWatch(student.studentSessionId);
  };

  const rosterLoading =
    selectedSession &&
    loadingSessionId === String(selectedSession.id) &&
    !(rosterStudents[String(selectedSession.id)]?.length);

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              boxShadow: `0 6px 16px -6px ${token.colorPrimary}`,
              flexShrink: 0,
            }}
          >
            <VideoCameraOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Live Monitoring
            </MyTitle>
            <MyText type="secondary">
              Real-time student activity during active sessions.
            </MyText>
          </Flex>
        </Flex>

        <Flex align="center" gap={16} wrap="wrap">
          <Select
            value={selectedSession?.id ?? null}
            onChange={setSelectedSessionId}
            options={sessionOptions}
            placeholder="No active sessions"
            style={{ minWidth: 240 }}
            notFoundContent="No active sessions"
          />
          <HubConnectionBadge connectionState={connectionState} />
        </Flex>
      </Flex>

      {!selectedSession ? (
        <MyText type="secondary">No sessions are currently active.</MyText>
      ) : (
        <MyRow gutter={[20, 20]}>
          <MyCol xs={24} lg={16}>
            {rosterLoading ? (
              <Flex justify="center" style={{ padding: 48 }}>
                <Spin />
              </Flex>
            ) : (
              <StudentStatusGrid
                students={monitoringStudents}
                canWatch={canAct}
                hubConnected={connectionState === "connected"}
                activeWatchStudentSessionId={activeWatch?.studentSessionId}
                onWatch={handleWatch}
              />
            )}
          </MyCol>
          <MyCol xs={24} lg={8}>
            <AlertFeed
              alerts={sessionAlerts}
              canAct={canAct}
              onDismiss={handleDismiss}
              onWarn={handleWarn}
              onEscalate={handleEscalate}
            />
          </MyCol>
        </MyRow>
      )}

      <WatchStreamModal
        open={!!activeWatch}
        studentName={watchedStudent?.name}
        studentNumber={watchedStudent?.studentNumber}
        peerState={activeWatch?.peerState ?? "connecting"}
        remoteStream={remoteStream}
        onEnd={() => void endWatch()}
      />
    </Flex>
  );
}
