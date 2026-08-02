import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme, Flex, Tag, Button, Popconfirm, message } from "antd";
import { CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MyCard from "../myCard/MyCard";
import MyText from "../myText/MyText";
import MyTable from "../mytable/MyTable";
import EditSessionModal from "./EditSessionModal";
import ExtendTimeModal from "./ExtendTimeModal";
import EditRosterModal from "./EditRosterModal";
import useSessionStore from "../../store/useSessionStore";
import useAuthStore from "../../store/useAuthStore";
import { getSessionStatus, getStatusConfig } from "../../utils/sessionUtils";

function SessionActions({
  session,
  status,
  isSuperAdmin,
  hasPermission,
  onOpenSession,
  onOpenExtend,
  onPublish,
  onDelete,
  onOverride,
  onTerminate,
  onEditRoster,
  onExport,
}) {
  if (status === "DRAFT") {
    return (
      <Flex gap={8} wrap="wrap">
        <Button size="small" onClick={() => onOpenSession(session)}>
          Edit
        </Button>
        <Button size="small" type="primary" onClick={() => onPublish(session)}>
          Publish
        </Button>
        <Popconfirm
          title="Delete this draft session?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(session)}
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Flex>
    );
  }

  if (status === "SCHEDULED") {
    return (
      <Flex gap={8} wrap="wrap">
        <Button size="small" onClick={() => onOpenSession(session)}>
          View
        </Button>
        <Button size="small" onClick={() => onEditRoster(session)}>
          Edit Roster
        </Button>
      </Flex>
    );
  }

  if (status === "LOCKED") {
    // After override — show edit options
    if (session.emergencyOverride) {
      return (
        <Flex gap={8} wrap="wrap">
          <Button size="small" onClick={() => onEditRoster(session)}>
            Edit Roster
          </Button>
          <Button size="small" onClick={() => onOpenSession(session)}>
            View
          </Button>
        </Flex>
      );
    }

    // Normal LOCKED — Super Admin can trigger override
    return (
      <Flex gap={8} wrap="wrap">
        {isSuperAdmin && (
          <Popconfirm
            title="Emergency override?"
            description="Unlocks proctor/roster edits despite the T-24h lock."
            okText="Override"
            onConfirm={() => onOverride(session)}
          >
            <Button size="small">Emergency Override</Button>
          </Popconfirm>
        )}
        <Button size="small" onClick={() => onOpenSession(session)}>
          View
        </Button>
      </Flex>
    );
  }

  if (status === "ACTIVE" || status === "GRACE") {
    return (
      <Flex gap={8} wrap="wrap">
        {isSuperAdmin && (
          <Button size="small" onClick={() => onOpenExtend(session)}>
            Extend Time
          </Button>
        )}
        {!isSuperAdmin && hasPermission("P04") && (
          <Popconfirm
            title="Terminate this session now?"
            okText="Terminate"
            okButtonProps={{ danger: true }}
            onConfirm={() => onTerminate(session)}
          >
            <Button size="small" danger>
              Terminate
            </Button>
          </Popconfirm>
        )}
        <Button size="small" onClick={() => onOpenSession(session)}>
          View
        </Button>
      </Flex>
    );
  }

  if (status === "CLOSED") {
    const canExport = isSuperAdmin || hasPermission("P06");

    if (!canExport) {
      return (
        <Button size="small" onClick={() => onOpenSession(session)}>
          View
        </Button>
      );
    }

    return (
      <Flex gap={8} wrap="wrap">
        <Button size="small" onClick={() => onExport(session)}>
          Export
        </Button>
      </Flex>
    );
  }

  return (
    <Button size="small" onClick={() => onOpenSession(session)}>
      View
    </Button>
  );
}

export default function SessionsTable({ sessions }) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [openSession, setOpenSession] = useState(null);
  const [extendingSession, setExtendingSession] = useState(null);
  const [rosterSession, setRosterSession] = useState(null);

  const currentUser = useAuthStore((state) => state.user);
  const updateSession = useSessionStore((state) => state.updateSession);
  const deleteSessionApi = useSessionStore((state) => state.deleteSessionApi);
  const publishSessionApi = useSessionStore((state) => state.publishSessionApi);
  const emergencyOverrideSession = useSessionStore(
    (state) => state.emergencyOverrideSession,
  );
  const extendSessionTimeApi = useSessionStore(
    (state) => state.extendSessionTimeApi,
  );
  const terminateSession = useSessionStore((state) => state.terminateSession);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const hasPermission = (perm) =>
    isSuperAdmin || currentUser?.permissions?.[perm] === true;

  const handleSaveSession = (sessionId, fields) => {
    updateSession(sessionId, fields);
    setOpenSession(null);
    message.success("Session updated.");
  };

  const handlePublish = async (session) => {
    await publishSessionApi(session.id);
  };

  const handleDelete = async (session) => {
    await deleteSessionApi(session.id);
  };

  const handleOverride = (session) => {
    emergencyOverrideSession(session.id);
    message.success(`Emergency override applied to "${session.sessionTitle}".`);
  };

  const handleExtend = async (sessionId, extraMinutes) => {
    const success = await extendSessionTimeApi(sessionId, extraMinutes);

    if (success) {
      setExtendingSession(null);
    }
  };

  const handleTerminate = (session) => {
    terminateSession(session.id);
    message.success(`"${session.sessionTitle}" was terminated.`);
  };

  const handleSaveRoster = (sessionId, updates) => {
    updateSession(sessionId, updates);
    setRosterSession(null);
    message.success("Roster updated successfully.");
  };

  const columns = [
    {
      title: "Session",
      dataIndex: "sessionTitle",
      key: "sessionTitle",
      width: 220,
      render: (title) => (
        <MyText strong style={{ fontSize: 13.5 }}>
          {title}
        </MyText>
      ),
    },
    {
      title: "Course",
      dataIndex: "courseCode",
      key: "courseCode",
      width: 100,
      render: (code) => <MyText style={{ fontSize: 13 }}>{code}</MyText>,
    },
    {
      title: "Start time",
      dataIndex: "scheduledStartUTC",
      key: "scheduledStartUTC",
      width: 130,
      render: (value) => {
        const start = dayjs(value);
        return (
          <Flex vertical gap={0}>
            <MyText style={{ fontSize: 12.5 }}>
              {start.format("YYYY-MM-DD")}
            </MyText>
            <MyText type="secondary" style={{ fontSize: 12 }}>
              {start.format("HH:mm")}
            </MyText>
          </Flex>
        );
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 90,
      render: (duration) => (
        <MyText style={{ fontSize: 13 }}>{duration} min</MyText>
      ),
    },
    {
      title: "Students",
      dataIndex: "enrolledStudents",
      key: "enrolledStudents",
      align: "center",
      width: 90,
      render: (count) => (
        <MyText style={{ fontSize: 13 }}>{count > 0 ? count : "—"}</MyText>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, session) => {
        const status = getSessionStatus(session);
        const { color, label } = getStatusConfig(status);
        return (
          <Tag
            color={color}
            style={{
              borderRadius: 5,
              padding: "1px 8px",
              fontSize: 11,
              fontWeight: 600,
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 220,
      render: (_, session) => (
        <SessionActions
          session={session}
          status={getSessionStatus(session)}
          isSuperAdmin={isSuperAdmin}
          hasPermission={hasPermission}
          onOpenSession={setOpenSession}
          onOpenExtend={setExtendingSession}
          onPublish={handlePublish}
          onDelete={handleDelete}
          onOverride={handleOverride}
          onTerminate={handleTerminate}
          onEditRoster={(s) => setRosterSession(s)}
          onExport={(s) => navigate(`/reports?sessionId=${s.id}`)}
        />
      ),
    },
  ];

  return (
    <MyCard
      title={
        <Flex align="center" gap={8} wrap="wrap">
          <CalendarOutlined
            style={{ fontSize: 16, color: token.colorPrimary }}
          />
          <MyText strong>Exam Sessions</MyText>
        </Flex>
      }
      style={{
        borderRadius: 14,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <MyTable
        columns={columns}
        dataSource={sessions}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No sessions in this filter" }}
      />

      <EditSessionModal
        open={!!openSession}
        session={openSession}
        status={openSession ? getSessionStatus(openSession) : null}
        onClose={() => setOpenSession(null)}
        onSave={handleSaveSession}
      />

      <ExtendTimeModal
        open={!!extendingSession}
        session={extendingSession}
        onClose={() => setExtendingSession(null)}
        onExtend={handleExtend}
      />

      <EditRosterModal
        open={!!rosterSession}
        session={rosterSession}
        onClose={() => setRosterSession(null)}
        onSave={handleSaveRoster}
      />
    </MyCard>
  );
}
