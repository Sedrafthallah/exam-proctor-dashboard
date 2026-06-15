import { Input, Space, Divider, theme, Flex, Card } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";

import MyTitle from "../MyTitle/MyTitle";
import MyText from "../myText/MyText";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyForm from "../myForm/MyForm";
import { useLanguage } from "../../i18n";

const { useToken } = theme;

export default function LoginMyForm({ switchToRegister }) {
  const { token } = useToken();
  const [form] = MyForm.useForm();
  const { t } = useLanguage();

  const onFinish = (values) => {
    console.log(values);
    form.resetFields();
  };

  return (
    <Flex vertical gap={20} style={{ width: "100%" }}>
      <Space direction="vertical" size={4} style={{ textAlign: "center" }}>
        <MyTitle level={3} style={{ fontWeight: 800, margin: 0 }}>
          <UserOutlined style={{ color: token.colorPrimary }} />
          {t.login.title}
        </MyTitle>

        <MyText style={{ color: token.colorTextSecondary }}>
          {t.login.subtitle}
        </MyText>
      </Space>

      <Divider style={{ margin: 0 }} />

      <Card
        bordered={false}
        style={{
          width: "100%",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: token.colorShadow,
        }}
      >
        <MyForm form={form} layout="vertical" onFinish={onFinish}>
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <MyForm.Item
              label={t.login.email}
              name="email"
              rules={[{ required: true, message: t.login.email }]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="example@gmail.com"
              />
            </MyForm.Item>

            <MyForm.Item
              label={t.login.password}
              name="password"
              rules={[{ required: true, message: t.login.password }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="********"
              />
            </MyForm.Item>

            <Flex justify="flex-start">
              <MyText style={{ color: token.colorPrimary, fontSize: 13 }}>
                {t.login.forgot}
              </MyText>
            </Flex>

            <MyButtonPrimary htmlType="submit" style={{ width: "100%" }}>
              {t.login.submit}
            </MyButtonPrimary>
          </Space>

          <Flex justify="center" style={{ marginTop: 12 }}>
            <MyText style={{ color: token.colorTextSecondary }}>
              {t.login.noAccount}{" "}
              <span
                onClick={switchToRegister}
                style={{
                  color: token.colorPrimary,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t.login.register}
              </span>
            </MyText>
          </Flex>
        </MyForm>
      </Card>
    </Flex>
  );
}
