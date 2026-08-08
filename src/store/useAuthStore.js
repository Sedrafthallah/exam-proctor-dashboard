import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useRolesStore from "./useRolesStore";

const INITIAL_USERS = [
  {
    id: 2,
    name: "Manar Aljarkas",
    email: "manar@university.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Admin",
    disabled: false,
    permissions: ["CreateExamSession", "ViewExamSession", "EditExamSession", "ExportData", "ViewAlerts"],
  },
  {
    id: 3,
    name: "Prof. Maher Saleh",
    email: "maher.saleh@vu.edu",
    password: "admin123",
    role: "PROCTOR",
    jobTitle: "Proctor",
    disabled: false,
    permissions: ["CreateExamSession", "ViewExamSession", "EditExamSession"],
  },
  {
    id: 4,
    name: "Dr. Lina Abbas",
    email: "lina.abbas@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Question Author",
    disabled: false,
    permissions: ["ManageQuestionBanks", "ViewQuestionBanks"],
  },
  {
    id: 5,
    name: "Fadi Nasser",
    email: "fadi.nasser@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Proctor",
    disabled: false,
    permissions: ["MonitorExamSession", "ViewAlerts"],
  },
  {
    id: 6,
    name: "Yara Tannous",
    email: "yara.tannous@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Registrar",
    disabled: false,
    permissions: ["ViewStudents", "EnrollStudents", "ExportData"],
  },
];

// Last-resort fallback for when the backend returns an empty permissions
// array for a specific user despite their role having real permissions
// defined. Reuses whatever useRolesStore currently has (either the real
// role→permissions data fetched from GET /api/roles, or its own last-resort
// INITIAL_ROLES if that fetch hasn't happened/succeeded yet) rather than
// duplicating another hand-guessed mock map here.
function fallbackPermissionsForRole(roleName) {
  const roles = useRolesStore.getState().roles;
  const match = roles.find(
    (r) => r.name?.toLowerCase() === String(roleName ?? "").toLowerCase(),
  );
  return match?.permissions ?? [];
}

const savedUser = sessionStorage.getItem("user");
const savedToken = sessionStorage.getItem("accessToken");
const savedRefreshToken = sessionStorage.getItem("refreshToken");

const useAuthStore = create((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedToken,
  accessToken: savedToken ?? null,
  refreshToken: savedRefreshToken ?? null,
  users: INITIAL_USERS,
  page: 1,
  pageSize: 10,
  total: 0,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        set({
          loading: false,
          error: json.message || "Invalid email or password",
        });

        return false;
      }

      const data = json.data;

      const user = {
        id: String(data.userId),
        name: data.fullName,
        email: data.email,
        role:
          data.roles?.[0] === "SuperAdmin"
            ? "SUPER_ADMIN"
            : data.roles?.[0] === "Proctor"
              ? "PROCTOR"
              : "ADMIN",
        jobTitle: data.roles?.[0] ?? "Admin",
        disabled: false,
        // Confirmed API shape: array of granted permission-name strings.
        // Fallback only applies if the backend returns an empty array here.
        permissions:
          data.permissions?.length > 0
            ? data.permissions
            : fallbackPermissionsForRole(data.roles?.[0]),
      };

      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        loading: false,
        error: null,
      });

      return true;
    } catch {
      set({
        loading: false,
        error: "Network error. Please try again.",
      });

      return false;
    }
  },

  logout: async () => {
    try {
      const { refreshToken, accessToken } = get();

      const response = await apiFetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      await response.json();
    } catch {
      // logout still proceeds locally below regardless of API outcome
    }

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
    set({ accessToken, refreshToken });
  },

  fetchAdmins: async (page = 1, pageSize = 10) => {
    try {
      const accessToken =
        get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(
        `/api/admins/with-permissions?Page=${page}&PageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) return;

      const admins = json.data.items.map((a) => {
        // Confirmed API shape: array of granted permission-name strings.
        // Fallback only applies if the backend returns an empty array here.
        const permissions =
          a.permissions?.length > 0
            ? a.permissions // ← real permissions if available
            : fallbackPermissionsForRole(a.role ?? "Admin"); // ← last-resort fallback

        return {
          id: String(a.id),
          name: a.fullName ?? a.userName,
          email: a.email ?? "—",
          role: a.role === "Proctor" ? "PROCTOR" : "ADMIN",
          jobTitle: a.role ?? "Admin",
          disabled: a.isActive === false,
          permissions,
        };
      });

      set({
        users: admins,
        page: json.data.page,
        pageSize: json.data.pageSize,
        total: json.data.totalCount,
      });
    } catch (err) {
      console.error("fetchAdmins error:", err);
    }
  },

  // Creates a real login account for a new admin (Users Management > New Admin).
  // The duplicate-email check below is a fast-fail UX nicety only — the API
  // response is still the source of truth for success/failure.
  // Returns { success, error, data } so the caller can surface a duplicate-email
  // error inline and show the API's temporary password on success.
  registerAdminApi: async ({ name, email, roleIds }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailTaken = get().users.some(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

    if (emailTaken) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    try {
      const accessToken =
        get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/admins/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fullName: name,
          email: email.trim(),
          roleIds,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        return {
          success: false,
          error: json.message || "Failed to create admin.",
        };
      }

      return { success: true, data: json.data };
    } catch (err) {
      console.error("registerAdminApi error:", err);
      return { success: false, error: "Network error." };
    }
  },

  // Edits an existing admin's profile/login/permissions from Users Management.
  // Returns { success, error } so the caller can surface a duplicate-email error inline.
  // NOTE: no update-admin endpoint exists elsewhere in the codebase to copy —
  // this follows the same `/api/admins/${id}` shape as deleteAdminApi /
  // deactivateAdminApi. Confirm the exact path/payload with the backend once
  // it's available.
  updateAdminApi: async (userId, { name, email, password, permissions }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailTaken = get().users.some(
      (u) => u.id !== userId && u.email.toLowerCase() === normalizedEmail,
    );

    if (emailTaken) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    try {
      const accessToken =
        get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/admins/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fullName: name,
          email: email.trim(),
          ...(password ? { password } : {}),
          permissions,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        return {
          success: false,
          error: json.message || "Failed to update admin.",
        };
      }

      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                name,
                email: email.trim(),
                permissions: u.role === "SUPER_ADMIN" ? u.permissions : permissions,
              }
            : u,
        ),
      }));

      return { success: true };
    } catch (err) {
      console.error("updateAdminApi error:", err);
      return { success: false, error: "Network error." };
    }
  },

  deleteAdminApi: async (id) => {
    try {
      const accessToken =
        get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/admins/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error("Failed to delete admin.");
        return false;
      }

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));

      message.success("Admin deleted successfully.");
      return true;
    } catch (err) {
      console.error("deleteAdminApi error:", err);
      message.error("Network error.");
      return false;
    }
  },

  deactivateAdminApi: async (id) => {
    try {
      const accessToken =
        get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/admins/${id}/deactivate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        return false;
      }

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, disabled: true } : user,
        ),
      }));

      return true;
    } catch (err) {
      console.error("deactivateAdminApi error:", err);
      return false;
    }
  },

  reactivateAdminApi: async (id) => {
    try {
      const accessToken =
        get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/admins/${id}/reactivate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        return false;
      }

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, disabled: false } : user,
        ),
      }));

      return true;
    } catch (err) {
      console.error("reactivateAdminApi error:", err);
      return false;
    }
  },

  deleteAdmin: (userId) => {
    set((state) => ({
      users: state.users.filter(
        (u) => u.id !== userId || u.role === "SUPER_ADMIN",
      ),
    }));
  },

  hasPermission: (permission) => {
    const { user } = get();

    if (!user) return false;

    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    const perms = user.permissions;
    if (Array.isArray(perms)) return perms.includes(permission);
    return perms?.[permission] === true; // defensive fallback, shouldn't normally hit
  },

  isSuperAdmin: () => {
    return get().user?.role === "SUPER_ADMIN";
  },
}));

export default useAuthStore;
