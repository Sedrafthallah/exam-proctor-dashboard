import { apiFetch } from "./apiClient";
import useAuthStore from "../store/useAuthStore";

function authHeaders() {
  const accessToken = useAuthStore.getState().accessToken;
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
}

/**
 * Live roster for an exam session (includes studentSessionId for Watch).
 * GET /api/monitoring/sessions/{sessionId}/students
 */
export async function fetchSessionStudents(sessionId) {
  const res = await apiFetch(`/api/monitoring/sessions/${sessionId}/students`, {
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => ({}));

  if (res.status === 403) {
    throw new Error("NOT_ASSIGNED");
  }

  if (!res.ok || json.statusCode !== 200 || !Array.isArray(json.data)) {
    throw new Error(json.message ?? "Failed to load session students");
  }

  return json.data.map((row) => ({
    studentSessionId: Number(row.studentSessionId),
    studentId: Number(row.studentId),
    studentName: row.studentName ?? "Unknown",
    studentNumber: row.studentNumber ?? "",
    status: String(row.status ?? "Unknown"),
    loginAt: row.loginAt ?? null,
    openAlertCount: Number(row.openAlertCount ?? 0),
    latestAlertType: row.latestAlertType ?? null,
    pipelineStatus: row.pipelineStatus ?? null,
    lastHeartbeatAtUtc: row.lastHeartbeatAtUtc ?? null,
  }));
}
