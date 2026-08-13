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
      "ImportStudents",
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
  permissionCatalog: [], // [{ id, name, description }] once loaded

  fetchPermissionCatalog: async () => {
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/roles/permissions", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();
      if (!res.ok || json.statusCode !== 200) {
        console.error(
          "fetchPermissionCatalog: unexpected response",
          json.statusCode,
          json.message,
        );
        return;
      }

      set({ permissionCatalog: json.data });
    } catch (err) {
      console.error("fetchPermissionCatalog error:", err);
    }
  },

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

      const catalog = get().permissionCatalog;
      if (!catalog.length) {
        message.error(
          "Permission catalog not loaded yet — please try again in a moment.",
        );
        return;
      }

      const nameToId = new Map(catalog.map((p) => [p.name, p.id]));
      const permissionIds = role.permissions
        .map((name) => nameToId.get(name))
        .filter((id) => id !== undefined);

      if (permissionIds.length !== role.permissions.length) {
        console.warn(
          "saveRole: some permission names had no matching id in the catalog:",
          role.permissions.filter((name) => !nameToId.has(name)),
        );
      }

      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ permissionIds }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to save permissions.");
        return;
      }

      if (Array.isArray(json.data)) {
        const roles = json.data.map((r) => ({
          id: String(r.id),
          name: r.name,
          isFixed: r.name === "SuperAdmin",
          permissions: r.permissions ?? [],
        }));
        set({ roles });
      }

      message.success(`"${role.name}" permissions saved.`);
    } catch (err) {
      console.error("saveRole error:", err);
      message.error("Network error.");
    }
  },
}));

export default useRolesStore;
