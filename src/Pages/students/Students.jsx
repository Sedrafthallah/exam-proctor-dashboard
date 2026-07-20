import { useState } from "react";
import { theme, Flex, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import useStudentStore from "../../store/useStudentStore";
import { parseStudentsCSVWithValidation } from "../../utils/csvUtils";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import StudentsRoster from "../../MyComponents/studentsTable/StudentsRoster";
import ImportPreviewModal from "../../MyComponents/studentsTable/ImportPreviewModal";

export default function Students() {
  const { token } = theme.useToken();
  const students = useStudentStore((state) => state.students);
  const bulkRegisterStudents = useStudentStore((state) => state.bulkRegisterStudents);

  const [previewData, setPreviewData] = useState(null); // { valid: [], errors: [] }
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleImportCsv = async (file) => {
    try {
      const text = await file.text();
      const { valid, errors } = parseStudentsCSVWithValidation(text);
      setPreviewData({ valid, errors });
      setPreviewOpen(true);
    } catch {
      message.error("Couldn't read that file. Please upload a valid CSV.");
    }

    return false; // prevent antd's default auto-upload
  };

  const handleConfirmImport = () => {
    const { addedCount, skippedCount } = bulkRegisterStudents(previewData.valid);
    setPreviewOpen(false);
    setPreviewData(null);

    if (addedCount > 0) {
      message.success(
        `Imported ${addedCount} student${addedCount === 1 ? "" : "s"}.` +
          (skippedCount > 0 ? ` Skipped ${skippedCount} duplicates.` : ""),
      );
    } else {
      message.info("All rows already on the roster — nothing imported.");
    }
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
            <MyButtonPrimary icon={<UploadOutlined />}>Import Roster CSV</MyButtonPrimary>
          </Upload>
        </Flex>
      </Flex>

      <StudentsRoster students={students} />

      <ImportPreviewModal
        open={previewOpen}
        data={previewData}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewData(null);
        }}
        onConfirm={handleConfirmImport}
      />
    </Flex>
  );
}
