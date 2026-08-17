import { useEffect, useState } from "react";
import { theme, Flex, Tag, Avatar, Badge, Button, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import { getInitials } from "../usersTable/adminsData";
import { ALERT_TYPE_CONFIG } from "../../utils/alertUtils";
import {
  isMonitoringDegraded,
  pipelineLabel,
} from "../../utils/monitoringHealth";

const STATUS_TAG = {
  ACTIVE: { color: "success", label: "ACTIVE" },
  INPROGRESS: { color: "success", label: "IN PROGRESS" },
  IN_PROGRESS: { color: "success", label: "IN PROGRESS" },
  PENDING_AUTH: { color: "warning", label: "PENDING AUTH" },
  NOTSTARTED: { color: "default", label: "NOT STARTED" },
  NOT_STARTED: { color: "default", label: "NOT STARTED" },
  NotStarted: { color: "default", label: "NOT STARTED" },
  InProgress: { color: "success", label: "IN PROGRESS" },
  InExam: { color: "success", label: "IN EXAM" },
  INEXAM: { color: "success", label: "IN EXAM" },
  SUBMITTED: { color: "default", label: "SUBMITTED" },
  Submitted: { color: "default", label: "SUBMITTED" },
  TERMINATED: { color: "error", label: "TERMINATED" },
  Terminated: { color: "error", label: "TERMINATED" },
  EXPIRED: { color: "default", label: "EXPIRED" },
  Expired: { color: "default", label: "EXPIRED" },
};

function statusTagFor(status) {
  const raw = String(status ?? "").trim();
  if (!raw) return STATUS_TAG.NOTSTARTED;
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  return (
    STATUS_TAG[raw] ??
    STATUS_TAG[upper] ??
    STATUS_TAG[upper.replace(/-/g, "_")] ??
    STATUS_TAG.NOTSTARTED
  );
}

function formatLoginTime(loginAt) {
  if (!loginAt) return null;
  try {
    const d = new Date(loginAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

function watchDisabledReason(student, { canWatch, hubConnected }) {
  if (!canWatch) return "You do not have permission to watch.";
  if (!hubConnected) return "Hub is offline.";
  if (!student.hubOnline) return "Student is not connected to the hub.";
  if (student.watchBusy) return "A watch is already in progress.";
  return null;
}

export default function StudentStatusGrid({
  students,
  canWatch = false,
  hubConnected = false,
  activeWatchStudentSessionId = null,
  onWatch,
}) {
  const { token } = theme.useToken();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, []);

  if (!students?.length) {
    return (
      <MyText type="secondary">No students enrolled in this session.</MyText>
    );
  }

  return (
    <MyRow gutter={[16, 16]}>
      {students.map((student) => {
        const statusTag = statusTagFor(student.status);
        const latestAlertConfig = student.latestAlert
          ? ALERT_TYPE_CONFIG[student.latestAlert.type]
          : null;
        const loginTime = student.loginTime ?? formatLoginTime(student.loginAt);
        const disabledReason = watchDisabledReason(student, {
          canWatch,
          hubConnected,
        });
        const watchingThis =
          activeWatchStudentSessionId != null &&
          Number(activeWatchStudentSessionId) ===
            Number(student.studentSessionId);

        const degraded =
          student.hubOnline &&
          isMonitoringDegraded({
            pipelineStatus: student.pipelineStatus,
            lastHeartbeatAtUtc: student.lastHeartbeatAtUtc,
            attemptStatus: student.status,
            now: nowMs,
          });

        return (
          <MyCol
            key={student.studentSessionId ?? student.id}
            xs={24}
            sm={12}
            xl={8}
          >
            <MyCard
              styles={{ body: { padding: 14 } }}
              style={{
                borderRadius: 12,
                border: `1px solid ${
                  watchingThis ? token.colorPrimary : token.colorBorder
                }`,
                background: token.colorBgElevated,
                height: "100%",
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Flex align="center" gap={10}>
                  <Badge
                    dot
                    color={
                      student.hubOnline
                        ? token.colorSuccess
                        : token.colorTextQuaternary
                    }
                    offset={[-2, 30]}
                  >
                    <Avatar
                      size={34}
                      style={{
                        background: token.colorPrimary,
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {getInitials(student.name ?? student.studentName)}
                    </Avatar>
                  </Badge>
                  <Flex vertical gap={0}>
                    <MyText strong style={{ fontSize: 13.5 }}>
                      {student.name ?? student.studentName}
                    </MyText>
                    <MyText type="secondary" style={{ fontSize: 11.5 }}>
                      {student.id ?? student.studentNumber}
                    </MyText>
                  </Flex>
                </Flex>

                {(student.alertCount ?? 0) > 0 && (
                  <Badge count={student.alertCount} color={token.colorError} />
                )}
              </Flex>

              <Flex
                justify="space-between"
                align="center"
                style={{ marginTop: 12 }}
                wrap="wrap"
                gap={8}
              >
                <Tag
                  color={statusTag.color}
                  style={{
                    borderRadius: 5,
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {statusTag.label}
                </Tag>
                <Flex align="center" gap={4}>
                  <ClockCircleOutlined
                    style={{ fontSize: 11, color: token.colorTextTertiary }}
                  />
                  <MyText type="secondary" style={{ fontSize: 11.5 }}>
                    {loginTime ? `Logged in ${loginTime}` : "Not logged in"}
                  </MyText>
                </Flex>
              </Flex>

              {degraded && (
                <Tooltip
                  title={`Pipeline: ${pipelineLabel(student.pipelineStatus)}. Hub is up but monitoring heartbeat is stale or unhealthy.`}
                >
                  <Tag
                    icon={<WarningOutlined />}
                    color="warning"
                    style={{
                      marginTop: 10,
                      marginInlineEnd: 0,
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Monitoring degraded
                  </Tag>
                </Tooltip>
              )}

              {latestAlertConfig && (
                <Flex
                  align="center"
                  gap={6}
                  style={{
                    marginTop: 10,
                    padding: "5px 8px",
                    borderRadius: 6,
                    background: `${latestAlertConfig.color}14`,
                  }}
                >
                  {latestAlertConfig.icon}
                  <MyText
                    style={{
                      fontSize: 11.5,
                      color: latestAlertConfig.color,
                      fontWeight: 600,
                    }}
                  >
                    {latestAlertConfig.label}
                  </MyText>
                </Flex>
              )}

              <Flex justify="flex-end" style={{ marginTop: 12 }}>
                <Tooltip title={disabledReason ?? "Open live camera watch"}>
                  <Button
                    type={watchingThis ? "primary" : "default"}
                    size="small"
                    icon={
                      watchingThis ? <EyeOutlined /> : <VideoCameraOutlined />
                    }
                    disabled={!!disabledReason && !watchingThis}
                    onClick={() => onWatch?.(student)}
                  >
                    {watchingThis ? "Watching" : "Watch"}
                  </Button>
                </Tooltip>
              </Flex>
            </MyCard>
          </MyCol>
        );
      })}
    </MyRow>
  );
}
