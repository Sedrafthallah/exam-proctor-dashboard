import { useState, useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Switch, Upload, Flex, message } from "antd";
import { PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useSessionStore from "../../store/useSessionStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import QuestionBankField from "./QuestionBankField";

const FACE_ALERT_OPTIONS = ["Low", "Medium", "High"];
const API_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

export default function NewSessionModal({ open, onClose, onCreate }) {
  const [form] = MyForm.useForm();
  const [availableProctors, setAvailableProctors] = useState([]);
  const [proctorsLoading, setProctorsLoading] = useState(false);
  const fetchQuestionBanks = useQuestionBankStore((state) => state.fetchQuestionBanks);
  const fetchAvailableProctors = useSessionStore((state) => state.fetchAvailableProctors);

  const scheduledStartUTC = Form.useWatch("scheduledStartUTC", form);
  const duration = Form.useWatch("duration", form);

  useEffect(() => {
    if (open) {
      fetchQuestionBanks();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !scheduledStartUTC || !duration) {
      return;
    }

    const startTime = scheduledStartUTC.format(API_DATETIME_FORMAT);
    const endTime = scheduledStartUTC.add(duration, "minute").format(API_DATETIME_FORMAT);

    let cancelled = false;

    (async () => {
      setProctorsLoading(true);
      const proctors = await fetchAvailableProctors(startTime, endTime);
      if (cancelled) return;
      setAvailableProctors(proctors);
      setProctorsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, scheduledStartUTC, duration, fetchAvailableProctors]);

  const proctorOptions =
    scheduledStartUTC && duration
      ? availableProctors.map((p) => ({ value: p.id, label: p.fullName }))
      : [];

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleImportRosterCsv = async (file) => {
    try {
      const text = await file.text();
      const lines = text.trim().split("\n").slice(1); // skip header row
      const ids = lines
        .map((line) => line.split(",")[0]?.trim())
        .filter(Boolean);

      if (ids.length === 0) {
        message.error("No valid rows found in the file.");
        return false;
      }

      const previousIds = form.getFieldValue("studentIds") || [];
      form.setFieldValue("studentIds", [...new Set([...previousIds, ...ids])]);
      message.success(`${ids.length} student ID(s) loaded from file.`);
    } catch {
      message.error("Couldn't read that file.");
    }

    return false; // prevent antd's default auto-upload
  };

  const handleFinish = (values) => {
    onCreate({
      sessionTitle: values.sessionTitle,
      courseCode: values.courseCode,
      scheduledStartUTC: values.scheduledStartUTC.toISOString(),
      duration: values.duration,
      gracePeriod: values.gracePeriod,
      loginWindow: values.loginWindow,
      questionBankId: values.questionBank ? Number(values.questionBank) : null,
      proctorId: values.proctor || null,
      studentIds: values.studentIds || [],
      enrolledStudents: (values.studentIds || []).length,
      gazeThreshold: values.gazeThreshold,
      faceAlertSensitivity: values.faceAlertSensitivity,
      questionRandomisation: values.questionRandomisation,
      optionShuffle: values.optionShuffle,
      audioMonitoring: values.audioMonitoring,
    });

    form.resetFields();
  };

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <PlusCircleOutlined />
          <MyText strong>New Exam Session</MyText>
        </Flex>
      }
    >
      <MyText type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Saved as a draft — publish it from the sessions table when it's ready.
      </MyText>

      <MyForm
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          duration: 60,
          gracePeriod: 5,
          loginWindow: 15,
          studentIds: [],
          gazeThreshold: 3,
          faceAlertSensitivity: "Medium",
          questionRandomisation: true,
          optionShuffle: false,
          audioMonitoring: false,
        }}
      >
        <MyRow gutter={[16, 0]}>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="sessionTitle"
              label="Session title"
              rules={[{ required: true, message: "Please enter a session title" }]}
            >
              <Input placeholder="e.g. CS301 Final — Spring 2025" />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="courseCode"
              label="Course code"
              rules={[{ required: true, message: "Please enter the course code" }]}
            >
              <Input placeholder="e.g. CS301" />
            </MyForm.Item>
          </MyCol>

          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="scheduledStartUTC"
              label="Scheduled start (UTC)"
              rules={[
                { required: true, message: "Please pick a start date and time" },
                {
                  validator: (_, value) =>
                    !value || value.isAfter(dayjs())
                      ? Promise.resolve()
                      : Promise.reject(new Error("Start time must be in the future")),
                },
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
                disabledTime={(current) => {
                  if (!current || !current.isSame(dayjs(), "day")) return {};
                  const now = dayjs();
                  return {
                    disabledHours: () =>
                      Array.from({ length: now.hour() }, (_, i) => i),
                    disabledMinutes: (selectedHour) =>
                      selectedHour === now.hour()
                        ? Array.from({ length: now.minute() + 1 }, (_, i) => i)
                        : [],
                  };
                }}
              />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="duration"
              label="Duration (min)"
              rules={[{ required: true, message: "Please enter the duration" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </MyForm.Item>
          </MyCol>

          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="gracePeriod"
              label="Grace period (min)"
              rules={[{ required: true, message: "Please enter the grace period" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="loginWindow"
              label="Login window (min)"
              rules={[{ required: true, message: "Please enter the login window" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </MyForm.Item>
          </MyCol>

          <MyCol xs={24} sm={12}>
            <MyForm.Item name="proctor" label="Assigned proctor">
              <Select
                allowClear
                loading={proctorsLoading}
                placeholder={
                  !scheduledStartUTC || !duration
                    ? "Pick a start time and duration first"
                    : "Select a proctor"
                }
                notFoundContent={
                  proctorsLoading
                    ? "Loading proctors..."
                    : "No proctors available for this time slot"
                }
                options={proctorOptions}
              />
            </MyForm.Item>
          </MyCol>
        </MyRow>

        <MyText strong style={{ display: "block", margin: "4px 0 8px", fontSize: 12.5 }}>
          QUESTION BANK
        </MyText>

        <QuestionBankField form={form} />

        <MyText strong style={{ display: "block", margin: "4px 0 8px", fontSize: 12.5 }}>
          ENROLL STUDENTS (OPTIONAL)
        </MyText>

        <MyForm.Item name="studentIds" hidden label="Students">
          <Select mode="multiple" />
        </MyForm.Item>

        <Flex vertical gap={8} style={{ marginBottom: 16 }}>
          <Upload accept=".csv" showUploadList={false} beforeUpload={handleImportRosterCsv}>
            <MyButtonSecondary icon={<UploadOutlined />}>Upload roster CSV</MyButtonSecondary>
          </Upload>
          <MyForm.Item shouldUpdate noStyle>
            {() => {
              const count = (form.getFieldValue("studentIds") || []).length;
              return (
                <MyText type="secondary" style={{ fontSize: 12 }}>
                  {count > 0
                    ? `${count} student${count === 1 ? "" : "s"} enrolled from file.`
                    : "New IDs from the file are also added to the student roster."}
                </MyText>
              );
            }}
          </MyForm.Item>
        </Flex>

        <MyText strong style={{ display: "block", margin: "4px 0 12px", fontSize: 12.5 }}>
          MONITORING SETTINGS
        </MyText>

        <MyRow gutter={[16, 0]}>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="gazeThreshold"
              label="Gaze alert threshold (s)"
              rules={[{ required: true, message: "Please enter a threshold" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="faceAlertSensitivity"
              label="Face alert sensitivity"
              rules={[{ required: true, message: "Please select a sensitivity" }]}
            >
              <Select
                options={FACE_ALERT_OPTIONS.map((level) => ({ value: level, label: level }))}
              />
            </MyForm.Item>
          </MyCol>
        </MyRow>

        <Flex vertical gap={10} style={{ marginBottom: 8 }}>
          <Flex justify="space-between" align="center">
            <MyText style={{ fontSize: 13 }}>Question randomisation</MyText>
            <MyForm.Item name="questionRandomisation" valuePropName="checked" noStyle>
              <Switch />
            </MyForm.Item>
          </Flex>
          <Flex justify="space-between" align="center">
            <MyText style={{ fontSize: 13 }}>Option shuffle</MyText>
            <MyForm.Item name="optionShuffle" valuePropName="checked" noStyle>
              <Switch />
            </MyForm.Item>
          </Flex>
          <Flex justify="space-between" align="center">
            <MyText style={{ fontSize: 13 }}>Audio monitoring</MyText>
            <MyForm.Item name="audioMonitoring" valuePropName="checked" noStyle>
              <Switch />
            </MyForm.Item>
          </Flex>
        </Flex>

        <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
          <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
          <MyButtonPrimary htmlType="submit" icon={<PlusCircleOutlined />}>
            Create Session
          </MyButtonPrimary>
        </Flex>
      </MyForm>
    </MyModal>
  );
}
