import { theme, Button, List, Avatar, Flex } from "antd";
import {
  HistoryOutlined,
  ArrowUpOutlined,
  LockOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyText from "../../MyComponents/myText/MyText";

dayjs.extend(relativeTime);

// Keyed by the audit action names returned by GET /api/audits (see ACTION_LABELS
// in useAuditLogStore.js). Actions not listed here fall back to DEFAULT_AUDIT_CONFIG.
const AUDIT_CONFIG = {
  PublishedExamSession: {
    icon: <ArrowUpOutlined />,
    color: "#2f54eb",
    bg: "rgba(47, 84, 235, 0.15)",
  },
  LockedQuestionBank: {
    icon: <LockOutlined />,
    color: "#722ed1",
    bg: "rgba(114, 46, 209, 0.15)",
  },
  DeletedExamSession: {
    icon: <CloseCircleOutlined />,
    color: "#f5222d",
    bg: "rgba(245, 34, 45, 0.15)",
  },
  CreatedAdmin: {
    icon: <UserAddOutlined />,
    color: "#52c41a",
    bg: "rgba(82, 196, 26, 0.15)",
  },
  ImportedRoster: {
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

export default function RecentAuditActivity({
  audits = [],
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
                        {item.actor}
                      </MyText>{" "}
                      {item.action}
                    </MyText>
                    <MyText
                      type="secondary"
                      style={{ fontSize: 11, fontFamily: "monospace" }}
                    >
                      {item.target}
                    </MyText>
                  </Flex>
                </Flex>

                <MyText
                  type="secondary"
                  style={{ fontSize: 11, whiteSpace: "nowrap" }}
                >
                  {dayjs(item.timestamp).fromNow()}
                </MyText>
              </Flex>
            </List.Item>
          );
        }}
      />
    </MyCard>
  );
}
