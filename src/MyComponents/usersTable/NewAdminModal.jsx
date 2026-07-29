import { Input, Select, Flex, Tag } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useRolesStore from "../../store/useRolesStore";

export default function NewAdminModal({ open, onClose, onCreate }) {
  const [form] = MyForm.useForm();
  const roles = useRolesStore((state) => state.roles);
  const assignableRoles = roles.filter((role) => !role.isFixed);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values) => {
    const role = assignableRoles.find((r) => r.id === values.role);

    const result = onCreate({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
      permissions: role?.permissions || {},
    });

    if (result?.success) {
      form.resetFields();
    } else if (result?.error) {
      form.setFields([{ name: "email", errors: [result.error] }]);
    }
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
          name="password"
          label="Temporary Password"
          rules={[
            { required: true, message: "Please set a temporary password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password placeholder="Set a temporary password" />
        </MyForm.Item>

        <MyForm.Item
          name="role"
          label="Role"
          initialValue={assignableRoles[0]?.id}
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select
            options={assignableRoles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
          />
        </MyForm.Item>

        <MyForm.Item shouldUpdate noStyle>
          {() => {
            const role = assignableRoles.find(
              (r) => r.id === form.getFieldValue("role"),
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
          <MyButtonPrimary htmlType="submit" icon={<UserAddOutlined />}>
            Create Account
          </MyButtonPrimary>
        </Flex>
      </MyForm>
    </MyModal>
  );
}
