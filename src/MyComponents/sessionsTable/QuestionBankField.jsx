import { useState } from "react";
import { Select, Segmented, Upload, Flex, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import MyForm from "../myForm/MyForm";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { parseQuestionsCSV } from "../../utils/csvUtils";

export default function QuestionBankField({ form, disabled }) {
  const [mode, setMode] = useState("select");
  const questionBanks = useQuestionBankStore((state) => state.questionBanks);
  const createBankFromCsv = useQuestionBankStore(
    (state) => state.createBankFromCsv,
  );

  const bankOptions = questionBanks.map((bank) => ({
    value: bank.id,
    label: `${bank.title} (${bank.courseTag}) — ${bank.questionCount} Q`,
  }));

  const handleUpload = async (file) => {
    try {
      const text = await file.text();
      const questions = parseQuestionsCSV(text);

      if (questions.length === 0) {
        message.error("No valid rows found — expected a 'question' column.");
        return false;
      }

      const bank = createBankFromCsv(
        questions.map((q) => ({
          type: q.type,
          text: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer || null,
          marks: q.marks,
        })),
        {
          title: file.name.replace(/\.csv$/i, ""),
          courseCode: form.getFieldValue("courseCode"),
        },
      );

      form.setFieldValue("questionBank", bank.id);
      message.success(
        `Created "${bank.code}" with ${questions.length} questions.`,
      );
    } catch {
      message.error("Couldn't read that file. Please upload a valid CSV.");
    }

    return false; // prevent antd's default auto-upload
  };

  if (disabled) {
    return (
      <MyForm.Item name="questionBank" label="Question bank">
        <Select
          allowClear
          placeholder="No question bank"
          options={bankOptions}
          disabled
        />
      </MyForm.Item>
    );
  }

  return (
    <>
      <Segmented
        value={mode}
        onChange={setMode}
        block
        style={{ marginBottom: 12 }}
        options={[
          { label: "Select existing", value: "select" },
          { label: "Upload CSV", value: "csv" },
        ]}
      />

      <MyForm.Item
        name="questionBank"
        label="Question bank"
        hidden={mode !== "select"}
      >
        <Select
          allowClear
          placeholder="Select a question bank"
          options={bankOptions}
          optionFilterProp="label"
        />
      </MyForm.Item>

      {mode === "csv" && (
        <Flex vertical gap={8} style={{ marginBottom: 16 }}>
          <Upload
            accept=".csv"
            showUploadList={false}
            beforeUpload={handleUpload}
          >
            <MyButtonSecondary icon={<UploadOutlined />} block>
              Upload questions CSV
            </MyButtonSecondary>
          </Upload>
          <MyForm.Item shouldUpdate noStyle>
            {() => {
              const id = form.getFieldValue("questionBank");
              const bank = questionBanks.find((b) => b.id === id);
              return (
                <MyText type="secondary" style={{ fontSize: 12 }}>
                  {bank
                    ? `Using "${bank.code}" — ${bank.questionCount ?? bank.questions?.length ?? 0} questions.`
                    : "Creates a new question bank from the file."}
                </MyText>
              );
            }}
          </MyForm.Item>
        </Flex>
      )}
    </>
  );
}
