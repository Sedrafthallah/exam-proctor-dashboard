import { create } from "zustand";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

const DEFAULT_SETTINGS = {
  gazeAlertThresholdSec: 3,
  faceSensitivity: "Medium",
  ambientAudioMonitoring: true,
  gracePeriodMinutes: 5,
  loginWindowMinutes: 15,
  questionRandomisation: true,
  optionShuffle: false,
  maxLivenessAttempts: 3,
  faceMatchThreshold: 95,
};

const useSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/settings", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch settings");
      }

      set({ settings: json.data, loading: false });
    } catch (err) {
      console.error("fetchSettings error:", err);
      set({ loading: false });
    }
  },

  updateSettings: async (fields) => {
    const previous = get().settings;
    const optimistic = { ...previous, ...fields };
    set({ settings: optimistic });

    try {
      const accessToken =
        useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(optimistic),
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) {
        set({ settings: previous });
        return { success: false, error: json.message || "Failed to update settings." };
      }

      set({ settings: json.data });
      return { success: true };
    } catch {
      set({ settings: previous });
      return { success: false, error: "Network error." };
    }
  },
}));

export default useSettingsStore;
