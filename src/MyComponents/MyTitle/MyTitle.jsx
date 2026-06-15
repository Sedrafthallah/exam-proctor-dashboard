import { Typography } from "antd";
import MyCol from "../myCol/MyCol";

export default function MyTitle({
  colProps,
  level = 2,
  children,
  ...props
}) {
  const title = (
    <Typography.Title
      level={level}
      {...props}
    >
      {children}
    </Typography.Title>
  );

  if (colProps) {
    return (
      <MyCol
        {...colProps}
      >
        {title}
      </MyCol>
    );
  }

  return title;
}
