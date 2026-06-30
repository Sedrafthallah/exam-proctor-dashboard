import { Layout, Input, Avatar, Space, Switch, theme } from "antd";

import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import MyButtonSecondary from "../../MyComponents/myButton/MyButtonSecondary";
import MyText from "../../MyComponents/myText/MyText";
const { Header } = Layout;
const { useToken } = theme;

export default function Navbar({ isDark, setIsDark, locale, setLocale }) {
  const { token } = useToken();

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
      }}
    >
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        style={{
          width: 340,
          height: 42,
          borderRadius: 10,
          background: token.colorBgElevated,
          borderColor: token.colorBorder,
        }}
      />

      <Space size={20}>
        <Space size={8}>
          <SunOutlined
            style={{
              color: isDark ? token.colorTextSecondary : token.colorPrimary,
            }}
          />

          <Switch checked={isDark} onChange={setIsDark} />

          <MoonOutlined
            style={{
              color: isDark ? token.colorPrimary : token.colorTextSecondary,
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
            fontSize: 20,
            color: token.colorText,
            cursor: "pointer",
          }}
        />

        <Space size={12}>
          <Avatar size={42} icon={<UserOutlined />} />

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
              }}
            >
              Sedra Fathallah
            </MyText>

            <MyText
              style={{
                fontSize: 12,
                color: token.colorTextSecondary,
              }}
            >
              Super Admin
            </MyText>
          </div>
        </Space>
      </Space>
    </Header>
  );
}
