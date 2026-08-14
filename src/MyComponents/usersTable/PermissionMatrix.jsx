import { useState } from "react";
import { theme, Tooltip, Flex, Avatar, Switch, Popconfirm, Tag, Button, Drawer, Progress } from "antd";
import {
  AppstoreOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { PERMISSION_CATEGORIES, ALL_PERMISSION_KEYS, getInitials } from "./adminsData";

const ROLE_CONFIG = {
  SUPER_ADMIN: { color: "purple", label: "Super Admin" },
  ADMIN: { color: "blue", label: "Admin" },
  PROCTOR: { color: "green", label: "Proctor" },
};

function PermissionsDrawer({ admin, onClose }) {
  const { token } = theme.useToken();
  if (!admin) return null;

  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const granted = isSuperAdmin ? ALL_PERMISSION_KEYS : admin.permissions ?? [];
  const { color, label } = ROLE_CONFIG[admin.role] ?? { color: "default", label: admin.role };

  return (
    <Drawer
      open={!!admin}
      onClose={onClose}
      width={460}
      title={
        <Flex align="center" gap={10}>
          <Avatar size={36} style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 13 }}>
            {getInitials(admin.name)}
          </Avatar>
          <Flex vertical>
            <MyText strong style={{ fontSize: 14 }}>{admin.name}</MyText>
            <MyText type="secondary" style={{ fontSize: 12 }}>{admin.jobTitle}</MyText>
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap={20}>
        <Flex align="center" justify="space-between">
          <Tag color={color} style={{ margin: 0 }}>{label}</Tag>
          <MyText type="secondary" style={{ fontSize: 12 }}>
            {isSuperAdmin ? "Full access" : `${granted.length} / ${ALL_PERMISSION_KEYS.length} granted`}
          </MyText>
        </Flex>

        {isSuperAdmin ? (
          <Flex
            align="center"
            gap={10}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: token.colorSuccessBg,
              border: `1px solid ${token.colorSuccessBorder}`,
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 16, color: token.colorSuccess }} />
            <MyText style={{ fontSize: 12.5 }}>
              Super Admin always has every permission.
            </MyText>
          </Flex>
        ) : (
          <Progress
            percent={Math.round((granted.length / ALL_PERMISSION_KEYS.length) * 100)}
            showInfo={false}
            strokeColor={token.colorPrimary}
          />
        )}

        {PERMISSION_CATEGORIES.map((group) => (
          <Flex key={group.category} vertical gap={8}>
            <MyText
              type="secondary"
              style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}
            >
              {group.category}
            </MyText>
            <Flex wrap="wrap" gap={8}>
              {group.permissions.map((perm) => {
                const active = granted.includes(perm.key);
                return (
                  <Flex
                    key={perm.key}
                    align="center"
                    gap={6}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 500,
                      background: active ? token.colorSuccessBg : token.colorFillTertiary,
                      color: active ? token.colorSuccessTextActive : token.colorTextTertiary,
                      border: `1px solid ${active ? token.colorSuccessBorder : token.colorBorderSecondary}`,
                    }}
                  >
                    {active ? (
                      <CheckOutlined style={{ fontSize: 10 }} />
                    ) : (
                      <CloseOutlined style={{ fontSize: 10 }} />
                    )}
                    {perm.label}
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Drawer>
  );
}

export default function PermissionMatrix({
  admins,
  pagination,
  loading,
  onToggleStatus,
  onDeleteAdmin,
}) {
  const { token } = theme.useToken();
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleToggleStatus = async (adminId) => {
    setTogglingId(adminId);
    await onToggleStatus(adminId);
    setTogglingId(null);
  };

  const handleDeleteAdmin = async (adminId) => {
    setDeletingId(adminId);
    await onDeleteAdmin(adminId);
    setDeletingId(null);
  };

  const columns = [
    {
      title: "Admin Account",
      dataIndex: "name",
      key: "name",
      render: (_, admin) => (
        <Flex align="center" gap={10}>
          <Avatar
            size={36}
            style={{
              background: token.colorPrimary,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {getInitials(admin.name)}
          </Avatar>
          <Flex vertical>
            <Flex align="center" gap={6}>
              <MyText strong style={{ fontSize: 13.5 }}>
                {admin.name}
              </MyText>
              {admin.disabled && (
                <Tag color="default" style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 6px" }}>
                  Disabled
                </Tag>
              )}
            </Flex>
            <MyText type="secondary" style={{ fontSize: 12 }}>
              {admin.jobTitle}
            </MyText>
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const { color, label } = ROLE_CONFIG[role] ?? { color: "default", label: role };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_, admin) => {
        const isSuperAdmin = admin.role === "SUPER_ADMIN";
        const granted = isSuperAdmin ? ALL_PERMISSION_KEYS : admin.permissions ?? [];

        return (
          <Button
            type="default"
            size="small"
            icon={isSuperAdmin ? <LockOutlined /> : undefined}
            onClick={() => setSelectedAdmin(admin)}
            style={
              isSuperAdmin
                ? { color: token.colorSuccess, borderColor: token.colorSuccessBorder, background: token.colorSuccessBg }
                : undefined
            }
          >
            {isSuperAdmin ? "Full access" : `${granted.length} / ${ALL_PERMISSION_KEYS.length} permissions`}
          </Button>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, admin) => {
        if (admin.role === "SUPER_ADMIN") {
          return null;
        }

        return (
          <Flex align="center" gap={10}>
            <Popconfirm
              title={admin.disabled ? "Enable this account?" : "Disable this account?"}
              description={
                admin.disabled
                  ? "The admin will be able to log in again."
                  : "This immediately blocks them from logging in."
              }
              okText={admin.disabled ? "Enable" : "Disable"}
              okButtonProps={{ danger: !admin.disabled, loading: togglingId === admin.id }}
              onConfirm={() => handleToggleStatus(admin.id)}
            >
              <Tooltip title={admin.disabled ? "Enable account" : "Disable account"}>
                <Switch size="small" checked={!admin.disabled} loading={togglingId === admin.id} />
              </Tooltip>
            </Popconfirm>

            <Popconfirm
              title="Delete this admin account?"
              description="This permanently removes their login and permissions."
              okText="Delete"
              okButtonProps={{ danger: true, loading: deletingId === admin.id }}
              onConfirm={() => handleDeleteAdmin(admin.id)}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deletingId === admin.id}
              />
            </Popconfirm>
          </Flex>
        );
      },
    },
  ];

  return (
    <MyCard
      title={
        <Flex align="center" gap={8} wrap="wrap">
          <AppstoreOutlined
            style={{ fontSize: 16, color: token.colorPrimary }}
          />
          <MyText strong>Permission Matrix</MyText>
        </Flex>
      }
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <MyTable
        columns={columns}
        dataSource={admins}
        rowKey="id"
        pagination={pagination ?? false}
        loading={loading}
        onRow={(admin) => ({
          style: admin.disabled ? { opacity: 0.6 } : undefined,
        })}
      />

      <PermissionsDrawer admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />
    </MyCard>
  );
}
