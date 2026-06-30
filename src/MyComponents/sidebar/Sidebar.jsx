import { Layout, Menu, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import useAuthStore from "../../store/useAuthStore";
import { adminItems, superAdminItems } from "./SidebarItem";

const { Sider } = Layout;
const { useToken } = theme;

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();

  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // 1. تحديد القائمة حسب الدور
  const baseItems = user?.role === "SUPER_ADMIN" ? superAdminItems : adminItems;

  // 2. فلترة حسب permissions
  const items = baseItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <Sider
      width={270}
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorder}`,
        minHeight: "100vh",
        transition: "all 0.2s ease",
      }}
    >
      {/* LOGO */}
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${token.colorBorder}`,
          fontSize: collapsed ? 16 : 26,
          fontWeight: 700,
          color: token.colorPrimary,
          transition: "all 0.2s ease",
        }}
      >
        {collapsed ? "VU" : "VU Proctor"}
      </div>

      {/* MENU */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{
          borderInlineEnd: 0,
          marginTop: 12,
          background: token.colorBgContainer,
        }}
      />
    </Sider>
  );
}
