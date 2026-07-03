import { theme, Flex } from "antd";
import { ToolOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyTitle from "../MyTitle/MyTitle";
import MyText from "../myText/MyText";

export default function ComingSoon({ title, description }) {
  const { token } = theme.useToken();

  return (
    <MyCard
      style={{
        borderRadius: 14,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
        minHeight: "60vh",
      }}
      styles={{ body: { height: "100%" } }}
    >
      <Flex
        vertical
        align="center"
        justify="center"
        gap={12}
        style={{ height: "56vh" }}
      >
        <Flex
          align="center"
          justify="center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: token.colorFillSecondary,
            color: token.colorPrimary,
            fontSize: 24,
          }}
        >
          <ToolOutlined />
        </Flex>

        <MyTitle level={4} style={{ margin: 0, color: token.colorText }}>
          {title}
        </MyTitle>

        <MyText type="secondary" style={{ textAlign: "center", maxWidth: 360 }}>
          {description || "This page is under construction."}
        </MyText>
      </Flex>
    </MyCard>
  );
}
