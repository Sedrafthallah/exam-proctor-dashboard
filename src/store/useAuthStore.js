import { create } from "zustand";
import { apiFetch } from "../api/apiClient";

const INITIAL_USERS = [
  {
    id: "AD-002",
    name: "Manar Aljarkas",
    email: "manar@university.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Admin",
    disabled: false,

    permissions: {
      P01: false,
      P02: false,
      P03: true,
      P04: true,
      P05: false,
      P06: true,
      P07: true,
    },
  },
  {
    id: "AD-003",
    name: "Prof. Maher Saleh",
    email: "maher.saleh@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Session Coordinator",
    disabled: false,
    permissions: {
      P01: false,
      P02: false,
      P03: true,
      P04: true,
      P05: false,
      P06: false,
      P07: true,
    },
  },
  {
    id: "AD-004",
    name: "Dr. Lina Abbas",
    email: "lina.abbas@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Question Author",
    disabled: false,
    permissions: {
      P01: true,
      P02: false,
      P03: false,
      P04: false,
      P05: false,
      P06: false,
      P07: false,
    },
  },
  {
    id: "AD-005",
    name: "Fadi Nasser",
    email: "fadi.nasser@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Proctor",
    disabled: false,
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
  {
    id: "AD-006",
    name: "Yara Tannous",
    email: "yara.tannous@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Registrar",
    disabled: false,
    permissions: {
      P01: false,
      P02: false,
      P03: false,
      P04: false,
      P05: true,
      P06: true,
      P07: false,
    },
  },
];

const savedUser = sessionStorage.getItem("user");
const savedToken = sessionStorage.getItem("accessToken");
const savedRefreshToken = sessionStorage.getItem("refreshToken");

const useAuthStore = create((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedToken,
  accessToken: savedToken ?? null,
  refreshToken: savedRefreshToken ?? null,
  users: INITIAL_USERS,
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
        role: data.roles?.[0] === "SuperAdmin" ? "SUPER_ADMIN" : "ADMIN",
        jobTitle: data.roles?.[0] ?? "Admin",
        disabled: false,
        permissions: data.permissions,
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

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error(error);
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

  fetchAdmins: async () => {
    try {
      const accessToken = get().accessToken ?? sessionStorage.getItem("accessToken");

      const res = await apiFetch(
        "/api/admins/with-permissions?Page=1&PageSize=100",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) return;

      const admins = json.data.map((a) => ({
        id: String(a.userId ?? a.userName),
        name: a.fullName ?? a.userName,
        email: a.email ?? "—",
        role: a.role ?? "ADMIN",
        jobTitle: a.role ?? "Admin",
        disabled: a.isActive === false,
        permissions: a.permissions ?? {},
      }));

      set({ users: admins });
    } catch (err) {
      console.error("fetchAdmins error:", err);
    }
  },

  // Creates a real login account for a new admin (Users Management > New Admin).
  // Returns { success, error } so the caller can surface a duplicate-email error inline.
  registerAdmin: ({ name, email, password, permissions }) => {
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

    const newUser = {
      id: `AD-${Date.now()}`,
      name,
      email: email.trim(),
      password,
      role: "ADMIN",
      jobTitle: "Admin",
      disabled: false,
      permissions: {
        P01: false,
        P02: false,
        P03: false,
        P04: false,
        P05: false,
        P06: false,
        P07: false,
        ...permissions,
      },
    };

    set((state) => ({ users: [...state.users, newUser] }));

    return { success: true, user: newUser };
  },

  // Edits an existing admin's profile/login/permissions from Users Management.
  // Returns { success, error } so the caller can surface a duplicate-email error inline.
  updateAdmin: (userId, { name, email, password, permissions }) => {
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

    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              name,
              email: email.trim(),
              ...(password ? { password } : {}),
              permissions:
                u.role === "SUPER_ADMIN"
                  ? u.permissions
                  : { ...u.permissions, ...permissions },
            }
          : u,
      ),
    }));

    return { success: true };
  },

  // Super Admin accounts can't be disabled or deleted from the UI — there must
  // always be at least one account that can manage the other admins.
  toggleUserStatus: (userId) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId && u.role !== "SUPER_ADMIN"
          ? { ...u, disabled: !u.disabled }
          : u,
      ),
    }));
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

    return user.permissions?.[permission] === true;
  },

  isSuperAdmin: () => {
    return get().user?.role === "SUPER_ADMIN";
  },
}));

export default useAuthStore;
