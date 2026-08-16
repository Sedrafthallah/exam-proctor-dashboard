import { theme, Flex, Badge } from "antd";
import MyText from "../myText/MyText";

const LABELS = {
  connected: { status: "success", colorKey: "colorSuccess", label: "WSS live" },
  connecting: { status: "processing", colorKey: "colorWarning", label: "WSS connecting" },
  reconnecting: {
    status: "processing",
    colorKey: "colorWarning",
    label: "WSS reconnecting",
  },
  disconnected: { status: "default", colorKey: "colorTextTertiary", label: "WSS offline" },
};

export default function HubConnectionBadge({ connectionState = "disconnected" }) {
  const { token } = theme.useToken();
  const cfg = LABELS[connectionState] ?? LABELS.disconnected;
  const color = token[cfg.colorKey] ?? token.colorTextTertiary;

  return (
    <Flex align="center" gap={6}>
      <Badge status={cfg.status} color={color} />
      <MyText
        type="secondary"
        style={{ fontSize: 11, fontWeight: 500, fontFamily: "monospace" }}
      >
        {cfg.label}
      </MyText>
    </Flex>
  );
}
