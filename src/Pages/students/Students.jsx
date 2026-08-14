import { useEffect } from "react";
import { theme, Flex, message, Upload, Tooltip } from "antd";
import { UploadOutlined, TeamOutlined, InfoCircleOutlined } from "@ant-design/icons";

import useStudentStore from "../../store/useStudentStore";
import useAuthStore from "../../store/useAuthStore";

import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";
import { getPermissionLabel } from "../../MyComponents/usersTable/adminsData";

import StudentsRoster from "../../MyComponents/studentsTable/StudentsRoster";

const IMPORT_ZIP_HELP =
  "Upload a .zip file containing a students.csv (columns: university_number, first_name, middle_name, last_name, email, phone_number) and one photo per student named {university_number}.jpg at the root of the zip.";

export default function Students() {
  const { token } = theme.useToken();
  const students = useStudentStore((state) => state.students);
  const loading = useStudentStore((state) => state.loading);
  const page = useStudentStore((state) => state.page);
  const pageSize = useStudentStore((state) => state.pageSize);
  const total = useStudentStore((state) => state.total);
  const importing = useStudentStore((state) => state.importing);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const importStudents = useStudentStore((state) => state.importStudents);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canImport = hasPermission("ImportStudents");

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleImportZip = async (file) => {
    if (!canImport) return false;

    try {
      const result = await importStudents(file);

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
      console.error("handleImportZip error:", err);
      message.error("Couldn't import that ZIP file.");
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

        <Flex align="center" gap={8}>
          <Upload
            accept=".zip"
            showUploadList={false}
            beforeUpload={handleImportZip}
            disabled={!canImport}
          >
            <Tooltip
              title={
                canImport ? "" : `Requires the ${getPermissionLabel("ImportStudents")} permission.`
              }
            >
              <MyButtonPrimary icon={<UploadOutlined />} loading={importing} disabled={!canImport}>
                Import Students (ZIP)
              </MyButtonPrimary>
            </Tooltip>
          </Upload>
          <Tooltip title={IMPORT_ZIP_HELP}>
            <InfoCircleOutlined style={{ color: token.colorTextSecondary, fontSize: 16 }} />
          </Tooltip>
        </Flex>
      </Flex>

      <StudentsRoster
        students={students}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (newPage, newPageSize) => fetchStudents(newPage, newPageSize),
          showSizeChanger: true,
        }}
      />
    </Flex>
  );
}
