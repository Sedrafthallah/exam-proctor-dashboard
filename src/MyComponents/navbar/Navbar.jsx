import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Avatar,
  Space,
  Switch,
  Dropdown,
  App,
  theme,
  Badge,
} from "antd";

import {
  BellOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../store/useAuthStore";
import useSessionStore from "../../store/useSessionStore";

import MyText from "../../MyComponents/myText/MyText";
import MyAccountModal from "./MyAccountModal";
const { Header } = Layout;
const { useToken } = theme;

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

export default function Navbar({ isDark, setIsDark }) {
  const { token } = useToken();

  const navigate = useNavigate();
  const { modal } = App.useApp();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const openAlertsCount = useSessionStore((state) => state.stats.openAlerts);

  const roleLabel = ROLE_LABELS[user?.role] || user?.role;

  const userMenuItems = [
    {
      key: "profile-info",
      label: (
        <div style={{ padding: "2px 4px", maxWidth: 200 }}>
          <div
            style={{ fontWeight: 600, fontSize: 13, color: token.colorText }}
          >
            {user?.name || "Guest"}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: token.colorTextTertiary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.email}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: token.colorTextTertiary,
            }}
          >
            {roleLabel}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "my-account",
      icon: <UserOutlined />,
      label: "My Account",
      onClick: () => setIsAccountModalOpen(true),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => {
        modal.confirm({
          title: "Confirm Logout",
          content: "Are you sure you want to log out?",
          okText: "Logout",
          okType: "danger",
          cancelText: "Cancel",
          onOk: async () => {
            await logout();
            navigate("/login");
          },
        });
      },
    },
  ];

  return (
    <Header
      style={{
        height: 72,
        lineHeight: "72px",
        padding: "0 24px",
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorder}`,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        insetBlockStart: 0,
        zIndex: 10,
      }}
    >
      <Space size={20} style={{ flexShrink: 0 }}>
        <Space
          size={9}
          style={{
            background: token.colorFillSecondary,
            padding: "7px 14px",
            borderRadius: 999,
            height: 40,
          }}
        >
          <SunOutlined
            style={{
              color: isDark ? token.colorTextTertiary : token.colorPrimary,
              fontSize: 15,
            }}
          />

          <Switch checked={isDark} onChange={setIsDark} />

          <MoonOutlined
            style={{
              color: isDark ? token.colorPrimary : token.colorTextTertiary,
              fontSize: 15,
            }}
          />
        </Space>

        <Badge count={openAlertsCount} size="small" offset={[-2, 2]}>
          <BellOutlined
            style={{
              fontSize: 19,
              color: token.colorTextSecondary,
              cursor: "pointer",
            }}
            onClick={() => navigate("/alerts")}
          />
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Space
            size={10}
            style={{
              cursor: "pointer",
              padding: "4px 8px 4px 4px",
              borderRadius: 10,
            }}
          >
            <Avatar
              size={38}
              icon={<UserOutlined />}
              style={{
                background: `linear-gradient(135deg, #6D4AFF, ${token.colorPrimary})`,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.2,
              }}
            >
              <MyText
                style={{
                  fontWeight: 600,
                  color: token.colorText,
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Guest"}
              </MyText>

              <MyText
                style={{
                  fontSize: 12,
                  color: token.colorTextSecondary,
                }}
              >
                {roleLabel}
              </MyText>
            </div>

            <DownOutlined
              style={{ fontSize: 10, color: token.colorTextTertiary }}
            />
          </Space>
        </Dropdown>
      </Space>

      <MyAccountModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </Header>
  );
}
