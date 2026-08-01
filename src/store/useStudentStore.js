import { create } from "zustand";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

// Mock roster, shaped like fetchStudents' mapped output — for testing the
// Admin/Proctor dashboards before the real API call resolves.
export const INITIAL_STUDENTS = [
  { id: "S-20211847", userId: 1, userName: "layla.mansour", name: "Layla Mansour", middleName: "Sami", email: "layla.mansour@student.vu.edu", phoneNumber: "0940000001" },
  { id: "S-20211285", userId: 2, userName: "karim.nasir", name: "Karim Nasir", middleName: "Adel", email: "karim.nasir@student.vu.edu", phoneNumber: "0940000002" },
  { id: "S-20210934", userId: 3, userName: "omar.khalil", name: "Omar Khalil", middleName: "Fadi", email: "omar.khalil@student.vu.edu", phoneNumber: "0940000003" },
  { id: "S-20212210", userId: 4, userName: "nour.haddad", name: "Nour Haddad", middleName: "Hani", email: "nour.haddad@student.vu.edu", phoneNumber: "0940000004" },
  { id: "S-20213321", userId: 5, userName: "yara.saleh", name: "Yara Saleh", middleName: "Ziad", email: "yara.saleh@student.vu.edu", phoneNumber: "0940000005" },
  { id: "S-20214412", userId: 6, userName: "hadi.aziz", name: "Hadi Aziz", middleName: "Samer", email: "hadi.aziz@student.vu.edu", phoneNumber: "0940000006" },
  { id: "S-20215503", userId: 7, userName: "rima.awad", name: "Rima Awad", middleName: "Nabil", email: "rima.awad@student.vu.edu", phoneNumber: "0940000007" },
  { id: "S-20216604", userId: 8, userName: "tarek.salem", name: "Tarek Salem", middleName: "Walid", email: "tarek.salem@student.vu.edu", phoneNumber: "0940000008" },
];

const useStudentStore = create((set, get) => ({
  students: INITIAL_STUDENTS,
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

  // POST /api/students/import-csv — multipart/form-data with a "file" field.
  // No frontend validation or parsing — the backend handles all of it and
  // returns { added, skipped, errors[] }; the roster is re-fetched after.
  importStudentsCsv: async (file) => {
    set({ importing: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/students/import-csv", {
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
        added: json.data?.added ?? 0,
        skipped: json.data?.skipped ?? 0,
        errors: json.data?.errors ?? [],
      };
    } catch (err) {
      console.error("importStudentsCsv error:", err);
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
