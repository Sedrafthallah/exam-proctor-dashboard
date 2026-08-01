import { useEffect, useState } from "react";
import { theme, Flex, Avatar, Alert, Tag, Table, Select } from "antd";
import {
  CheckCircleFilled,
  ThunderboltOutlined,
  WarningFilled,
  WarningOutlined,
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  BellOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

import MyCard from "../myCard/MyCard";
import MyTitle from "../MyTitle/MyTitle";
import MyText from "../myText/MyText";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import LiveAlerts from "./LiveAlerts";

import useAuthStore from "../../store/useAuthStore";
import useSessionStore from "../../store/useSessionStore";
import useAlertsStore from "../../store/useAlertsStore";
import useStudentStore from "../../store/useStudentStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getSessionStatus } from "../../utils/sessionUtils";
import { ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

// TODO: remove after backend sends real permissions
// Handy fixtures for manually testing each permission combination in the
// Admin dashboard — copy one of these into useAuthStore's `user` (e.g. via
// devtools) to preview the cards/chart a given permission set produces.
// eslint-disable-next-line react-refresh/only-export-components
export const MOCK_USERS_FOR_TESTING = {
  // Admin with P03 + P05
  adminSessions: {
    role: "ADMIN",
    permissions: { P01: false, P02: false, P03: true, P04: false, P05: true, P06: false, P07: false },
  },
  // Admin with P01 + P02
  adminQBank: {
    role: "ADMIN",
    permissions: { P01: true, P02: true, P03: false, P04: false, P05: false, P06: false, P07: false },
  },
  // Admin with P04 + P07
  adminProctor: {
    role: "ADMIN",
    permissions: { P01: false, P02: false, P03: false, P04: true, P05: false, P06: false, P07: true },
  },
  // Admin with P06
  adminReports: {
    role: "ADMIN",
    permissions: { P01: false, P02: false, P03: false, P04: false, P05: false, P06: true, P07: false },
  },
  // Full Admin
  adminFull: {
    role: "ADMIN",
    permissions: { P01: true, P02: true, P03: true, P04: true, P05: true, P06: true, P07: true },
  },
};

const PERMISSION_DETAILS = {
  P01: { label: "Question Bank: Author" },
  P02: { label: "Question Bank: View All" },
  P03: { label: "Session: Manage" },
  P04: { label: "Session: Live Proctor" },
  P05: { label: "Students: Register" },
  P06: { label: "Reports: Export" },
  P07: { label: "Reports: View Violations" },
};

const ALERT_TYPES = [
  "GAZE_DEVIATION",
  "FACE_ABSENCE",
  "MULTIPLE_FACES",
  "APP_SWITCH",
  "AUDIO_THRESHOLD",
];

const CRITICAL_ALERT_TYPES = ["FACE_ABSENCE", "MULTIPLE_FACES"];

// Mock 7-day trend — sessions over time isn't tracked by the backend yet.
const SESSIONS_TREND_MOCK = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 2 },
  { day: "Thu", count: 7 },
  { day: "Fri", count: 4 },
  { day: "Sat", count: 1 },
  { day: "Sun", count: 6 },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Real sessions from the API already carry a `status` field (e.g. "CLOSED",
// "ARCHIVED"); fall back to deriving it only for sessions that don't.
function sessionStatus(session) {
  return session.status || getSessionStatus(session);
}

const chartCardStyle = (token) => ({
  borderRadius: 14,
  boxShadow: token.boxShadow,
  border: `1px solid ${token.colorBorder}`,
  background: token.colorBgElevated,
});

function StatCard({ icon, color, bg, value, label, sub, token }) {
  return (
    <MyCard
      styles={{ body: { padding: "17px 18px" } }}
      style={{
        borderRadius: token.borderRadius,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
    >
      <Flex align="center" gap={12}>
        <Flex
          align="center"
          justify="center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: bg ?? `${color}1A`,
            color,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </Flex>
        <Flex vertical gap={0}>
          <MyText style={{ fontSize: 26, fontWeight: 600, color: token.colorText, lineHeight: 1 }}>
            {value}
          </MyText>
          <MyText type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>
            {label}
          </MyText>
          {sub && (
            <MyText type="secondary" style={{ fontSize: 11, color: token.colorTextTertiary }}>
              {sub}
            </MyText>
          )}
        </Flex>
      </Flex>
    </MyCard>
  );
}

function AlertsByTypeChart({ alerts, token }) {
  const data = ALERT_TYPES.map((type) => ({
    type,
    label: ALERT_TYPE_CONFIG[type]?.label ?? type.replace("_", " "),
    color: ALERT_TYPE_CONFIG[type]?.color ?? token.colorPrimary,
    count: alerts.filter((a) => a.type === type).length,
  }));

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          <MyText strong>Alerts by Type</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: token.colorTextDescription, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: token.colorTextDescription, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: token.colorBgElevated,
                borderColor: token.colorBorder,
                borderRadius: 8,
                color: token.colorText,
              }}
              cursor={{ fill: token.colorFillSecondary, opacity: 0.3 }}
            />
            <Bar name="Alerts" dataKey="count" radius={[3, 3, 0, 0]} barSize={28}>
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Flex>
    </MyCard>
  );
}

function SessionsTrendChart({ token }) {
  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <CalendarOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          <MyText strong>Sessions Over Time — last 7 days</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SESSIONS_TREND_MOCK} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="sessionsTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.35} />
                <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: token.colorTextDescription, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: token.colorTextDescription, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: token.colorBgElevated,
                borderColor: token.colorBorder,
                borderRadius: 8,
                color: token.colorText,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Sessions"
              stroke={token.colorPrimary}
              fill="url(#sessionsTrendFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Flex>
    </MyCard>
  );
}

function ReportsStatusPieChart({ sessions, token }) {
  const data = [
    { name: "Exported", value: sessions.filter((s) => sessionStatus(s) === "CLOSED").length, color: token.colorSuccess },
    { name: "Pending", value: sessions.filter((s) => sessionStatus(s) === "ACTIVE").length, color: token.colorWarning },
  ];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          <MyText strong>Reports Status</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      {total === 0 ? (
        <MyText type="secondary">No report data yet.</MyText>
      ) : (
        <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: token.colorBgElevated,
                  borderColor: token.colorBorder,
                  borderRadius: 8,
                  color: token.colorText,
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Flex>
      )}
    </MyCard>
  );
}

function QuestionsPerBankChart({ questionBanks, token }) {
  const data = questionBanks.map((qb) => ({
    name: qb.code,
    questions: qb.questions?.length || 0,
  }));

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BookOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          <MyText strong>Questions per Bank</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      {data.length === 0 ? (
        <MyText type="secondary">No question banks yet.</MyText>
      ) : (
        <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: token.colorTextDescription, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: token.colorTextDescription, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: token.colorBgElevated,
                  borderColor: token.colorBorder,
                  borderRadius: 8,
                  color: token.colorText,
                }}
                cursor={{ fill: token.colorFillSecondary, opacity: 0.3 }}
              />
              <Bar name="Questions" dataKey="questions" fill={token.colorWarning} radius={[3, 3, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Flex>
      )}
    </MyCard>
  );
}

function NoChartCard({ token }) {
  return (
    <MyCard style={chartCardStyle(token)}>
      <Flex align="center" justify="center" style={{ height: 180 }}>
        <MyText type="secondary">No data visualization available.</MyText>
      </Flex>
    </MyCard>
  );
}

function PermissionsTable({ permissions, token }) {
  const dataSource = Object.entries(PERMISSION_DETAILS).map(([key, { label }]) => ({
    key,
    permission: label,
    status: permissions[key] ? "Granted" : "Not Granted",
  }));

  const columns = [
    { title: "Permission", dataIndex: "permission" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Granted" ? "success" : "default"}>{status}</Tag>
      ),
    },
  ];

  return (
    <MyCard title={<MyText strong>My Permissions</MyText>} style={chartCardStyle(token)}>
      <Table dataSource={dataSource} columns={columns} pagination={false} size="small" />
    </MyCard>
  );
}

export default function AdminWelcome() {
  const { token } = theme.useToken();

  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  // ─── TEST MODE — remove before production ───────────────────
  const TEST_MODE = false; // ← set false to use real user permissions

  const TEST_SCENARIOS = {
    "P03 + P05 (Session Manager)": {
      P01: false, P02: false, P03: true, P04: false, P05: true, P06: false, P07: false
    },
    "P01 + P02 (Question Author)": {
      P01: true, P02: true, P03: false, P04: false, P05: false, P06: false, P07: false
    },
    "P04 + P07 (Proctor)": {
      P01: false, P02: false, P03: false, P04: true, P05: false, P06: false, P07: true
    },
    "P06 (Reports Manager)": {
      P01: false, P02: false, P03: false, P04: false, P05: false, P06: true, P07: false
    },
    "All Permissions (Full Admin)": {
      P01: true, P02: true, P03: true, P04: true, P05: true, P06: true, P07: true
    },
    "No Permissions": {
      P01: false, P02: false, P03: false, P04: false, P05: false, P06: false, P07: false
    },
  };

  const [testScenario, setTestScenario] = useState("P03 + P05 (Session Manager)");

  const permissions = TEST_MODE
    ? TEST_SCENARIOS[testScenario]
    : user?.permissions ?? {};
  // ─────────────────────────────────────────────────────────────

  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const alerts = useAlertsStore((state) => state.alerts);
  const students = useStudentStore((state) => state.students);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const questionBanks = useQuestionBankStore((state) => state.questionBanks);

  useEffect(() => {
    fetchSessions();
    fetchStudents();
  }, [fetchSessions, fetchStudents]);

  const cardStyle = {
    borderRadius: 14,
    boxShadow: token.boxShadow,
    border: `1px solid ${token.colorBorder}`,
    background: token.colorBgElevated,
  };

  const openAlerts = alerts.filter((a) => a.status === "OPEN");
  const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED");
  const activeSessions = sessions.filter((s) => sessionStatus(s) === "ACTIVE");
  const recentOpenAlerts = openAlerts.slice(0, 5);
  const hasAnyPermission = Object.values(permissions).some(Boolean);

  const header = (
    <MyCard style={cardStyle}>
      <Flex align="center" gap={14}>
        <Avatar
          size={48}
          style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 18 }}
        >
          {user?.name?.[0]}
        </Avatar>
        <div>
          <MyTitle level={4} style={{ margin: 0, color: token.colorText }}>
            {getGreeting()}, {user?.name || "there"} 👋
          </MyTitle>
          <MyText type="secondary">
            {user?.jobTitle} · {dayjs().format("dddd, D MMM YYYY")}
          </MyText>
        </div>
      </Flex>
    </MyCard>
  );

  if (role === "PROCTOR") {
    return (
      <Flex vertical gap={20}>
        {header}

        <MyRow gutter={[16, 16]}>
          <MyCol xs={24} sm={8}>
            <StatCard
              token={token}
              icon={<ThunderboltOutlined />}
              color="rgb(108, 140, 255)"
              bg="rgba(47, 85, 212, 0.15)"
              value={activeSessions.length}
              label="Active Sessions"
            />
          </MyCol>
          <MyCol xs={24} sm={8}>
            <StatCard
              token={token}
              icon={<WarningFilled />}
              color="rgb(239, 68, 68)"
              bg="rgba(239, 68, 68, 0.13)"
              value={openAlerts.length}
              label="Open Alerts"
            />
          </MyCol>
          <MyCol xs={24} sm={8}>
            <StatCard
              token={token}
              icon={<CheckCircleFilled />}
              color="rgb(34, 197, 94)"
              bg="rgba(34, 197, 94, 0.15)"
              value={resolvedAlerts.length}
              label="Resolved Alerts"
            />
          </MyCol>
        </MyRow>

        <AlertsByTypeChart alerts={alerts} token={token} />

        <LiveAlerts alerts={recentOpenAlerts} />
      </Flex>
    );
  }

  // ADMIN — dynamic layout based on granted permissions:
  // Header → Cards (permission-gated) → Chart (priority-based) → My Permissions table.
  const cards = [
    permissions.P03 && {
      key: "sessions",
      title: "Sessions",
      value: sessions.length,
      sub: `${activeSessions.length} active`,
      icon: <CalendarOutlined />,
      color: token.colorPrimary,
    },
    permissions.P05 && {
      key: "students",
      title: "Students",
      value: students.length,
      sub: "registered",
      icon: <TeamOutlined />,
      color: token.colorSuccess,
    },
    (permissions.P01 || permissions.P02) && {
      key: "question-banks",
      title: "Question Banks",
      value: questionBanks.length,
      sub: "total banks",
      icon: <FileTextOutlined />,
      color: token.colorWarning,
    },
    permissions.P04 && {
      key: "open-alerts",
      title: "Open Alerts",
      value: openAlerts.length,
      sub: `${openAlerts.filter((a) => CRITICAL_ALERT_TYPES.includes(a.type)).length} critical`,
      icon: <BellOutlined />,
      color: token.colorError,
    },
    permissions.P06 && {
      key: "ready-to-export",
      title: "Ready to Export",
      value: sessions.filter((s) => sessionStatus(s) === "CLOSED").length,
      sub: "closed sessions",
      icon: <BarChartOutlined />,
      color: token.colorInfo,
    },
    permissions.P07 && {
      key: "escalated",
      title: "Escalated",
      value: alerts.filter((a) => a.status === "ESCALATED").length,
      sub: "violations",
      icon: <WarningOutlined />,
      color: "#fa541c",
    },
  ].filter(Boolean);

  let chart;
  if (permissions.P04) {
    chart = <AlertsByTypeChart alerts={alerts} token={token} />;
  } else if (permissions.P03) {
    chart = <SessionsTrendChart token={token} />;
  } else if (permissions.P06) {
    chart = <ReportsStatusPieChart sessions={sessions} token={token} />;
  } else if (permissions.P01 || permissions.P02) {
    chart = <QuestionsPerBankChart questionBanks={questionBanks} token={token} />;
  } else {
    chart = <NoChartCard token={token} />;
  }

  return (
    <Flex vertical gap={20}>
      {TEST_MODE && (
        <MyCard
          style={{
            border: `1px solid ${token.colorWarning}`,
            background: token.colorWarningBg,
            marginBottom: 8,
          }}
        >
          <Flex align="center" gap={12} wrap="wrap">
            <MyText strong style={{ color: token.colorWarning }}>
              🧪 Test Mode
            </MyText>
            <Select
              value={testScenario}
              onChange={setTestScenario}
              style={{ minWidth: 260 }}
              options={Object.keys(TEST_SCENARIOS).map((k) => ({ label: k, value: k }))}
            />
          </Flex>
        </MyCard>
      )}

      {header}

      {!hasAnyPermission && (
        <Alert
          type="warning"
          showIcon
          message="No permissions assigned yet."
          description="Contact your Super Admin to assign permissions."
        />
      )}

      {cards.length > 0 && (
        <MyRow gutter={[16, 16]}>
          {cards.map((card) => (
            <MyCol key={card.key} xs={24} sm={12} md={8} lg={{ flex: "1 1 180px" }}>
              <StatCard
                token={token}
                icon={card.icon}
                color={card.color}
                value={card.value}
                label={card.title}
                sub={card.sub}
              />
            </MyCol>
          ))}
        </MyRow>
      )}

      {chart}

      <PermissionsTable permissions={permissions} token={token} />
    </Flex>
  );
}
