import { useState } from "react";
import { Select, Segmented, Upload, Flex, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import MyForm from "../myForm/MyForm";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useQuestionBankStore from "../../store/useQuestionBankStore";

export default function QuestionBankField({ form, disabled }) {
  const [mode, setMode] = useState("select");
  const questionBanks = useQuestionBankStore((state) => state.questionBanks);
  const uploadQuestionBankApi = useQuestionBankStore(
    (state) => state.uploadQuestionBankApi,
  );

  const bankOptions = questionBanks.map((bank) => ({
    value: bank.id,
    label: `${bank.title} (${bank.courseTag}) — ${bank.questionCount} Q`,
  }));

  const handleUpload = async (file) => {
    const courseCode = form.getFieldValue("courseCode") || "UNKNOWN";
    const title = file.name.replace(/\.csv$/i, "");

    const success = await uploadQuestionBankApi(file, {
      title,
      courseCode,
      version: "1.0",
    });

    if (success) {
      const banks = useQuestionBankStore.getState().questionBanks;
      const newBank = banks[0]; // fetchQuestionBanks refreshes and prepends
      if (newBank) {
        form.setFieldValue("questionBank", newBank.id);
        message.success(
          `Created "${newBank.title}" with ${newBank.questionCount} questions.`,
        );
      }
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
