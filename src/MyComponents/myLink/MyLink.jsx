import { Typography } from "antd";
import MyCol from "../myCol/MyCol";

export default function MyLink({
  colProps,
  children,
  ...props
}) {
  const link = (
    <Typography.Link
      {...props}
    >
      {children}
    </Typography.Link>
  );

  if (colProps) {
    return (
      <MyCol
        {...colProps}
      >
        {link}
      </MyCol>
    );
  }

  return link;
}
