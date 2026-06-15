import { Input, Space, Divider, theme, Flex, Card } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import MyTitle from "../MyTitle/MyTitle";
import MyText from "../myText/MyText";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyForm from "../myForm/MyForm";
import { useLanguage } from "../../i18n";

import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";

const { useToken } = theme;

export default function RegisterMyForm({ switchToLogin }) {
  const { token } = useToken();
  const [form] = MyForm.useForm();
  const { t } = useLanguage();

  const onFinish = (values) => {
    console.log("Register Data:", values);
    form.resetFields();
  };

  return (
    <Flex vertical gap={20} style={{ width: "100%" }}>
      <Space
        direction="vertical"
        size={4}
        style={{ width: "100%", textAlign: "center" }}
      >
        <MyTitle level={2} style={{ fontWeight: 800 }}>
          <UserAddOutlined style={{ color: token.colorPrimary }} />
          {t.register.title}
        </MyTitle>

        <MyText style={{ color: token.colorTextSecondary }}>
          {t.register.subtitle}
        </MyText>
      </Space>

      <Divider style={{ margin: 0 }} />

      <Card
        bordered={false}
        style={{
          width: "100%",
          borderRadius: 16,
          boxShadow: token.colorShadow,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <MyForm
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ width: "100%" }}
        >
          <MyRow gutter={16}>
            <MyCol span={12}>
              <MyForm.Item
                label={t.register.fullName}
                name="fullName"
                rules={[{ required: true, message: t.register.messageName }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder={t.register.placeHolderName}
                />
              </MyForm.Item>
            </MyCol>

            <MyCol span={12}>
              <MyForm.Item
                label={t.register.phone}
                name="phone"
                rules={[{ required: true, message: t.register.messagePhone }]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined />}
                  placeholder={t.register.placeHolderPhone}
                />
              </MyForm.Item>
            </MyCol>
          </MyRow>

          <MyRow gutter={16}>
            <MyCol span={12}>
              <MyForm.Item
                label={t.register.email}
                name="email"
                rules={[
                  { required: true, message: t.register.messageEmail },
                  {
                    type: "email",
                    message: t.register.messageEmailInvalid,
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder={t.register.placeHolderEmail}
                />
              </MyForm.Item>
            </MyCol>

            <MyCol span={12}>
              <MyForm.Item
                label={t.register.password}
                name="password"
                rules={[
                  { required: true, message: t.register.messagePassword },
                  { min: 6, message: t.register.messagePasswordMin },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder={t.register.placeHolderPassword}
                />
              </MyForm.Item>
            </MyCol>
          </MyRow>

          <MyRow gutter={16}>
            <MyCol span={24}>
              <MyForm.Item
                label={t.register.confirmPassword}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: t.register.messageConfirmPassword,
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(t.register.messagePasswordMismatch),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder={t.register.placeHolderConfirmPassword}
                />
              </MyForm.Item>
            </MyCol>
          </MyRow>

          <MyButtonPrimary
            htmlType="submit"
            style={{
              width: "100%",
              height: 48,
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            {t.register.submit}
          </MyButtonPrimary>

          <Flex vertical align="center" style={{ width: "100%" }}>
            <MyText
              style={{
                textAlign: "center",
                marginTop: 10,
                color: token.colorTextSecondary,
              }}
            >
              {t.register.haveAccount}{" "}
              <span
                onClick={switchToLogin}
                style={{
                  color: token.colorPrimary,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t.register.login}
              </span>
            </MyText>
          </Flex>
        </MyForm>
      </Card>

      <MyText
        style={{
          textAlign: "center",
          color: token.colorTextSecondary,
          fontSize: 13,
        }}
      >
        {t.register.terms}
      </MyText>
    </Flex>
  );
}
