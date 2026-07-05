import { theme, Flex, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useState } from "react";

import useAuthStore from "../../store/useAuthStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import PermissionMatrix from "../../MyComponents/usersTable/PermissionMatrix";
import PermissionReference from "../../MyComponents/usersTable/PermissionReference";
import NewAdminModal from "../../MyComponents/usersTable/NewAdminModal";

export default function Users() {
  const { token } = theme.useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const admins = useAuthStore((state) => state.users);
  const registerAdmin = useAuthStore((state) => state.registerAdmin);
  const toggleUserPermission = useAuthStore(
    (state) => state.toggleUserPermission,
  );

  const handleCreate = (values) => {
    const result = registerAdmin(values);

    if (result.success) {
      setIsModalOpen(false);
      message.success(
        `${values.name}'s account was created. They can now log in.`,
      );
    }

    return result;
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex vertical gap={4}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            Users Management
          </MyTitle>
          <MyText type="secondary">
            Admin accounts, roles and dynamic permissions.
          </MyText>
        </Flex>

        <Flex gap={10}>
          <MyButtonPrimary
            icon={<UserAddOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Admin
          </MyButtonPrimary>
        </Flex>
      </Flex>

      <PermissionMatrix
        admins={admins}
        onTogglePermission={toggleUserPermission}
      />
      <PermissionReference />

      <NewAdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </Flex>
  );
}
