import { Row } from "antd";

export default function MyRow({
  children,
  ...props
}) {
  return (
    <Row
      {...props}
    >
      {children}
    </Row>
  );
}
