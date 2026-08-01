import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

export const INITIAL_QUESTION_BANKS = [
  {
    code: "QB-2025-CS301",
    title: "CS301 Question Bank",
    courseCode: "CS301",
    createdBy: "Dr. Lina Abbas",
    createdAt: "2026-06-01T09:00:00Z",
    version: 1,
    linkedSessionId: null, // not assigned to an exam yet → stays DRAFT
    linkedSessionStartUTC: null,
    archived: false,
    questions: [
      {
        id: "Q001",
        type: "MCQ_SINGLE",
        text: "Which data structure uses LIFO ordering?",
        options: ["Queue", "Stack", "Heap", "Graph"],
        correctAnswer: "Stack",
        marks: 2,
      },
      {
        id: "Q002",
        type: "TRUE_FALSE",
        text: "A balanced BST guarantees O(log n) search.",
        options: ["True", "False"],
        correctAnswer: "True",
        marks: 1,
      },
      {
        id: "Q003",
        type: "MCQ_MULTI",
        text: "Which of the following are sorting algorithms?",
        options: ["Quick sort", "Dijkstra", "Merge sort", "Breadth-first search"],
        correctAnswer: ["Quick sort", "Merge sort"],
        marks: 2,
      },
      {
        id: "Q004",
        type: "SHORT_ANSWER",
        text: "Explain the difference between BFS and DFS.",
        options: [],
        correctAnswer: null,
        marks: 5,
      },
      {
        id: "Q005",
        type: "ESSAY",
        text: "Discuss the trade-offs between arrays and linked lists.",
        options: [],
        correctAnswer: null,
        marks: 10,
      },
    ],
  },
  {
    code: "QB-2025-NET410",
    title: "NET410 Question Bank",
    courseCode: "NET410",
    createdBy: "Dr. Lina Abbas",
    createdAt: "2026-05-10T09:00:00Z",
    version: 2,
    linkedSessionId: "sess-003", // NET410 Quiz 3 — matches useSessionStore
    linkedSessionStartUTC: "2026-07-06T14:00:00Z", // within T-24h of the session → LOCKED
    archived: false,
    questions: [
      {
        id: "Q001",
        type: "MCQ_SINGLE",
        text: "What is the default subnet mask for a Class C network?",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
        correctAnswer: "255.255.255.0",
        marks: 2,
      },
      {
        id: "Q002",
        type: "TRUE_FALSE",
        text: "TCP is a connectionless protocol.",
        options: ["True", "False"],
        correctAnswer: "False",
        marks: 1,
      },
      {
        id: "Q003",
        type: "MCQ_SINGLE",
        text: "Which layer of the OSI model handles routing?",
        options: ["Physical", "Data Link", "Network", "Transport"],
        correctAnswer: "Network",
        marks: 2,
      },
      {
        id: "Q004",
        type: "ESSAY",
        text: "Compare and contrast IPv4 and IPv6 addressing.",
        options: [],
        correctAnswer: null,
        marks: 10,
      },
    ],
  },
  {
    code: "QB-2024-CS201",
    title: "CS201 Question Bank",
    courseCode: "CS201",
    createdBy: "Prof. Maher Saleh",
    createdAt: "2024-11-01T09:00:00Z",
    version: 3,
    linkedSessionId: "sess-006", // CS201 Spring 2024 — matches useSessionStore
    linkedSessionStartUTC: "2024-12-10T08:00:00Z",
    archived: true, // exam cycle over → ARCHIVED
    questions: [
      {
        id: "Q001",
        type: "MCQ_SINGLE",
        text: "Which keyword declares a constant in most C-family languages?",
        options: ["var", "let", "const", "static"],
        correctAnswer: "const",
        marks: 1,
      },
      {
        id: "Q002",
        type: "TRUE_FALSE",
        text: "Recursion always uses less memory than iteration.",
        options: ["True", "False"],
        correctAnswer: "False",
        marks: 1,
      },
      {
        id: "Q003",
        type: "SHORT_ANSWER",
        text: "Define time complexity in your own words.",
        options: [],
        correctAnswer: null,
        marks: 3,
      },
    ],
  },
];

const useQuestionBankStore = create((set, get) => ({
  questionBanks: INITIAL_QUESTION_BANKS,
  loading: false,
  uploading: false,
  selectedBankDetail: null,
  detailLoading: false,

  fetchQuestionBanks: async () => {
    set({ loading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch("/api/question-banks", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch question banks");
      }

      const banks = json.data.map((b) => ({
        id: String(b.id),
        code: `QB-${b.id}`,
        title: b.title,
        courseTag: b.courseCode,
        status: b.status === "Published" ? "LOCKED" : b.status.toUpperCase(),
        version: b.version,
        questionCount: b.questionCount,
        lockedAt: b.lockedAt ?? null,
        createdAt: b.createdAt,
      }));

      set({ questionBanks: banks, loading: false });
    } catch (err) {
      console.error("fetchQuestionBanks error:", err);
      set({ loading: false });
    }
  },

  fetchQuestionBankById: async (id) => {
    set({ detailLoading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const res = await apiFetch(`/api/question-banks/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to fetch bank details.");
        set({ detailLoading: false });
        return null;
      }

      const b = json.data;

      const bank = {
        id: String(b.id),
        title: b.title,
        courseTag: b.courseCode,
        status: b.status === "Published" ? "LOCKED" : b.status.toUpperCase(),
        version: b.version,
        randomization: b.randomization,
        optionShuffle: b.optionShuffle,
        lockedAt: b.lockedAt ?? null,
        createdAt: b.createdAt,
        questions: b.questions.map((q) => ({
          id: String(q.id),
          type: q.type,
          questionText: q.questionText,
          marks: q.marks,
          optionA: q.optionA ?? null,
          optionB: q.optionB ?? null,
          optionC: q.optionC ?? null,
          optionD: q.optionD ?? null,
          optionE: q.optionE ?? null,
          correctAnswer: q.correctAnswer,
        })),
      };

      set({ selectedBankDetail: bank, detailLoading: false });
      return bank;
    } catch (err) {
      console.error("fetchQuestionBankById error:", err);
      set({ detailLoading: false });
      return null;
    }
  },

  uploadQuestionBankApi: async (file) => {
    set({ uploading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/question-banks/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || (json.statusCode !== 200 && json.statusCode !== 201)) {
        message.error(json.message || "Failed to upload question bank.");
        set({ uploading: false });
        return false;
      }

      message.success("Question bank uploaded successfully.");

      await get().fetchQuestionBanks();

      set({ uploading: false });
      return true;
    } catch (err) {
      console.error("uploadQuestionBankApi error:", err);
      message.error("Network error.");
      set({ uploading: false });
      return false;
    }
  },

  // Creates a new question bank from parsed CSV rows — used both by the
  // Question Banks page's "Upload File" shortcut and a session's question
  // bank field when set via "Upload CSV" instead of picking an existing bank.
  createBankFromCsv: (
    questions,
    { title, courseCode, linkedSessionId = null, linkedSessionStartUTC = null } = {},
  ) => {
    const currentUser = useAuthStore.getState().user;
    const code = `QB-${Date.now()}`;
    const bank = {
      code,
      title: title || code,
      courseCode: courseCode || null,
      createdBy: currentUser?.name || "Unknown",
      createdAt: new Date().toISOString(),
      version: 1,
      linkedSessionId,
      linkedSessionStartUTC,
      archived: false,
      questions: questions.map((q, index) => ({ id: q.id || `Q${Date.now()}-${index}`, ...q })),
    };

    set((state) => ({ questionBanks: [...state.questionBanks, bank] }));

    return bank;
  },

  deleteBank: (code) =>
    set((state) => ({
      questionBanks: state.questionBanks.filter((b) => b.code !== code),
    })),
}));

export default useQuestionBankStore;
