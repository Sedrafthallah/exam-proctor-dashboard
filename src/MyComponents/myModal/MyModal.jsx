import { Modal } from "antd";

export default function MyModal({ children, width = 700, ...props }) {
  return (
    <Modal
      {...props}
      width={width}
      style={{ top: 20, ...props.style }}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 8,
        },
        ...props.styles,
      }}
      footer={null}
    >
      {children}
    </Modal>
  );
}
