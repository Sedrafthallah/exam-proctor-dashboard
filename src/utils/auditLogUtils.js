export const AUDIT_ACTION_CONFIG = {
  SESSION_PUBLISHED: { color: "blue" },
  BANK_LOCKED: { color: "purple" },
  BANK_AUTO_LOCKED: { color: "default" },
  SESSION_TERMINATED: { color: "red" },
  ADMIN_CREATED: { color: "green" },
  ADMIN_DISABLED: { color: "red" },
  ROSTER_IMPORTED: { color: "orange" },
  SESSION_EDITED: { color: "blue" },
  EXPORTED: { color: "green" },
  QUESTIONS_AUTHORED: { color: "purple" },
};

export function getActionColor(type) {
  return AUDIT_ACTION_CONFIG[type]?.color ?? "default";
}

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "2m ago" / "3h ago" / "yesterday" / "3 days ago" — matches the compact
// relative timestamps used throughout the log feed.
export function formatRelativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();

  if (diff < HOUR) return `${Math.max(1, Math.floor(diff / MINUTE))}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY) return "yesterday";
  return `${Math.floor(diff / DAY)} days ago`;
}
