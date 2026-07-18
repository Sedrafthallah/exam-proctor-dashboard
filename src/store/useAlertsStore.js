import { create } from "zustand";
import dayjs from "dayjs";

// Alert types per the SRS monitoring spec. Connectivity Lost and Kiosk
// Warning are intentionally excluded — they aren't monitoring alerts.
export const MOCK_ALERTS = [
  {
    id: "AL-001",
    type: "MULTIPLE_FACES",
    studentName: "Layla Mansour",
    studentId: "S-20211847",
    sessionTitle: "CS301 Final — Spring 2025",
    timestamp: dayjs().subtract(2, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-002",
    type: "APP_SWITCH",
    studentName: "Layla Mansour",
    studentId: "S-20211847",
    sessionTitle: "CS301 Final — Spring 2025",
    timestamp: dayjs().subtract(5, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-003",
    type: "GAZE_DEVIATION",
    studentName: "Omar Khalil",
    studentId: "S-20210934",
    sessionTitle: "MTH120 Final Exam",
    timestamp: dayjs().subtract(8, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-004",
    type: "FACE_ABSENCE",
    studentName: "Karim Nseir",
    studentId: "S-20211205",
    sessionTitle: "DB202 Midterm",
    timestamp: dayjs().subtract(12, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-005",
    type: "AUDIO_THRESHOLD",
    studentName: "Sara Deeb",
    studentId: "S-20214112",
    sessionTitle: "MTH120 Final Exam",
    timestamp: dayjs().subtract(18, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-006",
    type: "GAZE_DEVIATION",
    studentName: "Yousef Aziz",
    studentId: "S-20209981",
    sessionTitle: "MTH120 Final Exam",
    timestamp: dayjs().subtract(25, "minute").toISOString(),
    status: "RESOLVED",
  },
  {
    id: "AL-007",
    type: "MULTIPLE_FACES",
    studentName: "Tarek Fares",
    studentId: "S-20211088",
    sessionTitle: "MTH120 Final Exam",
    timestamp: dayjs().subtract(34, "minute").toISOString(),
    status: "RESOLVED",
  },
  {
    id: "AL-008",
    type: "APP_SWITCH",
    studentName: "Nour Haidar",
    studentId: "S-20213302",
    sessionTitle: "MTH120 Final Exam",
    timestamp: dayjs().subtract(41, "minute").toISOString(),
    status: "RESOLVED",
  },
  {
    id: "AL-009",
    type: "FACE_ABSENCE",
    studentName: "Rana Suleiman",
    studentId: "S-20301103",
    sessionTitle: "CS301 Final — Spring 2025",
    timestamp: dayjs().subtract(50, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-010",
    type: "AUDIO_THRESHOLD",
    studentName: "Bilal Odeh",
    studentId: "S-20301104",
    sessionTitle: "CS301 Final — Spring 2025",
    timestamp: dayjs().subtract(58, "minute").toISOString(),
    status: "ESCALATED",
  },
  {
    id: "AL-011",
    type: "APP_SWITCH",
    studentName: "Dima Suleiman",
    studentId: "S-20212876",
    sessionTitle: "DB202 Midterm",
    timestamp: dayjs().subtract(3, "minute").toISOString(),
    status: "OPEN",
  },
  {
    id: "AL-012",
    type: "MULTIPLE_FACES",
    studentName: "Bassel Rahal",
    studentId: "S-20210467",
    sessionTitle: "DB202 Midterm",
    timestamp: dayjs().subtract(10, "minute").toISOString(),
    status: "ESCALATED",
  },
];

// When backend is ready: swap this for a WebSocket subscription that pushes
// new alerts in and PATCHes status changes through to the server.
const useAlertsStore = create((set) => ({
  alerts: MOCK_ALERTS,

  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, status } : alert)),
    })),
}));

export default useAlertsStore;
