import { theme, Flex, Badge, Avatar, Tag, Tooltip } from "antd";
import { CheckOutlined, NotificationOutlined, ArrowUpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import { getInitials, getPermissionLabel } from "../usersTable/adminsData";
import { ALERT_TYPE_CONFIG, ALERT_STATUS_CONFIG, DEFAULT_ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

dayjs.extend(relativeTime);

export default function AlertsTable({
  alerts,
  pagination,
  canDismiss,
  canWarn,
  canEscalate,
  onDismiss,
  onWarn,
  onEscalate,
}) {
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
                {record.description || config.description}
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
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      render: (severity) => (
        <Tag style={{ margin: 0 }}>{severity}</Tag>
      ),
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
        const config = ALERT_STATUS_CONFIG[status];
        if (!config) {
          return <Badge status="default" text={<MyText style={{ fontSize: 12.5 }}>{status}</MyText>} />;
        }
        return <Badge status={config.status} text={<MyText style={{ fontSize: 12.5 }}>{config.label}</MyText>} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 230,
      render: (_, record) => {
        // A moderator action was already recorded on this alert elsewhere —
        // show it read-only rather than offering the buttons again.
        if (record.actionTaken) {
          return (
            <Tooltip title={record.actionNote || undefined}>
              <Tag style={{ margin: 0 }}>
                {record.actionTaken}
                {record.actionAt ? ` · ${dayjs(record.actionAt).fromNow()}` : ""}
              </Tag>
            </Tooltip>
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
            <Tooltip
              title={canDismiss ? "" : `Requires the ${getPermissionLabel("DismissAlert")} permission.`}
            >
              <MyButtonSecondary
                size="small"
                icon={<CheckOutlined />}
                disabled={!canDismiss}
                onClick={() => onDismiss(record)}
              >
                Dismiss
              </MyButtonSecondary>
            </Tooltip>
            <Tooltip
              title={canWarn ? "" : `Requires the ${getPermissionLabel("WarnStudent")} permission.`}
            >
              <MyButtonSecondary
                size="small"
                icon={<NotificationOutlined />}
                disabled={!canWarn}
                onClick={() => onWarn(record)}
              >
                Warn
              </MyButtonSecondary>
            </Tooltip>
            <Tooltip
              title={canEscalate ? "" : `Requires the ${getPermissionLabel("EscalateAlert")} permission.`}
            >
              <MyButtonPrimary
                size="small"
                danger
                icon={<ArrowUpOutlined />}
                disabled={!canEscalate}
                onClick={() => onEscalate(record)}
              >
                Escalate
              </MyButtonPrimary>
            </Tooltip>
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
        pagination={pagination ?? false}
        locale={{ emptyText: "No alerts match this filter" }}
      />
    </MyCard>
  );
}

