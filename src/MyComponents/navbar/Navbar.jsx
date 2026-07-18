import { useState } from "react";
import { Layout, Input, Avatar, Space, Switch, Dropdown, theme } from "antd";

import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  LockOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../store/useAuthStore";
import { useLanguage } from "../../i18n";
import MyButtonSecondary from "../../MyComponents/myButton/MyButtonSecondary";
import MyText from "../../MyComponents/myText/MyText";
import ChangePasswordModal from "./ChangePasswordModal";
const { Header } = Layout;
const { useToken } = theme;

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

export default function Navbar({ isDark, setIsDark }) {
  const { token } = useToken();
  const { locale, setLocale } = useLanguage();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
      key: "change-password",
      icon: <LockOutlined />,
      label: "Change Password",
      onClick: () => setIsPasswordModalOpen(true),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => logout(),
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
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        insetBlockStart: 0,
        zIndex: 10,
      }}
    >
      <Input
        placeholder="Search..."
        allowClear
        prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
        style={{
          flex: "0 1 360px",
          minWidth: 160,
          height: 40,
          borderRadius: 10,
          background: token.colorFillSecondary,
          borderColor: "transparent",
        }}
      />

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

        <Space size={6}>
          <MyButtonSecondary
            size="small"
            type={locale === "ar" ? "primary" : "default"}
            onClick={() => setLocale("ar")}
            style={{
              minWidth: 42,
              fontWeight: 600,
            }}
          >
            AR
          </MyButtonSecondary>
          <MyButtonSecondary
            size="small"
            type={locale === "en" ? "primary" : "default"}
            onClick={() => setLocale("en")}
            style={{
              minWidth: 42,
              fontWeight: 600,
            }}
          >
            EN
          </MyButtonSecondary>
        </Space>

        <BellOutlined
          style={{
            fontSize: 19,
            color: token.colorTextSecondary,
            cursor: "pointer",
          }}
        />

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

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Header>
  );
}
