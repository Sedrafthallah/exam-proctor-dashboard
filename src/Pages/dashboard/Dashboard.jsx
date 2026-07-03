import { theme, Avatar, Flex } from "antd";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

import { WarningFilled } from "@ant-design/icons";
import { MdOutlineSensors, MdGroups, MdManageAccounts } from "react-icons/md";
import { FiInbox, FiCheckCircle } from "react-icons/fi";
import { AiFillThunderbolt } from "react-icons/ai";

import SessionsOverview from "../../MyComponents/dashboardTable/SessionsOverview";
import LiveAlerts from "../../MyComponents/dashboardTable/LiveAlerts";
import ExamActivityChart from "../../MyComponents/dashboardTable/ExamActivityCharts";
import RecentAuditActivity from "../../MyComponents/dashboardTable/RecentAuditActivity";

const dashboardCards = [
  {
    key: "active-sessions",
    title: "Active Sessions",
    value: "2",
    subText: "live",
    subIcon: <AiFillThunderbolt />,
    subTextColor: "#6c8cff",
    icon: <MdOutlineSensors />,
    color: "rgb(108, 140, 255)",
    bg: "rgba(47, 85, 212, 0.15)",
  },
  {
    key: "students-in-exam",
    title: "Students In Exam",
    value: "214",
    subText: " 137",
    subTextColor: "#22c55e",
    icon: <MdGroups />,
    color: "rgb(20, 184, 166)",
    bg: "rgba(20, 184, 166, 0.15)",
  },
  {
    key: "open-alerts",
    title: "Open Alerts",
    value: "8",
    subText: " 2 exit",
    subTextColor: "#ef4444",
    icon: <WarningFilled />,
    color: "rgb(239, 68, 68)",
    bg: "rgba(239, 68, 68, 0.13)",
  },
  {
    key: "question-banks",
    title: "Question Banks",
    value: "47",
    subText: "3 draft",
    subTextColor: "#8b5cf6",
    icon: <FiInbox />,
    color: "rgb(139,92,246)",
    bg: "rgba(139,92,246,0.15)",
  },
  {
    key: "admin-users",
    title: "Admin Users",
    value: "19",
    subText: " 2",
    subTextColor: "#22c55e",
    icon: <MdManageAccounts />,
    color: "rgb(217,119,6)",
    bg: "rgba(217,119,6,0.15)",
  },
  {
    key: "uptime",
    title: "Uptime (30d)",
    value: "99.7%",
    subText: " 1.2",
    subTextColor: "#22c55e",
    icon: <FiCheckCircle />,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.15)",
  },
];

export default function DashboardCards() {
  const { token } = theme.useToken();

  return (
    <>
      <MyRow gutter={[16, 16]}>
        {dashboardCards.map((item) => (
          <MyCol key={item.key} xs={24} sm={12} md={8} lg={4}>
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
            <SessionsOverview />
            <ExamActivityChart />
          </Flex>
        </MyCol>
        <MyCol xs={24} lg={8}>
          <Flex vertical gap={20}>
            <LiveAlerts />
            <RecentAuditActivity />
          </Flex>
        </MyCol>
      </MyRow>
    </>
  );
}
