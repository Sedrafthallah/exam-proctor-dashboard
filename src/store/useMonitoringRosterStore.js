import { create } from "zustand";
import { fetchSessionStudents } from "../api/monitoringApi";

const useMonitoringRosterStore = create((set, get) => ({
  /** @type {Record<string, Array>} */
  studentsBySessionId: {},
  loadingSessionId: null,
  error: null,

  getStudents: (sessionId) => {
    if (sessionId == null) return [];
    return get().studentsBySessionId[String(sessionId)] ?? [];
  },

  fetchSessionStudents: async (sessionId, { silent = false } = {}) => {
    const id = String(sessionId);
    if (!silent) {
      set({ loadingSessionId: id, error: null });
    }
    try {
      const students = await fetchSessionStudents(sessionId);
      set((s) => ({
        studentsBySessionId: { ...s.studentsBySessionId, [id]: students },
        ...(silent ? {} : { loadingSessionId: null }),
      }));
      return students;
    } catch (e) {
      if (!silent) {
        set({
          loadingSessionId: null,
          error: e?.message ?? "Failed to load roster",
        });
      }
      throw e;
    }
  },

  /**
   * Patch one roster row by studentSessionId across all cached sessions.
   */
  patchStudent: (studentSessionId, fields) => {
    const sid = Number(studentSessionId);
    if (!Number.isFinite(sid) || !fields) return;

    set((state) => {
      const nextBySession = { ...state.studentsBySessionId };
      let changed = false;

      for (const [sessionKey, rows] of Object.entries(nextBySession)) {
        const idx = rows.findIndex(
          (r) => Number(r.studentSessionId) === sid,
        );
        if (idx === -1) continue;
        const nextRows = rows.slice();
        nextRows[idx] = { ...nextRows[idx], ...fields };
        nextBySession[sessionKey] = nextRows;
        changed = true;
      }

      return changed ? { studentsBySessionId: nextBySession } : state;
    });
  },

  clearSession: (sessionId) => {
    const id = String(sessionId);
    set((s) => {
      const next = { ...s.studentsBySessionId };
      delete next[id];
      return { studentsBySessionId: next };
    });
  },
}));

export default useMonitoringRosterStore;
