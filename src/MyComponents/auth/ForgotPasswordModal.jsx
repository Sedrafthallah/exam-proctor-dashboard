import { useState } from "react";
import { Input, Flex, theme, message } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import { apiFetch } from "../../api/apiClient";

export default function ForgotPasswordModal({ open, onClose }) {
  const { token } = theme.useToken();
  const [emailForm] = MyForm.useForm();
  const [otpForm] = MyForm.useForm();
  const [step, setStep] = useState("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleClose = () => {
    emailForm.resetFields();
    otpForm.resetFields();
    setStep("email");
    setSubmittedEmail("");
    onClose();
  };

  const handleRequestOtp = async ({ email }) => {
    setSendingOtp(true);
    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to send code.");
        return;
      }

      setSubmittedEmail(email);
      message.success("Check your email for the code.");
      setStep("otp");
    } catch {
      message.error("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmOtp = async ({ otp, newPassword }) => {
    setResetting(true);
    try {
      const res = await apiFetch("/api/auth/confirm-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submittedEmail, otp, newPassword }),
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Invalid or expired code.");
        return;
      }

      setStep("done");
    } catch {
      message.error("Network error. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <MyModal
      open={open}
      onCancel={handleClose}
      title={
        <Flex align="center" gap={8}>
          <MyText strong>Reset Password</MyText>
        </Flex>
      }
    >
      {step === "email" && (
        <MyForm form={emailForm} layout="vertical" onFinish={handleRequestOtp}>
          <MyText type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Enter your account email and we'll send you a verification code.
          </MyText>
          <MyForm.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="you@vu.edu" />
          </MyForm.Item>
          <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
            <MyButtonSecondary onClick={handleClose} disabled={sendingOtp}>
              Cancel
            </MyButtonSecondary>
            <MyButtonPrimary htmlType="submit" loading={sendingOtp}>
              Send Code
            </MyButtonPrimary>
          </Flex>
        </MyForm>
      )}

      {step === "otp" && (
        <MyForm form={otpForm} layout="vertical" onFinish={handleConfirmOtp}>
          <MyText type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Enter the code sent to {submittedEmail}.
          </MyText>
          <MyForm.Item
            name="otp"
            label="Verification Code"
            rules={[{ required: true, message: "Please enter the code" }]}
          >
            <Input placeholder="6-digit code" maxLength={6} />
          </MyForm.Item>
          <MyForm.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password autoComplete="new-password" />
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
            <Input.Password autoComplete="new-password" />
          </MyForm.Item>
          <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
            <MyButtonSecondary type="text" onClick={() => setStep("email")} disabled={resetting}>
              Use a different email
            </MyButtonSecondary>
            <MyButtonPrimary htmlType="submit" loading={resetting}>
              Reset Password
            </MyButtonPrimary>
          </Flex>
        </MyForm>
      )}

      {step === "done" && (
        <Flex vertical align="center" gap={12} style={{ padding: "24px 0" }}>
          <CheckCircleFilled style={{ fontSize: 40, color: token.colorSuccess }} />
          <MyText strong>Password reset successfully.</MyText>
          <MyButtonPrimary onClick={handleClose}>Back to Login</MyButtonPrimary>
        </Flex>
      )}
    </MyModal>
  );
}
