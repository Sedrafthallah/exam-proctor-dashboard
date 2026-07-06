import { theme, Flex, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import useStudentStore from "../../store/useStudentStore";
import { parseStudentsCSV } from "../../utils/csvUtils";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import StudentsRoster from "../../MyComponents/studentsTable/StudentsRoster";

export default function Students() {
  const { token } = theme.useToken();
  const students = useStudentStore((state) => state.students);
  const bulkRegisterStudents = useStudentStore((state) => state.bulkRegisterStudents);

  const handleImportCsv = async (file) => {
    try {
      const text = await file.text();
      const records = parseStudentsCSV(text);

      if (records.length === 0) {
        message.error("No valid rows found — expected columns like ID, Name, Email.");
        return false;
      }

      const { addedCount, skippedCount } = bulkRegisterStudents(records);

      if (addedCount > 0) {
        message.success(
          `Imported ${addedCount} student${addedCount === 1 ? "" : "s"}.` +
            (skippedCount > 0 ? ` Skipped ${skippedCount} already on the roster.` : ""),
        );
      } else {
        message.info("All rows were already on the roster — nothing imported.");
      }
    } catch {
      message.error("Couldn't read that file. Please upload a valid CSV.");
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
            <MyButtonPrimary icon={<UploadOutlined />}>Import Roster CSV</MyButtonPrimary>
          </Upload>
        </Flex>
      </Flex>

      <StudentsRoster students={students} />
    </Flex>
  );
}
