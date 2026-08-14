import { theme, Flex, message } from "antd";
import { UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import useAuthStore from "../../store/useAuthStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import PermissionMatrix from "../../MyComponents/usersTable/PermissionMatrix";
import ProctorsList from "../../MyComponents/usersTable/ProctorsList";
import PermissionReference from "../../MyComponents/usersTable/PermissionReference";
import NewAdminModal from "../../MyComponents/usersTable/NewAdminModal";

export default function Users() {
  const { token } = theme.useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const admins = useAuthStore((state) => state.users);
  const loading = useAuthStore((state) => state.loading);
  const page = useAuthStore((state) => state.page);
  const pageSize = useAuthStore((state) => state.pageSize);
  const total = useAuthStore((state) => state.total);
  const fetchAdmins = useAuthStore((state) => state.fetchAdmins);
  const deactivateAdminApi = useAuthStore((state) => state.deactivateAdminApi);

  const reactivateAdminApi = useAuthStore((state) => state.reactivateAdminApi);
  const deleteAdminApi = useAuthStore((state) => state.deleteAdminApi);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = () => {
    fetchAdmins(); // ← بيجيب القائمة الحديثة من الـ API
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return;

    if (admin.disabled) {
      if (await reactivateAdminApi(adminId)) {
        message.success(`${admin.name}'s account was enabled.`);
      }
    } else {
      if (await deactivateAdminApi(adminId)) {
        message.success(`${admin.name}'s account was disabled.`);
      }
    }
  };
  const handleDeleteAdmin = async (adminId) => {
    const admin = admins.find((a) => a.id === adminId);

    const success = await deleteAdminApi(adminId);

    if (success) {
      message.success(`${admin?.name}'s account was deleted.`);
    }
  };

  const adminAccounts = admins.filter((a) => a.role !== "PROCTOR");
  const proctorAccounts = admins.filter((a) => a.role === "PROCTOR");

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              boxShadow: `0 6px 16px -6px ${token.colorPrimary}`,
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Users Management
            </MyTitle>
            <MyText type="secondary">
              Admin accounts, roles and dynamic permissions.
            </MyText>
          </Flex>
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
        admins={adminAccounts}
        loading={loading}
        onToggleStatus={handleToggleStatus}
        onDeleteAdmin={handleDeleteAdmin}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (newPage, newPageSize) => fetchAdmins(newPage, newPageSize),
          showSizeChanger: true,
        }}
      />

      <ProctorsList
        proctors={proctorAccounts}
        loading={loading}
        onToggleStatus={handleToggleStatus}
        onDeleteAdmin={handleDeleteAdmin}
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
