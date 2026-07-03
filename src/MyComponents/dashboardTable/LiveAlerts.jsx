import { theme, Badge, List, Avatar, Flex } from "antd";
import { BellOutlined } from "@ant-design/icons";
import {
  BsPeopleFill,
  BsWindowX,
  BsWifiOff,
  BsEyeSlashFill,
} from "react-icons/bs";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

const ALERT_CONFIG = {
  MULTIPLE_FACES: {
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.15)",
    icon: <BsPeopleFill size={16} />,
    label: "Multiple Faces",
  },
  APP_SWITCH: {
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.08)",
    border: "rgba(249, 115, 22, 0.15)",
    icon: <BsWindowX size={15} />,
    label: "App Switch",
  },
  CONNECTIVITY_LOST: {
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.08)",
    border: "rgba(234, 179, 8, 0.15)",
    icon: <BsWifiOff size={16} />,
    label: "Connectivity Lost",
  },
  GAZE_DEVIATION: {
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.08)",
    border: "rgba(168, 85, 247, 0.15)",
    icon: <BsEyeSlashFill size={16} />,
    label: "Gaze Deviation",
  },
};

const DEFAULT_ALERT_CONFIG = {
  color: "#6b7280",
  bg: "rgba(107, 114, 128, 0.08)",
  border: "rgba(107, 114, 128, 0.15)",
  icon: <BellOutlined />,
};

const getAlertConfig = (type) => {
  const normalizedType = type ? type.toUpperCase() : "";
  const config = ALERT_CONFIG[normalizedType];
  return config ?? { ...DEFAULT_ALERT_CONFIG, label: type || "Unknown" };
};

const staticAlerts = [
  {
    id: "1",
    type: "MULTIPLE_FACES",
    studentName: "Layla Mansour",
    studentId: "S-20211847",
    time: "00:12",
  },
  {
    id: "2",
    type: "APP_SWITCH",
    studentName: "Layla Mansour",
    studentId: "S-20211847",
    time: "00:40",
  },
  {
    id: "3",
    type: "CONNECTIVITY_LOST",
    studentName: "Karim Nasir",
    studentId: "S-20211285",
    time: "01:30",
  },
  {
    id: "4",
    type: "GAZE_DEVIATION",
    studentName: "Omar Khalil",
    studentId: "S-20210934",
    time: "02:15",
  },
];

// Swap `alerts` for a WebSocket/polling feed once the live-alerts API is ready.
export default function LiveAlerts({ alerts = staticAlerts }) {
  const { token } = theme.useToken();

  return (
    <MyCard
      title={
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <BellOutlined style={{ fontSize: 16, color: token.colorError }} />
            <MyText strong>Live Alerts</MyText>
          </Flex>
          <Flex align="center" gap={6}>
            <Badge status="processing" color={token.colorSuccess} />
            <MyText
              type="secondary"
              style={{
                fontSize: 11,
                fontWeight: 500,
                fontFamily: "monospace",
              }}
            >
              WSS
            </MyText>
          </Flex>
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
        dataSource={alerts}
        locale={{ emptyText: "No active alerts" }}
        renderItem={(alert) => {
          const config = getAlertConfig(alert.type);

          return (
            <List.Item
              key={alert.id}
              style={{
                padding: "10px 14px",
                marginBottom: 10,
                borderRadius: 8,
                background: config.bg,
                borderLeft: `4px solid ${config.color}`,
                borderTop: `1px solid ${config.border}`,
                borderRight: `1px solid ${config.border}`,
                borderBottom: `1px solid ${config.border}`,
              }}
            >
              <Flex
                justify="space-between"
                align="flex-start"
                style={{ width: "100%" }}
              >
                <Flex gap={10} align="flex-start">
                  <Avatar
                    shape="square"
                    size={26}
                    icon={config.icon}
                    style={{ background: "transparent", color: config.color }}
                  />
                  <Flex vertical gap={1}>
                    <MyText
                      style={{
                        fontWeight: 600,
                        color: config.color,
                        fontSize: 13,
                      }}
                    >
                      {config.label}
                    </MyText>
                    <MyText type="secondary" style={{ fontSize: 11 }}>
                      {alert.studentName}{" "}
                      <MyText type="secondary" style={{ fontSize: 11 }}>
                        • {alert.studentId}
                      </MyText>
                    </MyText>
                  </Flex>
                </Flex>

                <MyText
                  type="secondary"
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    fontWeight: 500,
                  }}
                >
                  {alert.time}
                </MyText>
              </Flex>
            </List.Item>
          );
        }}
      />
    </MyCard>
  );
}
