import { theme, Tag } from "antd";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";

const TYPE_LABELS = {
  MultipleChoice: "MCQ",
  TrueFalse: "True/False",
  ShortAnswer: "Short Answer",
  Essay: "Essay",
};

// Only MCQ/True-False are auto-graded — Short Answer/Essay have no manual
// grading path in this system, so their correct answer is never shown.
const GRADED_TYPES = ["MultipleChoice", "TrueFalse"];

const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD", "optionE"];

// Read-only — questions only ever enter a bank via CSV import, so there's
// nothing to edit or delete here.
export default function QuestionsPanel({ bank, loading }) {
  const { token } = theme.useToken();

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 90 },
    {
      title: "Type",
      key: "type",
      width: 120,
      render: (_, q) => (
        <Tag style={{ margin: 0, fontSize: 11 }}>{TYPE_LABELS[q.type] ?? q.type}</Tag>
      ),
    },
    {
      title: "Question Text",
      dataIndex: "questionText",
      key: "questionText",
      render: (text) => <MyText style={{ fontSize: 13 }}>{text}</MyText>,
    },
    {
      title: "Options",
      key: "options",
      render: (_, q) => {
        const options = OPTION_KEYS.map((key) => q[key]).filter(Boolean);
        return options.length > 0 ? (
          <MyText style={{ fontSize: 12.5 }}>{options.join(" · ")}</MyText>
        ) : (
          <MyText type="secondary" style={{ fontSize: 12 }}>—</MyText>
        );
      },
    },
    {
      title: "Correct Answer",
      key: "correctAnswer",
      width: 140,
      render: (_, q) =>
        GRADED_TYPES.includes(q.type) ? (
          <MyText style={{ fontSize: 13 }}>{q.correctAnswer}</MyText>
        ) : (
          <MyText type="secondary" style={{ fontSize: 12 }}>—</MyText>
        ),
    },
    {
      title: "Grading",
      key: "grading",
      width: 90,
      render: (_, q) => (
        <MyText type="secondary" style={{ fontSize: 12 }}>
          {GRADED_TYPES.includes(q.type) ? "Auto" : "Manual"}
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
        dataSource={bank?.questions ?? []}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: "No questions yet — import a CSV to add some" }}
      />
    </MyCard>
  );
}
