import { useState } from "react";
import { Input, Flex, theme, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";

export default function ChangePasswordModal({ open, onClose }) {
  const { token } = theme.useToken();
  const [form] = MyForm.useForm();
  const [saving, setSaving] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async () => {
    setSaving(true);

    // POST /api/auth/change-password { currentPassword, newPassword }
    await new Promise((resolve) => setTimeout(resolve, 700));

    setSaving(false);
    message.success("Password changed successfully.");
    form.resetFields();
    onClose();
  };

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <LockOutlined />
          <MyText strong>Change Password</MyText>
        </Flex>
      }
    >
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px ${token.colorBgContainer} inset !important;
          -webkit-text-fill-color: ${token.colorText} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <MyForm form={form} layout="vertical" onFinish={handleFinish}>
        <MyForm.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: "Please enter your current password" }]}
        >
          <Input.Password placeholder="Enter current password" autoComplete="current-password" />
        </MyForm.Item>

        <MyForm.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter a new password" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password placeholder="Enter new password" autoComplete="new-password" />
        </MyForm.Item>

        <MyForm.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Re-enter new password" autoComplete="new-password" />
        </MyForm.Item>

        <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
          <MyButtonSecondary onClick={handleCancel} disabled={saving}>
            Cancel
          </MyButtonSecondary>
          <MyButtonPrimary htmlType="submit" icon={<LockOutlined />} loading={saving}>
            Save
          </MyButtonPrimary>
        </Flex>
      </MyForm>
    </MyModal>
  );
}
