import { Routes, Route, Navigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";

import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../Pages/auth/Login";
import Dashboard from "../Pages/dashboard/Dashboard";

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

      <Route
        path="/dashboard"
        element={
          user ? (
            <MainLayout isDark={isDark} setIsDark={setIsDark}>
              <Dashboard />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
