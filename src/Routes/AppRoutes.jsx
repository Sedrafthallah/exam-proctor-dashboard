import { Routes, Route, Navigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";

import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../Pages/auth/Login";
import Dashboard from "../Pages/dashboard/Dashboard";
import Sessions from "../Pages/sessions/Sessions";
import Students from "../Pages/students/Students";
import QuestionBanks from "../Pages/questionBanks/QuestionBanks";
import Monitoring from "../Pages/monitoring/Monitoring";
import Alerts from "../Pages/alerts/Alerts";
import Grading from "../Pages/grading/Grading";
import Reports from "../Pages/reports/Reports";
import Users from "../Pages/users/Users";
import Settings from "../Pages/settings/Settings";
import AuditLogs from "../Pages/auditLogs/AuditLogs";

// Every path here mirrors a key in adminItems/superAdminItems (SidebarItem.jsx).
// The Sidebar already filters which links are visible per permission; page-level
// permission gating can be layered onto these routes once each page is built out.
const PRIVATE_PAGES = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/sessions", element: <Sessions /> },
  { path: "/students", element: <Students /> },
  { path: "/question-banks", element: <QuestionBanks /> },
  { path: "/monitoring", element: <Monitoring /> },
  { path: "/alerts", element: <Alerts /> },
  { path: "/grading", element: <Grading /> },
  { path: "/reports", element: <Reports /> },
  { path: "/users", element: <Users /> },
  { path: "/settings", element: <Settings /> },
  { path: "/logs", element: <AuditLogs /> },
];

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

      {PRIVATE_PAGES.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            user ? (
              <MainLayout isDark={isDark} setIsDark={setIsDark}>
                {element}
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
