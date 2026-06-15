import { Layout, theme } from "antd";
import { useLanguage } from "../i18n";

const { Content } = Layout;
const { useToken } = theme;

export default function MainLayout({ children, isDark, setIsDark }) {
  const { dir } = useLanguage();
  const { token } = useToken();

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
      dir={dir}
    >
      {/* <Headers isDark={isDark} setIsDark={setIsDark}  /> */}

      <Layout>
        {/* <SideBar /> */}

        <Content
          style={{
            padding: 24,
            background: token.colorBgLayout,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
