import { useState, useEffect } from "react";
import { theme, Button, Tag, List, Flex } from "antd";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { ClockCircleOutlined } from "@ant-design/icons";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

const STATUS_CONFIG = {
  DRAFT: { color: "default", label: "Draft" },
  SCHEDULED: { color: "blue", label: "Scheduled" },
  LOCKED: { color: "warning", label: "Locked" },
  ACTIVE: { color: "success", label: "Active" },
  GRACE: { color: "magenta", label: "Grace Period" },
  CLOSED: { color: "error", label: "Closed" },
  ARCHIVED: { color: "purple", label: "Archived" },
};

const getStatusConfig = (status) => {
  const normalizedStatus = status ? status.trim().toUpperCase() : "";
  return (
    STATUS_CONFIG[normalizedStatus] ?? {
      color: "default",
      label: status || "Unknown",
    }
  );
};

const DynamicTimer = ({ initialSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);

  const format = (num) => String(num).padStart(2, "0");

  return (
    <MyText style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>
      <ClockCircleOutlined style={{ marginRight: 5 }} />
      {hours > 0
        ? `${format(hours)}:${format(minutes)}:${format(seconds)}`
        : `${format(minutes)}:${format(seconds)}`}
    </MyText>
  );
};

// Swap `sessions` for a GET /api/dashboard/sessions call (sliced to 4) once the endpoint is ready.
const staticSessions = [
  {
    id: "1",
    title: "Midterm Exam - CS101",
    subTitle: "Dr. Ahmad ",
    status: "Active",
    seconds: 3252,
  },
  {
    id: "2",
    title: "Final Quiz - Math202",
    subTitle: "Eng. Sarah ",
    status: "Grace",
    seconds: 263,
  },
  {
    id: "3",
    title: "Programming Basics",
    subTitle: "Dr. Ali ",
    status: "Scheduled",
    seconds: 8100,
  },
  {
    id: "4",
    title: "Database Systems Sync",
    subTitle: "Dr. Rania ",
    status: "Locked",
    seconds: 0,
  },
];

export default function SessionsOverview({ sessions = staticSessions, onViewAll }) {
  const { token } = theme.useToken();

  return (
    <MyCard
      title={
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <LuChartNoAxesCombined
              style={{ fontSize: 18, color: token.colorPrimary }}
            />
            <MyText strong>Sessions Overview</MyText>
          </Flex>
          <Button
            type="text"
            size="small"
            style={{
              borderRadius: 6,
              fontSize: 12,
              color: token.colorPrimary,
              fontWeight: 600,
            }}
            onClick={onViewAll}
          >
            View All
          </Button>
        </Flex>
      }
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
    >
      <List
        split={false}
        dataSource={sessions}
        locale={{ emptyText: "No sessions to show" }}
        renderItem={(session) => {
          const statusConfig = getStatusConfig(session.status);

          return (
            <List.Item
              key={session.id}
              style={{
                padding: "14px 18px",
                marginBottom: 12,
                borderRadius: 10,
                background: token.colorFillSecondary,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ width: "100%" }}
              >
                <Flex vertical gap={4}>
                  <Flex align="center" gap={10} wrap="wrap">
                    <MyText strong style={{ fontSize: 14 }}>
                      {session.title}
                    </MyText>

                    <Tag
                      color={statusConfig.color}
                      style={{
                        borderRadius: 5,
                        padding: "1px 7px",
                        fontSize: 11,
                        fontWeight: 600,
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      {statusConfig.label}
                    </Tag>
                  </Flex>

                  <MyText type="secondary" style={{ fontSize: 12 }}>
                    {session.subTitle}
                  </MyText>
                </Flex>

                <Flex align="center">
                  {session.seconds > 0 && (
                    <DynamicTimer
                      key={`${session.id}-${session.seconds}`}
                      initialSeconds={session.seconds}
                    />
                  )}
                </Flex>
              </Flex>
            </List.Item>
          );
        }}
      />
    </MyCard>
  );
}
