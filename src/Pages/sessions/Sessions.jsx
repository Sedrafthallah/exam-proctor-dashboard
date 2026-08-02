import useSessionStore from "../../store/useSessionStore";
import { getSessionStatus } from "../../utils/sessionUtils";
import { theme, Flex } from "antd";
import { useState, useEffect } from "react";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";
import SessionsTable from "../../MyComponents/sessionsTable/SessionsTable";
import NewSessionModal from "../../MyComponents/sessionsTable/NewSessionModal";
import { PlusCircleOutlined, CalendarOutlined } from "@ant-design/icons";

export default function Sessions() {
  const FILTERS = [
    "ALL",
    "DRAFT",
    "SCHEDULED",
    "LOCKED",
    "ACTIVE",
    "GRACE",
    "CLOSED",
    "ARCHIVED",
  ];
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = theme.useToken();
  //"أعطيني sessions من الـ store" — وكل مرة sessions بتتغير بالـ store، الكومبوننت بيتحدث تلقائياً.
  const sessions = useSessionStore((state) => state.sessions);
  const createSessionApi = useSessionStore((state) => state.createSessionApi);
  //هاد بيجيب الدالة اللي بتبعت الـ API request
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const extendSessionTimeApi = useSessionStore(
    (state) => state.extendSessionTimeApi,
  );

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === "ALL") return true;
    return getSessionStatus(session) === activeFilter;
  });

  const handleCreateSession = async (fields) => {
    const success = await createSessionApi(fields);
    if (success) setIsModalOpen(false);
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              boxShadow: `0 6px 16px -6px ${token.colorPrimary}`,
              flexShrink: 0,
            }}
          >
            <CalendarOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Sessions Management
            </MyTitle>
            <MyText type="secondary">
              Create, schedule and monitor exam sessions.
            </MyText>
          </Flex>
        </Flex>
        <Flex gap={10}>
          <MyButtonPrimary
            icon={<PlusCircleOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Session
          </MyButtonPrimary>
        </Flex>
      </Flex>
      <Flex gap={10} wrap="wrap">
        {FILTERS.map((filter) => (
          <MyButtonPrimary
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              backgroundColor:
                activeFilter === filter
                  ? token.colorPrimary
                  : token.colorBgContainer,
              borderColor:
                activeFilter === filter ? token.colorPrimary : undefined,
              color:
                activeFilter === filter
                  ? token.colorText
                  : token.colorTextSecondary,
            }}
          >
            {filter}
          </MyButtonPrimary>
        ))}
      </Flex>

      {/* <SessionsTable sessions={filteredSessions} /> */}
      <SessionsTable
        sessions={filteredSessions}
        onExtendTime={extendSessionTimeApi}
      />

      <NewSessionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSession}
      />
    </Flex>
  );
}
