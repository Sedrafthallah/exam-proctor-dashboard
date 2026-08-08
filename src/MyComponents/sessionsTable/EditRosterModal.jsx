import { useState } from "react";
import { Select, Avatar, Flex, Button, message, theme } from "antd";
import { TeamOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MyModal from "../myModal/MyModal";
import MyText from "../myText/MyText";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import useSessionStore from "../../store/useSessionStore";
import useStudentStore from "../../store/useStudentStore";

const API_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

const getInitials = (name) =>
  name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

export default function EditRosterModal({ open, session, onClose, onSave }) {
  const { token } = theme.useToken();
  const students = useStudentStore((state) => state.students);
  const fetchAvailableProctors = useSessionStore((state) => state.fetchAvailableProctors);

  const [proctor, setProctor] = useState(null);
  const [roster, setRoster] = useState([]);
  const [initialRoster, setInitialRoster] = useState([]);
  const [proctorOptions, setProctorOptions] = useState([]);
  const [proctorsLoading, setProctorsLoading] = useState(false);

  const handleAfterOpenChange = (isOpen) => {
    if (isOpen && session) {
      const currentProctorId = session.assignedProctors?.[0]?.id ?? null;

      setProctor(currentProctorId);

      const initial = session.enrolledStudents?.length
        ? session.enrolledStudents
        : [];

      setRoster(initial);
      setInitialRoster(initial);

      if (session.scheduledStartUTC && session.duration) {
        const start = dayjs(session.scheduledStartUTC);
        const startTime = start.format(API_DATETIME_FORMAT);
        const endTime = start.add(session.duration, "minute").format(API_DATETIME_FORMAT);

        setProctorsLoading(true);
        fetchAvailableProctors(startTime, endTime).then((proctors) => {
          setProctorOptions(
            proctors.map((p) => ({ value: p.id, label: p.fullName })),
          );
          setProctorsLoading(false);
        });
      } else {
        setProctorOptions([]);
      }
    }
  };

  const rosterIds = new Set(roster.map((s) => s.id));
  const addStudentOptions = students
    .filter((s) => !rosterIds.has(s.id))
    .map((s) => ({ value: s.id, label: `${s.name} · ${s.id}` }));

  const handleRemoveStudent = (student) => {
    setRoster((prev) => prev.filter((s) => s.id !== student.id));
  };

  const handleAddStudent = (studentId) => {
    const selectedStudent = students.find((s) => s.id === studentId);
    if (!selectedStudent) return;
    setRoster((prev) => [...prev, selectedStudent]);
  };
  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
    const addedStudents = roster
      .filter(
        (student) =>
          !initialRoster.some((oldStudent) => oldStudent.id === student.id),
      )
      .map((student) => student.userId);
    const removedStudents = initialRoster
      .filter(
        (student) => !roster.some((newStudent) => newStudent.id === student.id),
      )
      .map((student) => student.userId);

    const success = await onSave(session.id, {
      assignedProctorIds: proctor ? [proctor] : [],
      studentIdsToAdd: addedStudents,
      studentIdsToRemove: removedStudents,
    });

    if (success) {
      message.success("Roster updated successfully.");
      onClose();
    }
    // On failure, editRestoreSessionApi (in useSessionStore.js) already calls
    // message.error(...) itself — don't duplicate an error toast here.
  };
  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      afterOpenChange={handleAfterOpenChange}
      title={
        <Flex align="center" gap={8}>
          <TeamOutlined />
          <MyText strong>Edit Roster — {session?.sessionTitle}</MyText>
        </Flex>
      }
    >
      <MyText type="secondary" style={{ display: "block", marginBottom: 20 }}>
        Assign a proctor and add or remove students for this session.
      </MyText>

      <MyText
        strong
        style={{ display: "block", margin: "4px 0 8px", fontSize: 12.5 }}
      >
        ASSIGNED PROCTOR
      </MyText>
      <Select
        allowClear
        style={{ width: "100%", marginBottom: 20 }}
        placeholder="Select a proctor"
        loading={proctorsLoading}
        notFoundContent={
          proctorsLoading
            ? "Loading proctors..."
            : "No proctors available for this time slot"
        }
        options={proctorOptions}
        value={proctor}
        onChange={setProctor}
      />

      <MyText
        strong
        style={{ display: "block", margin: "4px 0 8px", fontSize: 12.5 }}
      >
        ENROLLED STUDENTS ({roster.length})
      </MyText>
      <Flex
        vertical
        gap={6}
        style={{
          maxHeight: 220,
          overflowY: "auto",
          marginBottom: 16,
          padding: roster.length ? 4 : 0,
        }}
      >
        {roster.length === 0 && (
          <MyText type="secondary" style={{ fontSize: 12.5, padding: "8px 0" }}>
            No students enrolled yet.
          </MyText>
        )}
        {roster.map((student) => (
          <Flex
            key={student.id}
            align="center"
            justify="space-between"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Flex align="center" gap={10}>
              <Avatar
                size={28}
                style={{ background: token.colorPrimary, fontSize: 12 }}
              >
                {getInitials(student.name)}
              </Avatar>
              <Flex vertical gap={0}>
                <MyText style={{ fontSize: 13 }}>{student.name}</MyText>
                <MyText type="secondary" style={{ fontSize: 11.5 }}>
                  {student.id}
                </MyText>
              </Flex>
            </Flex>
            <Button
              size="small"
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleRemoveStudent(student)}
            />
          </Flex>
        ))}
      </Flex>

      <MyText
        strong
        style={{ display: "block", margin: "4px 0 8px", fontSize: 12.5 }}
      >
        ADD STUDENTS
      </MyText>
      <Select
        showSearch
        style={{ width: "100%" }}
        placeholder="Search and add a student..."
        value={null}
        options={addStudentOptions}
        filterOption={(input, option) =>
          String(option.label).toLowerCase().includes(input.toLowerCase())
        }
        onChange={handleAddStudent}
      />

      <Flex justify="end" gap={10} style={{ marginTop: 20 }}>
        <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
        <MyButtonPrimary icon={<TeamOutlined />} onClick={handleSave}>
          Save Changes
        </MyButtonPrimary>
      </Flex>
    </MyModal>
  );
}
