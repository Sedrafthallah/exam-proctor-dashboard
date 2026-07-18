import { theme, Flex, Tag, Avatar, Badge } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyRow from "../myRow/MyRow";
import MyCol from "../myCol/MyCol";
import { getInitials } from "../usersTable/adminsData";
import { ALERT_TYPE_CONFIG } from "../../utils/alertUtils";

const STATUS_TAG = {
  ACTIVE: { color: "success", label: "ACTIVE" },
  PENDING_AUTH: { color: "warning", label: "PENDING AUTH" },
  TERMINATED: { color: "error", label: "TERMINATED" },
};

export default function StudentStatusGrid({ students }) {
  const { token } = theme.useToken();

  return (
    <MyRow gutter={[16, 16]}>
      {students.map((student) => {
        const statusTag = STATUS_TAG[student.status] ?? STATUS_TAG.ACTIVE;
        const latestAlertConfig = student.latestAlert
          ? ALERT_TYPE_CONFIG[student.latestAlert.type]
          : null;

        return (
          <MyCol key={student.id} xs={24} sm={12} xl={8}>
            <MyCard
              styles={{ body: { padding: 14 } }}
              style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorder}`,
                background: token.colorBgElevated,
                height: "100%",
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Flex align="center" gap={10}>
                  <Avatar size={34} style={{ background: token.colorPrimary, fontWeight: 600, fontSize: 12 }}>
                    {getInitials(student.name)}
                  </Avatar>
                  <Flex vertical gap={0}>
                    <MyText strong style={{ fontSize: 13.5 }}>
                      {student.name}
                    </MyText>
                    <MyText type="secondary" style={{ fontSize: 11.5 }}>
                      {student.id}
                    </MyText>
                  </Flex>
                </Flex>

                {student.alertCount > 0 && (
                  <Badge count={student.alertCount} color={token.colorError} />
                )}
              </Flex>

              <Flex justify="space-between" align="center" style={{ marginTop: 12 }}>
                <Tag color={statusTag.color} style={{ borderRadius: 5, margin: 0, fontSize: 11, fontWeight: 600 }}>
                  {statusTag.label}
                </Tag>
                <Flex align="center" gap={4}>
                  <ClockCircleOutlined style={{ fontSize: 11, color: token.colorTextTertiary }} />
                  <MyText type="secondary" style={{ fontSize: 11.5 }}>
                    {student.loginTime ? `Logged in ${student.loginTime}` : "Not logged in"}
                  </MyText>
                </Flex>
              </Flex>

              {latestAlertConfig && (
                <Flex
                  align="center"
                  gap={6}
                  style={{
                    marginTop: 10,
                    padding: "5px 8px",
                    borderRadius: 6,
                    background: `${latestAlertConfig.color}14`,
                  }}
                >
                  {latestAlertConfig.icon}
                  <MyText style={{ fontSize: 11.5, color: latestAlertConfig.color, fontWeight: 600 }}>
                    {latestAlertConfig.label}
                  </MyText>
                </Flex>
              )}
            </MyCard>
          </MyCol>
        );
      })}
    </MyRow>
  );
}
