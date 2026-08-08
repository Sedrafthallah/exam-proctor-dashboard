import { theme, Flex, Badge, Avatar, List, Popconfirm } from "antd";
import { BellOutlined, CheckOutlined, NotificationOutlined, ArrowUpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import { ALERT_TYPE_CONFIG, ALERT_STATUS_CONFIG, DEFAULT_ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

dayjs.extend(relativeTime);

const ESCALATABLE_TYPES = ["FACE_ABSENCE", "MULTIPLE_FACES"];

export default function AlertFeed({ alerts, canAct, onDismiss, onWarn, onEscalate }) {
  const { token } = theme.useToken();
  const unreadCount = alerts.filter((a) => a.status === "OPEN").length;

  return (
    <MyCard
      title={
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <BellOutlined style={{ fontSize: 16, color: token.colorError }} />
            <MyText strong>Alert Feed</MyText>
          </Flex>
          <Badge count={unreadCount} color={token.colorError} />
        </Flex>
      }
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
        height: "100%",
      }}
      styles={{ body: { maxHeight: 640, overflowY: "auto" } }}
    >
      <List
        split={false}
        dataSource={alerts}
        locale={{ emptyText: "No alerts for this session" }}
        renderItem={(alert) => {
          const config = ALERT_TYPE_CONFIG[alert.type] ?? DEFAULT_ALERT_TYPE_CONFIG;
          const statusConfig = ALERT_STATUS_CONFIG[alert.status] ?? ALERT_STATUS_CONFIG.OPEN;
          const showActions = canAct && alert.status === "OPEN";

          return (
            <List.Item
              key={alert.id}
              style={{
                padding: "10px 12px",
                marginBottom: 10,
                borderRadius: 8,
                background: `${config.color}0f`,
                borderLeft: `4px solid ${config.color}`,
                display: "block",
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Flex gap={10} align="flex-start">
                  <Avatar
                    shape="square"
                    size={26}
                    icon={config.icon}
                    style={{ background: "transparent", color: config.color }}
                  />
                  <Flex vertical gap={1}>
                    <MyText style={{ fontWeight: 600, color: config.color, fontSize: 13 }}>
                      {config.label}
                    </MyText>
                    <MyText type="secondary" style={{ fontSize: 11.5 }}>
                      {alert.student}
                    </MyText>
                  </Flex>
                </Flex>

                <MyText type="secondary" style={{ fontSize: 11, fontFamily: "monospace" }}>
                  {dayjs(alert.timestamp).fromNow()}
                </MyText>
              </Flex>

              {showActions ? (
                <Flex gap={6} wrap="wrap" style={{ marginTop: 10 }}>
                  <MyButtonSecondary size="small" icon={<CheckOutlined />} onClick={() => onDismiss(alert)}>
                    Dismiss
                  </MyButtonSecondary>
                  <MyButtonSecondary size="small" icon={<NotificationOutlined />} onClick={() => onWarn(alert)}>
                    Warn
                  </MyButtonSecondary>
                  {ESCALATABLE_TYPES.includes(alert.type) && (
                    <Popconfirm
                      title="Escalate this alert?"
                      description="This flags it for immediate proctor/admin review."
                      okText="Escalate"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => onEscalate(alert)}
                    >
                      <MyButtonPrimary size="small" danger icon={<ArrowUpOutlined />}>
                        Escalate
                      </MyButtonPrimary>
                    </Popconfirm>
                  )}
                </Flex>
              ) : (
                <MyText
                  type="secondary"
                  style={{ display: "block", marginTop: 8, fontSize: 11.5, color: statusConfig.color }}
                >
                  {statusConfig.label}
                </MyText>
              )}
            </List.Item>
          );
        }}
      />
    </MyCard>
  );
}
