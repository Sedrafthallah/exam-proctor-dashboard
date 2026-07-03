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

  const currentToken = isDark ? darkToken : lightToken;

  return (
    <ConfigProvider
      direction={dir}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: currentToken,
        components: {
          Layout: {
            siderBg: currentToken.colorBgContainer,
            headerBg: currentToken.colorBgContainer,
            triggerBg: currentToken.colorFillSecondary,
            triggerColor: currentToken.colorPrimary,
          },
          Menu: {
            itemBorderRadius: 10,
            itemMarginInline: 12,
            itemMarginBlock: 4,
            itemHeight: 44,
            iconSize: 18,
            itemSelectedBg: currentToken.colorPrimary,
            itemSelectedColor: "#FFFFFF",
            itemHoverBg: currentToken.colorFillSecondary,
            itemHoverColor: currentToken.colorPrimary,
            itemColor: currentToken.colorTextSecondary,
          },
        },
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
