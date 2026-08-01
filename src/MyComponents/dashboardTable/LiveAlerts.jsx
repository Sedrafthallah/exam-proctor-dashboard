import { theme, Badge, List, Avatar, Flex } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";
import { ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

dayjs.extend(relativeTime);

const DEFAULT_ALERT_CONFIG = {
  color: "#6b7280",
  bg: "rgba(107, 114, 128, 0.08)",
  border: "rgba(107, 114, 128, 0.15)",
  icon: <BellOutlined />,
};

const getAlertConfig = (type) => {
  const config = ALERT_TYPE_CONFIG[type];
  if (!config) return { ...DEFAULT_ALERT_CONFIG, label: type || "Unknown" };
  return { ...config, bg: `${config.color}14`, border: `${config.color}26` };
};

// Swap `alerts` for a WebSocket/polling feed once the live-alerts API is ready.
export default function LiveAlerts({ alerts = [], title = "Live Alerts" }) {
  const { token } = theme.useToken();

  return (
    <MyCard
      title={
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <BellOutlined style={{ fontSize: 16, color: token.colorError }} />
            <MyText strong>{title}</MyText>
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
                  {dayjs(alert.timestamp).fromNow()}
                </MyText>
              </Flex>
            </List.Item>
          );
        }}
      />
    </MyCard>
  );
}
