import { useEffect } from "react";
import { Input, Checkbox, Flex } from "antd";
import { EditOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import { PERMISSION_CATEGORIES } from "./adminsData";

export default function EditAdminModal({ open, admin, onClose, onSave }) {
  const [form] = MyForm.useForm();
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (open && admin) {
      form.setFieldsValue({
        name: admin.name,
        email: admin.email,
        password: "",
        permissions: admin.permissions || [],
      });
    }
  }, [open, admin, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values) => {
    const permissions = values.permissions || [];

    const result = await onSave(admin.id, {
      name: values.name,
      email: values.email,
      ...(values.password ? { password: values.password } : {}),
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
          <EditOutlined />
          <MyText strong>Edit Admin Account</MyText>
        </Flex>
      }
    >
      <MyText type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Leave the password blank to keep the current one.
      </MyText>

      <MyForm form={form} layout="vertical" onFinish={handleFinish}>
        <MyForm.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter the admin's full name" }]}
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
          label="New Password"
          rules={[{ min: 6, message: "Password must be at least 6 characters" }]}
        >
          <Input.Password placeholder="Leave blank to keep current password" />
        </MyForm.Item>

        <MyForm.Item name="permissions" label="Permissions" initialValue={[]}>
          <Checkbox.Group style={{ width: "100%" }} disabled={isSuperAdmin}>
            <Flex vertical gap={14}>
              {PERMISSION_CATEGORIES.map((group) => (
                <Flex key={group.category} vertical gap={6}>
                  <MyText type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                    {group.category}
                  </MyText>
                  <MyRow gutter={[8, 10]}>
                    {group.permissions.map((perm) => (
                      <MyCol key={perm.key} xs={24} sm={12}>
                        <Checkbox value={perm.key}>
                          <MyText style={{ fontSize: 12.5 }}>{perm.label}</MyText>
                        </Checkbox>
                      </MyCol>
                    ))}
                  </MyRow>
                </Flex>
              ))}
            </Flex>
          </Checkbox.Group>
        </MyForm.Item>
        {isSuperAdmin && (
          <MyText type="secondary" style={{ fontSize: 12 }}>
            Super Admin always has full access — permissions can't be changed.
          </MyText>
        )}

        <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
          <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
          <MyButtonPrimary htmlType="submit" icon={<EditOutlined />}>
            Save Changes
          </MyButtonPrimary>
        </Flex>
      </MyForm>
    </MyModal>
  );
}
