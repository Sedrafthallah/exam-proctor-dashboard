import { useNavigate } from "react-router-dom";
import { Input, Alert, Checkbox, Flex, Form } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

import useAuthStore from "../../store/useAuthStore";
import { useLanguage } from "../../i18n";

import MyCard from "../../MyComponents/myCard/MyCard";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import MyTitle from "../../MyComponents/myTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyLink from "../../MyComponents/myLink/MyLink";
import MyForm from "../../MyComponents/myform/MyForm";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login, loading, error } = useAuthStore();

  const [form] = Form.useForm();

  const onFinish = async ({ email, password }) => {
    const success = await login(email, password);
    if (success) navigate("/dashboard");
  };

  return (
    <Flex
      style={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundImage: "url('src/assets/login.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        padding: "0 10%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(10, 25, 50, 0.8), rgba(47, 59, 83, 0.85))",
          zIndex: 1,
        }}
      />

      <MyCard
        style={{
          width: "100%",
          maxWidth: 390,
          borderRadius: 20,
          height: "fit-content",
          padding: 10,
          position: "relative",
          zIndex: 2,
          backgroundColor: "#eeeae3",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        <Flex vertical align="center" gap={8} style={{ marginBottom: 28 }}>
          <MyTitle level={2} style={{ margin: 0 }}>
            Virtual University
          </MyTitle>

          <MyText type="secondary">Examination System</MyText>

          <MyTitle level={4} style={{ marginTop: 10 }}>
            Welcome Back
          </MyTitle>

          <MyText type="secondary" style={{ textAlign: "center" }}>
            Sign in to access the examination management and monitoring system.
          </MyText>
        </Flex>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <MyForm form={form} layout="vertical" onFinish={onFinish}>
          <MyForm.Item
            name="email"
            label={<MyText strong>Email / Username</MyText>}
            rules={[{ required: true, message: t("email") }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email or username"
              style={{ height: 42 }}
            />
          </MyForm.Item>

          <MyForm.Item
            name="password"
            label={<MyText strong>Password</MyText>}
            rules={[{ required: true, message: t("password") }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              style={{ height: 42 }}
            />
          </MyForm.Item>

          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 20 }}
          >
            <Checkbox>Remember me</Checkbox>

            <MyLink href="#forgot">Forgot password?</MyLink>
          </Flex>

          <MyButtonPrimary
            htmlType="submit"
            block
            loading={loading}
            icon={<LoginOutlined />}
          >
            Sign In
          </MyButtonPrimary>
        </MyForm>

        <Flex vertical align="center" gap={4} style={{ marginTop: 24 }}>
          <MyText>🛡️ Authorized personnel only.</MyText>
          <MyText type="secondary">
            All activities are logged and monitored.
          </MyText>
        </Flex>
      </MyCard>
    </Flex>
  );
}
