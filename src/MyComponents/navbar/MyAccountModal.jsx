import { useEffect, useState } from "react";
import { Input, Flex, Tabs, theme, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useAuthStore from "../../store/useAuthStore";
import { apiFetch } from "../../api/apiClient";

export default function MyAccountModal({ open, onClose }) {
  const { token } = theme.useToken();
  const [profileForm] = MyForm.useForm();
  const [passwordForm] = MyForm.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setTokens = useAuthStore((state) => state.setTokens);
  const updateOwnProfile = useAuthStore((state) => state.updateOwnProfile);

  useEffect(() => {
    if (open && user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [open, user, profileForm]);

  const handleCancel = () => {
    profileForm.resetFields();
    passwordForm.resetFields();
    onClose();
  };

  const handleProfileSave = async ({ name, email }) => {
    setSavingProfile(true);

    try {
      // NOTE: no confirmed backend endpoint exists yet for a user updating
      // their own profile — this is a best guess following the /api/auth/
      // prefix used for other self-service actions (e.g. change-password).
      // Confirm the exact path/payload/response shape with the backend
      // before relying on this in production.
      const res = await apiFetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          FullName: name,
          Email: email.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to update profile.");
        return;
      }

      updateOwnProfile({ name, email: email.trim() });
      message.success("Profile updated successfully.");
    } catch {
      message.error("Network error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordFinish = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    setSavingPassword(true);

    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          CurrentPassword: currentPassword,
          NewPassword: newPassword,
          ConfirmPassword: confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to change password.");
        return;
      }

      setTokens(json.data.accessToken, json.data.refreshToken);

      message.success("Password changed successfully.");
      passwordForm.resetFields();
    } catch {
      message.error("Network error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  const items = [
    {
      key: "profile",
      label: (
        <Flex align="center" gap={6}>
          <UserOutlined />
          Profile
        </Flex>
      ),
      children: (
        <MyForm form={profileForm} layout="vertical" onFinish={handleProfileSave}>
          <MyForm.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input placeholder="e.g. Dr. Rania Odeh" />
          </MyForm.Item>

          <MyForm.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="e.g. rania.odeh@vu.edu" />
          </MyForm.Item>

          <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
            <MyButtonSecondary onClick={handleCancel} disabled={savingProfile}>
              Cancel
            </MyButtonSecondary>
            <MyButtonPrimary htmlType="submit" loading={savingProfile}>
              Save Profile
            </MyButtonPrimary>
          </Flex>
        </MyForm>
      ),
    },
    {
      key: "password",
      label: (
        <Flex align="center" gap={6}>
          <LockOutlined />
          Password
        </Flex>
      ),
      children: (
        <MyForm form={passwordForm} layout="vertical" onFinish={handlePasswordFinish}>
          <MyForm.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </MyForm.Item>

          <MyForm.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              autoComplete="new-password"
            />
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
            <Input.Password
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </MyForm.Item>

          <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
            <MyButtonSecondary onClick={handleCancel} disabled={savingPassword}>
              Cancel
            </MyButtonSecondary>
            <MyButtonPrimary
              htmlType="submit"
              icon={<LockOutlined />}
              loading={savingPassword}
            >
              Save Password
            </MyButtonPrimary>
          </Flex>
        </MyForm>
      ),
    },
  ];

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <UserOutlined />
          <MyText strong>My Account</MyText>
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

      <Tabs items={items} />
    </MyModal>
  );
}
