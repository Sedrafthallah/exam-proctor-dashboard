import { Input, Checkbox, Flex } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import { PERMISSIONS } from "./adminsData";

export default function NewAdminModal({ open, onClose, onCreate }) {
  const [form] = MyForm.useForm();

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values) => {
    const permissions = Object.fromEntries(
      (values.permissions || []).map((key) => [key, true]),
    );

    const result = onCreate({
      name: values.name,
      email: values.email,
      password: values.password,
      permissions,
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

        <MyForm.Item name="permissions" label="Permissions" initialValue={[]}>
          <Checkbox.Group style={{ width: "100%" }}>
            <MyRow gutter={[8, 10]}>
              {PERMISSIONS.map((perm) => (
                <MyCol key={perm.key} xs={24} sm={12}>
                  <Checkbox value={perm.key}>
                    <MyText style={{ fontSize: 12.5 }}>
                      <MyText strong style={{ fontSize: 12.5 }}>
                        {perm.code}
                      </MyText>{" "}
                      — {perm.title}
                    </MyText>
                  </Checkbox>
                </MyCol>
              ))}
            </MyRow>
          </Checkbox.Group>
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
