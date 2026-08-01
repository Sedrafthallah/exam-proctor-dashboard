export const BANK_STATUS_CONFIG = {
  DRAFT: { color: "default", label: "Draft" },
  LOCKED: { color: "warning", label: "Locked" },
  ARCHIVED: { color: "purple", label: "Archived" },
};

export function getStatusConfig(status) {
  const normalizedStatus = status ? status.trim().toUpperCase() : "";
  return (
    BANK_STATUS_CONFIG[normalizedStatus] ?? {
      color: "default",
      label: status || "Unknown",
    }
  );
}

// DRAFT → LOCKED happens automatically at T-24h before the bank's linked
// session start — no admin action, and no way back once locked. ARCHIVED is
// a separate, explicit flag set once a bank's exam cycle is fully over.
export function getBankStatus(bank) {
  if (bank.status) {
    return bank.status.toUpperCase();
  }

  if (bank.archived) {
    return "ARCHIVED";
  }

  if (bank.linkedSessionStartUTC) {
    const start = new Date(bank.linkedSessionStartUTC);
    const lockAt = new Date(start.getTime() - 24 * 60 * 60000);
    if (new Date() >= lockAt) {
      return "LOCKED";
    }
  }

  return "DRAFT";
}

export const QUESTION_TYPE_CONFIG = {
  MCQ_SINGLE: { label: "MCQ (Single)", color: "blue", autoGraded: true },
  MCQ_MULTI: { label: "MCQ (Multiple)", color: "geekblue", autoGraded: true },
  TRUE_FALSE: { label: "True / False", color: "cyan", autoGraded: true },
  SHORT_ANSWER: { label: "Short Answer", color: "orange", autoGraded: false },
  ESSAY: { label: "Essay", color: "gold", autoGraded: false },
};

export function getQuestionTypeConfig(type) {
  return (
    QUESTION_TYPE_CONFIG[type] ?? { label: type || "Unknown", color: "default", autoGraded: false }
  );
}

const CHOICE_TYPES = ["MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE"];

// Flags schema problems in parsed CSV rows (from parseQuestionsCSV) and
// cross-checks them against a bank's existing questions — plus each other —
// for duplicate question text. Rows with status "valid" are the ones safe
// to import; "duplicate"/"error" rows get silently skipped.
export function validateQuestionRows(rows, existingQuestions) {
  const existingTexts = new Set(existingQuestions.map((q) => q.text.trim().toLowerCase()));
  const seenInFile = new Set();

  return rows.map((row, index) => {
    const errors = [];
    const isChoiceType = CHOICE_TYPES.includes(row.type);

    if (!row.question.trim()) errors.push("Missing question text");
    if (!QUESTION_TYPE_CONFIG[row.type]) errors.push(`unknown type "${row.type}"`);
    if (isChoiceType && row.type !== "TRUE_FALSE" && row.options.length < 2) {
      errors.push("needs at least 2 options");
    }
    if (isChoiceType && row.correctAnswer && !row.options.includes(row.correctAnswer)) {
      errors.push(`invalid correct_answer "${row.correctAnswer}" for type ${row.type} — must match an option`);
    }
    if (isChoiceType && !row.correctAnswer) errors.push("missing correct answer");

    const normalizedText = row.question.trim().toLowerCase();
    const isDuplicate = normalizedText && (existingTexts.has(normalizedText) || seenInFile.has(normalizedText));
    seenInFile.add(normalizedText);

    let status = "valid";
    if (errors.length > 0) status = "error";
    else if (isDuplicate) status = "duplicate";

    return { ...row, rowId: row.id || `row-${index + 1}`, rowNumber: index + 1, status, errors };
  });
}
