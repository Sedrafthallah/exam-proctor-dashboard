import { useEffect, useState } from "react";
import { theme, Flex, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import useStudentStore from "../../store/useStudentStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import StudentsRoster from "../../MyComponents/studentsTable/StudentsRoster";
import ImportResultsModal from "../../MyComponents/studentsTable/ImportResultsModal";

export default function Students() {
  const { token } = theme.useToken();
  const students = useStudentStore((state) => state.students);
  const loading = useStudentStore((state) => state.loading);
  const importing = useStudentStore((state) => state.importing);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const importStudentsCsv = useStudentStore((state) => state.importStudentsCsv);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const [importResult, setImportResult] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const handleImportCsv = async (file) => {
    try {
      const result = await importStudentsCsv(file);
      setImportResult(result);
      setResultsOpen(true);
      fetchStudents();
    } catch (error) {
      message.error(error.message || "Couldn't import that CSV file.");
    }

    return false; // prevent antd's default auto-upload
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex vertical gap={4}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            Students
          </MyTitle>
          <MyText type="secondary">
            Registration, rosters and identity photos.
          </MyText>
        </Flex>

        <Flex gap={10}>
          <Upload accept=".csv" showUploadList={false} beforeUpload={handleImportCsv}>
            <MyButtonPrimary icon={<UploadOutlined />} loading={importing}>
              Import Roster CSV
            </MyButtonPrimary>
          </Upload>
        </Flex>
      </Flex>

      <StudentsRoster students={students} loading={loading} />

      <ImportResultsModal
        open={resultsOpen}
        result={importResult}
        onClose={() => {
          setResultsOpen(false);
          setImportResult(null);
        }}
      />
    </Flex>
  );
}
