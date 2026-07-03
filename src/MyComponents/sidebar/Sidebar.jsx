import { Layout, Menu, Avatar, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import useAuthStore from "../../store/useAuthStore";
import MyText from "../myText/MyText";
import { adminItems, superAdminItems } from "./SidebarItem";

const { Sider } = Layout;
const { useToken } = theme;

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

export default function Sidebar({ collapsed, setCollapsed, isDark }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useToken();

  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const baseItems = user?.role === "SUPER_ADMIN" ? superAdminItems : adminItems;

  const items = baseItems.filter((item) => {
    if (!item.permission) return true;
    const required = Array.isArray(item.permission)
      ? item.permission
      : [item.permission];
    return required.some((permission) => hasPermission(permission));
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const roleLabel = ROLE_LABELS[user?.role] || user?.role;

  return (
    <Sider
      width={264}
      collapsedWidth={88}
      theme={isDark ? "dark" : "light"}
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        background: token.colorBgContainer,
        borderInlineEnd: `1px solid ${token.colorBorder}`,
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}
    >
      {/* Wrapper */}
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ================= LOGO ================= */}
        <div
          style={{
            height: 72,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "0 10px" : "0 16px",
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(
                  135deg,
                  ${token.colorPrimary},
                  ${token.colorPrimaryActive}
                )`,
                boxShadow: `0 4px 12px ${token.colorPrimary}55`,
              }}
            >
              <SafetyCertificateOutlined
                style={{
                  color: "#fff",
                  fontSize: 18,
                }}
              />
            </div>

            {!collapsed && (
              <div style={{ lineHeight: 1.15 }}>
                <MyText
                  style={{
                    display: "block",
                    fontSize: 15,
                    fontWeight: 700,
                    color: token.colorText,
                  }}
                >
                  VU Proctor
                </MyText>

                <MyText
                  style={{
                    fontSize: 10,
                    letterSpacing: 0.6,
                    color: token.colorTextTertiary,
                  }}
                >
                  ADMIN PORTAL
                </MyText>
              </div>
            )}
          </div>

          {!collapsed && (
            <MenuFoldOutlined
              onClick={() => setCollapsed(true)}
              style={{
                fontSize: 16,
                cursor: "pointer",
                color: token.colorTextSecondary,
              }}
            />
          )}
        </div>

        {/* زر الفتح */}
        {collapsed && (
          <div
            style={{
              padding: "14px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MenuUnfoldOutlined
              onClick={() => setCollapsed(false)}
              style={{
                fontSize: 17,
                cursor: "pointer",
                color: token.colorTextSecondary,
              }}
            />
          </div>
        )}

        {/* ================= MENU ================= */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Menu
            mode="inline"
            theme={isDark ? "dark" : "light"}
            selectedKeys={[location.pathname]}
            items={items}
            onClick={({ key }) => navigate(key)}
            style={{
              borderInlineEnd: 0,
              marginTop: 12,
              background: token.colorBgContainer,
            }}
          />
        </div>

        {/* ================= USER CARD ================= */}
        <div
          style={{
            padding: collapsed ? "0 8px 20px" : "0 14px 20px",
            marginTop: 24,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 12,
              padding: collapsed ? "12px 8px" : "14px",
              borderRadius: 16,
              background: token.colorBgElevated,
              border: `1px solid ${token.colorBorder}`,
              boxShadow: token.boxShadowSecondary,
            }}
          >
            <Avatar
              size={collapsed ? 38 : 42}
              style={{
                fontWeight: 700,
                background: `linear-gradient(
                  135deg,
                  #6D4AFF,
                  ${token.colorPrimary}
                )`,
              }}
            >
              {initials}
            </Avatar>

            {!collapsed && (
              <div
                style={{
                  minWidth: 0,
                  lineHeight: 1.25,
                }}
              >
                <MyText
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: token.colorText,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name || "Guest"}
                </MyText>

                <MyText
                  style={{
                    fontSize: 11,
                    color: token.colorTextSecondary,
                  }}
                >
                  {roleLabel}
                </MyText>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sider>
  );
}
