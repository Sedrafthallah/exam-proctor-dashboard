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
} from "@ant-design/icons";

// 👤 ADMIN
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
    permission: "P05",
  },
  {
    key: "/students",
    label: "Students",
    icon: <TeamOutlined />,
    permission: "P03",
  },
  {
    key: "/question-banks",
    label: "Question Banks",
    icon: <FileTextOutlined />,
    permission: "P01",
  },
  {
    key: "/monitoring",
    label: "Live Monitoring",
    icon: <EyeOutlined />,
    permission: "P04",
  },
  {
    key: "/alerts",
    label: "Alerts",
    icon: <AlertOutlined />,
    permission: "P04",
  },
  {
    key: "/reports",
    label: "Reports",
    icon: <BarChartOutlined />,
    permission: "P07",
  },
];

export const superAdminItems = [
  ...adminItems,
  {
    key: "/users",
    label: "Users Management",
    icon: <UserOutlined />,
    permission: "P08",
  },
  {
    key: "/settings",
    label: "System Settings",
    icon: <SettingOutlined />,
    permission: "P08",
  },
  {
    key: "/logs",
    label: "Audit Logs",
    icon: <HistoryOutlined />,
    permission: "P08",
  },
];
