import { Routes, Route, Navigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";
import { adminItems, superAdminItems } from "../MyComponents/sidebar/SidebarItem";

import BlankLayout from "../layouts/BlankLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../Pages/auth/Login";
import Dashboard from "../Pages/dashboard/Dashboard";
import Sessions from "../Pages/sessions/Sessions";
import Students from "../Pages/students/Students";
import QuestionBanks from "../Pages/questionBanks/QuestionBanks";
import Monitoring from "../Pages/monitoring/Monitoring";
import Alerts from "../Pages/alerts/Alerts";
import Reports from "../Pages/reports/Reports";
import Users from "../Pages/users/Users";
import Roles from "../Pages/roles/Roles";
import Settings from "../Pages/settings/Settings";
import AuditLogs from "../Pages/auditLogs/AuditLogs";

const PAGE_ELEMENTS = {
  "/dashboard": <Dashboard />,
  "/sessions": <Sessions />,
  "/students": <Students />,
  "/question-banks": <QuestionBanks />,
  "/monitoring": <Monitoring />,
  "/alerts": <Alerts />,
  "/reports": <Reports />,
  "/users": <Users />,
  "/roles": <Roles />,
  "/settings": <Settings />,
  "/logs": <AuditLogs />,
};

// SidebarItem.jsx is the single source of truth for which permission(s) guard
// each page — route protection is derived from it here rather than keeping a
// second, hand-maintained permission map that could drift out of sync.
const SIDEBAR_ITEMS_BY_PATH = new Map(
  superAdminItems.map((item) => [item.key, item]),
);
const ADMIN_VISIBLE_PATHS = new Set(adminItems.map((item) => item.key));

function accessRulesFor(path) {
  const item = SIDEBAR_ITEMS_BY_PATH.get(path);
  if (!item) return {};

  // Present only in superAdminItems (not adminItems) → Super Admin-exclusive
  // page (Users, Roles), gated by role rather than a named permission.
  if (!ADMIN_VISIBLE_PATHS.has(path)) return { superAdminOnly: true };

  return item.permission ? { permission: item.permission } : {};
}

const PRIVATE_PAGES = Object.entries(PAGE_ELEMENTS).map(([path, element]) => ({
  path,
  element,
  ...accessRulesFor(path),
}));

export default function AppRoutes({ isDark, setIsDark }) {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <BlankLayout isDark={isDark} setIsDark={setIsDark}>
              <Login />
            </BlankLayout>
          )
        }
      />

      {PRIVATE_PAGES.map(({ path, element, permission, superAdminOnly }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute
              element={element}
              permission={permission}
              superAdminOnly={superAdminOnly}
              isDark={isDark}
              setIsDark={setIsDark}
            />
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
