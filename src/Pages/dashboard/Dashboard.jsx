import { theme, Avatar, Flex } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

import {
  WarningFilled,
  UserSwitchOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { MdOutlineSensors, MdGroups } from "react-icons/md";
import { FiInbox } from "react-icons/fi";
import { AiFillThunderbolt } from "react-icons/ai";

import SessionsOverview from "../../MyComponents/dashboardTable/SessionsOverview";
import LiveAlerts from "../../MyComponents/dashboardTable/LiveAlerts";
import ExamActivityChart from "../../MyComponents/dashboardTable/ExamActivityCharts";
import RecentAuditActivity from "../../MyComponents/dashboardTable/RecentAuditActivity";
import AdminWelcome from "../../MyComponents/dashboardTable/AdminWelcome";

import useSessionStore from "../../store/useSessionStore";
import useAlertsStore from "../../store/useAlertsStore";
import useAuthStore from "../../store/useAuthStore";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  if (!isSuperAdmin) {
    return <AdminWelcome user={user} hasPermission={hasPermission} />;
  }

  return <SuperAdminDashboard />;
}

function SuperAdminDashboard() {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const sessions = useSessionStore((state) => state.sessions);
  const weeklyStatistics = useSessionStore((state) => state.weeklyStatistics);
  const stats = useSessionStore((state) => state.stats);

  const fetchWeeklyStatistics = useSessionStore(
    (state) => state.fetchWeeklyStatistics,
  );
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const fetchStats = useSessionStore((state) => state.fetchStats);

  const alerts = useAlertsStore((state) => state.alerts);

  useEffect(() => {
    fetchStats();
    fetchSessions();
    fetchWeeklyStatistics();
  }, []);

  const dashboardCards = [
    {
      key: "active-sessions",
      title: "Active Sessions",
      value: String(stats.activeSessions),
      subText: stats.activeSessions > 0 ? "live" : "none active",
      subIcon: <AiFillThunderbolt />,
      subTextColor: "#6c8cff",
      icon: <MdOutlineSensors />,
      color: "rgb(108, 140, 255)",
      bg: "rgba(47, 85, 212, 0.15)",
    },
    {
      key: "total-students",
      title: "Total Students",
      value: String(stats.studentsInExam),
      subText: `in exam now`,
      subIcon: <CheckCircleFilled />,
      subTextColor: "#22c55e",
      icon: <MdGroups />,
      color: "rgb(20, 184, 166)",
      bg: "rgba(20, 184, 166, 0.15)",
    },
    {
      key: "open-alerts",
      title: "Open Alerts",
      value: String(stats.openAlerts),
      subText: "need review",
      subTextColor: "#ef4444",
      icon: <WarningFilled />,
      color: "rgb(239, 68, 68)",
      bg: "rgba(239, 68, 68, 0.13)",
    },
    {
      key: "question-banks",
      title: "Question Banks",
      value: String(stats.questionBanks),
      subText: "total banks",
      subTextColor: "#8b5cf6",
      icon: <FiInbox />,
      color: "rgb(139,92,246)",
      bg: "rgba(139,92,246,0.15)",
    },
    {
      key: "admin-users",
      title: "Admin Users",
      value: String(stats.adminUsers),
      subText: "registered",
      subTextColor: "#22c55e",
      icon: <UserSwitchOutlined />,
      color: "rgb(217,119,6)",
      bg: "rgba(217,119,6,0.15)",
    },
  ];

  const sessionsOverviewData = sessions
    .slice()
    .sort((a, b) => {
      const diffA = Math.abs(dayjs(a.scheduledStartUTC).diff(dayjs()));
      const diffB = Math.abs(dayjs(b.scheduledStartUTC).diff(dayjs()));
      return diffA - diffB;
    })
    .slice(0, 5)
    .map((session) => {
      const status = session.status;
      const start = dayjs(session.scheduledStartUTC);
      const graceEnd = start
        .add(session.duration, "minute")
        .add(session.gracePeriod, "minute");

      let seconds = 0;
      if (status === "ACTIVE" || status === "GRACE") {
        seconds = Math.max(0, graceEnd.diff(dayjs(), "second"));
      } else if (status === "SCHEDULED" || status === "LOCKED") {
        seconds = Math.max(0, start.diff(dayjs(), "second"));
      }

      return {
        id: session.id,
        title: session.sessionTitle,
        subTitle: session.proctor || session.courseCode,
        status,
        seconds,
      };
    });

  const recentAlerts = alerts.filter((a) => a.status === "OPEN").slice(0, 5);

  return (
    <>
      <MyRow gutter={[16, 16]}>
        {dashboardCards.map((item) => (
          <MyCol key={item.key} xs={24} sm={12} md={{ flex: "1 1 200px" }}>
            <MyCard
              styles={{ body: { padding: 0 } }}
              style={{
                borderRadius: token.borderRadius,
                padding: "17px 18px",
                boxShadow: token.boxShadow,
                border: `1px solid ${token.colorBorder}`,
                background: token.colorBgElevated,
              }}
            >
              <Flex justify="space-between" align="center">
                <Avatar
                  shape="square"
                  size={38}
                  icon={item.icon}
                  style={{
                    background: item.bg,
                    color: item.color,
                    fontSize: 21,
                  }}
                />

                <MyText
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    color: item.subTextColor,
                  }}
                >
                  {item.subIcon && (
                    <Flex align="center" style={{ fontSize: 14 }}>
                      {item.subIcon}
                    </Flex>
                  )}
                  {item.subText}
                </MyText>
              </Flex>

              <MyText
                style={{
                  display: "block",
                  fontSize: 30,
                  fontWeight: 600,
                  color: token.colorText,
                  marginTop: 13,
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                {item.value}
              </MyText>

              <MyText
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 12.5,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {item.title}
              </MyText>
            </MyCard>
          </MyCol>
        ))}
      </MyRow>

      <MyRow gutter={[16, 16]} style={{ marginTop: 24 }}>
        <MyCol xs={24} lg={16}>
          <Flex vertical gap={20}>
            <SessionsOverview
              sessions={sessionsOverviewData}
              onViewAll={() => navigate("/sessions")}
            />
            <ExamActivityChart data={weeklyStatistics} />
          </Flex>
        </MyCol>
        <MyCol xs={24} lg={8}>
          <Flex vertical gap={20}>
            <LiveAlerts alerts={recentAlerts} />
            <RecentAuditActivity />
          </Flex>
        </MyCol>
      </MyRow>
    </>
  );
}
