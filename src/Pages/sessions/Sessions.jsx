import useSessionStore from "../../store/useSessionStore";
import { getSessionStatus } from "../../utils/sessionUtils";
import { theme, Flex, message } from "antd";
import { useState, useEffect } from "react";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyButtonPrimary from "../../MyComponents/myButton/MyButtonPrimary";
import SessionsTable from "../../MyComponents/sessionsTable/SessionsTable";
import NewSessionModal from "../../MyComponents/sessionsTable/NewSessionModal";
import { PlusCircleOutlined } from "@ant-design/icons";

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
  const addSession = useSessionStore((state) => state.addSession);
  //هاد بيجيب الدالة اللي بتبعت الـ API request
  const fetchSessions = useSessionStore((state) => state.fetchSessions);

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === "ALL") return true;
    return getSessionStatus(session) === activeFilter;
  });

  const handleCreateSession = (fields) => {
    addSession(fields);
    setIsModalOpen(false);
    message.success(`"${fields.sessionTitle}" was created as a draft.`);
  };

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <Flex vertical gap={4}>
          <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
            Sessions Management
          </MyTitle>
          <MyText type="secondary">
            Create, schedule and monitor exam sessions.
          </MyText>
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

      <SessionsTable sessions={filteredSessions} />

      <NewSessionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSession}
      />
    </Flex>
  );
}
