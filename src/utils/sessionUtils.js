import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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

export function getSessionStatus(session) {
  const now = new Date();
  const start = new Date(session.scheduledStartUTC);
  const end = new Date(start.getTime() + session.duration * 60000);
  const grace = new Date(end.getTime() + session.gracePeriod * 60000);
  const lockTime = new Date(start.getTime() - 24 * 60 * 60000);

  if (session.archived) {
    return "ARCHIVED";
  }

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
    return "LOCKED";
  }
  if (session.published) return "SCHEDULED";
  return "DRAFT";
}

export function sessionStatus(session) {
  return session.status ?? getSessionStatus(session);
}

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
