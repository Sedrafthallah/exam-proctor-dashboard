import { Modal } from "antd";

export default function MyModal({ children, ...props }) {
  return (
    <Modal
      {...props}
      width={700}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 8,
        },
      }}
      footer={null}
    >
      {children}
    </Modal>
  );
}
