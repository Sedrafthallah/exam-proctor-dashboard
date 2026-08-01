import { theme, Tag, Button, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { getBankStatus, getStatusConfig } from "../../utils/questionBankUtils";

export default function BanksList({ questionBanks, onSelectBank, canAuthor }) {
  const { token } = theme.useToken();
  const deleteBank = useQuestionBankStore((state) => state.deleteBank);

  const handleDelete = (bank) => {
    deleteBank(bank.code);
    message.success(`"${bank.code}" was deleted.`);
  };

  const columns = [
    {
      title: "Bank Code",
      dataIndex: "code",
      key: "code",
      render: (code) => (
        <MyText strong style={{ fontSize: 13.5, color: token.colorPrimary }}>
          {code}
        </MyText>
      ),
    },
    {
      title: "Course",
      key: "courseCode",
      width: 110,
      render: (_, bank) => <Tag style={{ margin: 0 }}>{bank.courseCode ?? bank.courseTag ?? "—"}</Tag>,
    },
    {
      title: "Questions",
      key: "questions",
      align: "center",
      width: 100,
      render: (_, bank) => (
        <MyText style={{ fontSize: 13 }}>{bank.questionCount ?? bank.questions?.length ?? 0}</MyText>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, bank) => {
        const { color, label } = getStatusConfig(getBankStatus(bank));
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
      title: "Actions",
      key: "actions",
      align: "center",
      width: 70,
      render: (_, bank) => {
        if (getBankStatus(bank) !== "DRAFT" || !canAuthor) return null;

        return (
          <Popconfirm
            title="Delete this question bank?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(bank)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <MyCard
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
        dataSource={questionBanks}
        rowKey="code"
        pagination={false}
        onRow={(bank) => ({
          onClick: () => onSelectBank(bank.id),
          style: { cursor: "pointer" },
        })}
        locale={{ emptyText: "No question banks yet — upload a CSV to create one" }}
      />
    </MyCard>
  );
}
