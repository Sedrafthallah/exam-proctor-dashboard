import { useState, useEffect } from "react";
import { theme, Flex, Badge, Segmented, Select, message } from "antd";
import {
  AlertOutlined,
  FireOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import MyTitle from "../../MyComponents/MyTitle/MyTitle";
import MyText from "../../MyComponents/myText/MyText";
import MyCard from "../../MyComponents/myCard/MyCard";
import MyRow from "../../MyComponents/myRow/MyRow";
import MyCol from "../../MyComponents/myCol/MyCol";
import AlertsTable from "../../MyComponents/alertsTable/AlertsTable";
import useAlertsStore from "../../store/useAlertsStore";
import useAuthStore from "../../store/useAuthStore";

const CRITICAL_TYPES = ["FACE_ABSENCE", "MULTIPLE_FACES"];
const WARNING_TYPES = ["GAZE_DEVIATION", "APP_SWITCH", "AUDIO_THRESHOLD"];

const STATUS_FILTERS = ["All", "Open", "Resolved", "Escalated"];

const TYPE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "GAZE_DEVIATION", label: "Gaze Deviation" },
  { value: "FACE_ABSENCE", label: "Face Absence" },
  { value: "MULTIPLE_FACES", label: "Multiple Faces" },
  { value: "APP_SWITCH", label: "App Switch" },
  { value: "AUDIO_THRESHOLD", label: "Audio Threshold" },
];

function StatCard({ icon, color, bg, value, label, token }) {
  return (
    <MyCard
      styles={{ body: { padding: "17px 18px" } }}
      style={{
        borderRadius: token.borderRadius,
        boxShadow: token.boxShadow,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
      }}
    >
      <Flex align="center" gap={12}>
        <Flex
          align="center"
          justify="center"
          style={{ width: 38, height: 38, borderRadius: 10, background: bg, color, fontSize: 18, flexShrink: 0 }}
        >
          {icon}
        </Flex>
        <Flex vertical gap={0}>
          <MyText style={{ fontSize: 26, fontWeight: 600, color: token.colorText, lineHeight: 1 }}>
            {value}
          </MyText>
          <MyText type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>
            {label}
          </MyText>
        </Flex>
      </Flex>
    </MyCard>
  );
}

export default function Alerts() {
  const { token } = theme.useToken();
  const alerts = useAlertsStore((state) => state.alerts);
  const updateAlertStatus = useAlertsStore((state) => state.updateAlertStatus);
  const fetchAlerts = useAlertsStore((state) => state.fetchAlerts);
  const fetchOpenAlerts = useAlertsStore((state) => state.fetchOpenAlerts);
  const fetchResolvedAlerts = useAlertsStore((state) => state.fetchResolvedAlerts);
  const fetchEscalatedAlerts = useAlertsStore((state) => state.fetchEscalatedAlerts);
  const fetchAlertsByType = useAlertsStore((state) => state.fetchAlertsByType);
  const currentUser = useAuthStore((state) => state.user);

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const status = statusFilter.toUpperCase();
    if (status === "OPEN") fetchOpenAlerts();
    else if (status === "RESOLVED") fetchResolvedAlerts();
    else if (status === "ESCALATED") fetchEscalatedAlerts();
    else fetchAlerts(); // ALL
  }, [statusFilter]);

  useEffect(() => {
    if (typeFilter && typeFilter !== "ALL") {
      fetchAlertsByType(typeFilter);
    } else {
      fetchAlerts();
    }
  }, [typeFilter]);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const hasPermission = (perm) => isSuperAdmin || currentUser?.permissions?.[perm] === true;
  const canAct = isSuperAdmin || hasPermission("P04");

  const total = alerts.length;
  const critical = alerts.filter((a) => CRITICAL_TYPES.includes(a.type)).length;
  const warnings = alerts.filter((a) => WARNING_TYPES.includes(a.type)).length;
  const resolved = alerts.filter((a) => a.status === "RESOLVED").length;

  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter !== "All" && alert.status !== statusFilter.toUpperCase()) return false;
    if (typeFilter !== "ALL" && alert.type !== typeFilter) return false;
    return true;
  });

  const handleDismiss = (alert) => {
    updateAlertStatus(alert.id, "RESOLVED");
    message.success(`Alert dismissed for ${alert.studentName}.`);
  };

  const handleWarn = (alert) => {
    message.success(`Warning sent to ${alert.studentName}.`);
  };

  const handleEscalate = (alert) => {
    updateAlertStatus(alert.id, "ESCALATED");
    message.success(`Alert escalated for ${alert.studentName}.`);
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
            <AlertOutlined style={{ fontSize: 20, color: "#fff" }} />
          </Flex>
          <Flex vertical gap={2}>
            <MyTitle level={3} style={{ margin: 0, color: token.colorText }}>
              Alerts
            </MyTitle>
            <MyText type="secondary">
              Live proctoring alerts across all active and recent sessions.
            </MyText>
          </Flex>
        </Flex>
        <Flex align="center" gap={6}>
          <Badge status="processing" color={token.colorSuccess} />
          <MyText
            type="secondary"
            style={{ fontSize: 11, fontWeight: 500, fontFamily: "monospace" }}
          >
            WSS live
          </MyText>
        </Flex>
      </Flex>

      <MyRow gutter={[16, 16]}>
        <MyCol xs={24} sm={12} md={6}>
          <StatCard
            token={token}
            icon={<AlertOutlined />}
            color="rgb(108, 140, 255)"
            bg="rgba(47, 85, 212, 0.15)"
            value={total}
            label="Total (24h)"
          />
        </MyCol>
        <MyCol xs={24} sm={12} md={6}>
          <StatCard
            token={token}
            icon={<FireOutlined />}
            color="rgb(239, 68, 68)"
            bg="rgba(239, 68, 68, 0.13)"
            value={critical}
            label="Critical"
          />
        </MyCol>
        <MyCol xs={24} sm={12} md={6}>
          <StatCard
            token={token}
            icon={<WarningOutlined />}
            color="rgb(217,119,6)"
            bg="rgba(217,119,6,0.15)"
            value={warnings}
            label="Warnings"
          />
        </MyCol>
        <MyCol xs={24} sm={12} md={6}>
          <StatCard
            token={token}
            icon={<CheckCircleOutlined />}
            color="rgb(20, 184, 166)"
            bg="rgba(20, 184, 166, 0.15)"
            value={resolved}
            label="Resolved"
          />
        </MyCol>
      </MyRow>

      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Segmented
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTERS}
        />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_FILTER_OPTIONS}
          style={{ minWidth: 200 }}
        />
      </Flex>

      <AlertsTable
        alerts={filteredAlerts}
        canAct={canAct}
        onDismiss={handleDismiss}
        onWarn={handleWarn}
        onEscalate={handleEscalate}
      />
    </Flex>
  );
}
