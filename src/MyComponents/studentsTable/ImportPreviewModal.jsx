import { Tabs, Flex, theme } from "antd";
import { FileTextOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";

export default function ImportPreviewModal({ open, data, onClose, onConfirm }) {
  const { token } = theme.useToken();

  const valid = data?.valid || [];
  const errors = data?.errors || [];

  const validColumns = [
    {
      title: "",
      key: "check",
      width: 36,
      render: () => <CheckCircleFilled style={{ color: token.colorSuccess }} />,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Student ID", dataIndex: "id", key: "id" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  const errorColumns = [
    {
      title: "",
      key: "check",
      width: 36,
      render: () => <CloseCircleFilled style={{ color: token.colorError }} />,
    },
    { title: "Row #", dataIndex: "row", key: "row", width: 90 },
    { title: "Reason", dataIndex: "reason", key: "reason" },
  ];

  const items = [
    {
      key: "valid",
      label: `Valid Students (${valid.length})`,
      children: (
        <MyTable
          columns={validColumns}
          dataSource={valid}
          rowKey="id"
          size="small"
          pagination={false}
          locale={{ emptyText: "No valid rows to import" }}
        />
      ),
    },
  ];

  if (errors.length > 0) {
    items.push({
      key: "errors",
      label: `Errors (${errors.length})`,
      children: (
        <MyTable
          columns={errorColumns}
          dataSource={errors}
          rowKey="row"
          size="small"
          pagination={false}
          locale={{ emptyText: "No errors" }}
        />
      ),
    });
  }

  return (
    <MyModal
      open={open}
      onCancel={onClose}
      title={
        <Flex align="center" gap={8}>
          <FileTextOutlined />
          <MyText strong>Import Preview</MyText>
        </Flex>
      }
    >
      <Flex gap={20} style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 15 }} />
          <MyText style={{ fontSize: 13 }}>{valid.length} students ready to import</MyText>
        </Flex>
        {errors.length > 0 && (
          <Flex align="center" gap={8}>
            <CloseCircleFilled style={{ color: token.colorError, fontSize: 15 }} />
            <MyText style={{ fontSize: 13 }}>{errors.length} rows with errors</MyText>
          </Flex>
        )}
      </Flex>

      <Tabs items={items} />

      <Flex justify="end" gap={10} style={{ marginTop: 16 }}>
        <MyButtonSecondary onClick={onClose}>Cancel</MyButtonSecondary>
        <MyButtonPrimary disabled={valid.length === 0} onClick={onConfirm}>
          Confirm Import ({valid.length} students)
        </MyButtonPrimary>
      </Flex>
    </MyModal>
  );
}
