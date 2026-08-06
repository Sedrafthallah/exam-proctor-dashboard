import { useState } from "react";
import { Input, Select, Flex, Tag, Modal, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useRolesStore from "../../store/useRolesStore";
import useAuthStore from "../../store/useAuthStore";

const ROLE_IDS = {
  Admin: 2,
  Proctor: 3,
  SuperAdmin: 1,
};

export default function NewAdminModal({ open, onClose, onCreate }) {
  const [form] = MyForm.useForm();
  const [loading, setLoading] = useState(false);
  const roles = useRolesStore((state) => state.roles);
  const assignableRoles = roles.filter((role) => !role.isFixed);
  const registerAdminApi = useAuthStore((state) => state.registerAdminApi);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values) => {
    setLoading(true);

    const result = await registerAdminApi({
      name: values.name,
      email: values.email,
      roleIds: [ROLE_IDS[values.role] ?? 2],
    });

    setLoading(false);

    if (!result.success) {
      message.error(result.error || "Failed to create admin.");
      return;
    }

    const data = result.data;

    // عرض الـ temporary password للسوبر أدمن
    Modal.success({
      title: "Admin account created",
      content: (
        <div>
          <p>
            <strong>{data.fullName}</strong> ({data.email})
          </p>
          <p>Temporary password:</p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              background: "#f0f0f0",
              padding: "8px 12px",
              borderRadius: 6,
              letterSpacing: 1,
            }}
          >
            {data.temporaryPassword}
          </p>
          <p style={{ color: "#888", fontSize: 12 }}>
            Share this password with the admin. They should change it on first
            login.
          </p>
        </div>
      ),
    });

    form.resetFields();
    onClose();
    onCreate?.(data); // ← notify parent if needed
  };

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <UserAddOutlined />
          <MyText strong>New Admin Account</MyText>
        </Flex>
      }
    >
      <MyText type="secondary" style={{ display: "block", marginBottom: 16 }}>
        This registers a real login account. The admin signs in from the normal
        login page using this email and temporary password.
      </MyText>

      <MyForm form={form} layout="vertical" onFinish={handleFinish}>
        <MyForm.Item
          name="name"
          label="Full Name"
          rules={[
            { required: true, message: "Please enter the admin's full name" },
          ]}
        >
          <Input placeholder="e.g. Dr. Rania Odeh" />
        </MyForm.Item>

        <MyForm.Item
          name="email"
          label="Login Email"
          rules={[
            { required: true, message: "Please enter a login email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="e.g. rania.odeh@vu.edu" />
        </MyForm.Item>

        <MyForm.Item
          name="role"
          label="Role"
          initialValue={assignableRoles[0]?.name}
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select
            options={assignableRoles.map((role) => ({
              value: role.name,
              label: role.name,
            }))}
          />
        </MyForm.Item>

        <MyForm.Item shouldUpdate noStyle>
          {() => {
            const role = assignableRoles.find(
              (r) => r.name === form.getFieldValue("role"),
            );
            const granted = Object.entries(role?.permissions || {})
              .filter(([, value]) => value)
              .map(([key]) => key);

            return (
              <Flex vertical gap={6} style={{ marginBottom: 16 }}>
                <MyText type="secondary" style={{ fontSize: 12.5 }}>
                  This role includes:
                </MyText>
                <Flex gap={6} wrap="wrap">
                  {granted.length ? (
                    granted.map((key) => (
                      <Tag key={key} style={{ margin: 0 }}>
                        {key}
                      </Tag>
                    ))
                  ) : (
                    <MyText type="secondary" style={{ fontSize: 12.5 }}>
                      No permissions
                    </MyText>
                  )}
                </Flex>
              </Flex>
            );
          }}
        </MyForm.Item>

        <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
          <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
          <MyButtonPrimary
            htmlType="submit"
            icon={<UserAddOutlined />}
            loading={loading}
          >
            Create Account
          </MyButtonPrimary>
        </Flex>
      </MyForm>
    </MyModal>
  );
}
