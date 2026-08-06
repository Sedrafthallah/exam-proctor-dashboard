import { useEffect } from "react";
import { theme, Flex, Avatar, Alert } from "antd";
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

// Every admin account sees the same fixed demo numbers on this dashboard,
// independent of the backend — used to demo the frontend without needing
// real sessions/students/alerts data to exist yet.
const FULL_ADMIN_PERMISSIONS = {
  P01: true,
  P02: true,
  P03: true,
  P04: true,
  P05: true,
  P06: true,
  P07: true,
};

const MOCK_ADMIN_DASHBOARD_DATA = {
  sessions: [
    { id: 1, status: "ACTIVE" },
    { id: 2, status: "ACTIVE" },
    { id: 3, status: "ACTIVE" },
    { id: 4, status: "CLOSED" },
    { id: 5, status: "CLOSED" },
    { id: 6, status: "CLOSED" },
    { id: 7, status: "CLOSED" },
    { id: 8, status: "ARCHIVED" },
  ],
  students: Array.from({ length: 340 }, (_, i) => ({ id: i + 1 })),
  questionBanks: [
    { code: "CS101", questionCount: 45 },
    { code: "MATH201", questionCount: 62 },
    { code: "PHY150", questionCount: 38 },
    { code: "ENG110", questionCount: 27 },
    { code: "CHEM220", questionCount: 51 },
  ],
  alerts: [
    { id: 1, type: "GAZE_DEVIATION", status: "OPEN" },
    { id: 2, type: "GAZE_DEVIATION", status: "OPEN" },
    { id: 3, type: "GAZE_DEVIATION", status: "RESOLVED" },
    { id: 4, type: "FACE_ABSENCE", status: "OPEN" },
    { id: 5, type: "FACE_ABSENCE", status: "ESCALATED" },
    { id: 6, type: "MULTIPLE_FACES", status: "OPEN" },
    { id: 7, type: "MULTIPLE_FACES", status: "ESCALATED" },
    { id: 8, type: "APP_SWITCH", status: "OPEN" },
    { id: 9, type: "APP_SWITCH", status: "RESOLVED" },
    { id: 10, type: "AUDIO_THRESHOLD", status: "OPEN" },
    { id: 11, type: "AUDIO_THRESHOLD", status: "RESOLVED" },
    { id: 12, type: "FACE_ABSENCE", status: "RESOLVED" },
  ],
  weeklyStatistics: [
    { day: "Mon", sessions: 4 },
    { day: "Tue", sessions: 7 },
    { day: "Wed", sessions: 5 },
    { day: "Thu", sessions: 9 },
    { day: "Fri", sessions: 6 },
    { day: "Sat", sessions: 3 },
    { day: "Sun", sessions: 8 },
  ],
};

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

function ReportsStatusPieChart({ sessions, token }) {
  const data = [
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
  const isAdmin = role === "ADMIN";

  const permissions = isAdmin ? FULL_ADMIN_PERMISSIONS : (user?.permissions ?? {});

  const sessionsStore = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const weeklyStatisticsStore = useSessionStore((state) => state.weeklyStatistics);
  const fetchWeeklyStatistics = useSessionStore((state) => state.fetchWeeklyStatistics);
  const alertsStore = useAlertsStore((state) => state.alerts);
  const fetchAlerts = useAlertsStore((state) => state.fetchAlerts);
  const studentsStore = useStudentStore((state) => state.students);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const questionBanksStore = useQuestionBankStore((state) => state.questionBanks);
  const fetchQuestionBanks = useQuestionBankStore((state) => state.fetchQuestionBanks);

  // Admin dashboard shows fixed demo data instead of live data — no need to
  // hit the backend for it.
  useEffect(() => {
    if (isAdmin) return;
    fetchSessions();
    fetchStudents();
    fetchAlerts();
    fetchQuestionBanks();
    fetchWeeklyStatistics();
  }, [isAdmin, fetchSessions, fetchStudents, fetchAlerts, fetchQuestionBanks, fetchWeeklyStatistics]);

  const sessions = isAdmin ? MOCK_ADMIN_DASHBOARD_DATA.sessions : sessionsStore;
  const students = isAdmin ? MOCK_ADMIN_DASHBOARD_DATA.students : studentsStore;
  const alerts = isAdmin ? MOCK_ADMIN_DASHBOARD_DATA.alerts : alertsStore;
  const questionBanks = isAdmin
    ? MOCK_ADMIN_DASHBOARD_DATA.questionBanks
    : questionBanksStore;
  const weeklyStatistics = isAdmin
    ? MOCK_ADMIN_DASHBOARD_DATA.weeklyStatistics
    : weeklyStatisticsStore;

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

  // let chart;
  // if (permissions.P04) {
  //   chart = <AlertsByTypeChart alerts={alerts} token={token} />;
  // } else if (permissions.P03) {
  //   chart = <SessionsTrendChart token={token} />;
  // } else if (permissions.P06) {
  //   chart = <ReportsStatusPieChart sessions={sessions} token={token} />;
  // } else if (permissions.P01 || permissions.P02) {
  //   chart = <QuestionsPerBankChart questionBanks={questionBanks} token={token} />;
  // } else {
  //   chart = <NoChartCard token={token} />;
  // }
  const activeCharts = [
    permissions.P04 && {
      key: "alerts-chart",
      component: <AlertsByTypeChart alerts={alerts} token={token} />,
    },
    permissions.P03 && {
      key: "sessions-chart",
      component: <SessionsTrendChart data={weeklyStatistics} token={token} />,
    },
    permissions.P06 && {
      key: "reports-chart",
      component: <ReportsStatusPieChart sessions={sessions} token={token} />,
    },
    (permissions.P01 || permissions.P02) && {
      key: "qbank-chart",
      component: (
        <QuestionsPerBankChart questionBanks={questionBanks} token={token} />
      ),
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

      {/* {cards.length > 0 && (
        <MyRow gutter={[16, 16]}>
          {cards.map((card) => (
            <MyCol
              key={card.key}
              xs={24}
              sm={12}
              md={8}
              lg={{ flex: "1 1 180px" }}
            >
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
      )} */}

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
      {/* {chart} */}
      {/* عرض كل المخططات المتاحة للأدمن بجانب بعضها */}
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
