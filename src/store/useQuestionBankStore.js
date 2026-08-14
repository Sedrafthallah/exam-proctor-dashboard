import { create } from "zustand";
import { message } from "antd";
import { apiFetch } from "../api/apiClient";
import useAuthStore from "./useAuthStore";

const useQuestionBankStore = create((set, get) => ({
  questionBanks: [],
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

  uploadQuestionBankApi: async (file, fields = {}) => {
    set({ uploading: true });
    try {
      const accessToken =
        useAuthStore.getState().accessToken ??
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("csvFile", file);
      formData.append("title", fields.title ?? "Untitled Bank");
      formData.append("courseCode", fields.courseCode ?? "");
      formData.append("version", fields.version ?? "1.0");

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
    {
      title,
      courseCode,
      linkedSessionId = null,
      linkedSessionStartUTC = null,
    } = {},
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
      questions: questions.map((q, index) => ({
        id: q.id || `Q${Date.now()}-${index}`,
        ...q,
      })),
    };

    set((state) => ({ questionBanks: [...state.questionBanks, bank] }));

    return bank;
  },

  deleteQuestionBankApi: async (id) => {
    const accessToken =
      useAuthStore.getState().accessToken ?? sessionStorage.getItem("accessToken");

    try {
      const res = await apiFetch(`/api/question-banks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (!res.ok || json.statusCode !== 200) {
        message.error(json.message || "Failed to delete question bank.");
        return false;
      }

      set((state) => ({
        questionBanks: state.questionBanks.filter((b) => b.id !== id),
      }));

      message.success("Question bank deleted.");
      return true;
    } catch {
      message.error("Failed to delete question bank.");
      return false;
    }
  },
}));

export default useQuestionBankStore;
