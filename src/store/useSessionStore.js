import { create } from "zustand";
import dayjs from "dayjs";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";
export const INITIAL_SESSIONS = [
  {
    id: "sess-001",
    sessionTitle: "CS301 Final — Spring 2025",
    courseCode: "CS301",
    scheduledStartUTC: "2025-06-10T08:00:00Z", // ماضي بكثير → CLOSED
    duration: 90,
    gracePeriod: 5,
    loginWindow: 15,
    questionBank: "QB-2025-CS301",
    proctor: "Manar Aljarkas",
    enrolledStudents: 214,
    questionRandomisation: true,
    optionShuffle: true,
    audioMonitoring: true,
    gazeThreshold: 3,
    faceAlertSensitivity: "Medium",
    published: true,
    archived: false,
  },
  {
    id: "sess-002",
    sessionTitle: "DB202 Midterm",
    courseCode: "DB202",
    scheduledStartUTC: dayjs().subtract(20, "minute").toISOString(), // ماضي قريب → ACTIVE أو GRACE
    duration: 60,
    gracePeriod: 5,
    loginWindow: 15,
    questionBank: "QB-2025-DB202",
    proctor: "Manar Aljarkas",
    enrolledStudents: 98,
    questionRandomisation: true,
    optionShuffle: false,
    audioMonitoring: false,
    gazeThreshold: 3,
    faceAlertSensitivity: "Low",
    published: true,
    archived: false,
  },
  {
    id: "sess-003",
    sessionTitle: "NET410 Quiz 3",
    courseCode: "NET410",
    scheduledStartUTC: dayjs().add(12, "hour").toISOString(), // ضمن نافذة T-24h → LOCKED
    duration: 45,
    gracePeriod: 5,
    loginWindow: 10,
    questionBank: "QB-2025-NET410",
    proctor: "Inas Alqadiri",
    enrolledStudents: 55,
    questionRandomisation: false,
    optionShuffle: false,
    audioMonitoring: true,
    gazeThreshold: 5,
    faceAlertSensitivity: "High",
    published: true,
    archived: false,
  },
  {
    id: "sess-004",
    sessionTitle: "AI501 Final Project",
    courseCode: "AI501",
    scheduledStartUTC: "2026-07-15T11:00:00Z", // مستقبل بعيد → SCHEDULED
    duration: 120,
    gracePeriod: 10,
    loginWindow: 20,
    questionBank: "QB-2025-AI501",
    proctor: "Manar Aljarkas",
    enrolledStudents: 42,
    questionRandomisation: true,
    optionShuffle: true,
    audioMonitoring: true,
    gazeThreshold: 3,
    faceAlertSensitivity: "Medium",
    published: true,
    archived: false,
  },
  {
    id: "sess-005",
    sessionTitle: "CS101 Intro Quiz",
    courseCode: "CS101",
    scheduledStartUTC: "2026-08-01T10:00:00Z", // مستقبل + مش منشور → DRAFT
    duration: 30,
    gracePeriod: 5,
    loginWindow: 15,
    questionBank: null,
    proctor: null,
    enrolledStudents: 0,
    questionRandomisation: false,
    optionShuffle: false,
    audioMonitoring: false,
    gazeThreshold: 3,
    faceAlertSensitivity: "Medium",
    published: false, // ← DRAFT
    archived: false,
  },
  {
    id: "sess-006",
    sessionTitle: "CS201 Spring 2024",
    courseCode: "CS201",
    scheduledStartUTC: "2024-12-10T08:00:00Z", // قديم جداً → ARCHIVED
    duration: 90,
    gracePeriod: 5,
    loginWindow: 15,
    questionBank: "QB-2024-CS201",
    proctor: "Inas Alqadiri",
    enrolledStudents: 180,
    questionRandomisation: true,
    optionShuffle: true,
    audioMonitoring: false,
    gazeThreshold: 3,
    faceAlertSensitivity: "Medium",
    published: true,
    archived: true, // ← ARCHIVED
  },
  {
    id: "sess-007",
    sessionTitle: "MTH120 Final Exam",
    courseCode: "MTH120",
    scheduledStartUTC: "2025-05-20T09:00:00Z", // ماضي بكثير → CLOSED
    duration: 60,
    gracePeriod: 5,
    loginWindow: 15,
    questionBank: "QB-2025-MTH120",
    proctor: "Manar Aljarkas",
    enrolledStudents: 64,
    questionRandomisation: true,
    optionShuffle: true,
    audioMonitoring: true,
    gazeThreshold: 3,
    faceAlertSensitivity: "Medium",
    published: true,
    archived: false,
  },
  {
    id: "sess-008",
    sessionTitle: "PHY210 Midterm",
    courseCode: "PHY210",
    scheduledStartUTC: "2025-04-02T10:00:00Z", // ماضي بكثير → CLOSED
    duration: 75,
    gracePeriod: 5,
    loginWindow: 15,
    questionBank: "QB-2025-PHY210",
    proctor: "Inas Alqadiri",
    enrolledStudents: 87,
    questionRandomisation: true,
    optionShuffle: false,
    audioMonitoring: true,
    gazeThreshold: 4,
    faceAlertSensitivity: "High",
    published: true,
    archived: false,
  },
];

const useSessionStore = create((set) => ({
  sessions: [],
  weeklyStatistics: [],
  weeklyStatisticsLoading: false,
  loading: false,
  stats: {
    activeSessions: 0,
    studentsInExam: 0,
    openAlerts: 0,
    questionBanks: 0,
    adminUsers: 0,
  },

  fetchStats: async () => {
    try {
      const accessToken = useAuthStore.getState().accessToken;

      const res = await apiFetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok && json.statusCode === 200) {
        set({ stats: json.data });
      }
    } catch (error) {
      console.error("fetchStats error:", error);
    }
  },

  fetchSessions: async () => {
    set({ loading: true });
    try {
      const accessToken = useAuthStore.getState().accessToken;

      const res = await apiFetch("/api/exam-sessions?pageSize=100&page=1", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch sessions");
      }

      const sessions = json.data.map((s) => ({
        id: String(s.id),
        sessionTitle: s.title,
        courseCode: s.courseTag,
        status: s.status, // ← جاهز من الباك مباشرة
        scheduledStartUTC: s.startTime,
        duration: s.durationMinutes,
        gracePeriod: s.gracePeriodMinutes,
        loginWindow: s.loginWindowMinutes,
        gazeThreshold: s.eyeGazeThresholdSec,
        questionBank: s.questionBankName ?? null,
        questionBankId: s.questionBankId ?? null,
        lockedAt: s.lockedAt ?? null,
        closedAt: s.closedAt ?? null,
        createdAt: s.createdAt ?? null,
        createdBy: s.createdBy ?? null,
        // حقول ناقصة من الباك — رح تتضاف لاحقاً
        enrolledStudents: s.enrolledStudents ?? 0,
        proctor: s.assignedProctor ?? null,
        published: s.status !== "DRAFT",
        archived: s.status === "ARCHIVED",
        // monitoring defaults
        audioMonitoring: s.audioMonitoring ?? false,
        faceAlertSensitivity: s.faceAlertSensitivity ?? "Medium",
        questionRandomisation: s.questionRandomisation ?? true,
        optionShuffle: s.optionShuffle ?? true,
      }));

      set({ sessions, loading: false });
    } catch (error) {
      console.error("fetchSessions error:", error);
      set({ loading: false });
    }
  },

  // Creates a new session as a Draft — it only becomes visible to students once
  // published from the sessions table.
  addSession: (fields) =>
    set((state) => ({
      sessions: [
        ...state.sessions,
        {
          id: `sess-${Date.now()}`,
          enrolledStudents: 0,
          published: false,
          archived: false,
          ...fields,
        },
      ],
    })),

  // Applies edits from the session edit modal. The modal only submits fields
  // that isEditable() allowed for the session's current status.
  updateSession: (sessionId, fields) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...fields } : s,
      ),
    })),

  // Drafts only — a published session can't be deleted from the UI.
  deleteSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  publishSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, published: true } : s,
      ),
    })),

  // Super Admin only: lets a locked (T-24h) session be edited like a
  // SCHEDULED one (proctor/roster) despite the lock window.
  emergencyOverrideSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, emergencyOverride: true } : s,
      ),
    })),

  // Super Admin only: adds minutes to a session that's currently running.
  extendSessionTime: (sessionId, extraMinutes) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, duration: s.duration + extraMinutes } : s,
      ),
    })),

  // P-04 (Live Proctor) only: force-ends a running session early.
  terminateSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, forceClosed: true } : s,
      ),
    })),

  fetchWeeklyStatistics: async () => {
    set({ weeklyStatisticsLoading: true });

    try {
      // جيبي الـ token من useAuthStore
      const accessToken = useAuthStore.getState().accessToken;

      const response = await apiFetch("/api/exam-sessions/weekly-statistics", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.statusCode !== 200) {
        throw new Error(result.message || "Failed to fetch weekly statistics");
      }

      const chartData = result.data.map((item) => ({
        day: item.day.slice(0, 3),
        sessions: item.totalSessions,
        submissions: item.totalStudents,
      }));

      set({ weeklyStatistics: chartData, weeklyStatisticsLoading: false });
    } catch (error) {
      console.error("Weekly statistics error:", error);
      set({ weeklyStatistics: [], weeklyStatisticsLoading: false });
    }
  },
}));
export default useSessionStore;
