import { create } from "zustand";

export const INITIAL_QUESTION_BANKS = [
  { code: "QB-2025-CS301", title: "CS301 Question Bank", courseCode: "CS301", questionCount: 120 },
  { code: "QB-2025-DB202", title: "DB202 Question Bank", courseCode: "DB202", questionCount: 80 },
  { code: "QB-2025-NET410", title: "NET410 Question Bank", courseCode: "NET410", questionCount: 60 },
  { code: "QB-2025-AI501", title: "AI501 Question Bank", courseCode: "AI501", questionCount: 45 },
  { code: "QB-2024-CS201", title: "CS201 Question Bank", courseCode: "CS201", questionCount: 95 },
];

const useQuestionBankStore = create((set) => ({
  questionBanks: INITIAL_QUESTION_BANKS,

  // Creates a new question bank from parsed CSV rows — used when a session's
  // question bank field is set via "Upload CSV" instead of picking an
  // existing bank.
  createBankFromCsv: (questions, { title, courseCode }) => {
    const code = `QB-${Date.now()}`;
    const bank = {
      code,
      title: title || code,
      courseCode: courseCode || null,
      questionCount: questions.length,
      questions,
    };

    set((state) => ({ questionBanks: [...state.questionBanks, bank] }));

    return bank;
  },
}));

export default useQuestionBankStore;
