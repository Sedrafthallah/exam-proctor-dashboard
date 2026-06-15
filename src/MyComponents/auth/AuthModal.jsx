import { Tabs } from "antd";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import MyModal from "../myModal/MyModal";
import { useState } from "react";
import { useLanguage } from "../../i18n";

export default function AuthModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("login");
  const { t } = useLanguage();

  return (
    <MyModal open={open} footer={null} onCancel={onClose} width={500}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: "login",
            label: t.tabs.login,
            children: (
              <LoginForm switchToRegister={() => setActiveTab("register")} />
            ),
          },
          {
            key: "register",
            label: t.tabs.register,
            children: (
              <RegisterForm switchToLogin={() => setActiveTab("login")} />
            ),
          },
        ]}
      />
    </MyModal>
  );
}
