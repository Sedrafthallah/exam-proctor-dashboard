import { useState } from "react";
import { Input, Upload, Flex, message } from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import { parseQuestionsCSV } from "../../utils/csvUtils";
import { validateQuestionRows } from "../../utils/questionBankUtils";

// Quick-create path: pick a CSV, name the bank, done. Which session (if any)
// uses this bank is decided later from the session's own question bank field.
export default function UploadBankModal({ open, onClose, onUpload, uploading }) {
  const [form] = MyForm.useForm();
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const reset = () => {
    form.resetFields();
    setFileName("");
    setParsedRows(null);
    setSelectedFile(null);
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleUpload = async (file) => {
    try {
      const text = await file.text();
      const parsed = parseQuestionsCSV(text);

      if (parsed.length === 0) {
        message.error("No valid rows found — expected a 'question' column.");
        return false;
      }

      setFileName(file.name);
      setParsedRows(validateQuestionRows(parsed, []));
      setSelectedFile(file);
      form.setFieldValue("title", file.name.replace(/\.csv$/i, "").replace(/[_-]+/g, " "));
    } catch {
      message.error("Couldn't read that file. Please upload a valid CSV.");
    }

    return false; // prevent antd's default auto-upload
  };

  const validRows = (parsedRows || []).filter((r) => r.status === "valid");
  const flaggedCount = (parsedRows || []).length - validRows.length;

  const handleFinish = async () => {
    const success = await onUpload(selectedFile);
    if (success) reset();
  };

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <UploadOutlined />
          <MyText strong>Upload Question Bank File</MyText>
        </Flex>
      }
    >
      <MyText type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Pick a CSV to create a new draft bank from it. Link it to a session later from that
        session's question bank field.
      </MyText>

      <Upload accept=".csv" showUploadList={false} beforeUpload={handleUpload}>
        <MyButtonSecondary icon={<UploadOutlined />}>Choose CSV file</MyButtonSecondary>
      </Upload>

      {!parsedRows && (
        <Flex justify="end" style={{ marginTop: 20 }}>
          <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
        </Flex>
      )}

      {parsedRows && (
        <MyForm form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
          <Flex align="center" gap={6} style={{ marginBottom: 12 }}>
            <FileTextOutlined style={{ fontSize: 12 }} />
            <MyText type="secondary" style={{ fontSize: 12.5 }}>
              {fileName} · {validRows.length} valid
              {flaggedCount > 0 ? `, ${flaggedCount} flagged (will be skipped)` : ""}
            </MyText>
          </Flex>

          <MyForm.Item
            name="title"
            label="Bank name"
            extra="e.g. the course code, or course + exam — whatever helps you recognize which session it's for."
            rules={[{ required: true, message: "Please enter a bank name" }]}
          >
            <Input placeholder="e.g. CS301 — Midterm 2026" />
          </MyForm.Item>

          <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
            <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
            <MyButtonPrimary
              htmlType="submit"
              icon={<UploadOutlined />}
              disabled={validRows.length === 0}
              loading={uploading}
            >
              Create &amp; Import
            </MyButtonPrimary>
          </Flex>
        </MyForm>
      )}
    </MyModal>
  );
}
