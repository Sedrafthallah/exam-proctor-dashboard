import { theme, Flex, Badge, Avatar, Popconfirm } from "antd";
import { CheckOutlined, NotificationOutlined, ArrowUpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import { getInitials } from "../usersTable/adminsData";
import { ALERT_TYPE_CONFIG, ALERT_STATUS_CONFIG, DEFAULT_ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

dayjs.extend(relativeTime);

export default function AlertsTable({ alerts, canAct, onDismiss, onWarn, onEscalate }) {
  const { token } = theme.useToken();

  const columns = [
    {
      title: "Alert",
      key: "alert",
      width: 240,
      render: (_, record) => {
        const config = ALERT_TYPE_CONFIG[record.type] ?? DEFAULT_ALERT_TYPE_CONFIG;
        return (
          <Flex align="flex-start" gap={10}>
            <Avatar
              shape="square"
              size={28}
              icon={config.icon}
              style={{ background: "transparent", color: config.color, fontSize: 15 }}
            />
            <Flex vertical gap={1}>
              <MyText strong style={{ fontSize: 13.5, color: config.color }}>
                {config.label}
              </MyText>
              <MyText type="secondary" style={{ fontSize: 12 }}>
                {config.description}
              </MyText>
            </Flex>
          </Flex>
        );
      },
    },
    {
      title: "Student",
      key: "student",
      width: 190,
      render: (_, record) => (
        <Flex align="center" gap={10}>
          <Avatar size={28} style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 11 }}>
            {getInitials(record.student)}
          </Avatar>
          <MyText style={{ fontSize: 13 }}>{record.student}</MyText>
        </Flex>
      ),
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
      width: 190,
      render: (title) => <MyText style={{ fontSize: 13 }}>{title}</MyText>,
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 110,
      render: (timestamp) => (
        <MyText type="secondary" style={{ fontSize: 12.5 }}>
          {dayjs(timestamp).fromNow()}
        </MyText>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        const { status: badgeStatus, label } = ALERT_STATUS_CONFIG[status] ?? ALERT_STATUS_CONFIG.OPEN;
        return <Badge status={badgeStatus} text={<MyText style={{ fontSize: 12.5 }}>{label}</MyText>} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: canAct ? 230 : 90,
      render: (_, record) => {
        if (!canAct) {
          return (
            <MyText type="secondary" style={{ fontSize: 12.5 }}>
              —
            </MyText>
          );
        }

        if (record.status !== "OPEN") {
          return (
            <MyText type="secondary" style={{ fontSize: 12.5 }}>
              —
            </MyText>
          );
        }

        return (
          <Flex gap={6} wrap="wrap">
            <MyButtonSecondary size="small" icon={<CheckOutlined />} onClick={() => onDismiss(record)}>
              Dismiss
            </MyButtonSecondary>
            <MyButtonSecondary
              size="small"
              icon={<NotificationOutlined />}
              onClick={() => onWarn(record)}
            >
              Warn
            </MyButtonSecondary>
            <Popconfirm
              title="Escalate this alert?"
              description="This flags it for immediate proctor/admin review."
              okText="Escalate"
              okButtonProps={{ danger: true }}
              onConfirm={() => onEscalate(record)}
            >
              <MyButtonPrimary size="small" danger icon={<ArrowUpOutlined />}>
                Escalate
              </MyButtonPrimary>
            </Popconfirm>
          </Flex>
        );
      },
    },
  ];

  return (
    <MyCard
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <MyTable
        columns={columns}
        dataSource={alerts}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No alerts match this filter" }}
      />
    </MyCard>
  );
}

