import { Flex, theme } from "antd";
import { FileTextOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import MyButtonPrimary from "../myButton/MyButtonPrimary";

// Shows the result of POST /api/students/import-csv: how many rows the
// backend accepted/rejected, and its per-row message (validation errors,
// "Updated existing student", etc.) — the backend does the validation, this
// just renders what it reported back.
export default function ImportResultsModal({ open, result, onClose }) {
  const { token } = theme.useToken();

  const totalRecords = result?.totalRecords ?? 0;
  const successfulImports = result?.successfulImports ?? 0;
  const failedImports = result?.failedImports ?? 0;
  const rows = result?.results ?? [];

  const columns = [
    {
      title: "",
      key: "status",
      width: 36,
      render: (_, row) =>
        row.isSuccess ? (
          <CheckCircleFilled style={{ color: token.colorSuccess }} />
        ) : (
          <CloseCircleFilled style={{ color: token.colorError }} />
        ),
    },
    {
      title: "University Number",
      dataIndex: "universityNumber",
      key: "universityNumber",
      width: 150,
      render: (value) => value ?? "—",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      render: (value) => value ?? "—",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message, row) => (
        <MyText type={row.isSuccess ? "secondary" : "danger"} style={{ fontSize: 13 }}>
          {message}
        </MyText>
      ),
    },
  ];

  return (
    <MyModal
      open={open}
      onCancel={onClose}
      title={
        <Flex align="center" gap={8}>
          <FileTextOutlined />
          <MyText strong>Import Results</MyText>
        </Flex>
      }
    >
      <Flex gap={20} style={{ marginBottom: 16 }}>
        <MyText style={{ fontSize: 13 }}>{totalRecords} rows processed</MyText>
        <Flex align="center" gap={8}>
          <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 15 }} />
          <MyText style={{ fontSize: 13 }}>{successfulImports} succeeded</MyText>
        </Flex>
        {failedImports > 0 && (
          <Flex align="center" gap={8}>
            <CloseCircleFilled style={{ color: token.colorError, fontSize: 15 }} />
            <MyText style={{ fontSize: 13 }}>{failedImports} failed</MyText>
          </Flex>
        )}
      </Flex>

      <MyTable
        columns={columns}
        dataSource={rows}
        rowKey={(row, index) => row.studentId ?? `failed-${index}`}
        size="small"
        pagination={false}
        locale={{ emptyText: "No results" }}
      />

      <Flex justify="end" style={{ marginTop: 16 }}>
        <MyButtonPrimary onClick={onClose}>Close</MyButtonPrimary>
      </Flex>
    </MyModal>
  );
}
