import { useState } from "react";
import { theme, Flex, Input, Tag, Avatar } from "antd";
import {
  TeamOutlined,
  SearchOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getInitials } from "../usersTable/adminsData";

const STATUS_CONFIG = {
  REGISTERED: { color: "success", label: "Registered" },
  NO_PHOTO: { color: "error", label: "No Photo" },
};

function IdPhotoIndicator({ status, token }) {
  if (status === "NO_PHOTO") {
    return <CloseCircleFilled style={{ color: token.colorError, fontSize: 16 }} />;
  }
  return <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 16 }} />;
}

export default function StudentsRoster({ students }) {
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
      title: "Student",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name) => (
        <Flex align="center" gap={10}>
          <Avatar size={32} style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 12 }}>
            {getInitials(name)}
          </Avatar>
          <MyText strong style={{ fontSize: 13.5 }}>
            {name}
          </MyText>
        </Flex>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 140,
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const { color, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.NO_PHOTO;
        return (
          <Tag
            color={color}
            style={{
              borderRadius: 5,
              padding: "1px 8px",
              fontSize: 11,
              fontWeight: 600,
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "ID Photo",
      key: "idPhoto",
      align: "center",
      width: 90,
      render: (_, student) => (
        <Flex justify="center">
          <IdPhotoIndicator status={student.status} token={token} />
        </Flex>
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
        pagination={false}
        locale={{ emptyText: "No students match your search" }}
      />
    </MyCard>
  );
}
