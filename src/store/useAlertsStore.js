import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

const ALERT_TYPE_MAP = {
  GazeDeviation:    "GAZE_DEVIATION",
  FaceAbsence:      "FACE_ABSENCE",
  MultipleFaces:    "MULTIPLE_FACES",
  AppSwitch:        "APP_SWITCH",
  AudioThreshold:   "AUDIO_THRESHOLD",
  ConnectivityLost: "CONNECTIVITY_LOST",
};

// Backend now sends `status` as a numeric-string code instead of the
// previously-guessed `isDelivered` boolean. Only "0" has been observed in
// practice so far (an alert with no actionTaken yet), so it's mapped onto
// the OPEN/RESOLVED/ESCALATED vocabulary the rest of the app already
// filters/gates action buttons on (see AlertsTable, AlertFeed, Alerts.jsx,
// AdminWelcome.jsx, Dashboard.jsx). TODO: confirm the remaining status codes
// with the backend once alerts in other states are observed. Unmapped codes
// deliberately fail closed to a synthetic, non-matching token — this hides
// action buttons rather than guessing they mean "open".
const STATUS_LABELS = {
  "0": "OPEN",
};

// TODO: confirm the full severity code mapping with the backend once other
// values are observed — only "0" has been seen so far.
const SEVERITY_LABELS = {
  "0": "Low",
};

const mapAlert = (a) => ({
  id: String(a.id),
  type: ALERT_TYPE_MAP[a.alertType] ?? a.alertType.toUpperCase(),
  typeCode: a.alertType, // raw PascalCase backend code (e.g. "GazeDeviation"), for matching against GET /api/alerts/types
  description: a.alertDescription ?? "",
  status: STATUS_LABELS[a.status] ?? `UNKNOWN_STATUS_${a.status}`,
  statusCode: a.status, // raw backend code, kept in case exact-match filtering needs it later
  severity: SEVERITY_LABELS[a.severity] ?? `Severity ${a.severity}`,
  severityCode: a.severity,
  student: a.studentName || "Unknown",
  studentNumber: a.studentNumber ?? null,
  studentId: a.studentId ?? null,
  session: a.sessionName || "—",
  sessionId: a.sessionId ?? null,
  timestamp: a.triggeredAt,
  actionTaken: a.actionTaken ?? null,
  actionNote: a.actionNote ?? null,
  actionAt: a.actionAt ?? null,
});

const fetchAlertsWithParams = async (params = "", page = 1, pageSize = 7) => {
  try {
    const accessToken =
      useAuthStore.getState().accessToken ??
      sessionStorage.getItem("accessToken");

    const separator = params ? "&" : "?";
    const res = await apiFetch(
      `/api/alerts${params}${separator}Page=${page}&PageSize=${pageSize}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const json = await res.json();

    if (!res.ok || json.statusCode !== 200) {
      return { alerts: [], total: 0, page, pageSize };
    }

    return {
      alerts: json.data.items.map(mapAlert),
      total: json.data.totalCount,
      page: json.data.page,
      pageSize: json.data.pageSize,
    };
  } catch (err) {
    console.error("fetchAlerts error:", err);
    return { alerts: [], total: 0, page, pageSize };
  }
};

const callAlertAction = async (id, action) => {
  try {
    const accessToken =
      useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

    const res = await apiFetch(`/api/alerts/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await res.json();
    if (!res.ok || json.statusCode !== 200) {
      return { success: false, error: json.message || `Failed to ${action} alert.` };
    }

    return { success: true, message: json.message };
  } catch (err) {
    console.error(`${action} alert error:`, err);
    return { success: false, error: "Network error." };
  }
};

// When backend is ready: swap this for a WebSocket subscription that pushes
// new alerts in and PATCHes status changes through to the server.
const useAlertsStore = create((set) => ({
  alerts: [],
  loading: false,
  page: 1,
  pageSize: 7,
  total: 0,
  summary: { total: 0, critical: 0, warnings: 0, resolved: 0, lastUpdated: null },
  alertTypes: [],

  fetchAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } = await fetchAlertsWithParams("", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchOpenAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } = await fetchAlertsWithParams("?status=Open", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchResolvedAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } = await fetchAlertsWithParams("?status=Resolved", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchEscalatedAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } = await fetchAlertsWithParams("?status=Escalated", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchAlertsByType: async (type, page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } = await fetchAlertsWithParams(
      `?alertType=${encodeURIComponent(type)}`,
      page,
      pageSize,
    );
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchAlertsSummary: async () => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/alerts/Cards", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) return;

      set({
        summary: {
          total: json.data.totalAlerts,
          critical: json.data.criticalAlerts,
          warnings: json.data.warningAlerts,
          resolved: json.data.resolvedAlerts,
          lastUpdated: json.data.lastUpdated,
        },
      });
    } catch (err) {
      console.error("fetchAlertsSummary error:", err);
    }
  },

  fetchAlertTypes: async () => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/alerts/types", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) return;

      set({ alertTypes: json.data });
    } catch (err) {
      console.error("fetchAlertTypes error:", err);
    }
  },

  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, status } : alert)),
    })),

  dismissAlertApi: async (id) => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/alerts/${id}/dismiss`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to dismiss alert.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("dismissAlertApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

  warnAlertApi: async (id) => callAlertAction(id, "warn"),
  escalateAlertApi: async (id) => callAlertAction(id, "escalate"),
}));

export default useAlertsStore;
