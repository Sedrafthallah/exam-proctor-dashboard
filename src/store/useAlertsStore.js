import { create } from "zustand";
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

const mapAlert = (a) => ({
  id: String(a.id),
  type: ALERT_TYPE_MAP[a.alertType] ?? a.alertType.toUpperCase(),
  status: a.isDelivered ? "RESOLVED" : "OPEN",
  student: a.studentFullName || "Unknown",
  session: a.eventName || "—",
  timestamp: a.triggeredAt,
});

const fetchAlertsWithParams = async (params = "") => {
  try {
    const accessToken =
      useAuthStore.getState().accessToken ??
      sessionStorage.getItem("accessToken");

    const res = await apiFetch(`/api/alerts${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await res.json();
    if (!res.ok || json.statusCode !== 200) return [];
    return json.data.map(mapAlert);
  } catch (err) {
    console.error("fetchAlerts error:", err);
    return [];
  }
};

// When backend is ready: swap this for a WebSocket subscription that pushes
// new alerts in and PATCHes status changes through to the server.
const useAlertsStore = create((set) => ({
  alerts: [],
  loading: false,

  fetchAlerts: async () => {
    set({ loading: true });
    const alerts = await fetchAlertsWithParams("");
    set({ alerts, loading: false });
  },

  fetchOpenAlerts: async () => {
    set({ loading: true });
    const alerts = await fetchAlertsWithParams("?status=Open");
    set({ alerts, loading: false });
  },

  fetchResolvedAlerts: async () => {
    set({ loading: true });
    const alerts = await fetchAlertsWithParams("?status=Resolved");
    set({ alerts, loading: false });
  },

  fetchEscalatedAlerts: async () => {
    set({ loading: true });
    const alerts = await fetchAlertsWithParams("?status=Escalated");
    set({ alerts, loading: false });
  },

  fetchAlertsByType: async (type) => {
    set({ loading: true });
    const alerts = await fetchAlertsWithParams(`?alertType=${encodeURIComponent(type)}`);
    set({ alerts, loading: false });
  },

  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, status } : alert)),
    })),
}));

export default useAlertsStore;
