import { theme, Flex } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyText from "../myText/MyText";
import { PERMISSIONS } from "./adminsData";

export default function PermissionReference() {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={12}>
      <Flex align="center" gap={8}>
        <KeyOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
        <MyText strong style={{ fontSize: 15 }}>
          Permission Reference
        </MyText>
      </Flex>

      <MyRow gutter={[16, 16]}>
        {PERMISSIONS.map((item) => (
          <MyCol key={item.code} xs={24} md={12}>
            <MyCard
              style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorder}`,
                background: token.colorBgElevated,
                height: "100%",
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Flex gap={12} align="flex-start">
                <MyText
                  style={{
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    color: token.colorPrimary,
                    background: token.colorPrimaryBg,
                    border: `1px solid ${token.colorPrimaryBorder}`,
                    borderRadius: 6,
                    padding: "2px 8px",
                    lineHeight: "18px",
                  }}
                >
                  {item.code}
                </MyText>

                <Flex vertical gap={4}>
                  <MyText strong style={{ fontSize: 13.5 }}>
                    {item.title}
                  </MyText>
                  <MyText type="secondary" style={{ fontSize: 12.5 }}>
                    {item.description}
                  </MyText>
                </Flex>
              </Flex>
            </MyCard>
          </MyCol>
        ))}
      </MyRow>
    </Flex>
  );
}
