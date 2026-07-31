import { theme, Flex, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import useAuthStore from "../../store/useAuthStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import PermissionMatrix from "../../MyComponents/usersTable/PermissionMatrix";
import PermissionReference from "../../MyComponents/usersTable/PermissionReference";
import NewAdminModal from "../../MyComponents/usersTable/NewAdminModal";
import EditAdminModal from "../../MyComponents/usersTable/EditAdminModal";
import { getSessionStatus } from "../../utils/sessionUtils";
import { INITIAL_SESSIONS } from "../../store/useSessionStore";

export default function Users() {
  const { token } = theme.useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);

  const admins = useAuthStore((state) => state.users);
  const fetchAdmins = useAuthStore((state) => state.fetchAdmins);
  const updateAdmin = useAuthStore((state) => state.updateAdmin);
  const toggleUserStatus = useAuthStore((state) => state.toggleUserStatus);
  const deleteAdmin = useAuthStore((state) => state.deleteAdmin);

  const editingAdmin = admins.find((a) => a.id === editingAdminId) || null;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = () => {
    fetchAdmins(); // ← بيجيب القائمة الحديثة من الـ API
    setIsModalOpen(false);
  };

  const handleSaveEdit = (adminId, values) => {
    const result = updateAdmin(adminId, values);

    if (result.success) {
      setEditingAdminId(null);
      message.success(`${values.name}'s account was updated.`);
    }

    return result;
  };

  const handleToggleStatus = (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    toggleUserStatus(adminId);
    message.success(
      admin?.disabled
        ? `${admin.name}'s account was enabled.`
        : `${admin?.name}'s account was disabled.`,
    );
  };

  const handleDeleteAdmin = (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    deleteAdmin(adminId);
    message.success(`${admin?.name}'s account was deleted.`);
  };

  INITIAL_SESSIONS.forEach((s) => {
    console.log(s.sessionTitle, "→", getSessionStatus(s));
  });
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
        onToggleStatus={handleToggleStatus}
        onDeleteAdmin={handleDeleteAdmin}
        onEditAdmin={setEditingAdminId}
      />
      <PermissionReference />

      <NewAdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />

      <EditAdminModal
        open={!!editingAdmin}
        admin={editingAdmin}
        onClose={() => setEditingAdminId(null)}
        onSave={handleSaveEdit}
      />
    </Flex>
  );
}
