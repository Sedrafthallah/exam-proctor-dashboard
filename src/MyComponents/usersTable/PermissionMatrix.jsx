import { theme, Tooltip, Flex, Avatar } from "antd";
import {
  AppstoreOutlined,
  CheckOutlined,
  LockOutlined,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { PERMISSIONS, getInitials } from "./adminsData";

function PermissionCell({ active, onToggle, token }) {
  return (
    <Flex justify="center">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        style={{
          width: 26,
          height: 26,
          padding: 0,
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          background: active ? token.colorSuccess : token.colorFillTertiary,
          color: active ? "#fff" : token.colorTextQuaternary,
          transition: "background 0.15s ease",
        }}
      >
        {active ? <CheckOutlined style={{ fontSize: 12 }} /> : "–"}
      </button>
    </Flex>
  );
}

export default function PermissionMatrix({ admins, onTogglePermission }) {
  const { token } = theme.useToken();

  const columns = [
    {
      title: "Admin Account",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 220,
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
            <MyText strong style={{ fontSize: 13.5 }}>
              {admin.name}
            </MyText>
            <MyText type="secondary" style={{ fontSize: 12 }}>
              {admin.jobTitle}
            </MyText>
          </Flex>
        </Flex>
      ),
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
          <PermissionCell
            active={!!admin.permissions[perm.key]}
            onToggle={() => onTogglePermission(admin.id, perm.key)}
            token={token}
          />
        );
      },
    })),
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
      />
    </MyCard>
  );
}
