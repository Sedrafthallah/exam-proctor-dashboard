import { useEffect, useMemo, useState } from "react";
import { theme, Flex, Select, Spin, message } from "antd";
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

/** Survives React Strict Mode remount so we don't abort SignalR negotiate. */
let hubMountGeneration = 0;

export default function Monitoring() {
  const { token } = theme.useToken();
  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const alerts = useAlertsStore((state) => state.alerts);
  const fetchAlerts = useAlertsStore((state) => state.fetchAlerts);
  const updateAlertStatus = useAlertsStore((state) => state.updateAlertStatus);
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
    fetchAlerts();
  }, [fetchSessions, fetchAlerts]);

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

  // REST roster — independent of hub (students must show even when WSS is down).
  useEffect(() => {
    if (!selectedSession?.id) return;

    let cancelled = false;
    (async () => {
      try {
        await fetchSessionStudents(selectedSession.id);
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
    .filter((alert) => alert.sessionTitle === selectedSession?.sessionTitle)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const rosterSessionId = selectedSession?.id;
  const monitoringStudents = useMemo(() => {
    if (rosterSessionId == null) return [];
    const rows = rosterStudents[String(rosterSessionId)] ?? [];
    return rows.map((row) => {
      const sid = Number(row.studentSessionId);
      const studentAlerts = sessionAlerts.filter(
        (alert) =>
          alert.studentId === row.studentNumber ||
          alert.student === row.studentName,
      );
      const latestType = row.latestAlertType;
      const latestAlert =
        studentAlerts[0] ??
        (latestType && ALERT_TYPE_CONFIG[latestType]
          ? { type: latestType }
          : latestType
            ? { type: latestType }
            : null);

      return {
        studentSessionId: sid,
        studentId: row.studentId,
        name: row.studentName,
        studentName: row.studentName,
        id: row.studentNumber,
        studentNumber: row.studentNumber,
        status: row.status,
        loginAt: row.loginAt,
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

  const handleDismiss = (alert) => {
    updateAlertStatus(alert.id, "Resolved");
    message.success(`Alert dismissed for ${alert.student}.`);
  };

  const handleWarn = (alert) => {
    message.success(`Warning sent to ${alert.student}.`);
  };

  const handleEscalate = (alert) => {
    updateAlertStatus(alert.id, "Escalated");
    message.success(`Alert escalated for ${alert.student}.`);
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
