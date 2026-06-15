import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme as antTheme } from "antd";
import { LanguageProvider, useLanguage } from "./i18n";
import AppRoutes from "./Routes/AppRoutes";
import lightToken from "./token/lightToken";
import darkToken from "./token/darkToken";
import "./App.css";

function ThemedApp() {
  const [isDark, setIsDark] = useState(false);
  const { dir } = useLanguage();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  return (
    <ConfigProvider
      direction={dir}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: isDark ? darkToken : lightToken,
      }}
    >
      <BrowserRouter>
        <AppRoutes isDark={isDark} setIsDark={setIsDark} />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemedApp />
    </LanguageProvider>
  );
}
