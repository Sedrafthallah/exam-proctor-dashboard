import { create } from "zustand";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

const useStudentStore = create((set, get) => ({
  students: [],
  page: 1,
  pageSize: 1000,
  total: 0,
  loading: false,
  importing: false,

  // Note: "PgeSize" is the backend's actual query param spelling, not a typo.
  fetchStudents: async (page = get().page ?? 1, pageSize = get().pageSize ?? 1000) => {
    set({ loading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/students?Page=${page}&PgeSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch students");
      }

      const students = json.data.items.map((s) => ({
        id: s.universityNumber,
        userId: s.id,
        userName: s.userName,
        name: [s.firstName, s.lastName].filter(Boolean).join(" "),
        middleName: s.middleName,
        email: s.email,
        phoneNumber: s.phoneNumber,
      }));

      set({
        students,
        page: json.data.page,
        pageSize: json.data.pageSize,
        total: json.data.totalCount,
        loading: false,
      });
    } catch (error) {
      console.error("fetchStudents error:", error);
      set({ loading: false });
    }
  },

  // POST /api/students/import — multipart "importZip" field: a ZIP with
  // students.csv plus one {university_number}.jpg per student.
  importStudents: async (file) => {
    set({ importing: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("importZip", file);

      const res = await apiFetch("/api/students/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || (json.statusCode !== 200 && json.statusCode !== 201)) {
        set({ importing: false });
        return {
          success: false,
          error: json.message || "Import failed.",
          added: 0,
          skipped: 0,
          errors: [],
        };
      }

      await get().fetchStudents();

      set({ importing: false });

      return {
        success: true,
        added: json.data?.successfulImports ?? 0,
        skipped: json.data?.failedImports ?? 0,
        errors: (json.data?.results ?? [])
          .filter((r) => !r.isSuccess)
          .map((r) => r.message),
      };
    } catch (err) {
      console.error("importStudents error:", err);
      set({ importing: false });
      return {
        success: false,
        error: "Network error.",
        added: 0,
        skipped: 0,
        errors: [],
      };
    }
  },
}));

export default useStudentStore;
