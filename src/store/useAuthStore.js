import { create } from "zustand";

const ALL_PERMISSIONS_GRANTED = {
  P01: true,
  P02: true,
  P03: true,
  P04: true,
  P05: true,
  P06: true,
  P07: true,
  P08: true,
};

const INITIAL_USERS = [
  {
    id: "SA-001",
    name: "Sedra Fathallah",
    email: "sidra@university.edu",
    password: "admin123",
    role: "SUPER_ADMIN",
    jobTitle: "Super Admin",
    disabled: false,
    permissions: ALL_PERMISSIONS_GRANTED,
  },
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
      P06: false,
      P07: true,
      P08: true,
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
    permissions: { P01: false, P02: false, P03: true, P04: true, P05: false, P06: false, P07: false, P08: true },
  },
  {
    id: "AD-004",
    name: "Dr. Lina Abbas",
    email: "lina.abbas@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Question Author",
    disabled: false,
    permissions: { P01: true, P02: false, P03: false, P04: false, P05: false, P06: false, P07: false, P08: false },
  },
  {
    id: "AD-005",
    name: "Fadi Nasser",
    email: "fadi.nasser@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Proctor + Grader",
    disabled: false,
    permissions: { P01: false, P02: false, P03: false, P04: true, P05: false, P06: true, P07: false, P08: true },
  },
  {
    id: "AD-006",
    name: "Yara Tannous",
    email: "yara.tannous@vu.edu",
    password: "admin123",
    role: "ADMIN",
    jobTitle: "Registrar",
    disabled: false,
    permissions: { P01: false, P02: false, P03: false, P04: false, P05: true, P06: false, P07: true, P08: false },
  },
];

/*
==================================================
عند تفعيل التخزين لاحقاً مع الباك:
const storedUser = localStorage.getItem("user");
==================================================
*/

const useAuthStore = create((set, get) => ({
  // الوضع الحالي أثناء تطوير الـ UI
  user: null,

  /*
  عند تفعيل التخزين لاحقاً:
  user: storedUser ? JSON.parse(storedUser) : null,
  */

  // All registered admin accounts (super admin + admins). This is what both
  // the Login page authenticates against and the Users Management page displays,
  // so an account created from Users Management can log in right away.
  users: INITIAL_USERS,

  loading: false,
  error: null,

  login: async (email, password) => {
    set({
      loading: true,
      error: null,
    });

    await new Promise((r) => setTimeout(r, 500));

    const found = get().users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );

    if (!found) {
      set({
        loading: false,
        error: "Invalid email or password",
      });

      return false;
    }

    if (found.disabled) {
      set({
        loading: false,
        error: "This account has been disabled",
      });

      return false;
    }

    const safeUser = { ...found };
    delete safeUser.password;

    /*
    عند تفعيل التخزين لاحقاً:
    localStorage.setItem(
      "user",
      JSON.stringify(safeUser)
    );
    */

    set({
      user: safeUser,
      loading: false,
      error: null,
    });

    return true;
  },

  logout: () => {
    /*
    عند تفعيل التخزين لاحقاً:
    localStorage.removeItem("user");
    */

    set({
      user: null,
      error: null,
    });
  },

  // Creates a real login account for a new admin (Users Management > New Admin).
  // Returns { success, error } so the caller can surface a duplicate-email error inline.
  registerAdmin: ({ name, email, password, permissions }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailTaken = get().users.some((u) => u.email.toLowerCase() === normalizedEmail);

    if (emailTaken) {
      return { success: false, error: "An account with this email already exists" };
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
        P08: false,
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
      return { success: false, error: "An account with this email already exists" };
    }

    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              name,
              email: email.trim(),
              ...(password ? { password } : {}),
              permissions: u.role === "SUPER_ADMIN" ? u.permissions : { ...u.permissions, ...permissions },
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
        u.id === userId && u.role !== "SUPER_ADMIN" ? { ...u, disabled: !u.disabled } : u,
      ),
    }));
  },

  deleteAdmin: (userId) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId || u.role === "SUPER_ADMIN"),
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
