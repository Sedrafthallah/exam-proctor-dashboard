import { theme, Flex } from "antd";
import { DownloadOutlined, AuditOutlined } from "@ant-design/icons";

import useAuditLogStore from "../../store/useAuditLogStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonSecondary from "../../MyComponents/myButton/MyButtonSecondary";

import AuditLogFeed from "../../MyComponents/auditLogsTable/AuditLogFeed";

export default function AuditLogs() {
  const { token } = theme.useToken();
  const logs = useAuditLogStore((state) => state.logs);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              boxShadow: `0 6px 16px -6px ${token.colorPrimary}`,
              flexShrink: 0,
            }}
          >
            <AuditOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Audit Logs
            </MyTitle>
            <MyText type="secondary">Immutable, signed record of every administrative action.</MyText>
          </Flex>
        </Flex>

        <MyButtonSecondary icon={<DownloadOutlined />} onClick={handleExport}>
          Export Log
        </MyButtonSecondary>
      </Flex>

      <AuditLogFeed logs={logs} />
    </Flex>
  );
}
