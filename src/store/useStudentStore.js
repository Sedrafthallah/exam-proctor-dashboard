import { create } from "zustand";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

const useStudentStore = create((set) => ({
  students: [],
  loading: false,
  importing: false,

  // GET /api/students?Page=&PgeSize= (the "PgeSize" spelling is the backend's
  // actual query param, not a typo on our side).
  fetchStudents: async () => {
    set({ loading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/students?Page=1&PgeSize=1000", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch students");
      }

      const students = json.data.map((s) => ({
        id: s.universityNumber,
        userId: s.id,
        userName: s.userName,
        name: [s.firstName, s.lastName].filter(Boolean).join(" "),
        middleName: s.middleName,
        email: s.email,
        phoneNumber: s.phoneNumber,
      }));

      set({ students, loading: false });
    } catch (error) {
      console.error("fetchStudents error:", error);
      set({ loading: false });
    }
  },

  // POST /api/students/import-csv — multipart/form-data with a "csvFile"
  // field. Returns the backend's per-row results { totalRecords,
  // successfulImports, failedImports, results[] } so the caller can show
  // what succeeded/failed; the roster itself should be re-fetched after.
  importStudentsCsv: async (file) => {
    set({ importing: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("csvFile", file);

      const res = await apiFetch("/api/students/import-csv", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to import CSV");
      }

      set({ importing: false });
      return json.data;
    } catch (error) {
      set({ importing: false });
      throw error;
    }
  },
}));

export default useStudentStore;
