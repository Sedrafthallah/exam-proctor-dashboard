import { theme, Flex } from "antd";
import {
  SafetyCertificateFilled,
  UploadOutlined,
  LockOutlined,
  StopOutlined,
  UserAddOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FormOutlined,
} from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import { getActionColor, formatRelativeTime } from "../../utils/auditLogUtils";

const ACTION_ICONS = {
  SESSION_PUBLISHED: UploadOutlined,
  BANK_LOCKED: LockOutlined,
  BANK_AUTO_LOCKED: LockOutlined,
  SESSION_TERMINATED: StopOutlined,
  ADMIN_CREATED: UserAddOutlined,
  ADMIN_DISABLED: StopOutlined,
  ROSTER_IMPORTED: FileExcelOutlined,
  SESSION_EDITED: CalendarOutlined,
  EXPORTED: DownloadOutlined,
  QUESTIONS_AUTHORED: FormOutlined,
};

// antd color keywords (blue/purple/red/green/orange) don't all map to a
// semantic theme token — purple falls back to a fixed accent.
function resolveColor(colorName, token) {
  switch (colorName) {
    case "red":
      return token.colorError;
    case "green":
      return token.colorSuccess;
    case "orange":
      return token.colorWarning;
    case "blue":
      return token.colorInfo;
    case "purple":
      return "#A855F7";
    default:
      return token.colorTextTertiary;
  }
}

function withOpacity(hex, opacity) {
  if (!hex.startsWith("#")) return hex;
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}

function ActionIcon({ type, token }) {
  const Icon = ACTION_ICONS[type] || FormOutlined;
  const color = resolveColor(getActionColor(type), token);

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: 8,
        background: withOpacity(color, 0.15),
        color,
        fontSize: 15,
      }}
    >
      <Icon />
    </Flex>
  );
}

export default function AuditLogFeed({ logs }) {
  const { token } = theme.useToken();

  return (
    <MyCard
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <Flex
        align="center"
        gap={10}
        style={{ padding: "16px 20px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <SafetyCertificateFilled style={{ fontSize: 20, color: token.colorPrimary }} />
        <Flex vertical gap={0}>
          <MyText strong style={{ fontSize: 13.5 }}>
            Signed Chain · SHA-256
          </MyText>
          <MyText type="secondary" style={{ fontSize: 12 }}>
            Every entry is cryptographically linked to the previous one
          </MyText>
        </Flex>
      </Flex>

      <Flex vertical style={{ padding: "8px 12px" }}>
        {logs.map((log) => (
          <Flex
            key={log.id}
            align="center"
            gap={12}
            style={{
              padding: "12px 8px",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <ActionIcon type={log.type} token={token} />

            <Flex vertical gap={0} flex={1} style={{ minWidth: 0 }}>
              <MyText style={{ fontSize: 13.5 }}>
                <MyText strong style={{ fontSize: 13.5 }}>
                  {log.actor}
                </MyText>{" "}
                {log.action}
              </MyText>
              <MyText type="secondary" style={{ fontSize: 12 }}>
                {log.target}
              </MyText>
            </Flex>

            <MyText type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
              {formatRelativeTime(log.timestamp)}
            </MyText>
          </Flex>
        ))}
      </Flex>
    </MyCard>
  );
}
