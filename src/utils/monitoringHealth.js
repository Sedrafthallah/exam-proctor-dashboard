/** Default student heartbeat interval (seconds) when policy is unknown. */
export const HEARTBEAT_INTERVAL_SECONDS = 10;

/** Staleness window = 2 × heartbeat interval (PROCTORING_REALTIME_CONTRACT). */
export const HEARTBEAT_STALE_MULTIPLIER = 2;

/**
 * How often Live Monitoring re-fetches roster presence from REST.
 * Hub pushes are primary; this is a safety net if a beat notify is missed.
 */
export const PRESENCE_REFRESH_INTERVAL_MS =
  HEARTBEAT_INTERVAL_SECONDS * 1000;

/**
 * Hub online ≠ monitoring healthy.
 * Degraded when pipeline is not OK, or last heartbeat is older than 2×H.
 * If the student is InExam (or similar) and has never heartbeated, treat as degraded.
 */
export function isMonitoringDegraded({
  pipelineStatus,
  lastHeartbeatAtUtc,
  attemptStatus,
  now = Date.now(),
  heartbeatIntervalSeconds = HEARTBEAT_INTERVAL_SECONDS,
} = {}) {
  const pipeline = pipelineStatus != null ? String(pipelineStatus) : null;
  if (pipeline === "CAMERA_DOWN" || pipeline === "ENGINE_DEGRADED") {
    return true;
  }

  if (!lastHeartbeatAtUtc) {
    const s = String(attemptStatus ?? "").toLowerCase().replace(/[_\s]/g, "");
    return s === "inexam" || s === "inprogress" || s === "active";
  }

  const last = new Date(lastHeartbeatAtUtc).getTime();
  if (Number.isNaN(last)) return true;

  const maxAgeMs =
    heartbeatIntervalSeconds * HEARTBEAT_STALE_MULTIPLIER * 1000;
  return now - last > maxAgeMs;
}

/** Short label for pipeline badge. */
export function pipelineLabel(pipelineStatus) {
  switch (String(pipelineStatus ?? "")) {
    case "OK":
      return "OK";
    case "CAMERA_DOWN":
      return "Camera down";
    case "ENGINE_DEGRADED":
      return "Engine degraded";
    default:
      return pipelineStatus ? String(pipelineStatus) : "No heartbeat";
  }
}
