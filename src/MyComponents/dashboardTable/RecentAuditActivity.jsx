import { theme, Button, List, Avatar, Flex } from "antd";
import {
  HistoryOutlined,
  ArrowUpOutlined,
  LockOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

const AUDIT_CONFIG = {
  PUBLISH: {
    icon: <ArrowUpOutlined />,
    color: "#2f54eb",
    bg: "rgba(47, 84, 235, 0.15)",
  },
  LOCK: {
    icon: <LockOutlined />,
    color: "#722ed1",
    bg: "rgba(114, 46, 209, 0.15)",
  },
  TERMINATE: {
    icon: <CloseCircleOutlined />,
    color: "#f5222d",
    bg: "rgba(245, 34, 45, 0.15)",
  },
  CREATE_USER: {
    icon: <UserAddOutlined />,
    color: "#52c41a",
    bg: "rgba(82, 196, 26, 0.15)",
  },
  IMPORT: {
    icon: <FileExcelOutlined />,
    color: "#fa8c16",
    bg: "rgba(250, 140, 22, 0.15)",
  },
};

const DEFAULT_AUDIT_CONFIG = {
  icon: <HistoryOutlined />,
  color: "#8c8c8c",
  bg: "rgba(140, 140, 140, 0.15)",
};

const getAuditConfig = (type) => AUDIT_CONFIG[type] ?? DEFAULT_AUDIT_CONFIG;

// Swap `audits` for a paginated GET /api/audit-logs?limit=5 call once the endpoint is ready.
const staticAudits = [
  {
    id: "1",
    type: "PUBLISH",
    user: "Sedra Fathallah",
    action: "published session",
    details: "EP-2025-CS210-M",
    time: "2m ago",
  },
  {
    id: "2",
    type: "LOCK",
    user: "Dr. Lina Abbas",
    action: "locked question bank",
    details: "QB-2025-CS301-F_v3",
    time: "18m ago",
  },
  {
    id: "3",
    type: "TERMINATE",
    user: "Fadi Nasser",
    action: "terminated student",
    details: "S-20211847 · CS301",
    time: "32m ago",
  },
  {
    id: "4",
    type: "CREATE_USER",
    user: "Sedra Fathallah",
    action: "created admin account",
    details: "y.tannous@damascus.edu",
    time: "1h ago",
  },
  {
    id: "5",
    type: "IMPORT",
    user: "Yara Tannous",
    action: "imported roster",
    details: "88 students · CS210",
    time: "2h ago",
  },
];

export default function RecentAuditActivity({
  audits = staticAudits,
  onViewAuditLogs,
}) {
  const { token } = theme.useToken();

  return (
    <MyCard
      title={
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <HistoryOutlined
              style={{ color: token.colorPrimary, fontSize: 16 }}
            />
            <MyText strong>Recent Audit Activity</MyText>
          </Flex>
          <Button
            type="link"
            size="small"
            style={{ fontSize: 12, fontWeight: 600, padding: 0 }}
            onClick={onViewAuditLogs}
          >
            Audit logs
          </Button>
        </Flex>
      }
      style={{
        width: "100%",
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
    >
      <List
        split={false}
        dataSource={audits}
        locale={{ emptyText: "No recent activity" }}
        renderItem={(item) => {
          const config = getAuditConfig(item.type);

          return (
            <List.Item
              key={item.id}
              style={{ padding: "0 0 16px", border: "none" }}
            >
              <Flex
                justify="space-between"
                align="flex-start"
                gap={12}
                style={{ width: "100%" }}
              >
                <Flex gap={12} align="flex-start" style={{ flex: 1 }}>
                  <Avatar
                    shape="square"
                    size={32}
                    icon={config.icon}
                    style={{
                      background: config.bg,
                      color: config.color,
                      fontSize: 15,
                    }}
                  />
                  <Flex vertical gap={2}>
                    <MyText
                      style={{
                        fontSize: 13,
                        color: token.colorTextDescription,
                        lineHeight: 1.4,
                      }}
                    >
                      <MyText strong style={{ color: token.colorText }}>
                        {item.user}
                      </MyText>{" "}
                      {item.action}
                    </MyText>
                    <MyText
                      type="secondary"
                      style={{ fontSize: 11, fontFamily: "monospace" }}
                    >
                      {item.details}
                    </MyText>
                  </Flex>
                </Flex>

                <MyText
                  type="secondary"
                  style={{ fontSize: 11, whiteSpace: "nowrap" }}
                >
                  {item.time}
                </MyText>
              </Flex>
            </List.Item>
          );
        }}
      />
    </MyCard>
  );
}
