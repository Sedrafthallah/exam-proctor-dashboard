import { theme, Tag } from "antd";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import { getQuestionTypeConfig } from "../../utils/questionBankUtils";

// Read-only — questions only ever enter a bank via CSV import, so there's
// nothing to edit or delete here.
export default function QuestionsPanel({ bank }) {
  const { token } = theme.useToken();

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 90 },
    {
      title: "Type",
      key: "type",
      width: 140,
      render: (_, q) => {
        const typeConfig = getQuestionTypeConfig(q.type);
        return (
          <Tag color={typeConfig.color} style={{ margin: 0, fontSize: 11 }}>
            {q.type}
          </Tag>
        );
      },
    },
    {
      title: "Question Text",
      dataIndex: "text",
      key: "text",
      render: (text) => <MyText style={{ fontSize: 13 }}>{text}</MyText>,
    },
    {
      title: "Grading",
      key: "grading",
      width: 90,
      render: (_, q) => (
        <MyText type="secondary" style={{ fontSize: 12 }}>
          {getQuestionTypeConfig(q.type).autoGraded ? "Auto" : "Manual"}
        </MyText>
      ),
    },
    { title: "Marks", dataIndex: "marks", key: "marks", align: "center", width: 70 },
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
        dataSource={bank.questions}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No questions yet — import a CSV to add some" }}
      />
    </MyCard>
  );
}
