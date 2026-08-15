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

  fetchSessionStudents: async (sessionId) => {
    const id = String(sessionId);
    set({ loadingSessionId: id, error: null });
    try {
      const students = await fetchSessionStudents(sessionId);
      set((s) => ({
        studentsBySessionId: { ...s.studentsBySessionId, [id]: students },
        loadingSessionId: null,
      }));
      return students;
    } catch (e) {
      set({
        loadingSessionId: null,
        error: e?.message ?? "Failed to load roster",
      });
      throw e;
    }
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
