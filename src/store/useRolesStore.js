import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

// The backend still speaks its own permission names — this maps them to the
// local P01-P07 set the UI is built around. Remove both this and
// LOCAL_TO_API_PERMISSION once the backend switches to P01-P07 directly.
const API_TO_LOCAL_PERMISSION = {
  // P01 - Question Bank Author
  CreateQuestionBank: "P01",
  EditQuestionBank: "P01",
  DeleteQuestionBank: "P01",
  ImportQuestionBank: "P01",

  // P02 - Question Bank View
  ViewQuestionBank: "P02",

  // P03 - Session Manage
  CreateExamSession: "P03",
  EditExamSession: "P03",
  DeleteExamSession: "P03",
  PublishExamSession: "P03",
  ViewExamSession: "P03",

  // P04 - Live Proctor
  MonitorSession: "P04",
  IssueWarning: "P04",
  TerminateStudent: "P04",
  ViewLiveSession: "P04",

  // P05 - Students Register
  RegisterStudent: "P05",
  ImportRoster: "P05",
  ViewStudents: "P05",

  // P06 - Reports Export
  ExportReports: "P06",
  ExportAuditLog: "P06",

  // P07 - View Violations
  ViewViolations: "P07",
  ViewAlerts: "P07",
};

// Reverse of API_TO_LOCAL_PERMISSION — used when saving a role's permissions
// back to the API.
const LOCAL_TO_API_PERMISSION = {
  P01: ["CreateQuestionBank", "EditQuestionBank", "ImportQuestionBank"],
  P02: ["ViewQuestionBank"],
  P03: ["CreateExamSession", "EditExamSession", "PublishExamSession", "ViewExamSession"],
  P04: ["MonitorSession", "IssueWarning", "TerminateStudent"],
  P05: ["RegisterStudent", "ImportRoster", "ViewStudents"],
  P06: ["ExportReports", "ExportAuditLog"],
  P07: ["ViewViolations", "ViewAlerts"],
};

function mapApiPermissionsToLocal(apiPermissions = []) {
  const local = {
    P01: false, P02: false, P03: false,
    P04: false, P05: false, P06: false, P07: false,
  };

  apiPermissions.forEach((perm) => {
    const localKey = API_TO_LOCAL_PERMISSION[perm];
    if (localKey) local[localKey] = true;
  });

  return local;
}

// Labels/descriptions for the P01..P07 permission set, shared by the Roles
// Management page and anywhere else a role's permissions need to be summarised
// (e.g. the New Admin modal's role picker).
export const PERMISSION_LABELS = {
  P01: {
    label: "Question Bank: Author",
    desc: "Create, edit and import question banks via CSV.",
  },
  P02: {
    label: "Question Bank: View All",
    desc: "Read-only access to all question banks.",
  },
  P03: {
    label: "Session: Manage",
    desc: "Create, publish and manage exam sessions and rosters.",
  },
  P04: {
    label: "Session: Live Proctor",
    desc: "Monitor active sessions, issue warnings, terminate students.",
  },
  P05: {
    label: "Students: Register",
    desc: "Register students, upload rosters and manage ID photos.",
  },
  P06: {
    label: "Reports: Export",
    desc: "Export grading packages and signed audit logs.",
  },
  P07: {
    label: "Reports: View Violations",
    desc: "Read-only access to violation and incident logs.",
  },
};

export const INITIAL_ROLES = [
  {
    id: "superadmin",
    name: "Super Admin",
    nameAr: "المشرف الرئيسي",
    isFixed: true, // read-only, cannot be edited
    permissions: {
      P01: true,
      P02: true,
      P03: true,
      P04: true,
      P05: true,
      P06: true,
      P07: true,
    },
  },
  {
    id: "admin",
    name: "Admin",
    nameAr: "مدير النظام",
    isFixed: false,
    permissions: {
      P01: true,
      P02: true,
      P03: true,
      P04: false,
      P05: true,
      P06: true,
      P07: true,
    },
  },
  {
    id: "proctor",
    name: "Proctor",
    nameAr: "مشرف الامتحان",
    isFixed: false,
    permissions: {
      P01: false,
      P02: false,
      P03: false,
      P04: true,
      P05: false,
      P06: false,
      P07: true,
    },
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
            ? mapApiPermissionsToLocal(r.permissions) // API permissions → P01-P07
            : (INITIAL_ROLES.find((ir) => ir.name === r.name)?.permissions ??
              {}),
        // لو فاضية → خدي من الـ INITIAL_ROLES الموك
      }));

      set({ roles });
    } catch (err) {
      console.error("fetchRoles error:", err);
    }
  },

  updateRolePermission: (roleId, permId, value) =>
    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === roleId && !role.isFixed
          ? { ...role, permissions: { ...role.permissions, [permId]: value } }
          : role,
      ),
    })),

  saveRole: async (roleId) => {
    try {
      const role = get().roles.find((r) => r.id === roleId);
      if (!role || role.isFixed) return;

      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      // convert P01-P07 → API permissions array
      const apiPermissions = Object.entries(role.permissions)
        .filter(([, value]) => value === true)
        .flatMap(([key]) => LOCAL_TO_API_PERMISSION[key] ?? []);

      const res = await apiFetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ permissions: apiPermissions }),
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
