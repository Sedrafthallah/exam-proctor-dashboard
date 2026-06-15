import { Typography } from "antd";
import MyCol from "../myCol/MyCol";

export default function MyText({
  colProps,
  children,
  ...props
}) {
  const text = (
    <Typography.Text
      {...props}
    >
      {children}
    </Typography.Text>
  );

  if (colProps) {
    return (
      <MyCol
        {...colProps}
      >
        {text}
      </MyCol>
    );
  }

  return text;
}
