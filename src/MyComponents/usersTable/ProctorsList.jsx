import { useState } from "react";
import { theme, Tooltip, Flex, Avatar, Switch, Popconfirm, Tag, Button } from "antd";
import { TeamOutlined, DeleteOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getInitials, getPermissionLabel } from "./adminsData";

export default function ProctorsList({
  proctors,
  loading,
  onToggleStatus,
  onDeleteAdmin,
}) {
  const { token } = theme.useToken();
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
      title: "Proctor",
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
              {admin.email}
            </MyText>
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_, admin) => (
        <Flex wrap="wrap" gap={6}>
          {(admin.permissions ?? []).length === 0 ? (
            <MyText type="secondary" style={{ fontSize: 12 }}>
              None granted
            </MyText>
          ) : (
            admin.permissions.map((key) => (
              <Tag key={key} style={{ margin: 0, fontSize: 11 }}>
                {getPermissionLabel(key)}
              </Tag>
            ))
          )}
        </Flex>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_, admin) => (
        <Flex align="center" gap={10}>
          <Popconfirm
            title={admin.disabled ? "Enable this account?" : "Disable this account?"}
            description={
              admin.disabled
                ? "The proctor will be able to log in again."
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
            title="Delete this proctor account?"
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
      ),
    },
  ];

  return (
    <MyCard
      title={
        <Flex align="center" gap={8} wrap="wrap">
          <TeamOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
          <MyText strong>Proctors</MyText>
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
        dataSource={proctors}
        rowKey="id"
        pagination={false}
        loading={loading}
        onRow={(admin) => ({
          style: admin.disabled ? { opacity: 0.6 } : undefined,
        })}
        locale={{ emptyText: "No proctor accounts yet" }}
      />
    </MyCard>
  );
}
