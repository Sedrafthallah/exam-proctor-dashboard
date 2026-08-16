/** Stable copy for StreamWatchRejected.code (contract §6.3). */
export const STREAM_WATCH_REJECT_COPY = {
  NOT_AUTHORIZED: "You are not authorised to watch this student.",
  STUDENT_OFFLINE: "Student is not connected to the hub.",
  WATCH_IN_PROGRESS: "Another watch is already in progress for this student.",
  CAPACITY: "Session watch capacity was reached. Try again later.",
  STUDENT_NOT_IN_SESSION:
    "Join this exam session on the hub before requesting a watch.",
  INVALID_STATE: "This attempt is no longer live for watching.",
};

export function rejectMessage(code, fallback) {
  return STREAM_WATCH_REJECT_COPY[code] ?? fallback ?? "Unable to start watch.";
}
