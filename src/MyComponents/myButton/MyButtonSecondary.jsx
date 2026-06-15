import { Button } from "antd";
import MyCol from "../myCol/MyCol";

export default function MyButtonSecondary({
  colProps,
  children,
  ...props
}) {
  const button = (
    <Button
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
