import { create } from "zustand";

const DEFAULT_SETTINGS = {
  gazeThreshold: 3,
  faceAlertSensitivity: "Medium", // "Low" | "Medium" | "High"
  audioMonitoring: true,
  gracePeriod: 5,
  loginWindow: 15,
  questionRandomisation: true,
  optionShuffle: false,
  maxLivenessAttempts: 3,
  faceMatchThreshold: 95,
};

// When backend is ready: replace updateSettings' set() with a PUT /api/settings call.
const useSettingsStore = create((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (fields) =>
    set((state) => ({ settings: { ...state.settings, ...fields } })),
}));

export default useSettingsStore;
