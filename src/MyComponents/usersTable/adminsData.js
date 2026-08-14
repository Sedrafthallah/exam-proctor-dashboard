// `key` is the exact permission-name string the API returns/accepts;
// `category` groups them for the Permission Matrix / Reference UIs.
export const PERMISSION_DETAILS = [
  { key: "CreateExamSession", label: "Create Exam Session", category: "Sessions" },
  { key: "ViewExamSession", label: "View Exam Session", category: "Sessions" },
  { key: "EditExamSession", label: "Edit Exam Session", category: "Sessions" },
  { key: "DeleteExamSession", label: "Delete Exam Session", category: "Sessions" },
  { key: "PublishExamSession", label: "Publish Exam Session", category: "Sessions" },
  { key: "MonitorExamSession", label: "Monitor Exam Session", category: "Sessions" },
  { key: "ExtendSessionTime", label: "Extend Session Time", category: "Sessions" },
  { key: "RestoreExamSession", label: "Restore Exam Session", category: "Sessions" },

  { key: "ViewStudents", label: "View Students", category: "Students" },
  { key: "ImportStudents", label: "Import Students", category: "Students" },

  { key: "AssignProctor", label: "Assign Proctor", category: "Proctors" },
  { key: "ViewProctors", label: "View Proctors", category: "Proctors" },

  { key: "CreateUser", label: "Create User", category: "Users" },
  { key: "ViewUsers", label: "View Users", category: "Users" },
  { key: "EditUser", label: "Edit User", category: "Users" },
  { key: "DeleteUser", label: "Delete User", category: "Users" },

  { key: "ManageRoles", label: "Manage Roles", category: "Roles & Permissions" },
  { key: "ManagePermissions", label: "Manage Permissions", category: "Roles & Permissions" },

  { key: "ViewAuditLogs", label: "View Audit Logs", category: "Audit Logs" },

  { key: "ViewReports", label: "View Reports", category: "Reports" },
  { key: "ExportData", label: "Export Data", category: "Reports" },

  { key: "ViewAlerts", label: "View Alerts", category: "Alerts" },
  { key: "DismissAlert", label: "Dismiss Alert", category: "Alerts" },
  { key: "WarnStudent", label: "Warn Student", category: "Alerts" },
  { key: "EscalateAlert", label: "Escalate Alert", category: "Alerts" },

  { key: "ManageQuestionBanks", label: "Manage Question Banks", category: "Question Banks" },
  { key: "ViewQuestionBanks", label: "View Question Banks", category: "Question Banks" },

  { key: "ViewSystemSettings", label: "View System Settings", category: "System Settings" },
  { key: "ManageSystemSettings", label: "Manage System Settings", category: "System Settings" },

  { key: "ViewDashboard", label: "View Dashboard", category: "Dashboard" },
  { key: "ViewProctorDashboard", label: "View Proctor Dashboard", category: "Dashboard" },
];

// Flat list of every real permission name — used where a role needs "all
// permissions" (e.g. Super Admin's last-resort local fallback).
export const ALL_PERMISSION_KEYS = PERMISSION_DETAILS.map((p) => p.key);

// Selectable pool for the Proctor role — an admin can check/uncheck any
// subset of these, not an all-or-nothing set.
export const PROCTOR_ALLOWED_PERMISSIONS = [
  "MonitorExamSession",
  "ViewExamSession",
  "ViewStudents",
  "ViewAlerts",
  "DismissAlert",
  "WarnStudent",
  "EscalateAlert",
];

// key → short label lookup, e.g. for compact permission tags on a Proctor row.
export function getPermissionLabel(key) {
  return PERMISSION_DETAILS.find((p) => p.key === key)?.label ?? key;
}

// PERMISSION_DETAILS grouped by category, in table order — drives the
// sectioned Permission Matrix / Reference UIs.
export const PERMISSION_CATEGORIES = PERMISSION_DETAILS.reduce((groups, perm) => {
  let group = groups.find((g) => g.category === perm.category);
  if (!group) {
    group = { category: perm.category, permissions: [] };
    groups.push(group);
  }
  group.permissions.push(perm);
  return groups;
}, []);

export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
