import { useState } from "react";
import { Layout, theme } from "antd";

import Sidebar from "../MyComponents/sidebar/Sidebar";
import Navbar from "../MyComponents/navbar/Navbar";

const { Content } = Layout;

export default function MainLayout({ children, isDark, setIsDark }) {
  const { token } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: token.colorBgBase,
      }}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isDark={isDark}
      />

      <Layout>
        <Navbar isDark={isDark} setIsDark={setIsDark} />

        <Content
          style={{
            padding: 24,
            background: token.colorBgBase,
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
