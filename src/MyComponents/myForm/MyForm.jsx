import { Form } from "antd";

export default function MyForm({ form, children, ...props }) {
  return (
    <Form form={form} {...props}>
      {children}
    </Form>
  );
}

MyForm.Item = Form.Item;
MyForm.useForm = Form.useForm;
