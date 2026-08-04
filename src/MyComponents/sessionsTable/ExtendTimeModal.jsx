import { InputNumber, Flex } from "antd";
import { FieldTimeOutlined } from "@ant-design/icons";
import MyModal from "../myModal/MyModal";
import MyForm from "../myForm/MyForm";
import MyButtonPrimary from "../myButton/MyButtonPrimary";
import MyButtonSecondary from "../myButton/MyButtonSecondary";
import MyText from "../myText/MyText";

export default function ExtendTimeModal({ open, session, onClose, onExtend }) {
  const [form] = MyForm.useForm();

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values) => {
    await onExtend(session.id, values.extraMinutes);
    form.resetFields();
  };

  return (
    <MyModal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <FieldTimeOutlined />
          <MyText strong>Extend Session Time</MyText>
        </Flex>
      }
    >
      <MyText type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Super Admin override — adds extra minutes to "{session?.sessionTitle}",
        currently in progress.
      </MyText>

      <MyForm
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ extraMinutes: 10 }}
      >
        <MyForm.Item
          name="extraMinutes"
          label="Extra minutes"
          rules={[
            { required: true, message: "Please enter how many minutes to add" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </MyForm.Item>

        <Flex justify="end" gap={10} style={{ marginTop: 8 }}>
          <MyButtonSecondary onClick={handleCancel}>Cancel</MyButtonSecondary>
          <MyButtonPrimary htmlType="submit" icon={<FieldTimeOutlined />}>
            Extend
          </MyButtonPrimary>
        </Flex>
      </MyForm>
    </MyModal>
  );
}
