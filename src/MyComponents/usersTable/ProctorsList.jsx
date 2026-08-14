import { theme, Flex, Avatar, Tag } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getInitials } from "./adminsData";

export default function ProctorsList({ proctors, loading, pagination }) {
  const { token } = theme.useToken();

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
            <MyText strong style={{ fontSize: 13.5 }}>
              {proctor.full_name}
            </MyText>
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
      />
    </MyCard>
  );
}
