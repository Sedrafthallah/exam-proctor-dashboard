import { useState } from "react";
import { theme, Flex, Select, Tooltip, message } from "antd";
import {
  FileZipOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";
import MyButtonSecondary from "../../MyComponents/myButton/MyButtonSecondary";
import ResponseViewerTable from "../../MyComponents/reportsTable/ResponseViewerTable";
import useSessionStore from "../../store/useSessionStore";
import useAuthStore from "../../store/useAuthStore";
import { useSessionResponses } from "../../store/useReportsStore";
import { getSessionStatus, getStatusConfig } from "../../utils/sessionUtils";
import {
  downloadTextFile,
  buildGradingPackageCsv,
  buildGradingPackageJson,
  buildSignedAuditLog,
} from "../../utils/downloadUtils";

export default function Reports() {
  const { token } = theme.useToken();
  const sessions = useSessionStore((state) => state.sessions);
  const currentUser = useAuthStore((state) => state.user);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const hasPermission = (perm) => isSuperAdmin || currentUser?.permissions?.[perm] === true;
  const canExport = isSuperAdmin || hasPermission("P07");

  const reportableSessions = sessions.filter((session) =>
    ["CLOSED", "ARCHIVED"].includes(getSessionStatus(session)),
  );

  const [selectedSessionId, setSelectedSessionId] = useState(
    reportableSessions[0]?.id ?? null,
  );

  const selectedSession = reportableSessions.find((s) => s.id === selectedSessionId) ?? null;
  const responses = useSessionResponses(selectedSession?.id);
  const status = selectedSession ? getSessionStatus(selectedSession) : null;
  const statusConfig = status ? getStatusConfig(status) : null;

  const sessionOptions = reportableSessions.map((session) => ({
    value: session.id,
    label: `${session.sessionTitle} · ${session.courseCode} · ${dayjs(session.scheduledStartUTC).format("YYYY-MM-DD")}`,
  }));

  const handleDownloadCsv = () => {
    if (!selectedSession) return;
    downloadTextFile(
      `${selectedSession.courseCode}-grading-package.csv`,
      buildGradingPackageCsv(selectedSession, responses),
      "text/csv",
    );
    message.success("Grading-ready package (CSV) downloaded.");
  };

  const handleDownloadJson = () => {
    if (!selectedSession) return;
    downloadTextFile(
      `${selectedSession.courseCode}-grading-package.json`,
      buildGradingPackageJson(selectedSession, responses),
      "application/json",
    );
    message.success("Grading-ready package (JSON) downloaded.");
  };

  const handleDownloadAuditLog = () => {
    if (!selectedSession) return;
    downloadTextFile(
      `${selectedSession.courseCode}-signed-audit-log.json`,
      buildSignedAuditLog(selectedSession, responses),
      "application/json",
    );
    message.success("Signed audit log downloaded.");
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex vertical gap={4}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            Reports & Exports
          </MyTitle>
          <MyText type="secondary">
            {selectedSession && statusConfig
              ? `${selectedSession.courseCode} · ${statusConfig.label.toUpperCase()} — response viewer and export packages.`
              : "Session data exports and signed incident logs for closed sessions."}
          </MyText>
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
            border: `1px solid ${token.colorBorder}`,
            background: token.colorBgElevated,
            textAlign: "center",
          }}
        >
          <MyText type="secondary">
            No closed or archived sessions available for reporting yet.
          </MyText>
        </MyCard>
      ) : (
        <>
          <MyRow gutter={[20, 20]}>
            <MyCol xs={24} lg={12}>
              <MyCard
                style={{
                  borderRadius: 14,
                  boxShadow: token.boxShadow,
                  border: `1px solid ${token.colorBorder}`,
                  background: token.colorBgElevated,
                  height: "100%",
                }}
              >
                <Flex gap={14} align="flex-start">
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: token.colorPrimaryBg,
                      flexShrink: 0,
                    }}
                  >
                    <FileZipOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                  </Flex>
                  <Flex vertical gap={4}>
                    <MyText strong style={{ fontSize: 14.5 }}>
                      Grading-Ready Package
                    </MyText>
                    <MyText type="secondary" style={{ fontSize: 13 }}>
                      Session metadata, question manifest, auto-scored results and score
                      summary with SHA-256 manifest.
                    </MyText>
                  </Flex>
                </Flex>
                <Flex gap={10} style={{ marginTop: 18 }}>
                  <Tooltip title={!canExport ? "Requires export permission (P-07)." : ""}>
                    <MyButtonPrimary
                      icon={<FileZipOutlined />}
                      disabled={!canExport}
                      onClick={handleDownloadCsv}
                    >
                      CSV ZIP
                    </MyButtonPrimary>
                  </Tooltip>
                  <Tooltip title={!canExport ? "Requires export permission (P-07)." : ""}>
                    <MyButtonSecondary
                      icon={<CodeOutlined />}
                      disabled={!canExport}
                      onClick={handleDownloadJson}
                    >
                      JSON
                    </MyButtonSecondary>
                  </Tooltip>
                </Flex>
              </MyCard>
            </MyCol>

            <MyCol xs={24} lg={12}>
              <MyCard
                style={{
                  borderRadius: 14,
                  boxShadow: token.boxShadow,
                  border: `1px solid ${token.colorBorder}`,
                  background: token.colorBgElevated,
                  height: "100%",
                }}
              >
                <Flex gap={14} align="flex-start">
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: token.colorErrorBg,
                      flexShrink: 0,
                    }}
                  >
                    <SafetyCertificateOutlined style={{ fontSize: 18, color: token.colorError }} />
                  </Flex>
                  <Flex vertical gap={4}>
                    <MyText strong style={{ fontSize: 14.5 }}>
                      Signed Audit Log
                    </MyText>
                    <MyText type="secondary" style={{ fontSize: 13 }}>
                      Cryptographically signed incident log for disciplinary use, kept
                      separate from grading. Requires export permission (P-07).
                    </MyText>
                  </Flex>
                </Flex>
                <Flex gap={10} style={{ marginTop: 18 }}>
                  <Tooltip title={!canExport ? "Requires export permission (P-07)." : ""}>
                    <MyButtonPrimary
                      icon={<DownloadOutlined />}
                      disabled={!canExport}
                      onClick={handleDownloadAuditLog}
                    >
                      Download Signed Log
                    </MyButtonPrimary>
                  </Tooltip>
                </Flex>
              </MyCard>
            </MyCol>
          </MyRow>

          <ResponseViewerTable responses={responses} />
        </>
      )}
    </Flex>
  );
}
