import { theme, Flex } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import MyText from "../myText/MyText";
import { PERMISSION_CATEGORIES } from "./adminsData";

export default function PermissionReference() {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={20}>
      <Flex align="center" gap={8}>
        <KeyOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
        <MyText strong style={{ fontSize: 15 }}>
          Permission Reference
        </MyText>
      </Flex>

      {PERMISSION_CATEGORIES.map((group) => (
        <Flex key={group.category} vertical gap={10}>
          <MyText type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {group.category}
          </MyText>

          <MyRow gutter={[16, 16]}>
            {group.permissions.map((item) => (
              <MyCol key={item.key} xs={24} md={12}>
                <MyCard
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${token.colorBorder}`,
                    background: token.colorBgElevated,
                    height: "100%",
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Flex gap={12} align="center">
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
                      {item.key}
                    </MyText>

                    <MyText strong style={{ fontSize: 13.5 }}>
                      {item.label}
                    </MyText>
                  </Flex>
                </MyCard>
              </MyCol>
            ))}
          </MyRow>
        </Flex>
      ))}
    </Flex>
  );
}
