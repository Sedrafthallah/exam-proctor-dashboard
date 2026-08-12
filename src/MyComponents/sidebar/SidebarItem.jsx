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

// Permission values are the real permission-name strings from the backend's
// roles-and-permissions endpoint (26 total). An array means the item is
// visible if the Admin holds ANY one of the listed permissions.
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
];

// Users Management, System Settings and Audit Logs are Super Admin-only
// capabilities (role R-01) rather than granted permissions, so they carry
// no `permission` flag — the Sidebar only renders this list for that role.
export const superAdminItems = [
  ...adminItems,
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

  {
    key: "/logs",
    label: "Audit Logs",
    icon: <HistoryOutlined />,
  },
  {
    key: "/settings",
    label: "System Settings",
    icon: <SettingOutlined />,
  },
];
