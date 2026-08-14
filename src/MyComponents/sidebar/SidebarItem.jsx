import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

// Permission values are permission-name strings from the backend. An array
// means the item is visible if the Admin holds ANY one of the listed permissions.
const settingsItem = {
  key: "/settings",
  label: "System Settings",
  icon: <SettingOutlined />,
  permission: ["ViewSystemSettings", "ManageSystemSettings"],
};

export const adminItems = [
  {
    key: "/dashboard",
    label: "Dashboard",
    icon: <DashboardOutlined />,
  },
  {
    key: "/sessions",
    label: "Sessions",
    icon: <BookOutlined />,
    permission: "ViewExamSession",
  },
  {
    key: "/students",
    label: "Students",
    icon: <TeamOutlined />,
    permission: "ViewStudents",
  },
  {
    key: "/question-banks",
    label: "Question Banks",
    icon: <FileTextOutlined />,
    permission: ["ManageQuestionBanks", "ViewQuestionBanks"],
  },
  {
    key: "/monitoring",
    label: "Live Monitoring",
    icon: <EyeOutlined />,
    permission: "MonitorExamSession",
  },
  {
    key: "/alerts",
    label: "Alerts",
    icon: <AlertOutlined />,
    permission: ["ViewAlerts", "DismissAlert", "WarnStudent", "EscalateAlert"],
  },
  {
    key: "/reports",
    label: "Reports",
    icon: <BarChartOutlined />,
    permission: ["ViewReports", "ExportData"],
  },
  {
    key: "/logs",
    label: "Audit Logs",
    icon: <HistoryOutlined />,
    permission: "ViewAuditLogs",
  },
  settingsItem,
];

// Users Management and Roles & Permissions are Super Admin-only capabilities
// (role R-01) rather than granted permissions, so they carry no `permission`
// flag — the Sidebar only renders these two entries for that role. System
// Settings stays last, after them.
export const superAdminItems = [
  ...adminItems.filter((item) => item.key !== "/settings"),
  {
    key: "/users",
    label: "Users Management",
    icon: <UserOutlined />,
  },
  {
    key: "/roles",
    label: "Roles & Permissions",
    icon: <SafetyCertificateOutlined />,
  },
  settingsItem,
];
