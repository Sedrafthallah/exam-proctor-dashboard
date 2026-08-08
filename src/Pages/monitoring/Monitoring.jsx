import { useState } from "react";
import { theme, Flex, Badge, Select, message } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import StudentStatusGrid from "../../MyComponents/monitoring/StudentStatusGrid";
import AlertFeed from "../../MyComponents/monitoring/AlertFeed";
import useSessionStore from "../../store/useSessionStore";
import useStudentStore from "../../store/useStudentStore";
import useAlertsStore from "../../store/useAlertsStore";
import useAuthStore from "../../store/useAuthStore";
import { getSessionStatus } from "../../utils/sessionUtils";

// Monitoring-only overlay (login state during the exam) for the roster in
// useStudentStore — not real session-attendance data, since the backend
// doesn't exist yet. Keyed by student id, linked to the live DB202 session.
const MONITORING_STATUS = {
  "S-20211847": { status: "ACTIVE", loginTime: "09:02" }, // Layla Mansour
  "S-20210934": { status: "ACTIVE", loginTime: "09:00" }, // Omar Khalil
  "S-20213302": { status: "ACTIVE", loginTime: "09:03" }, // Nour Haidar
  "S-20209981": { status: "PENDING_AUTH", loginTime: null }, // Yousef Aziz
  "S-20214410": { status: "ACTIVE", loginTime: "08:58" }, // Sara Deeb
  "S-20211205": { status: "ACTIVE", loginTime: "09:02" }, // Karim Nseir
  "S-20212876": { status: "ACTIVE", loginTime: "09:01" }, // Dima Suleiman
  "S-20210467": { status: "TERMINATED", loginTime: "08:55" }, // Bassel Rahal
};

export default function Monitoring() {
  const { token } = theme.useToken();
  const sessions = useSessionStore((state) => state.sessions);
  const students = useStudentStore((state) => state.students);
  const alerts = useAlertsStore((state) => state.alerts);
  const updateAlertStatus = useAlertsStore((state) => state.updateAlertStatus);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const canAct = hasPermission("MonitorExamSession");

  const activeSessions = sessions.filter((session) => getSessionStatus(session) === "ACTIVE");
  const [selectedSessionId, setSelectedSessionId] = useState(activeSessions[0]?.id ?? null);
  const selectedSession = activeSessions.find((s) => s.id === selectedSessionId) ?? activeSessions[0] ?? null;

  const sessionOptions = activeSessions.map((session) => ({
    value: session.id,
    label: `${session.sessionTitle} · ${session.courseCode}`,
  }));

  const sessionAlerts = alerts
    .filter((alert) => alert.sessionTitle === selectedSession?.sessionTitle)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const monitoringStudents = Object.keys(MONITORING_STATUS)
    .map((studentId) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return null;

      const overlay = MONITORING_STATUS[studentId];
      const studentAlerts = sessionAlerts.filter((alert) => alert.studentId === studentId);

      return {
        ...student,
        status: overlay.status,
        loginTime: overlay.loginTime,
        alertCount: studentAlerts.length,
        latestAlert: studentAlerts[0] ?? null,
      };
    })
    .filter(Boolean);

  const handleDismiss = (alert) => {
    updateAlertStatus(alert.id, "RESOLVED");
    message.success(`Alert dismissed for ${alert.student}.`);
  };

  const handleWarn = (alert) => {
    message.success(`Warning sent to ${alert.student}.`);
  };

  const handleEscalate = (alert) => {
    updateAlertStatus(alert.id, "ESCALATED");
    message.success(`Alert escalated for ${alert.student}.`);
  };

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
            <MyText type="secondary">Real-time student activity during active sessions.</MyText>
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
          <Flex align="center" gap={6}>
            <Badge status="processing" color={token.colorSuccess} />
            <MyText type="secondary" style={{ fontSize: 11, fontWeight: 500, fontFamily: "monospace" }}>
              WSS live
            </MyText>
          </Flex>
        </Flex>
      </Flex>

      {!selectedSession ? (
        <MyText type="secondary">No sessions are currently active.</MyText>
      ) : (
        <MyRow gutter={[20, 20]}>
          <MyCol xs={24} lg={16}>
            <StudentStatusGrid students={monitoringStudents} />
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
    </Flex>
  );
}
