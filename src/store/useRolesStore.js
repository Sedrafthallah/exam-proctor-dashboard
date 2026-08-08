import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";
import { ALL_PERMISSION_KEYS } from "../MyComponents/usersTable/adminsData";

// Last-resort local fallback, only used if fetchRoles() fails (e.g. backend
// unreachable). Real per-role permissions always come from GET /api/roles
// when available — Proctor's set here matches the confirmed live response
// (["CreateExamSession", "ViewExamSession", "EditExamSession"]); Admin's is
// a best-effort placeholder, not authoritative.
export const INITIAL_ROLES = [
  {
    id: "superadmin",
    name: "Super Admin",
    nameAr: "المشرف الرئيسي",
    isFixed: true, // read-only, cannot be edited
    permissions: [...ALL_PERMISSION_KEYS],
  },
  {
    id: "admin",
    name: "Admin",
    nameAr: "مدير النظام",
    isFixed: false,
    permissions: [
      "ManageQuestionBanks",
      "ViewQuestionBanks",
      "CreateExamSession",
      "ViewExamSession",
      "EditExamSession",
      "DeleteExamSession",
      "PublishExamSession",
      "ViewStudents",
      "EnrollStudents",
      "ExportData",
      "ViewReports",
      "ViewAuditLogs",
      "ViewAlerts",
    ],
  },
  {
    id: "proctor",
    name: "Proctor",
    nameAr: "مشرف الامتحان",
    isFixed: false,
    permissions: ["CreateExamSession", "ViewExamSession", "EditExamSession"],
  },
];

const useRolesStore = create((set, get) => ({
  roles: INITIAL_ROLES,

  fetchRoles: async () => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/roles", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) return;

      // حولي الـ response لشكل يناسب الـ store
      const roles = json.data.map((r) => ({
        id: String(r.id),
        name: r.name,
        isFixed: r.name === "SuperAdmin",
        permissions:
          r.permissions?.length > 0
            ? r.permissions // real permission-name array from the API
            : (INITIAL_ROLES.find((ir) => ir.name === r.name)?.permissions ??
              []),
        // لو فاضية → خدي من الـ INITIAL_ROLES الموك
      }));

      set({ roles });
    } catch (err) {
      console.error("fetchRoles error:", err);
    }
  },

  updateRolePermission: (roleId, permissionKey, value) =>
    set((state) => ({
      roles: state.roles.map((role) => {
        if (role.id !== roleId || role.isFixed) return role;

        const has = role.permissions.includes(permissionKey);
        if (value === has) return role;

        return {
          ...role,
          permissions: value
            ? [...role.permissions, permissionKey]
            : role.permissions.filter((p) => p !== permissionKey),
        };
      }),
    })),

  saveRole: async (roleId) => {
    try {
      const role = get().roles.find((r) => r.id === roleId);
      if (!role || role.isFixed) return;

      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ permissions: role.permissions }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to save permissions.");
        return;
      }

      message.success(`"${role.name}" permissions saved.`);
    } catch (err) {
      console.error("saveRole error:", err);
      message.error("Network error.");
    }
  },
}));

export default useRolesStore;
