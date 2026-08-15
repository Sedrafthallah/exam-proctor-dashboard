import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Syria does not observe DST (abolished 2022) and is fixed at UTC+3 year-round.
// Hardcoding the offset in minutes — rather than relying on a named IANA zone like
// "Asia/Damascus" — sidesteps any possibility of a stale/incorrect timezone database
// on the viewer's own device, which is what caused this bug in the first place.
const INSTITUTION_UTC_OFFSET_MINUTES = 180;

export function toInstitutionTime(value) {
  return dayjs(value).utc().utcOffset(INSTITUTION_UTC_OFFSET_MINUTES);
}

export const SESSION_STATUS_CONFIG = {
  DRAFT: { color: "default", label: "Draft" },
  SCHEDULED: { color: "blue", label: "Scheduled" },
  LOCKED: { color: "warning", label: "Locked" },
  ACTIVE: { color: "success", label: "Active" },
  GRACE: { color: "magenta", label: "Grace Period" },
  CLOSED: { color: "error", label: "Closed" },
  ARCHIVED: { color: "purple", label: "Archived" },
};

export function getStatusConfig(status) {
  const normalizedStatus = status ? status.trim().toUpperCase() : "";
  return (
    SESSION_STATUS_CONFIG[normalizedStatus] ?? {
      color: "default",
      label: status || "Unknown",
    }
  );
}

// Backend is the source of truth for status; this time-based calculation is
// only a fallback for a session built locally before the backend has
// assigned one (e.g. optimistic local state), not for already-fetched
// sessions.
export function getSessionStatus(session) {
  const now = new Date();
  const start = new Date(session.scheduledStartUTC);
  const end = new Date(start.getTime() + session.duration * 60000);
  const grace = new Date(end.getTime() + session.gracePeriod * 60000);
  const lockTime = new Date(start.getTime() - 24 * 60 * 60000);

  if (session.archived) {
    return "ARCHIVED";
  }
  // A proctor force-closed the session early — it skips straight to CLOSED
  // regardless of the scheduled end time.
  if (session.forceClosed) {
    return "CLOSED";
  }
  if (now >= grace) {
    return "CLOSED";
  }
  if (now >= end) {
    return "GRACE";
  }
  if (now >= start) {
    return "ACTIVE";
  }
  if (now >= lockTime) {
    // A Super Admin emergency override drops the session back to SCHEDULED
    // rules (proctor/roster editable) during the T-24h lock window.
    return "LOCKED";
  }
  if (session.published) return "SCHEDULED";
  return "DRAFT";
}

// Prefers the real backend status; falls back to the time-based calculation
// only when status is genuinely missing (e.g. a session object built
// optimistically before the backend has assigned one).
export function sessionStatus(session) {
  return session.status ?? getSessionStatus(session);
}

// Field-level edit permissions, keyed by the session's current lifecycle status.
// DRAFT: everything is editable. SCHEDULED: only proctor and roster changes.
// LOCKED/ACTIVE/CLOSED/ARCHIVED: no field is admin-editable through this form
// (see the dedicated Super Admin / proctor actions on the sessions table instead).
const EDITABLE_FIELDS_BY_STATUS = {
  DRAFT: null, // null = all fields
  SCHEDULED: ["proctor", "roster"],
};

export function isEditable(field, status) {
  const allowedFields = EDITABLE_FIELDS_BY_STATUS[status];
  if (status === "DRAFT") return true;
  if (!allowedFields) return false;
  return allowedFields.includes(field);
}
