import { Col } from "antd";

export default function MyCol({
  children,
  ...props
}) {
  return (
    <Col
      {...props}
    >
      {children}
    </Col>
  );
}
