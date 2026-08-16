import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";
import { mapAlert, mapHubAlertStatus } from "../utils/alertMappers";

function authHeaders(extra = {}) {
  const accessToken =
    useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
    ...extra,
  };
}

const fetchAlertsWithParams = async (params = "", page = 1, pageSize = 7) => {
  try {
    const separator = params ? "&" : "?";
    const res = await apiFetch(
      `/api/alerts${params}${separator}Page=${page}&PageSize=${pageSize}`,
      { headers: authHeaders() },
    );

    const json = await res.json();

    if (!res.ok || json.statusCode !== 200) {
      return { alerts: [], total: 0, page, pageSize };
    }

    return {
      alerts: (json.data.items ?? []).map(mapAlert),
      total: json.data.totalCount,
      page: json.data.page,
      pageSize: json.data.pageSize,
    };
  } catch (err) {
    console.error("fetchAlerts error:", err);
    return { alerts: [], total: 0, page, pageSize };
  }
};

const callAlertAction = async (id, action, body) => {
  try {
    const res = await apiFetch(`/api/alerts/${id}/${action}`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok || json.statusCode !== 200) {
      return {
        success: false,
        error: json.message || `Failed to ${action} alert.`,
      };
    }

    return { success: true, message: json.message };
  } catch (err) {
    console.error(`${action} alert error:`, err);
    return { success: false, error: "Network error." };
  }
};

const useAlertsStore = create((set, get) => ({
  alerts: [],
  loading: false,
  page: 1,
  pageSize: 7,
  total: 0,
  summary: {
    total: 0,
    critical: 0,
    warnings: 0,
    resolved: 0,
    lastUpdated: null,
  },
  alertTypes: [],

  fetchAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } =
      await fetchAlertsWithParams("", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchOpenAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } =
      await fetchAlertsWithParams("?status=Open", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchResolvedAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } =
      await fetchAlertsWithParams("?status=Resolved", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchEscalatedAlerts: async (page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } =
      await fetchAlertsWithParams("?status=Escalated", page, pageSize);
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  fetchAlertsByType: async (type, page = 1, pageSize = 7) => {
    set({ loading: true });
    const { alerts, total, page: p, pageSize: ps } =
      await fetchAlertsWithParams(
        `?alertType=${encodeURIComponent(type)}`,
        page,
        pageSize,
      );
    set({ alerts, total, page: p, pageSize: ps, loading: false });
  },

  /** Prefetch alerts for Live Monitoring session feed (hub merges afterward). */
  fetchAlertsForSession: async (sessionId, { pageSize = 100 } = {}) => {
    if (sessionId == null) return [];
    set({ loading: true });
    const { alerts, total, page, pageSize: ps } = await fetchAlertsWithParams(
      `?sessionId=${encodeURIComponent(sessionId)}`,
      1,
      pageSize,
    );
    set((state) => {
      const byId = new Map(state.alerts.map((a) => [a.id, a]));
      for (const a of alerts) byId.set(a.id, a);
      return {
        alerts: Array.from(byId.values()),
        total: Math.max(state.total, total),
        page,
        pageSize: ps,
        loading: false,
      };
    });
    return alerts;
  },

  fetchAlertsSummary: async () => {
    try {
      const res = await apiFetch("/api/alerts/Cards", {
        headers: authHeaders(),
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
      const res = await apiFetch("/api/alerts/types", {
        headers: authHeaders(),
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) return;

      set({ alertTypes: json.data });
    } catch (err) {
      console.error("fetchAlertTypes error:", err);
    }
  },

  /** Insert or replace by id (hub AlertCreated + REST merge). */
  upsertAlert: (mapped) => {
    if (!mapped?.id) return;
    set((state) => {
      const idx = state.alerts.findIndex((a) => a.id === mapped.id);
      if (idx === -1) {
        return { alerts: [mapped, ...state.alerts], total: state.total + 1 };
      }
      const next = state.alerts.slice();
      next[idx] = { ...next[idx], ...mapped };
      return { alerts: next };
    });
  },

  /** Apply hub AlertUpdated payload. */
  applyAlertUpdated: ({ alertId, newStatus, actionTaken }) => {
    const id = String(alertId ?? "");
    if (!id) return;
    const status = mapHubAlertStatus(newStatus);
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status,
              statusCode: newStatus,
              actionTaken: actionTaken ?? alert.actionTaken,
            }
          : alert,
      ),
    }));
  },

  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, status } : alert,
      ),
    })),

  dismissAlertApi: async (id) => {
    try {
      const res = await apiFetch(`/api/alerts/${id}/dismiss`, {
        method: "POST",
        headers: authHeaders(),
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to dismiss alert.");
        return false;
      }

      get().updateAlertStatus(String(id), "RESOLVED");
      return true;
    } catch (err) {
      console.error("dismissAlertApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

  warnAlertApi: async (id, messageText) => {
    const msg = String(messageText ?? "").trim();
    if (!msg) {
      return { success: false, error: "Warning message is required." };
    }
    const result = await callAlertAction(id, "warn", { message: msg });
    if (result.success) {
      get().updateAlertStatus(String(id), "RESOLVED");
    }
    return result;
  },

  escalateAlertApi: async (id, reason) => {
    const text = String(reason ?? "").trim();
    if (!text) {
      return { success: false, error: "Escalate reason is required." };
    }
    const result = await callAlertAction(id, "escalate", { reason: text });
    if (result.success) {
      get().updateAlertStatus(String(id), "ESCALATED");
    }
    return result;
  },
}));

export default useAlertsStore;
export { mapAlert };
