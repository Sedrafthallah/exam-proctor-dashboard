import { theme, Flex, Tag, Avatar } from "antd";
import {
  FileSearchOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  FlagFilled,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getInitials } from "../usersTable/adminsData";

const SUBMISSION_CONFIG = {
  SUBMITTED: { color: "success", label: "SUBMITTED" },
  "AUTO-SUB": { color: "blue", label: "AUTO-SUB" },
  TERMINATED: { color: "error", label: "TERMINATED" },
};

export default function ResponseViewerTable({ responses }) {
  const { token } = theme.useToken();

  const columns = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name, record) => (
        <Flex align="center" gap={10}>
          <Avatar size={32} style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 12 }}>
            {getInitials(name)}
          </Avatar>
          <Flex vertical gap={0}>
            <MyText strong style={{ fontSize: 13.5 }}>
              {name}
            </MyText>
            <MyText type="secondary" style={{ fontSize: 12 }}>
              {record.id}
            </MyText>
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Submission",
      dataIndex: "submission",
      key: "submission",
      width: 120,
      render: (value) => {
        const { color, label } = SUBMISSION_CONFIG[value] ?? { color: "default", label: value };
        return (
          <Tag
            color={color}
            style={{ borderRadius: 5, padding: "1px 8px", fontSize: 11, fontWeight: 600, margin: 0 }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Identity",
      dataIndex: "identityMatch",
      key: "identityMatch",
      width: 110,
      render: (match) =>
        match == null ? (
          <Flex align="center" gap={6}>
            <ExclamationCircleFilled style={{ color: token.colorWarning, fontSize: 13 }} />
            <MyText style={{ fontSize: 13 }}>manual</MyText>
          </Flex>
        ) : (
          <Flex align="center" gap={6}>
            <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 13 }} />
            <MyText style={{ fontSize: 13 }}>{match}%</MyText>
          </Flex>
        ),
    },
    {
      title: "Auto Score",
      key: "autoScore",
      width: 110,
      render: (_, record) => (
        <MyText strong style={{ fontSize: 13.5 }}>
          {record.autoScore} <MyText type="secondary" style={{ fontSize: 12.5, fontWeight: 400 }}>/ {record.maxScore}</MyText>
        </MyText>
      ),
    },
    {
      title: "Violations",
      dataIndex: "violations",
      key: "violations",
      width: 100,
      align: "center",
      render: (count) =>
        count > 0 ? (
          <Flex align="center" justify="center" gap={4}>
            <FlagFilled style={{ color: token.colorError, fontSize: 12 }} />
            <MyText style={{ fontSize: 13, color: token.colorError }}>{count}</MyText>
          </Flex>
        ) : (
          <MyText type="secondary">—</MyText>
        ),
    },
  ];

  return (
    <MyCard
      title={
        <Flex align="center" gap={10} wrap="wrap">
          <FileSearchOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
          <MyText strong>Response Viewer</MyText>
          <Tag style={{ borderRadius: 5, margin: 0, fontSize: 11 }}>read-only</Tag>
          <MyText type="secondary" style={{ fontSize: 12.5 }}>
            {responses.length} submissions
          </MyText>
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
        dataSource={responses}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No submissions for this session" }}
      />
    </MyCard>
  );
}
