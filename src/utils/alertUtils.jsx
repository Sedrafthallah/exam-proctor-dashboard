import {
  EyeInvisibleOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  SwapOutlined,
  SoundOutlined,
  DisconnectOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

export const ALERT_TYPE_CONFIG = {
  GAZE_DEVIATION: {
    label: "Gaze Deviation",
    description: "Eyes off-screen beyond threshold",
    color: "#eab308",
    icon: <EyeInvisibleOutlined />,
    severity: "WARNING",
  },
  FACE_ABSENCE: {
    label: "Face Absence",
    description: "No face detected in camera frame",
    color: "#ef4444",
    icon: <UserDeleteOutlined />,
    severity: "CRITICAL",
  },
  MULTIPLE_FACES: {
    label: "Multiple Faces",
    description: "More than one face detected",
    color: "#ef4444",
    icon: <TeamOutlined />,
    severity: "CRITICAL",
  },
  APP_SWITCH: {
    label: "App Switch",
    description: "Switched to another application or window",
    color: "#f97316",
    icon: <SwapOutlined />,
    severity: "WARNING",
  },
  AUDIO_THRESHOLD: {
    label: "Audio Threshold",
    description: "Ambient audio exceeded the allowed threshold",
    color: "#3b82f6",
    icon: <SoundOutlined />,
    severity: "WARNING",
  },
  CONNECTIVITY_LOST: {
    label: "Connectivity Lost",
    description: "Student's connection dropped during the exam",
    color: "#64748b",
    icon: <DisconnectOutlined />,
    severity: "WARNING",
  },
};

export const DEFAULT_ALERT_TYPE_CONFIG = {
  label: "Unknown Alert",
  description: "Unrecognized alert type",
  color: "#64748b",
  icon: <QuestionCircleOutlined />,
  severity: "WARNING",
};

export const ALERT_STATUS_CONFIG = {
  OPEN: { status: "processing", color: "blue", label: "Open" },
  RESOLVED: { status: "success", color: "green", label: "Resolved" },
  ESCALATED: { status: "error", color: "red", label: "Escalated" },
};
