import { useNavigate } from "react-router-dom";
import { Input, Alert, Checkbox, Flex, Form, theme } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

import useAuthStore from "../../store/useAuthStore";
import { useLanguage } from "../../i18n";

import MyCard from "../../MyComponents/myCard/MyCard";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyLink from "../../MyComponents/myLink/MyLink";
import MyForm from "../../MyComponents/myForm/MyForm";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login, loading, error } = useAuthStore();
  const { token } = theme.useToken();

  const [form] = Form.useForm();

  const onFinish = async ({ email, password }) => {
    const success = await login(email, password);
    if (success) navigate("/dashboard");
  };

  const cardBg = "#0F172A";
  const textColor = "#F8FAFC";
  const textSecondaryColor = "#94A3B8";
  const inputBg = "#1E293B";
  const borderStyle = "1px solid #334155";

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
        padding: " 0 10%",
      }}
    >
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px ${inputBg} inset !important;
          -webkit-text-fill-color: ${textColor} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(7, 16, 34, 0.9), rgba(15, 23, 42, 0.93))",
          zIndex: 1,
        }}
      />

      <MyCard
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 24,
          height: "fit-content",
          padding: "24px 16px",
          position: "relative",
          zIndex: 2,
          backgroundColor: cardBg,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
          border: borderStyle,
        }}
      >
        <Flex vertical align="center" gap={6} style={{ marginBottom: 28 }}>
          <MyTitle
            level={3}
            style={{
              margin: 0,
              color: textColor,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            VIRTUAL UNIVERSITY
          </MyTitle>

          <MyText
            style={{
              color: token.colorPrimaryHover,
              fontSize: 13,
              letterSpacing: "1px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            EXAMINATION SYSTEM
          </MyText>

          <MyTitle
            level={4}
            style={{
              marginTop: 14,
              marginBottom: 4,
              color: textColor,
              fontWeight: 700,
            }}
          >
            Welcome Back
          </MyTitle>

          <MyText
            style={{
              textAlign: "center",
              color: textSecondaryColor,
              fontSize: 14,
            }}
          >
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
            label={
              <MyText style={{ color: textColor, fontWeight: 600 }}>
                Email / Username
              </MyText>
            }
            rules={[{ required: true, message: t("email") }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: textSecondaryColor }} />}
              placeholder="Enter your email or username"
              style={{
                height: 45,
                backgroundColor: inputBg,
                border: "none",
                color: textColor,
              }}
            />
          </MyForm.Item>

          <MyForm.Item
            name="password"
            label={
              <MyText style={{ color: textColor, fontWeight: 600 }}>
                Password
              </MyText>
            }
            rules={[{ required: true, message: t("password") }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: textSecondaryColor }} />}
              placeholder="Enter your password"
              style={{
                height: 45,
                backgroundColor: inputBg,
                border: "none",
                color: textColor,
              }}
            />
          </MyForm.Item>

          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 24 }}
          >
            <Checkbox style={{ color: textColor }}>Remember me</Checkbox>
            <MyLink
              href="#forgot"
              style={{ color: token.colorPrimaryHover, fontWeight: 500 }}
            >
              Forgot password?
            </MyLink>
          </Flex>

          <MyButtonPrimary
            htmlType="submit"
            block
            loading={loading}
            icon={<LoginOutlined />}
            style={{ height: 45, borderRadius: 8, fontWeight: 600 }}
          >
            Sign In
          </MyButtonPrimary>
        </MyForm>

        <div style={{ borderTop: borderStyle, marginTop: 24, paddingTop: 16 }}>
          <Flex vertical align="center" gap={2}>
            <MyText
              style={{
                color: textSecondaryColor,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              🛡️ Authorized personnel only.
            </MyText>
            <MyText
              style={{
                color: textSecondaryColor,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              All activities are logged and monitored.
            </MyText>
          </Flex>
        </div>
      </MyCard>
    </Flex>
  );
}
