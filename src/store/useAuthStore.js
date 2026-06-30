import { create } from "zustand";

const MOCK_USERS = [
  {
    id: "SA-001",
    name: "Sedra Fathallah",
    email: "sidra@university.edu",
    password: "admin123",
    role: "SUPER_ADMIN",

    permissions: {
      P01: true,
      P02: true,
      P03: true,
      P04: true,
      P05: true,
      P06: true,
      P07: true,
      P08: true,
    },
  },
  {
    id: "AD-002",
    name: "Manar Aljarkas",
    email: "manar@university.edu",
    password: "admin123",
    role: "ADMIN",

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

  loading: false,
  error: null,

  login: async (email, password) => {
    set({
      loading: true,
      error: null,
    });

    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!found) {
      set({
        loading: false,
        error: "Invalid email or password",
      });

      return false;
    }

    const { password: _, ...safeUser } = found;

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
