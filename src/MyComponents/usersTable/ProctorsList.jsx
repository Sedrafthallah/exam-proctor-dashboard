import { useState } from "react";
import { theme, Flex, Avatar, Tag, Switch, Popconfirm, Button, Tooltip } from "antd";
import { TeamOutlined, DeleteOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getInitials } from "./adminsData";

export default function ProctorsList({ proctors, loading, pagination, onToggleStatus, onDeleteProctor }) {
  const { token } = theme.useToken();
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleToggleStatus = async (proctorId) => {
    setTogglingId(proctorId);
    await onToggleStatus(proctorId);
    setTogglingId(null);
  };

  const handleDeleteProctor = async (proctorId) => {
    setDeletingId(proctorId);
    await onDeleteProctor(proctorId);
    setDeletingId(null);
  };

  const columns = [
    {
      title: "Proctor",
      dataIndex: "full_name",
      key: "full_name",
      render: (_, proctor) => (
        <Flex align="center" gap={10}>
          <Avatar
            size={36}
            style={{
              background: token.colorPrimary,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {getInitials(proctor.full_name)}
          </Avatar>
          <Flex vertical>
            <Flex align="center" gap={6}>
              <MyText strong style={{ fontSize: 13.5 }}>
                {proctor.full_name}
              </MyText>
              {proctor.disabled && (
                <Tag color="default" style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 6px" }}>
                  Disabled
                </Tag>
              )}
            </Flex>
            <MyText type="secondary" style={{ fontSize: 12 }}>
              {proctor.email}
            </MyText>
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Assigned Sessions",
      dataIndex: "assignedSessionsCount",
      key: "assignedSessionsCount",
      render: (count) => <Tag style={{ margin: 0 }}>{count ?? 0}</Tag>,
    },
    {
      title: "Active Sessions",
      dataIndex: "activeSessionsCount",
      key: "activeSessionsCount",
      render: (count) => (
        <Tag color={count > 0 ? "processing" : "default"} style={{ margin: 0 }}>
          {count ?? 0}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, proctor) => (
        <Flex align="center" gap={10}>
          <Popconfirm
            title={proctor.disabled ? "Enable this account?" : "Disable this account?"}
            description={
              proctor.disabled
                ? "The proctor will be able to log in again."
                : "This immediately blocks them from logging in."
            }
            okText={proctor.disabled ? "Enable" : "Disable"}
            okButtonProps={{ danger: !proctor.disabled, loading: togglingId === proctor.proctorId }}
            onConfirm={() => handleToggleStatus(proctor.proctorId)}
          >
            <Tooltip title={proctor.disabled ? "Enable account" : "Disable account"}>
              <Switch size="small" checked={!proctor.disabled} loading={togglingId === proctor.proctorId} />
            </Tooltip>
          </Popconfirm>

          <Popconfirm
            title="Delete this proctor account?"
            description="This permanently removes their login and permissions."
            okText="Delete"
            okButtonProps={{ danger: true, loading: deletingId === proctor.proctorId }}
            onConfirm={() => handleDeleteProctor(proctor.proctorId)}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deletingId === proctor.proctorId}
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
        rowKey="proctorId"
        pagination={pagination ?? false}
        loading={loading}
        locale={{ emptyText: "No proctor accounts yet" }}
        onRow={(proctor) => ({
          style: proctor.disabled ? { opacity: 0.6 } : undefined,
        })}
      />
    </MyCard>
  );
}
