import { create } from "zustand";
import { message } from "antd";
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
    published: false,
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

const useSessionStore = create((set, get) => ({
  sessions: [],
  page: 1,
  pageSize: 100,
  total: 0,
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

  fetchSessions: async (page = get().page, pageSize = get().pageSize) => {
    set({ loading: true });
    try {
      const accessToken = useAuthStore.getState().accessToken;

      const res = await apiFetch(`/api/exam-sessions?pageSize=${pageSize}&page=${page}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch sessions");
      }

      const sessions = json.data.items.map((s) => ({
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
        updatedAt: s.updatedAt ?? null,
        updatedBy: s.updatedBy ?? null,
        enrolledStudents: s.studentCount ?? 0,
        proctor: s.proctorName ?? null,
        published: s.status !== "DRAFT",
        archived: s.status === "ARCHIVED",
        // monitoring defaults
        audioMonitoring: s.audioMonitoring ?? false,
        faceAlertSensitivity: s.faceAlertSensitivity ?? "Medium",
        questionRandomisation: s.questionRandomisation ?? true,
        optionShuffle: s.optionShuffle ?? true,
      }));

      set({
        sessions,
        page: json.data.page,
        pageSize: json.data.pageSize,
        total: json.data.totalCount,
        loading: false,
      });
    } catch (error) {
      console.error("fetchSessions error:", error);
      set({ loading: false });
    }
  },

  // Time-range-aware lookup used by the proctor pickers in NewSessionModal /
  // EditRosterModal — only returns proctors actually free during the window,
  // so no client-side role filtering of the full admins list is needed.
  fetchAvailableProctors: async (startTime, endTime) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(
        `/api/exam-sessions/available-proctors?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) return [];

      return json.data; // [{ id, fullName, email }]
    } catch (err) {
      console.error("fetchAvailableProctors error:", err);
      return [];
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

  // Confirmed via a working Postman request against POST /api/exam-sessions:
  // this endpoint expects multipart/form-data (PascalCase field names), not
  // JSON — sending JSON was the root cause of the previous 400 "Invalid
  // session settings" on every attempt. Do NOT set a Content-Type header
  // below; the browser must set it itself so it can include the multipart
  // boundary string.
  createSessionApi: async (fields) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("Title", fields.sessionTitle);
      formData.append("CourseCode", fields.courseCode);
      formData.append("ScheduledStart", fields.scheduledStartUTC);
      formData.append("DurationMinutes", fields.duration);
      formData.append("GracePeriodMinutes", fields.gracePeriod);
      formData.append("LoginWindowMinutes", fields.loginWindow);
      if (fields.questionBankId != null) {
        formData.append("QuestionBankId", fields.questionBankId);
      }
      formData.append("EyeGazeThresholdSec", fields.gazeThreshold ?? 3);
      formData.append("FaceAlertSensitivity", fields.faceAlertSensitivity ?? "Medium");
      formData.append("QuestionRandomisation", fields.questionRandomisation ?? true);
      formData.append("OptionShuffle", fields.optionShuffle ?? true);
      formData.append("AudioMonitoring", fields.audioMonitoring ?? true);
      // Single append today since the UI only selects one proctor; if
      // fields.proctorId ever becomes an array, loop and append once per id
      // — that's the standard way to send an array via form-data.
      if (fields.proctorId) {
        formData.append("AssignedProctorIds", fields.proctorId);
      }
      if (fields.studentsFile) {
        formData.append("StudentsCsvFile", fields.studentsFile);
      }

      const res = await apiFetch("/api/exam-sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || (json.statusCode !== 200 && json.statusCode !== 201)) {
        message.error(json.message || "Failed to create session.");
        return false;
      }

      const s = json.data.session;

      const newSession = {
        id: String(s.id),
        sessionTitle: s.title,
        courseCode: s.courseTag,
        status: s.status,
        scheduledStartUTC: s.startTime,
        duration: s.durationMinutes,
        gracePeriod: s.gracePeriodMinutes,
        loginWindow: s.loginWindowMinutes,
        gazeThreshold: s.eyeGazeThresholdSec,
        faceAlertSensitivity: s.faceAlertSensitivity,
        questionRandomisation: s.randomization,
        optionShuffle: s.optionShuffle,
        audioMonitoring: false,
        questionBank: s.questionBankTitle ?? null,
        questionBankId: s.questionBankId ?? null,
        proctor: s.assignedProctors?.[0]?.fullName ?? null,
        enrolledStudents: 0,
        published: false,
        archived: false,
      };

      set((state) => ({
        sessions: [newSession, ...state.sessions],
      }));

      message.success(`"${s.title}" created as draft.`);
      return true;
    } catch (err) {
      console.error("createSessionApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

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

  deleteSessionApi: async (id) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/exam-sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to delete session.");
        return false;
      }

      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
      }));

      message.success("Session deleted successfully.");
      return true;
    } catch (err) {
      console.error("deleteSessionApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

  publishSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, published: true } : s,
      ),
    })),

  publishSessionApi: async (id) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/exam-sessions/${id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to publish session.");
        return false;
      }

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: "SCHEDULED", published: true } : s,
        ),
      }));

      message.success("Session published successfully.");
      return true;
    } catch (err) {
      console.error("publishSessionApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

  // extend
  extendSessionTimeApi: async (id, extraMinutes) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/exam-sessions/${id}/extend-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ExtraMinutes: Number(extraMinutes),
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to extend session.");
        return false;
      }

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id
            ? {
                ...s,
                duration: s.duration + extraMinutes,
              }
            : s,
        ),
      }));

      message.success("Session extended successfully.");
      return true;
    } catch (err) {
      console.error("extendSessionTimeApi error:", err);
      message.error("Network error.");
      return false;
    }
  },
  //update
  updateSessionApi: async (id, fields) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/exam-sessions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: fields.sessionTitle,
          durationMinutes: fields.duration,
          questionBankId: fields.questionBankId ?? null,
          gracePeriodMinutes: fields.gracePeriod,
          loginWindowMinutes: fields.loginWindow,
          eyeGazeThresholdSec: fields.gazeThreshold,
          // Only included when the proctor field was actually part of this
          // edit (see EditSessionModal's handleFinish) — previously omitted
          // entirely, so reassigning a proctor from "Edit Session" silently
          // never reached the backend. NOTE: assumed to follow the same
          // assignedProctorIds shape createSessionApi/editRestoreSessionApi
          // use for this same resource — confirm with the backend if wrong.
          ...(fields.proctorId !== undefined
            ? { assignedProctorIds: fields.proctorId ? [fields.proctorId] : [] }
            : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to update session.");
        return false;
      }

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id
            ? {
                ...s,
                sessionTitle: json.data.title,
                duration: json.data.durationMinutes,
                questionBank: json.data.questionBankTitle,
                questionBankId: String(json.data.questionBankId),
                gracePeriod: json.data.gracePeriodMinutes,
                loginWindow: json.data.loginWindowMinutes,
                gazeThreshold: json.data.eyeGazeThresholdSec,
                proctor: json.data.assignedProctors?.[0]?.fullName ?? s.proctor,
              }
            : s,
        ),
      }));

      message.success("Session updated successfully.");
      return true;
    } catch (err) {
      console.error("updateSessionApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

  // edit restore
  editRestoreSessionApi: async (id, fields) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/exam-sessions/${id}/edit-restore`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          assignedProctorIds: fields.assignedProctorIds,
          studentIdsToAdd: fields.studentIdsToAdd,
          studentIdsToRemove: fields.studentIdsToRemove,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to update roster.");
        return false;
      }

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, ...json.data } : s,
        ),
      }));

      message.success("Roster updated successfully.");
      return true;
    } catch (err) {
      console.error("editRestoreSessionApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

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

  // MonitorExamSession permission only: force-ends a running session early.
  terminateSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, forceClosed: true } : s,
      ),
    })),

  fetchSessionById: async (id) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/exam-sessions/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) return null;

      const s = json.data;

      return {
        id: String(s.id),
        sessionTitle: s.title,
        courseCode: s.courseTag,
        status: s.status,
        scheduledStartUTC: s.startTime,
        duration: s.durationMinutes,
        gracePeriod: s.gracePeriodMinutes,
        loginWindow: s.loginWindowMinutes,
        gazeThreshold: s.eyeGazeThresholdSec,
        faceAlertSensitivity: s.faceAlertSensitivity,
        questionRandomisation: s.randomization,
        optionShuffle: s.optionShuffle,
        audioMonitoring: s.audioMonitoring ?? false,
        questionBank: s.questionBankTitle ?? null,
        questionBankId: s.questionBankId ?? null,
        proctor: s.assignedProctors?.[0]?.fullName ?? null,
        enrolledStudents: s.enrolledStudents?.length ?? 0,
      };
    } catch (err) {
      console.error("fetchSessionById error:", err);
      return null;
    }
  },

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
// Proctor dashboard — separate lightweight endpoints, not part of the store
// (no client state to keep in sync), just fetch-and-return for AdminWelcome.
export async function fetchProctorSummaryCards() {
  try {
    const accessToken =
      useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

    const res = await apiFetch("/api/proctor-dashboard/summary-cards", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.error("fetchProctorSummaryCards error:", err);
    return null;
  }
}

export async function fetchProctorAlertCountsByType(days = 7) {
  try {
    const accessToken =
      useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

    const res = await apiFetch(`/api/proctor-dashboard/alert-counts-by-type?days=${days}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await res.json();
    return json.data ?? [];
  } catch (err) {
    console.error("fetchProctorAlertCountsByType error:", err);
    return [];
  }
}

export default useSessionStore;
