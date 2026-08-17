/** Maps backend alert catalogue codes to UI type keys. */
export const ALERT_TYPE_MAP = {
  GazeDeviation: "GAZE_DEVIATION",
  FaceAbsence: "FACE_ABSENCE",
  MultipleFaces: "MULTIPLE_FACES",
  AppSwitch: "APP_SWITCH",
  AudioThreshold: "AUDIO_THRESHOLD",
  ConnectivityLost: "CONNECTIVITY_LOST",
};

/** Normalize backend AlertStatus (enum string or legacy numeric code). */
export function mapAlertStatus(raw) {
  if (raw == null || raw === "") return "UNKNOWN_STATUS";
  const s = String(raw);
  const lower = s.toLowerCase();
  if (s === "0" || lower === "open") return "OPEN";
  if (lower === "resolved") return "RESOLVED";
  if (lower === "escalated") return "ESCALATED";
  if (s === "OPEN" || s === "RESOLVED" || s === "ESCALATED") return s;
  return `UNKNOWN_STATUS_${s}`;
}

/** Normalize backend AlertSeverity (enum string or legacy numeric code). */
export function mapAlertSeverity(raw) {
  if (raw == null || raw === "") return "Unknown";
  const s = String(raw);
  const lower = s.toLowerCase();
  if (s === "0" || lower === "info") return "Info";
  if (lower === "warning") return "Warning";
  if (lower === "critical") return "Critical";
  if (s === "Info" || s === "Warning" || s === "Critical") return s;
  return `Severity ${s}`;
}

/**
 * Maps a backend AlertEventDto (REST or hub AlertCreated) into UI alert shape.
 */
export function mapAlert(a) {
  const alertType = a.alertType ?? a.AlertType ?? "";
  return {
    id: String(a.id ?? a.Id ?? ""),
    type: ALERT_TYPE_MAP[alertType] ?? String(alertType).toUpperCase(),
    typeCode: alertType,
    description: a.alertDescription ?? a.AlertDescription ?? "",
    status: mapAlertStatus(a.status ?? a.Status),
    statusCode: a.status ?? a.Status,
    severity: mapAlertSeverity(a.severity ?? a.Severity),
    severityCode: a.severity ?? a.Severity,
    student: (a.studentName ?? a.StudentName) || "Unknown",
    studentNumber: a.studentNumber ?? a.StudentNumber ?? null,
    studentId: a.studentId ?? a.StudentId ?? null,
    studentSessionId: Number(
      a.studentSessionId ?? a.StudentSessionId ?? NaN,
    ),
    session: (a.sessionName ?? a.SessionName) || "—",
    sessionId: a.sessionId ?? a.SessionId ?? null,
    timestamp: a.triggeredAt ?? a.TriggeredAt,
    snapshotUrl: a.snapshotUrl ?? a.SnapshotUrl ?? null,
    actionTaken: a.actionTaken ?? a.ActionTaken ?? null,
    actionNote: a.actionNote ?? a.ActionNote ?? null,
    actionAt: a.actionAt ?? a.ActionAt ?? null,
  };
}

/** Map hub AlertUpdated.newStatus into UI status. */
export function mapHubAlertStatus(newStatus) {
  return mapAlertStatus(newStatus);
}
