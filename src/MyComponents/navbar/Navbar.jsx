import { useState } from "react";

import { Layout, Menu, Space, Switch, theme } from "antd";
import { useLanguage } from "../../i18n";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import { MenuOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { useToken } = theme;

export default function Navbar({ isDark, setIsDark }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const { token } = useToken();

  const handleMenuClick = (e) => {
    const targetElement = document.getElementById(e.key);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <Header
      style={{
        background: token.colorBgContainer,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: "0 20px",
        height: "auto",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <MyRow align="middle" justify="space-between">
        <MyCol xs={18} md={6}>
          <MyRow align="middle" gutter={10}>
            <MyCol
              style={{
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <img
                src="src/assets/logo.jpg"
                alt="logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </MyCol>
            <MyCol>{t.companyName}</MyCol>
          </MyRow>
        </MyCol>

        <MyCol xs={0} md={12}>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={["home"]}
            items={t.navItems}
            onClick={handleMenuClick}
            style={{
              background: "transparent",
              justifyContent: "center",
            }}
          />
        </MyCol>

        <MyCol xs={6} md={6}>
          <MyRow justify="end" align="middle">
            <MyCol xs={0} md={24}>
              <Space size="small">
                <MyButtonPrimary
                  onClick={() => handleMenuClick({ key: "contact" })}
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {t.contactButton}
                </MyButtonPrimary>

                <MyCol>
                  <Space align="center" size={8}>
                    <SunOutlined
                      style={{
                        color: isDark
                          ? token.colorTextSecondary
                          : token.colorPrimary,
                        fontSize: 16,
                      }}
                    />
                    <Switch
                      checked={isDark}
                      onChange={setIsDark}
                      style={{
                        background: isDark
                          ? token.colorPrimary
                          : token.colorBorder,
                      }}
                    />
                    <MoonOutlined
                      style={{
                        color: isDark
                          ? token.colorPrimary
                          : token.colorTextSecondary,
                        fontSize: 16,
                      }}
                    />
                  </Space>
                </MyCol>
                <MyButtonSecondary
                  size="small"
                  type={locale === "ar" ? "primary" : "default"}
                  onClick={() => setLocale("ar")}
                >
                  AR
                </MyButtonSecondary>

                <MyButtonSecondary
                  size="small"
                  type={locale === "en" ? "primary" : "default"}
                  onClick={() => setLocale("en")}
                >
                  EN
                </MyButtonSecondary>
              </Space>
            </MyCol>

            <MyCol xs={24} md={0}>
              <MyButtonSecondary
                type="text"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                icon={
                  <MenuOutlined
                    style={{
                      fontSize: 20,
                    }}
                  />
                }
              />
            </MyCol>
          </MyRow>
        </MyCol>
      </MyRow>

      {mobileMenuOpen && (
        <MyRow>
          <MyCol
            xs={24}
            md={0}
            style={{
              background: token.colorBgContainer,
              borderTop: `1px solid ${token.colorBorder}`,
              marginTop: 10,
              padding: "8px 24px 16px",
            }}
          >
            {t.navItems.map((item) => (
              <MyRow
                key={item.key}
                onClick={() => handleMenuClick({ key: item.key })}
                style={{
                  padding: "12px 0",
                  fontWeight: 600,
                  fontSize: 15,
                  borderBottom: `1px solid ${token.colorBorder}`,
                  cursor: "pointer",
                  color: token.colorTextBase,
                }}
              >
                <MyCol span={24}>{item.label}</MyCol>
              </MyRow>
            ))}
            <MyRow
              style={{
                borderTop: `1px solid ${token.colorBorder}`,
              }}
            >
              <MyCol span={24}>
                <Space
                  direction="vertical"
                  size={10}
                  style={{
                    width: "100%",
                  }}
                >
                  <MyCol>
                    <Space align="center" size={8}>
                      <SunOutlined
                        style={{
                          color: isDark
                            ? token.colorTextSecondary
                            : token.colorPrimary,
                          fontSize: 16,
                        }}
                      />
                      <Switch
                        checked={isDark}
                        onChange={setIsDark}
                        style={{
                          background: isDark
                            ? token.colorPrimary
                            : token.colorBorder,
                        }}
                      />
                      <MoonOutlined
                        style={{
                          color: isDark
                            ? token.colorPrimary
                            : token.colorTextSecondary,
                          fontSize: 16,
                        }}
                      />
                    </Space>
                  </MyCol>
                  <MyButtonSecondary
                    block
                    size="small"
                    type={locale === "ar" ? "primary" : "default"}
                    onClick={() => setLocale("ar")}
                  >
                    AR
                  </MyButtonSecondary>

                  <MyButtonSecondary
                    block
                    size="small"
                    type={locale === "en" ? "primary" : "default"}
                    onClick={() => setLocale("en")}
                  >
                    EN
                  </MyButtonSecondary>
                </Space>
              </MyCol>
            </MyRow>
          </MyCol>
        </MyRow>
      )}
    </Header>
  );
}
