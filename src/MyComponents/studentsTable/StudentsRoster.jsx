import { useState } from "react";
import { theme, Flex, Input, Avatar } from "antd";
import { TeamOutlined, SearchOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getInitials } from "../usersTable/adminsData";

export default function StudentsRoster({ students, loading }) {
  const { token } = theme.useToken();
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    if (!normalizedSearch) return true;
    return (
      student.name.toLowerCase().includes(normalizedSearch) ||
      student.id.toLowerCase().includes(normalizedSearch)
    );
  });

  const columns = [
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      width: 150,
      render: (userName, student) => (
        <Flex align="center" gap={10}>
          <Avatar size={32} style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 12 }}>
            {getInitials(student.name)}
          </Avatar>
          <MyText strong style={{ fontSize: 13.5 }}>
            {userName}
          </MyText>
        </Flex>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name) => <MyText style={{ fontSize: 13 }}>{name}</MyText>,
    },
    {
      title: "Middle Name",
      dataIndex: "middleName",
      key: "middleName",
      width: 140,
      render: (middleName) => <MyText style={{ fontSize: 13 }}>{middleName}</MyText>,
    },
    {
      title: "University Number",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (id) => <MyText style={{ fontSize: 13 }}>{id}</MyText>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (email) => (
        <MyText type="secondary" style={{ fontSize: 13 }}>
          {email}
        </MyText>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
      render: (phoneNumber) => (
        <MyText type="secondary" style={{ fontSize: 13 }}>
          {phoneNumber}
        </MyText>
      ),
    },
  ];

  return (
    <MyCard
      title={
        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
          <Flex align="center" gap={8}>
            <TeamOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
            <MyText strong>Roster</MyText>
          </Flex>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            placeholder="Search by name or ID..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        dataSource={filteredStudents}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: "No students match your search" }}
      />
    </MyCard>
  );
}
