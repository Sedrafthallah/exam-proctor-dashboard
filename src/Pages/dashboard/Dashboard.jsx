import { theme, Avatar, Flex } from "antd";
import dayjs from "dayjs";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

import { WarningFilled, UserSwitchOutlined, CheckCircleFilled } from "@ant-design/icons";
import { MdOutlineSensors, MdGroups } from "react-icons/md";
import { FiInbox } from "react-icons/fi";
import { AiFillThunderbolt } from "react-icons/ai";

import SessionsOverview from "../../MyComponents/dashboardTable/SessionsOverview";
import LiveAlerts from "../../MyComponents/dashboardTable/LiveAlerts";
import ExamActivityChart from "../../MyComponents/dashboardTable/ExamActivityCharts";
import RecentAuditActivity from "../../MyComponents/dashboardTable/RecentAuditActivity";

import useSessionStore from "../../store/useSessionStore";
import useStudentStore from "../../store/useStudentStore";
import useAlertsStore from "../../store/useAlertsStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getSessionStatus } from "../../utils/sessionUtils";
import { getBankStatus } from "../../utils/questionBankUtils";

export default function DashboardCards() {
  const { token } = theme.useToken();

  const sessions = useSessionStore((state) => state.sessions);
  const students = useStudentStore((state) => state.students);
  const alerts = useAlertsStore((state) => state.alerts);
  const questionBanks = useQuestionBankStore((state) => state.questionBanks);

  const activeSessionsCount = sessions.filter((s) => getSessionStatus(s) === "ACTIVE").length;
  const registeredStudentsCount = students.filter((s) => s.status === "REGISTERED").length;
  const openAlertsCount = alerts.filter((a) => a.status === "OPEN").length;
  const criticalOpenAlertsCount = alerts.filter(
    (a) => a.status === "OPEN" && (a.type === "FACE_ABSENCE" || a.type === "MULTIPLE_FACES"),
  ).length;
  const draftBanksCount = questionBanks.filter((b) => getBankStatus(b) === "DRAFT").length;
  const pendingAuthCount = alerts.filter((a) => a.type === "FACE_ABSENCE" && a.status === "OPEN").length;

  const dashboardCards = [
    {
      key: "active-sessions",
      title: "Active Sessions",
      value: String(activeSessionsCount),
      subText: "live",
      subIcon: <AiFillThunderbolt />,
      subTextColor: "#6c8cff",
      icon: <MdOutlineSensors />,
      color: "rgb(108, 140, 255)",
      bg: "rgba(47, 85, 212, 0.15)",
    },
    {
      key: "total-students",
      title: "Total Students",
      value: String(students.length),
      subText: `${registeredStudentsCount} verified`,
      subIcon: <CheckCircleFilled />,
      subTextColor: "#22c55e",
      icon: <MdGroups />,
      color: "rgb(20, 184, 166)",
      bg: "rgba(20, 184, 166, 0.15)",
    },
    {
      key: "open-alerts",
      title: "Open Alerts",
      value: String(openAlertsCount),
      subText: `${criticalOpenAlertsCount} critical`,
      subTextColor: "#ef4444",
      icon: <WarningFilled />,
      color: "rgb(239, 68, 68)",
      bg: "rgba(239, 68, 68, 0.13)",
    },
    {
      key: "question-banks",
      title: "Question Banks",
      value: String(questionBanks.length),
      subText: `${draftBanksCount} draft`,
      subTextColor: "#8b5cf6",
      icon: <FiInbox />,
      color: "rgb(139,92,246)",
      bg: "rgba(139,92,246,0.15)",
    },
    {
      key: "pending-auth",
      title: "Pending Auth",
      value: String(pendingAuthCount),
      subText: pendingAuthCount > 0 ? "needs review" : "all clear",
      subTextColor: pendingAuthCount > 0 ? "#ef4444" : "#22c55e",
      icon: <UserSwitchOutlined />,
      color: "rgb(217,119,6)",
      bg: "rgba(217,119,6,0.15)",
    },
  ];

  const sessionsOverviewData = sessions
    .slice()
    .sort((a, b) => new Date(b.scheduledStartUTC) - new Date(a.scheduledStartUTC))
    .slice(0, 5)
    .map((session) => {
      const status = getSessionStatus(session);
      const start = dayjs(session.scheduledStartUTC);
      const graceEnd = start.add(session.duration, "minute").add(session.gracePeriod, "minute");

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
          <MyCol
            key={item.key}
            xs={24}
            sm={12}
            md={{ flex: "1 1 200px" }}
          >
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
            <SessionsOverview sessions={sessionsOverviewData} />
            <ExamActivityChart />
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
