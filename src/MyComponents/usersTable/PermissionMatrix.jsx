import { theme, Tooltip, Flex, Avatar, Switch, Popconfirm, Tag, Button } from "antd";
import {
  AppstoreOutlined,
  CheckOutlined,
  LockOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { PERMISSIONS, getInitials } from "./adminsData";

function PermissionCell({ active, token }) {
  return (
    <Flex justify="center">
      <Flex
        justify="center"
        align="center"
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          background: active ? token.colorSuccess : token.colorFillTertiary,
          color: active ? "#fff" : token.colorTextQuaternary,
        }}
      >
        {active ? <CheckOutlined style={{ fontSize: 12 }} /> : "–"}
      </Flex>
    </Flex>
  );
}

export default function PermissionMatrix({
  admins,
  onToggleStatus,
  onDeleteAdmin,
  onEditAdmin,
}) {
  const { token } = theme.useToken();

  const columns = [
    {
      title: "Admin Account",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 240,
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
        const config = {
          SUPER_ADMIN: { color: "purple", label: "Super Admin" },
          ADMIN: { color: "blue", label: "Admin" },
          PROCTOR: { color: "green", label: "Proctor" },
        };
        const { color, label } = config[role] ?? { color: "default", label: role };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    ...PERMISSIONS.map((perm) => ({
      title: (
        <Tooltip title={perm.title}>
          <span>{perm.code}</span>
        </Tooltip>
      ),
      dataIndex: perm.key,
      key: perm.key,
      align: "center",
      width: 90,
      render: (_, admin) => {
        const isSuperAdmin = admin.role === "SUPER_ADMIN";
        return isSuperAdmin ? (
          <Tooltip title="Super Admin always has full access">
            <Flex justify="center">
              <Flex
                justify="center"
                align="center"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: token.colorSuccess,
                  color: "#fff",
                }}
              >
                <LockOutlined style={{ fontSize: 11 }} />
              </Flex>
            </Flex>
          </Tooltip>
        ) : (
          <PermissionCell active={!!admin.permissions[perm.key]} token={token} />
        );
      },
    })),
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 160,
      render: (_, admin) => {
        if (admin.role === "SUPER_ADMIN") {
          return (
            <Tooltip title="Edit account">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditAdmin(admin.id)}
              />
            </Tooltip>
          );
        }

        return (
          <Flex align="center" gap={10}>
            <Tooltip title="Edit account">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditAdmin(admin.id)}
              />
            </Tooltip>

            <Tooltip title={admin.disabled ? "Enable account" : "Disable account"}>
              <Switch
                size="small"
                checked={!admin.disabled}
                onChange={() => onToggleStatus(admin.id)}
              />
            </Tooltip>

            <Popconfirm
              title="Delete this admin account?"
              description="This permanently removes their login and permissions."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDeleteAdmin(admin.id)}
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
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
        pagination={false}
        onRow={(admin) => ({
          style: admin.disabled ? { opacity: 0.6 } : undefined,
        })}
      />
    </MyCard>
  );
}
