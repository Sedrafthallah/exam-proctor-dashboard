import { theme, Flex, Badge, Avatar, Popconfirm } from "antd";
import {
  EyeInvisibleOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  SwapOutlined,
  SoundOutlined,
  CheckOutlined,
  NotificationOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import { getInitials } from "../usersTable/adminsData";

dayjs.extend(relativeTime);

const ALERT_TYPE_CONFIG = {
  GAZE_DEVIATION: {
    label: "Gaze Deviation",
    description: "Eyes off-screen beyond threshold",
    color: "#eab308",
    icon: <EyeInvisibleOutlined />,
    severity: "WARNING",
  },
  FACE_ABSENCE: {
    label: "Face Absence",
    description: "No face detected in camera frame",
    color: "#ef4444",
    icon: <UserDeleteOutlined />,
    severity: "CRITICAL",
  },
  MULTIPLE_FACES: {
    label: "Multiple Faces",
    description: "More than one face detected",
    color: "#ef4444",
    icon: <TeamOutlined />,
    severity: "CRITICAL",
  },
  APP_SWITCH: {
    label: "App Switch",
    description: "Switched to another application or window",
    color: "#f97316",
    icon: <SwapOutlined />,
    severity: "WARNING",
  },
  AUDIO_THRESHOLD: {
    label: "Audio Threshold",
    description: "Ambient audio exceeded the allowed threshold",
    color: "#3b82f6",
    icon: <SoundOutlined />,
    severity: "WARNING",
  },
};

const STATUS_CONFIG = {
  OPEN: { status: "processing", color: "blue", label: "Open" },
  RESOLVED: { status: "success", color: "green", label: "Resolved" },
  ESCALATED: { status: "error", color: "red", label: "Escalated" },
};

export default function AlertsTable({ alerts, canAct, onDismiss, onWarn, onEscalate }) {
  const { token } = theme.useToken();

  const columns = [
    {
      title: "Alert",
      key: "alert",
      width: 240,
      render: (_, record) => {
        const config = ALERT_TYPE_CONFIG[record.type];
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
            {getInitials(record.studentName)}
          </Avatar>
          <Flex vertical gap={0}>
            <MyText style={{ fontSize: 13 }}>{record.studentName}</MyText>
            <MyText type="secondary" style={{ fontSize: 11.5 }}>
              {record.studentId}
            </MyText>
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Session",
      dataIndex: "sessionTitle",
      key: "sessionTitle",
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
        const { status: badgeStatus, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
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

