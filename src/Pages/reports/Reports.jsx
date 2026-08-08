import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { theme, Flex, Select, Tag, Tooltip, Divider, message } from "antd";
import {
  FileZipOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  CalendarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import useSessionStore from "../../store/useSessionStore";
import useAuthStore from "../../store/useAuthStore";
import { getSessionStatus, getStatusConfig } from "../../utils/sessionUtils";
import { apiFetch } from "../../api/apiClient";

export default function Reports() {
  const { token } = theme.useToken();
  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const canExport = hasPermission("ExportData");

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const reportableSessions = sessions.filter((session) =>
    ["CLOSED", "ARCHIVED"].includes(getSessionStatus(session)),
  );

  const [selectedSessionId, setSelectedSessionId] = useState(
    reportableSessions[0]?.id ?? null,
  );

  const [searchParams] = useSearchParams();

  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  if (searchParams !== prevSearchParams) {
    setPrevSearchParams(searchParams);
    const sessionId = searchParams.get("sessionId");
    if (sessionId) {
      const found = reportableSessions.find((s) => s.id === sessionId);
      if (found) setSelectedSessionId(found.id);
    }
  }

  const selectedSession =
    reportableSessions.find((s) => s.id === selectedSessionId) ?? null;

  const status = selectedSession ? getSessionStatus(selectedSession) : null;
  const statusConfig = status ? getStatusConfig(status) : null;

  const sessionOptions = reportableSessions.map((session) => ({
    value: session.id,
    label: `${session.sessionTitle} · ${session.courseCode} · ${dayjs(session.scheduledStartUTC).format("YYYY-MM-DD")}`,
  }));

  const handleDownloadCsv = async () => {
    if (!selectedSessionId) return;
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(
        `/api/exam-sessions/${selectedSessionId}/export/grading`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        message.error("Failed to export grading report.");
        return;
      }

      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grading-${selectedSessionId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("Grading report downloaded.");
    } catch (err) {
      console.error("export grading error:", err);
      message.error("Network error.");
    }
  };

  const handleDownloadAuditLog = async () => {
    if (!selectedSessionId) return;
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(
        `/api/exam-sessions/${selectedSessionId}/export/audit-log`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        message.error("Failed to export audit log.");
        return;
      }

      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${selectedSessionId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("Audit log downloaded.");
    } catch (err) {
      console.error("export audit log error:", err);
      message.error("Network error.");
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
            <FolderOpenOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Reports & Exports
            </MyTitle>
            <MyText type="secondary">
              Session data exports and signed incident logs for closed sessions.
            </MyText>
          </Flex>
        </Flex>
        <Select
          value={selectedSessionId}
          onChange={setSelectedSessionId}
          options={sessionOptions}
          placeholder="Select a session"
          style={{ minWidth: 320 }}
          notFoundContent="No closed or archived sessions"
        />
      </Flex>

      {!selectedSession ? (
        <MyCard
          style={{
            borderRadius: 14,
            border: `1px dashed ${token.colorBorder}`,
            background: token.colorBgElevated,
          }}
          styles={{ body: { padding: "48px 24px" } }}
        >
          <Flex vertical align="center" gap={10}>
            <InboxOutlined
              style={{ fontSize: 32, color: token.colorTextQuaternary }}
            />
            <MyText type="secondary">
              No closed or archived sessions available for reporting yet.
            </MyText>
          </Flex>
        </MyCard>
      ) : (
        <Flex vertical gap={20}>
          <MyCard
            style={{
              borderRadius: 14,
              border: `1px solid ${token.colorBorder}`,
              background: token.colorBgElevated,
            }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={10}>
              <Flex align="center" gap={10}>
                <MyText strong style={{ fontSize: 15 }}>
                  {selectedSession.sessionTitle}
                </MyText>
                <Tag
                  color={statusConfig.color}
                  style={{ borderRadius: 5, margin: 0 }}
                >
                  {statusConfig.label.toUpperCase()}
                </Tag>
              </Flex>
              <Flex align="center" gap={16}>
                <MyText type="secondary" style={{ fontSize: 13 }}>
                  {selectedSession.courseCode}
                </MyText>
                <Flex align="center" gap={6}>
                  <CalendarOutlined
                    style={{ fontSize: 12, color: token.colorTextTertiary }}
                  />
                  <MyText type="secondary" style={{ fontSize: 13 }}>
                    {dayjs(selectedSession.scheduledStartUTC).format(
                      "YYYY-MM-DD",
                    )}
                  </MyText>
                </Flex>
              </Flex>
            </Flex>
          </MyCard>

          <MyRow gutter={[24, 24]}>
            <MyCol xs={24} lg={12}>
              <MyCard
                hoverable
                style={{
                  borderRadius: 16,
                  boxShadow: token.boxShadow,
                  border: `1px solid ${token.colorBorder}`,
                  borderTop: `4px solid ${token.colorPrimary}`,
                  background: token.colorBgElevated,
                  height: "100%",
                  minHeight: 380,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                styles={{ body: { padding: "40px 36px", height: "100%" } }}
              >
                <Flex
                  vertical
                  align="center"
                  gap={16}
                  style={{ height: "100%" }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 18,
                      background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorPrimaryBgHover})`,
                      flexShrink: 0,
                    }}
                  >
                    <FileZipOutlined
                      style={{ fontSize: 30, color: token.colorPrimary }}
                    />
                  </Flex>
                  <Flex vertical align="center" gap={8}>
                    <MyText strong style={{ fontSize: 18 }}>
                      Grading-Ready Package
                    </MyText>
                    <MyText
                      type="secondary"
                      style={{
                        fontSize: 14,
                        textAlign: "center",
                        maxWidth: 340,
                        lineHeight: 1.6,
                      }}
                    >
                      Session metadata, question manifest, auto-scored results
                      and score summary with SHA-256 manifest.
                    </MyText>
                  </Flex>

                  <Divider style={{ margin: "8px 0" }} />

                  <Flex
                    vertical
                    align="center"
                    gap={10}
                    style={{ width: "100%", marginTop: "auto" }}
                  >
                    <Flex gap={12} justify="center" style={{ width: "100%" }}>
                      <Tooltip
                        title={
                          !canExport ? "Requires the Export Data permission." : ""
                        }
                      >
                        <MyButtonPrimary
                          size="large"
                          icon={<FileZipOutlined />}
                          disabled={!canExport}
                          onClick={handleDownloadCsv}
                          style={{ flex: 1 }}
                        >
                          CSV ZIP
                        </MyButtonPrimary>
                      </Tooltip>
                      <Tooltip
                        title={
                          !canExport ? "Requires the Export Data permission." : ""
                        }
                      ></Tooltip>
                    </Flex>
                    {!canExport && (
                      <MyText type="secondary" style={{ fontSize: 12 }}>
                        Export requires the Export Data permission.
                      </MyText>
                    )}
                  </Flex>
                </Flex>
              </MyCard>
            </MyCol>

            <MyCol xs={24} lg={12}>
              <MyCard
                hoverable
                style={{
                  borderRadius: 16,
                  boxShadow: token.boxShadow,
                  border: `1px solid ${token.colorBorder}`,
                  borderTop: `4px solid ${token.colorError}`,
                  background: token.colorBgElevated,
                  height: "100%",
                  minHeight: 380,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                styles={{ body: { padding: "40px 36px", height: "100%" } }}
              >
                <Flex
                  vertical
                  align="center"
                  gap={16}
                  style={{ height: "100%" }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 18,
                      background: `linear-gradient(135deg, ${token.colorErrorBg}, ${token.colorErrorBgHover})`,
                      flexShrink: 0,
                    }}
                  >
                    <SafetyCertificateOutlined
                      style={{ fontSize: 30, color: token.colorError }}
                    />
                  </Flex>
                  <Flex vertical align="center" gap={8}>
                    <MyText strong style={{ fontSize: 18 }}>
                      Signed Audit Log
                    </MyText>
                    <MyText
                      type="secondary"
                      style={{
                        fontSize: 14,
                        textAlign: "center",
                        maxWidth: 340,
                        lineHeight: 1.6,
                      }}
                    >
                      Cryptographically signed incident log for disciplinary
                      use, kept separate from grading. Requires the Export
                      Data permission.
                    </MyText>
                  </Flex>

                  <Divider style={{ margin: "8px 0" }} />

                  <Flex
                    vertical
                    align="center"
                    gap={10}
                    style={{ width: "100%", marginTop: "auto" }}
                  >
                    <Tooltip
                      title={
                        !canExport ? "Requires the Export Data permission." : ""
                      }
                      style={{ width: "100%" }}
                    >
                      <MyButtonPrimary
                        size="large"
                        icon={<DownloadOutlined />}
                        disabled={!canExport}
                        onClick={handleDownloadAuditLog}
                        style={{ width: "100%", maxWidth: 280 }}
                      >
                        Download Signed Log
                      </MyButtonPrimary>
                    </Tooltip>
                    {!canExport && (
                      <MyText type="secondary" style={{ fontSize: 12 }}>
                        Requires the Export Data permission.
                      </MyText>
                    )}
                  </Flex>
                </Flex>
              </MyCard>
            </MyCol>
          </MyRow>
        </Flex>
      )}
    </Flex>
  );
}
