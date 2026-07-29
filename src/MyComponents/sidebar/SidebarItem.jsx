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

// Permission codes follow the Admin Permission Set (P-01..P-07) in the
// Engineering Analysis spec. An array means the item is visible if the
// Admin holds ANY one of the listed permissions.
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
    permission: "P03", // Session: Manage
  },
  {
    key: "/students",
    label: "Students",
    icon: <TeamOutlined />,
    permission: "P05", // Students: Register
  },
  {
    key: "/question-banks",
    label: "Question Banks",
    icon: <FileTextOutlined />,
    permission: ["P01", "P02"], // Question Bank: Author / View All
  },
  {
    key: "/monitoring",
    label: "Live Monitoring",
    icon: <EyeOutlined />,
    permission: "P04", // Session: Live Proctor
  },
  {
    key: "/alerts",
    label: "Alerts",
    icon: <AlertOutlined />,
    permission: ["P04", "P07"], // Session: Live Proctor / Reports: View Violations (read-only)
  },
  {
    key: "/reports",
    label: "Reports",
    icon: <BarChartOutlined />,
    permission: ["P06", "P07"], // Reports: Export / View Violations
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
    key: "/settings",
    label: "System Settings",
    icon: <SettingOutlined />,
  },
  {
    key: "/logs",
    label: "Audit Logs",
    icon: <HistoryOutlined />,
  },
];
