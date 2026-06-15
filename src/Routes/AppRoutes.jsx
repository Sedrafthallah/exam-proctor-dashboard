import { Routes, Route } from "react-router-dom";
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import Home from "../Pages/home/Home";

export default function AppRoutes({ isDark, setIsDark }) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <BlankLayout isDark={isDark} setIsDark={setIsDark}>
            <Home />
          </BlankLayout>
        }
      />

      <Route
        path="*"
        element={
          <BlankLayout isDark={isDark} setIsDark={setIsDark}>
            <Home />
          </BlankLayout>
        }
      />
    </Routes>
  );
}
