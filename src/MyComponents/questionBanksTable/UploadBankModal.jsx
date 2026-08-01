import { useState } from "react";
import { Input, Upload, Flex } from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";

export default function UploadBankModal({ open, onClose, onUpload, uploading }) {
  const [form] = MyForm.useForm();
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const reset = () => {
    form.resetFields();
    setFileName("");
    setSelectedFile(null);
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleBeforeUpload = (file) => {
    setFileName(file.name);
    setSelectedFile(file);
    form.setFieldValue("title", file.name.replace(/\.csv$/i, "").replace(/[_-]+/g, " "));
    return false; // prevent antd's default auto-upload
  };

  const handleFinish = async (values) => {
    const success = await onUpload(selectedFile, values);
    if (success) {
      reset();
      onClose();
    }
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

      <Upload accept=".csv" showUploadList={false} beforeUpload={handleBeforeUpload}>
        <MyButtonSecondary icon={<UploadOutlined />}>
          {fileName ? fileName : "Choose CSV file"}
        </MyButtonSecondary>
      </Upload>

      {!selectedFile && (
        <Flex justify="end" style={{ marginTop: 20 }}>
          <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
        </Flex>
      )}

      {selectedFile && (
        <MyForm
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ marginTop: 16 }}
          initialValues={{ version: "1.0" }}
        >
          <Flex align="center" gap={6} style={{ marginBottom: 12 }}>
            <FileTextOutlined style={{ fontSize: 12 }} />
            <MyText type="secondary" style={{ fontSize: 12.5 }}>
              {fileName}
            </MyText>
          </Flex>

          <MyForm.Item
            name="title"
            label="Bank name"
            rules={[{ required: true, message: "Please enter a bank name" }]}
          >
            <Input placeholder="e.g. CS301 — Midterm 2026" />
          </MyForm.Item>

          <MyForm.Item name="courseCode" label="Course code">
            <Input placeholder="e.g. CS301" />
          </MyForm.Item>

          <MyForm.Item name="version" label="Version">
            <Input placeholder="e.g. 1.0" />
          </MyForm.Item>

          <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
            <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
            <MyButtonPrimary htmlType="submit" icon={<UploadOutlined />} loading={uploading}>
              Create &amp; Import
            </MyButtonPrimary>
          </Flex>
        </MyForm>
      )}
    </MyModal>
  );
}
