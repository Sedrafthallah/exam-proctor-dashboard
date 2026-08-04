import { create } from "zustand";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

const ACTION_LABELS = {
  AutoTransition:       "auto-transitioned session",
  SessionStarted:       "started session",
  SessionEnded:         "ended session",
  WarningSent:          "sent warning",
  CreatedExamSession:   "created exam session",
  PublishedExamSession: "published session",
  DeletedExamSession:   "deleted session",
  ExtendedSession:      "extended session time",
  CreatedAdmin:         "created admin account",
  DeletedAdmin:         "deleted admin account",
  ImportedRoster:       "imported roster CSV",
  ExportedGrading:      "exported grading package",
  LockedQuestionBank:   "locked question bank",
};

const useAuditLogStore = create((set) => ({
  logs: [],
  loading: false,

  fetchAuditLogs: async () => {
    set({ loading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/audits?Page=1&PageSize=50", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch audit logs");
      }

      const logs = json.data.map((a) => ({
        id: String(a.id),
        actor: a.actorName || a.actorType || "System",
        action: ACTION_LABELS[a.action] ?? a.action,
        target: a.entityName || a.entityType || "—",
        type: a.action,
        details: a.details,
        timestamp: a.occurredAt,
        examSessionId: a.examSessionId,
      }));

      set({ logs, loading: false });
    } catch (err) {
      console.error("fetchAuditLogs error:", err);
      set({ loading: false });
    }
  },
}));

export default useAuditLogStore;
