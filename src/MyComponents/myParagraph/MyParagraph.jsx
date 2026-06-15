import { Typography } from "antd";
import MyCol from "../myCol/MyCol";

export default function MyParagraph({
  colProps,
  children,
  ...props
}) {
  const paragraph = (
    <Typography.Paragraph
      {...props}
    >
      {children}
    </Typography.Paragraph>
  );

  if (colProps) {
    return (
      <MyCol
        {...colProps}
      >
        {paragraph}
      </MyCol>
    );
  }

  return paragraph;
}
