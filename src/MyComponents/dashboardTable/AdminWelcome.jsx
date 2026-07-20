import { theme, Flex } from "antd";
import MyCard from "../myCard/MyCard";
import MyTitle from "../MyTitle/MyTitle";
import MyText from "../myText/MyText";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";

const PERMISSION_DETAILS = {
  P01: {
    label: "Question Bank: Author",
    description: "Import questions via CSV and manage question banks.",
    icon: "📝",
  },
  P02: {
    label: "Question Bank: View All",
    description: "Read-only access to all question banks in the system.",
    icon: "👁",
  },
  P03: {
    label: "Session: Manage",
    description: "Create, configure, publish exam sessions and manage rosters.",
    icon: "📅",
  },
  P04: {
    label: "Session: Live Proctor",
    description: "Monitor active sessions, issue warnings and terminate students.",
    icon: "🎥",
  },
  P05: {
    label: "Students: Register",
    description: "Register students, upload rosters and manage ID photos.",
    icon: "👥",
  },
  P06: {
    label: "Reports: Export",
    description: "Export grading packages and signed audit logs in CSV and JSON.",
    icon: "📊",
  },
  P07: {
    label: "Reports: View Violations",
    description: "Read-only access to violation and incident logs.",
    icon: "🚨",
  },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminWelcome({ user, hasPermission }) {
  const { token } = theme.useToken();

  const cardStyle = {
    borderRadius: 14,
    boxShadow: token.boxShadow,
    border: `1px solid ${token.colorBorder}`,
    background: token.colorBgElevated,
  };

  return (
    <Flex vertical gap={20}>
      <MyCard style={cardStyle}>
        <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
          {getGreeting()}, {user?.name || "Admin"} 👋
        </MyTitle>
        <MyText type="secondary">Admin · Last login: Today</MyText>
      </MyCard>

      <MyCard title={<MyText strong>Your Permissions</MyText>} style={cardStyle}>
        <MyRow gutter={[16, 16]}>
          {Object.entries(PERMISSION_DETAILS).map(([key, { label, description, icon }]) => {
            const granted = hasPermission(key);

            return (
              <MyCol key={key} xs={24} md={12}>
                <Flex
                  vertical
                  gap={6}
                  style={{
                    height: "100%",
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: granted ? token.colorSuccessBg : token.colorFillTertiary,
                    border: `1px solid ${granted ? token.colorSuccessBorder : token.colorBorderSecondary}`,
                  }}
                >
                  <Flex align="center" gap={8}>
                    <span style={{ fontSize: 16, opacity: granted ? 1 : 0.5 }}>{icon}</span>
                    <MyText
                      strong
                      style={{ fontSize: 13.5, color: granted ? token.colorSuccessText : token.colorTextTertiary }}
                    >
                      {label}
                    </MyText>
                    <span style={{ fontSize: 13 }}>{granted ? "✅" : "❌"}</span>
                  </Flex>

                  <MyText type="secondary" style={{ fontSize: 12.5, color: granted ? undefined : token.colorTextTertiary }}>
                    {granted ? description : "Not assigned — contact your Super Admin."}
                  </MyText>
                </Flex>
              </MyCol>
            );
          })}
        </MyRow>
      </MyCard>
    </Flex>
  );
}
