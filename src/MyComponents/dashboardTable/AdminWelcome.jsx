import { useEffect, useMemo, useState } from "react";
import { theme, Flex, Avatar, Alert } from "antd";
import {
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

import useAuthStore from "../../store/useAuthStore";
import useSessionStore, {
  fetchProctorSummaryCards,
  fetchProctorAlertCountsByType,
  fetchDashboardSummaryCards,
  fetchDashboardAlertCountsByType,
  fetchDashboardSessionCountsByDay,
  fetchDashboardQuestionCountsByBank,
  fetchDashboardExportStatus,
} from "../../store/useSessionStore";
import useAlertsStore from "../../store/useAlertsStore";
import useStudentStore from "../../store/useStudentStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getSessionStatus } from "../../utils/sessionUtils";
import { ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

const ALERT_TYPES = [
  "GAZE_DEVIATION",
  "FACE_ABSENCE",
  "MULTIPLE_FACES",
  "APP_SWITCH",
  "AUDIO_THRESHOLD",
];

const CRITICAL_ALERT_TYPES = ["FACE_ABSENCE", "MULTIPLE_FACES"];

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
          <MyText
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: token.colorText,
              lineHeight: 1,
            }}
          >
            {value}
          </MyText>
          <MyText type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>
            {label}
          </MyText>
          {sub && (
            <MyText
              type="secondary"
              style={{ fontSize: 11, color: token.colorTextTertiary }}
            >
              {sub}
            </MyText>
          )}
        </Flex>
      </Flex>
    </MyCard>
  );
}

function AlertsByTypeChart({ alerts, alertCounts, token }) {
  // Prefer the backend's pre-counted data (GET /api/dashboard/alert-counts-by-type)
  // when available; its `code` values don't match ALERT_TYPE_CONFIG's keys, so
  // bars use a flat color there instead of falling back to the client-side count.
  const hasBackendData = alertCounts && alertCounts.length > 0;
  const data = hasBackendData
    ? alertCounts.map((item) => ({
        type: item.code,
        label: item.label,
        color: token.colorPrimary,
        count: item.count,
      }))
    : ALERT_TYPES.map((type) => ({
        type,
        label: ALERT_TYPE_CONFIG[type]?.label ?? type.replace("_", " "),
        color: ALERT_TYPE_CONFIG[type]?.color ?? token.colorPrimary,
        count: alerts.filter((a) => a.type === type).length,
      }));

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined
            style={{ color: token.colorPrimary, fontSize: 16 }}
          />
          <MyText strong>Alerts by Type</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
              vertical={false}
            />
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
            <Bar
              name="Alerts"
              dataKey="count"
              radius={[3, 3, 0, 0]}
              barSize={28}
            >
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

const ALERT_STATUS_COLORS = {
  OPEN: "#faad14",
  RESOLVED: "#52c41a",
  ESCALATED: "#fa541c",
};

// Counts are computed client-side from the already-loaded `alerts` array
// (same source AlertsByTypeChart uses) because GET /api/alerts?status=...
// is confirmed broken — it returns the same empty result regardless of the
// status value. `alert.status` here is already normalized by useAlertsStore
// (STATUS_LABELS / UNKNOWN_STATUS_${code} fallback), so unrecognized codes
// still show up as their own labeled bar instead of being dropped.
function AlertsByStatusChart({ alerts, token }) {
  const statusCounts = alerts.reduce((counts, alert) => {
    counts[alert.status] = (counts[alert.status] ?? 0) + 1;
    return counts;
  }, {});

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: ALERT_STATUS_COLORS[status] ?? token.colorTextTertiary,
  }));

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined
            style={{ color: token.colorPrimary, fontSize: 16 }}
          />
          <MyText strong>Alerts by Status</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      {data.length === 0 ? (
        <MyText type="secondary">No alert data yet.</MyText>
      ) : (
        <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={token.colorBorderSecondary}
                vertical={false}
              />
              <XAxis
                dataKey="status"
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
              <Bar
                name="Alerts"
                dataKey="count"
                radius={[3, 3, 0, 0]}
                barSize={28}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Flex>
      )}
    </MyCard>
  );
}

// Proctor dashboard only — data already arrives pre-counted as
// [{ code, label, count }] from GET /api/proctor-dashboard/alert-counts-by-type,
// a different shape than AlertsByTypeChart's raw alert list, so this is a
// separate minimal chart rather than adapting that one.
function ProctorAlertCountsChart({ data, token }) {
  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined
            style={{ color: token.colorPrimary, fontSize: 16 }}
          />
          <MyText strong>Alerts by Type — last 7 days</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      {!data || data.length === 0 ? (
        <MyText type="secondary">No alert data yet.</MyText>
      ) : (
        <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={token.colorBorderSecondary}
                vertical={false}
              />
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
              <Bar
                name="Alerts"
                dataKey="count"
                fill={token.colorPrimary}
                radius={[3, 3, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </Flex>
      )}
    </MyCard>
  );
}

function SessionsTrendChart({ data, token }) {
  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <CalendarOutlined
            style={{ color: token.colorPrimary, fontSize: 16 }}
          />
          <MyText strong>Sessions Over Time — last 7 days</MyText>
        </Flex>
      }
      style={chartCardStyle(token)}
    >
      <Flex style={{ width: "100%", height: 220, marginTop: 5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="sessionsTrendFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={token.colorPrimary}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={token.colorPrimary}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
              vertical={false}
            />
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
              dataKey="sessions"
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

function ReportsStatusPieChart({ sessions, exportStatus, token }) {
  const hasBackendData =
    exportStatus && (exportStatus.exported > 0 || exportStatus.pending > 0);
  const data = hasBackendData
    ? [
        { name: "Exported", value: exportStatus.exported, color: token.colorSuccess },
        { name: "Pending", value: exportStatus.pending, color: token.colorWarning },
      ]
    : [
        {
          name: "Exported",
          value: sessions.filter((s) => sessionStatus(s) === "CLOSED").length,
          color: token.colorSuccess,
        },
        {
          name: "Pending",
          value: sessions.filter((s) => sessionStatus(s) === "ACTIVE").length,
          color: token.colorWarning,
        },
      ];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <MyCard
      title={
        <Flex align="center" gap={8}>
          <BarChartOutlined
            style={{ color: token.colorPrimary, fontSize: 16 }}
          />
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
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
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
    questions: qb.questionCount || 0,
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
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={token.colorBorderSecondary}
                vertical={false}
              />
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
              <Bar
                name="Questions"
                dataKey="questions"
                fill={token.colorWarning}
                radius={[3, 3, 0, 0]}
                barSize={28}
              />
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

export default function AdminWelcome() {
  const { token } = theme.useToken();

  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  // Proctor dashboard — separate confirmed endpoints, fetched and rendered
  // via the same StatCard/MyCard components as the Admin path below rather
  // than merged into its permission-gated cards/charts logic.
  const [proctorSummary, setProctorSummary] = useState(null);
  const [proctorAlertCounts, setProctorAlertCounts] = useState([]);

  useEffect(() => {
    if (role !== "PROCTOR") return;
    fetchProctorSummaryCards().then(setProctorSummary);
    fetchProctorAlertCountsByType(7).then(setProctorAlertCounts);
  }, [role]);

  // ADMIN — dedicated backend-computed dashboard endpoints, replacing the
  // client-side computed values used for the stat cards/charts below.
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [alertCountsByType, setAlertCountsByType] = useState([]);
  const [sessionCountsByDay, setSessionCountsByDay] = useState([]);
  const [questionCountsByBank, setQuestionCountsByBank] = useState([]);
  const [exportStatus, setExportStatus] = useState(null);

  useEffect(() => {
    if (role === "PROCTOR") return;
    fetchDashboardSummaryCards().then(setDashboardSummary);
    fetchDashboardAlertCountsByType().then(setAlertCountsByType);
    fetchDashboardSessionCountsByDay(7).then(setSessionCountsByDay);
    fetchDashboardQuestionCountsByBank().then(setQuestionCountsByBank);
    fetchDashboardExportStatus().then(setExportStatus);
  }, [role]);

  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const has = (perm) => permissions.includes(perm);

  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const weeklyStatistics = useSessionStore((state) => state.weeklyStatistics);
  const fetchWeeklyStatistics = useSessionStore((state) => state.fetchWeeklyStatistics);
  const alerts = useAlertsStore((state) => state.alerts);
  const fetchAlerts = useAlertsStore((state) => state.fetchAlerts);
  const students = useStudentStore((state) => state.students);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const questionBanks = useQuestionBankStore((state) => state.questionBanks);
  const fetchQuestionBanks = useQuestionBankStore((state) => state.fetchQuestionBanks);

  useEffect(() => {
    // Mirrors the has(...) gates the cards/charts below use for the same
    // data, so a reduced-permission account (e.g. Proctor) doesn't fire
    // fetches for data it can't view and gets a 403 for.
    // - sessions: feeds the "Sessions" card (ViewExamSession) AND the
    //   "Ready to Export" card + Reports Status chart (ExportData).
    // - alerts: feeds the "Escalated" card (ViewAlerts) AND the "Open
    //   Alerts" card + Alerts by Type chart (MonitorExamSession).
    if (permissions.includes("ViewExamSession") || permissions.includes("ExportData")) {
      fetchSessions();
    }
    if (permissions.includes("ViewStudents")) {
      fetchStudents();
    }
    if (permissions.includes("MonitorExamSession") || permissions.includes("ViewAlerts")) {
      fetchAlerts();
    }
    if (permissions.includes("ManageQuestionBanks") || permissions.includes("ViewQuestionBanks")) {
      fetchQuestionBanks();
    }
    if (permissions.includes("ViewExamSession")) {
      fetchWeeklyStatistics();
    }
  }, [permissions, fetchSessions, fetchStudents, fetchAlerts, fetchQuestionBanks, fetchWeeklyStatistics]);

  const cardStyle = {
    borderRadius: 14,
    boxShadow: token.boxShadow,
    border: `1px solid ${token.colorBorder}`,
    background: token.colorBgElevated,
  };

  const openAlerts = alerts.filter((a) => a.status === "OPEN");
  const activeSessions = sessions.filter((s) => sessionStatus(s) === "ACTIVE");
  const hasAnyPermission = permissions.length > 0;

  const header = (
    <MyCard style={cardStyle}>
      <Flex align="center" gap={14}>
        <Avatar
          size={48}
          style={{
            background: token.colorPrimary,
            fontWeight: 600,
            fontSize: 18,
          }}
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

  // PROCTOR — separate confirmed endpoints, rendered with the same
  // StatCard/MyCard components as the Admin path below. Kept as an early
  // return rather than merged into that path's has()-based permission
  // gating, which doesn't apply to this data.
  if (role === "PROCTOR") {
    return (
      <Flex vertical gap={20}>
        {header}

        <MyRow gutter={[16, 16]}>
          <MyCol xs={24} sm={12} md={8}>
            <StatCard
              token={token}
              icon={<CalendarOutlined />}
              color={token.colorPrimary}
              value={proctorSummary?.activeSessions ?? 0}
              label="Active Sessions"
            />
          </MyCol>
          <MyCol xs={24} sm={12} md={8}>
            <StatCard
              token={token}
              icon={<BellOutlined />}
              color={token.colorError}
              value={proctorSummary?.openAlerts ?? 0}
              label="Open Alerts"
            />
          </MyCol>
          <MyCol xs={24} sm={12} md={8}>
            <StatCard
              token={token}
              icon={<WarningOutlined />}
              color={token.colorSuccess}
              value={proctorSummary?.resolvedAlertsToday ?? 0}
              label="Resolved Today"
            />
          </MyCol>
        </MyRow>

        <MyRow gutter={[16, 16]}>
          <MyCol xs={24} lg={24}>
            <ProctorAlertCountsChart data={proctorAlertCounts} token={token} />
          </MyCol>
        </MyRow>
      </Flex>
    );
  }

  // ADMIN — dynamic layout based on granted permissions:
  // Header → Cards (permission-gated) → Charts (permission-gated).
  const cards = [
    has("ViewExamSession") && {
      key: "sessions",
      title: "Sessions",
      value: dashboardSummary?.totalSessions ?? sessions.length,
      sub: `${dashboardSummary?.activeSessions ?? activeSessions.length} active`,
      icon: <CalendarOutlined />,
      color: token.colorPrimary,
    },
    has("ViewStudents") && {
      key: "students",
      title: "Students",
      value: dashboardSummary?.registeredStudents ?? students.length,
      sub: "registered",
      icon: <TeamOutlined />,
      color: token.colorSuccess,
    },
    (has("ManageQuestionBanks") || has("ViewQuestionBanks")) && {
      key: "question-banks",
      title: "Question Banks",
      value: dashboardSummary?.questionBanks ?? questionBanks.length,
      sub: "total banks",
      icon: <FileTextOutlined />,
      color: token.colorWarning,
    },
    has("MonitorExamSession") && {
      key: "open-alerts",
      title: "Open Alerts",
      value: dashboardSummary?.openAlerts ?? openAlerts.length,
      sub: `${dashboardSummary?.criticalOpenAlerts ?? openAlerts.filter((a) => CRITICAL_ALERT_TYPES.includes(a.type)).length} critical`,
      icon: <BellOutlined />,
      color: token.colorError,
    },
    has("ExportData") && {
      key: "ready-to-export",
      title: "Ready to Export",
      value: dashboardSummary?.readyToExport ?? sessions.filter((s) => sessionStatus(s) === "CLOSED").length,
      sub: "closed sessions",
      icon: <BarChartOutlined />,
      color: token.colorInfo,
    },
    has("ViewAlerts") && {
      key: "escalated",
      title: "Escalated",
      value: dashboardSummary?.escalatedAlerts ?? alerts.filter((a) => a.status === "ESCALATED").length,
      sub: "violations",
      icon: <WarningOutlined />,
      color: "#fa541c",
    },
  ].filter(Boolean);

  // Backend session-counts-by-day/question-counts-by-bank shapes mapped onto
  // the field names SessionsTrendChart/QuestionsPerBankChart already render,
  // so the charts themselves don't need to know about two data sources.
  const sessionsChartData =
    sessionCountsByDay.length > 0
      ? sessionCountsByDay.map((d) => ({
          day: d.dayName.slice(0, 3),
          sessions: d.sessionCount,
        }))
      : weeklyStatistics;

  const questionBankChartData =
    questionCountsByBank.length > 0
      ? questionCountsByBank.map((qb) => ({
          code: qb.bankTitle,
          questionCount: qb.questionCount,
        }))
      : questionBanks;

  const activeCharts = [
    has("MonitorExamSession") && {
      key: "alerts-chart",
      component: (
        <AlertsByTypeChart
          alerts={alerts}
          alertCounts={alertCountsByType}
          token={token}
        />
      ),
    },
    has("ViewExamSession") && {
      key: "sessions-chart",
      component: <SessionsTrendChart data={sessionsChartData} token={token} />,
    },
    has("ExportData") && {
      key: "reports-chart",
      component: (
        <ReportsStatusPieChart
          sessions={sessions}
          exportStatus={exportStatus}
          token={token}
        />
      ),
    },
    (has("ManageQuestionBanks") || has("ViewQuestionBanks")) && {
      key: "qbank-chart",
      component: (
        <QuestionsPerBankChart questionBanks={questionBankChartData} token={token} />
      ),
    },
    has("ViewAlerts") && {
      key: "alerts-by-status",
      component: <AlertsByStatusChart alerts={alerts} token={token} />,
    },
  ].filter(Boolean);
  return (
    <Flex vertical gap={20}>
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
            <MyCol key={card.key} xs={24} sm={12} md={8} lg={6}>
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
      {activeCharts.length > 0 ? (
        <MyRow gutter={[16, 16]}>
          {activeCharts.map((chartItem, index) => {
            // فحص ما إذا كان هذا العنصر هو الأخير في مصفوفة فردية العدد
            const isLastOddItem =
              index === activeCharts.length - 1 &&
              activeCharts.length % 2 !== 0;

            return (
              <MyCol
                key={chartItem.key}
                xs={24}
                // إذا كان المخطط الوحيد أو كان العنصر الأخير الفردي، يأخذ العرض كاملاً 24
                lg={isLastOddItem || activeCharts.length === 1 ? 24 : 12}
              >
                {chartItem.component}
              </MyCol>
            );
          })}
        </MyRow>
      ) : (
        <NoChartCard token={token} />
      )}
    </Flex>
  );
}
