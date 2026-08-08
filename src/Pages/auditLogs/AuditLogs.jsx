import { useEffect, useState } from "react";
import { theme, Flex, message } from "antd";
import { DownloadOutlined, AuditOutlined } from "@ant-design/icons";

import useAuditLogStore from "../../store/useAuditLogStore";
import useAuthStore from "../../store/useAuthStore";
import { apiFetch } from "../../api/apiClient";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonSecondary from "../../MyComponents/myButton/MyButtonSecondary";

import AuditLogFeed from "../../MyComponents/auditLogsTable/AuditLogFeed";

export default function AuditLogs() {
  const { token } = theme.useToken();
  const logs = useAuditLogStore((state) => state.logs);
  const loading = useAuditLogStore((state) => state.loading);
  const page = useAuditLogStore((state) => state.page);
  const pageSize = useAuditLogStore((state) => state.pageSize);
  const total = useAuditLogStore((state) => state.total);
  const fetchAuditLogs = useAuditLogStore((state) => state.fetchAuditLogs);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const accessToken =
        useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/audits/export", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        message.error("Failed to export audit log.");
        return;
      }

      const csvText = await res.text();
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      message.error("Failed to export audit log.");
    } finally {
      setExporting(false);
    }
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

        <MyButtonSecondary icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
          Export Log
        </MyButtonSecondary>
      </Flex>

      <AuditLogFeed
        logs={logs}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (newPage, newPageSize) => fetchAuditLogs(newPage, newPageSize),
          showSizeChanger: true,
        }}
      />
    </Flex>
  );
}
