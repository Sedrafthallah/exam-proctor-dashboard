import { create } from "zustand";
import { message } from "antd";

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

// When backend is ready:
// GET  /api/roles                      → replace INITIAL_ROLES
// PUT  /api/roles/{roleId}/permissions  → replace saveRole's mock success
const useRolesStore = create((set, get) => ({
  roles: INITIAL_ROLES,

  updateRolePermission: (roleId, permId, value) =>
    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === roleId && !role.isFixed
          ? { ...role, permissions: { ...role.permissions, [permId]: value } }
          : role,
      ),
    })),

  saveRole: (roleId) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    message.success(`"${role.name}" permissions saved.`);
  },
}));

export default useRolesStore;
