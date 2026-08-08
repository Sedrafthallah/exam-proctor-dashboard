import { Navigate } from "react-router-dom";

import useAuthStore from "../store/useAuthStore";
import MainLayout from "../layouts/MainLayout";

// Gates a private route behind login and (optionally) a permission check.
// `permission` mirrors SidebarItem.jsx's "any of" pattern: pass a single
// real permission name or an array, and the user needs at least one of them.
// `superAdminOnly` gates Super Admin-exclusive pages (Users, Roles, Settings,
// Audit Logs) that aren't granted via a named permission.
export default function ProtectedRoute({
  element,
  permission,
  superAdminOnly,
  isDark,
  setIsDark,
}) {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && user.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    const allowed = required.some((p) => hasPermission(p));

    if (!allowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <MainLayout isDark={isDark} setIsDark={setIsDark}>
      {element}
    </MainLayout>
  );
}
