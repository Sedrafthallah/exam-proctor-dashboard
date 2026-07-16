import { create } from "zustand";

// Read-only response/submission data per session, keyed by session id. This
// is separate from useSessionStore (session config) because it models the
// exam attempts produced once a session closes — not the session itself.
// No manual/Short-Answer grading column: the project only ships MCQ
// auto-scoring, so "Auto Score" is the final score.
export const MOCK_RESPONSES = {
  "sess-001": [
    { id: "S-20301101", name: "Hana Yousef", submission: "SUBMITTED", identityMatch: 98, autoScore: 44, maxScore: 50, violations: 0 },
    { id: "S-20301102", name: "Khaled Nasser", submission: "SUBMITTED", identityMatch: 95, autoScore: 41, maxScore: 50, violations: 1 },
    { id: "S-20301103", name: "Rana Suleiman", submission: "AUTO-SUB", identityMatch: 93, autoScore: 36, maxScore: 50, violations: 3 },
    { id: "S-20301104", name: "Bilal Odeh", submission: "SUBMITTED", identityMatch: 99, autoScore: 47, maxScore: 50, violations: 0 },
    { id: "S-20301105", name: "Dina Karam", submission: "TERMINATED", identityMatch: null, autoScore: 12, maxScore: 50, violations: 6 },
    { id: "S-20301106", name: "Fadi Hamdan", submission: "SUBMITTED", identityMatch: 97, autoScore: 39, maxScore: 50, violations: 0 },
    { id: "S-20301107", name: "Mira Awad", submission: "SUBMITTED", identityMatch: 96, autoScore: 43, maxScore: 50, violations: 1 },
  ],
  "sess-006": [
    { id: "S-20201201", name: "Ziad Farouk", submission: "SUBMITTED", identityMatch: 94, autoScore: 33, maxScore: 40, violations: 0 },
    { id: "S-20201202", name: "Lina Barakat", submission: "SUBMITTED", identityMatch: 99, autoScore: 38, maxScore: 40, violations: 0 },
    { id: "S-20201203", name: "Samer Qasim", submission: "AUTO-SUB", identityMatch: 91, autoScore: 27, maxScore: 40, violations: 2 },
    { id: "S-20201204", name: "Noor Habash", submission: "SUBMITTED", identityMatch: 96, autoScore: 35, maxScore: 40, violations: 0 },
    { id: "S-20201205", name: "Ahmad Zayed", submission: "SUBMITTED", identityMatch: 92, autoScore: 30, maxScore: 40, violations: 1 },
    { id: "S-20201206", name: "Rula Nimer", submission: "TERMINATED", identityMatch: null, autoScore: 9, maxScore: 40, violations: 5 },
  ],
  "sess-007": [
    { id: "S-20211088", name: "Tarek Fares", submission: "SUBMITTED", identityMatch: 99, autoScore: 38, maxScore: 40, violations: 0 },
    { id: "S-20213302", name: "Nour Haidar", submission: "SUBMITTED", identityMatch: 97, autoScore: 35, maxScore: 40, violations: 0 },
    { id: "S-20210934", name: "Omar Khalil", submission: "AUTO-SUB", identityMatch: 96, autoScore: 31, maxScore: 40, violations: 2 },
    { id: "S-20209981", name: "Yousef Aziz", submission: "SUBMITTED", identityMatch: 98, autoScore: 40, maxScore: 40, violations: 0 },
    { id: "S-20211847", name: "Layla Mansour", submission: "TERMINATED", identityMatch: null, autoScore: 18, maxScore: 40, violations: 5 },
    { id: "S-20214112", name: "Sara Deeb", submission: "SUBMITTED", identityMatch: 96, autoScore: 37, maxScore: 40, violations: 1 },
    { id: "S-20212556", name: "Adam Rasheed", submission: "SUBMITTED", identityMatch: 94, autoScore: 34, maxScore: 40, violations: 0 },
  ],
  "sess-008": [
    { id: "S-20210451", name: "Maya Salameh", submission: "SUBMITTED", identityMatch: 97, autoScore: 40, maxScore: 45, violations: 0 },
    { id: "S-20210452", name: "Wael Antoun", submission: "SUBMITTED", identityMatch: 95, autoScore: 36, maxScore: 45, violations: 0 },
    { id: "S-20210453", name: "Reem Sabbagh", submission: "AUTO-SUB", identityMatch: 90, autoScore: 29, maxScore: 45, violations: 3 },
    { id: "S-20210454", name: "Karim Fakhoury", submission: "SUBMITTED", identityMatch: 98, autoScore: 42, maxScore: 45, violations: 0 },
    { id: "S-20210455", name: "Hala Mansour", submission: "SUBMITTED", identityMatch: 93, autoScore: 33, maxScore: 45, violations: 1 },
    { id: "S-20210456", name: "Jad Khoury", submission: "TERMINATED", identityMatch: null, autoScore: 15, maxScore: 45, violations: 4 },
  ],
};

const useReportsStore = create(() => ({
  responsesBySession: MOCK_RESPONSES,
}));

export function useSessionResponses(sessionId) {
  return useReportsStore((state) => state.responsesBySession[sessionId] ?? []);
}

export default useReportsStore;
