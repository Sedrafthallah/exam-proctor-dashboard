import { useState } from "react";
import { Input, InputNumber, DatePicker, Select, Switch, Flex } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";
import useAuthStore from "../../store/useAuthStore";
import useSessionStore from "../../store/useSessionStore";
import useQuestionBankStore from "../../store/useQuestionBankStore";
import { isEditable, toInstitutionTime } from "../../utils/sessionUtils";
import QuestionBankField from "./QuestionBankField";

const FACE_ALERT_OPTIONS = ["Low", "Medium", "High"];

export default function EditSessionModal({
  open,
  session,
  status,
  onClose,
  onSave,
}) {
  const [form] = MyForm.useForm();
  const proctors = useAuthStore((state) => state.proctors);
  const fetchProctors = useAuthStore((state) => state.fetchProctors);
  const fetchSessionById = useSessionStore((state) => state.fetchSessionById);
  const fetchQuestionBanks = useQuestionBankStore(
    (state) => state.fetchQuestionBanks,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const proctorOptions = proctors.map((p) => ({
    value: p.proctorId,
    label: p.full_name,
  }));

  const canEdit = (field) => isEditable(field, status);
  const isReadOnly = !canEdit("sessionTitle") && !canEdit("proctor");

  const handleAfterOpenChange = (isOpen) => {
    if (isOpen && session) {
      fetchQuestionBanks();
      fetchProctors();

      setDetailLoading(true);
      fetchSessionById(session.id).then((data) => {
        const s = data ?? session; // fallback to store data if API fails
        form.setFieldsValue({
          sessionTitle: s.sessionTitle,
          courseCode: s.courseCode,
          scheduledStartUTC: toInstitutionTime(s.scheduledStartUTC),
          duration: s.duration,
          gracePeriod: s.gracePeriod,
          loginWindow: s.loginWindow,
          questionBank: s.questionBank,
          // s.proctor is a display name (from the sessions API) — resolve it
          // to the matching proctor's id so it matches proctorOptions' values.
          proctor:
            proctors.find((p) => p.full_name === s.proctor)?.proctorId ?? null,
          gazeThreshold: s.gazeThreshold,
          faceAlertSensitivity: s.faceAlertSensitivity,
          questionRandomisation: s.questionRandomisation,
          optionShuffle: s.optionShuffle,
          audioMonitoring: s.audioMonitoring,
        });
        setDetailLoading(false);
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values) => {
    // Only submit fields this status actually allows editing, even though
    // disabled inputs already hold their unchanged original values.
    const editableEntries = Object.entries(values).filter(([field]) =>
      canEdit(field),
    );

    const success = await onSave(session.id, {
      ...Object.fromEntries(editableEntries),
      ...(editableEntries.some(([field]) => field === "scheduledStartUTC")
        ? { scheduledStartUTC: values.scheduledStartUTC.toISOString() }
        : {}),
      ...(editableEntries.some(([field]) => field === "proctor")
        ? { proctorId: values.proctor || null }
        : {}),
    });

    if (success) {
      form.resetFields();
    }
  };

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      afterOpenChange={handleAfterOpenChange}
      confirmLoading={detailLoading}
      title={
        <Flex align="center" gap={8}>
          {isReadOnly ? <EyeOutlined /> : <EditOutlined />}
          <MyText strong>
            {isReadOnly ? "Session Details" : "Edit Session"}
          </MyText>
        </Flex>
      }
    >
      {isReadOnly && (
        <MyText type="secondary" style={{ display: "block", marginBottom: 16 }}>
          This session's status doesn't allow field edits — showing read-only
          details.
        </MyText>
      )}

      <MyForm form={form} layout="vertical" onFinish={handleFinish}>
        <MyRow gutter={[16, 0]}>
          <MyCol xs={24} sm={12}>
            <MyForm.Item name="sessionTitle" label="Session title">
              <Input disabled={!canEdit("sessionTitle")} />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item name="courseCode" label="Course code">
              <Input disabled={!canEdit("courseCode")} />
            </MyForm.Item>
          </MyCol>

          <MyCol xs={24} sm={12}>
            <MyForm.Item name="scheduledStartUTC" label="Scheduled start (UTC)">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                disabled={!canEdit("scheduledStartUTC")}
              />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item name="duration" label="Duration (min)">
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                disabled={!canEdit("duration")}
              />
            </MyForm.Item>
          </MyCol>

          <MyCol xs={24} sm={12}>
            <MyForm.Item name="gracePeriod" label="Grace period (min)">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                disabled={!canEdit("gracePeriod")}
              />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item name="loginWindow" label="Login window (min)">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                disabled={!canEdit("loginWindow")}
              />
            </MyForm.Item>
          </MyCol>

          <MyCol xs={24} sm={12}>
            <MyForm.Item name="proctor" label="Assigned proctor">
              <Select
                allowClear
                placeholder="Select a proctor"
                options={proctorOptions}
                disabled={!canEdit("proctor")}
              />
            </MyForm.Item>
          </MyCol>
        </MyRow>

        <MyText
          strong
          style={{ display: "block", margin: "4px 0 8px", fontSize: 12.5 }}
        >
          QUESTION BANK
        </MyText>

        <QuestionBankField form={form} disabled={!canEdit("questionBank")} />

        <MyText
          strong
          style={{ display: "block", margin: "4px 0 12px", fontSize: 12.5 }}
        >
          MONITORING SETTINGS
        </MyText>

        <MyRow gutter={[16, 0]}>
          <MyCol xs={24} sm={12}>
            <MyForm.Item name="gazeThreshold" label="Gaze alert threshold (s)">
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                disabled={!canEdit("gazeThreshold")}
              />
            </MyForm.Item>
          </MyCol>
          <MyCol xs={24} sm={12}>
            <MyForm.Item
              name="faceAlertSensitivity"
              label="Face alert sensitivity"
            >
              <Select
                options={FACE_ALERT_OPTIONS.map((level) => ({
                  value: level,
                  label: level,
                }))}
                disabled={!canEdit("faceAlertSensitivity")}
              />
            </MyForm.Item>
          </MyCol>
        </MyRow>

        <Flex vertical gap={10} style={{ marginBottom: 8 }}>
          <Flex justify="space-between" align="center">
            <MyText style={{ fontSize: 13 }}>Question randomisation</MyText>
            <MyForm.Item
              name="questionRandomisation"
              valuePropName="checked"
              noStyle
            >
              <Switch disabled={!canEdit("questionRandomisation")} />
            </MyForm.Item>
          </Flex>
          <Flex justify="space-between" align="center">
            <MyText style={{ fontSize: 13 }}>Option shuffle</MyText>
            <MyForm.Item name="optionShuffle" valuePropName="checked" noStyle>
              <Switch disabled={!canEdit("optionShuffle")} />
            </MyForm.Item>
          </Flex>
          <Flex justify="space-between" align="center">
            <MyText style={{ fontSize: 13 }}>Audio monitoring</MyText>
            <MyForm.Item name="audioMonitoring" valuePropName="checked" noStyle>
              <Switch disabled={!canEdit("audioMonitoring")} />
            </MyForm.Item>
          </Flex>
        </Flex>

        <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
          <MyButtonSecondary onClick={handleCancel}>
            {isReadOnly ? "Close" : "Cancel"}
          </MyButtonSecondary>
          {!isReadOnly && (
            <MyButtonPrimary
              htmlType="submit"
              icon={<EditOutlined />}
              loading={detailLoading}
            >
              Save Changes
            </MyButtonPrimary>
          )}
        </Flex>
      </MyForm>
    </MyModal>
  );
}
