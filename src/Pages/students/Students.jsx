import { useEffect } from "react";
import { theme, Flex, message, Upload } from "antd";
import { UploadOutlined, TeamOutlined } from "@ant-design/icons";

import useStudentStore from "../../store/useStudentStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";

import StudentsRoster from "../../MyComponents/studentsTable/StudentsRoster";

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

  const handleImportCsv = async (file) => {
    try {
      const result = await importStudentsCsv(file);

      if (!result.success) {
        message.error(result.error || "Import failed.");
        return false;
      }

      if (result.added > 0) {
        message.success(
          `Imported ${result.added} student${result.added === 1 ? "" : "s"}.` +
            (result.skipped > 0 ? ` ${result.skipped} skipped.` : ""),
        );
      } else {
        message.info("No new students imported.");
      }

      if (result.errors?.length > 0) {
        message.warning(`${result.errors.length} row(s) had errors.`);
      }
    } catch (err) {
      console.error("handleImportCsv error:", err);
      message.error("Couldn't import that CSV file.");
    }

    return false; // prevent antd's default auto-upload
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              boxShadow: `0 6px 16px -6px ${token.colorPrimary}`,
              flexShrink: 0,
            }}
          >
            <TeamOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Students
            </MyTitle>
            <MyText type="secondary">
              Registration, rosters and identity photos.
            </MyText>
          </Flex>
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
    </Flex>
  );
}
