import { Button } from "antd";
import MyCol from "../myCol/MyCol";

export default function MyButtonPrimary({
  colProps,
  children,
  ...props
}) {
  const button = (
    <Button
      type="primary"
      {...props}
    >
      {children}
    </Button>
  );

  if (colProps) {
    return (
      <MyCol
        {...colProps}
      >
        {button}
      </MyCol>
    );
  }

  return button;
}
