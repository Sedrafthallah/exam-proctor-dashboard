import { useState, useEffect } from "react";
import { Select, Avatar, Flex, Button, message, theme } from "antd";
import { TeamOutlined, CloseOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyText from "../myText/MyText";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import useAuthStore from "../../store/useAuthStore";
import useStudentStore from "../../store/useStudentStore";

const getInitials = (name) =>
  name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

export default function EditRosterModal({ open, session, onClose, onSave }) {
  const { token } = theme.useToken();
  const users = useAuthStore((state) => state.users);
  const students = useStudentStore((state) => state.students);

  const [proctor, setProctor] = useState(null);
  const [roster, setRoster] = useState([]);
  const [initialRoster, setInitialRoster] = useState([]);
  console.log("SESSION:", session);
  useEffect(() => {
    if (open && session) {
      const currentProctorId = session.assignedProctors?.[0]?.id ?? null;

      setProctor(currentProctorId);

      const initial = session.enrolledStudents?.length
        ? session.enrolledStudents
        : [];

      setRoster(initial);
      setInitialRoster(initial);
    }
  }, [open, session]);

  const proctorOptions = users
    .filter((u) => !u.disabled)
    .map((u) => ({
      value: u.id,
      label: u.name,
    }));
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
  console.log("PROCTOR:", proctor);
  console.log("STUDENTS:", students);
  console.log("USERS:", users);

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
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
    console.log("Saving roster:", {
      sessionId: session.id,
      assignedProctorIds: proctor ? [proctor] : [],
      studentIdsToAdd: addedStudents,
      studentIdsToRemove: removedStudents,
    });
    console.log("SELECTED PROCTOR:", proctor);
    console.log("PAYLOAD:", {
      assignedProctorIds: proctor ? [proctor] : [],
      studentIdsToAdd: addedStudents,
      studentIdsToRemove: removedStudents,
    });
    onSave(session.id, {
      assignedProctorIds: proctor ? [proctor] : [],
      studentIdsToAdd: addedStudents,
      studentIdsToRemove: removedStudents,
    });

    message.success("Roster updated successfully.");
  };
  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
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
