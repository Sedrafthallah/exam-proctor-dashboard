import { create } from "zustand";

const MIN = 60000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

export const INITIAL_AUDIT_LOGS = [
  {
    id: "log-001",
    actor: "Sedra Fathallah",
    action: "published session",
    target: "AI501 Final Project",
    type: "SESSION_PUBLISHED",
    timestamp: new Date(now - 2 * MIN).toISOString(),
  },
  {
    id: "log-002",
    actor: "Dr. Lina Abbas",
    action: "locked question bank",
    target: "QB-2025-NET410 · v2",
    type: "BANK_LOCKED",
    timestamp: new Date(now - 18 * MIN).toISOString(),
  },
  {
    id: "log-003",
    actor: "Fadi Nasser",
    action: "terminated student session",
    target: "S-20211847 · NET410 Quiz 3",
    type: "SESSION_TERMINATED",
    timestamp: new Date(now - 32 * MIN).toISOString(),
  },
  {
    id: "log-004",
    actor: "Sedra Fathallah",
    action: "created admin account",
    target: "yara.tannous@vu.edu",
    type: "ADMIN_CREATED",
    timestamp: new Date(now - 1 * HOUR).toISOString(),
  },
  {
    id: "log-005",
    actor: "Yara Tannous",
    action: "imported roster CSV",
    target: "88 students · DB202",
    type: "ROSTER_IMPORTED",
    timestamp: new Date(now - 2 * HOUR).toISOString(),
  },
  {
    id: "log-006",
    actor: "Prof. Maher Saleh",
    action: "edited session schedule",
    target: "DB202 Midterm",
    type: "SESSION_EDITED",
    timestamp: new Date(now - 3 * HOUR).toISOString(),
  },
  {
    id: "log-007",
    actor: "Sedra Fathallah",
    action: "exported grading package",
    target: "CS301 Final",
    type: "EXPORTED",
    timestamp: new Date(now - 5 * HOUR).toISOString(),
  },
  {
    id: "log-008",
    actor: "Dr. Lina Abbas",
    action: "authored 8 questions",
    target: "QB-2025-CS301",
    type: "QUESTIONS_AUTHORED",
    timestamp: new Date(now - DAY).toISOString(),
  },
  {
    id: "log-009",
    actor: "System",
    action: "auto-locked question bank (T-24h)",
    target: "QB-2025-NET410 · v2",
    type: "BANK_AUTO_LOCKED",
    timestamp: new Date(now - 2 * DAY).toISOString(),
  },
  {
    id: "log-010",
    actor: "Fadi Nasser",
    action: "disabled admin account",
    target: "Yara Tannous",
    type: "ADMIN_DISABLED",
    timestamp: new Date(now - 3 * DAY).toISOString(),
  },
];

const useAuditLogStore = create(() => ({
  logs: INITIAL_AUDIT_LOGS,
}));

export default useAuditLogStore;
