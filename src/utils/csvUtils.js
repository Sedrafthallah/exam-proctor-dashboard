// Minimal dependency-free CSV parser: handles quoted fields ("a, b") and
// escaped quotes ("") inside them, comma-delimited, CRLF or LF line endings.
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function matchHeader(header, aliases) {
  const normalized = header.trim().toLowerCase();
  return Object.keys(aliases).find((field) => aliases[field].includes(normalized));
}

// Turns raw CSV rows into records keyed by the given alias map, e.g.
// { id: [...], name: [...] } -> { id: "S-001", name: "Layla Mansour" }.
function mapRowsToRecords(rows, aliases) {
  const [headerRow, ...dataRows] = rows;
  const fieldByColumn = headerRow.map((header) => matchHeader(header, aliases));

  return dataRows.map((row) => {
    const record = {};
    fieldByColumn.forEach((field, index) => {
      if (field) record[field] = (row[index] || "").trim();
    });
    return record;
  });
}

const STUDENT_HEADER_ALIASES = {
  id: ["id", "studentid", "student id", "student_id"],
  name: ["name", "fullname", "full name", "student", "student name"],
  email: ["email", "universityemail", "university email"],
};

// Parses a roster CSV into { id, name, email } records. Expects a header row
// with columns matching (in any order/casing): id/name/email or common
// variants (e.g. "Student ID", "Full Name", "University Email").
export function parseStudentsCSV(text) {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  return mapRowsToRecords(rows, STUDENT_HEADER_ALIASES).filter(
    (record) => record.id && record.name,
  );
}

const QUESTION_HEADER_ALIASES = {
  id: ["id", "questionid", "question id"],
  question: ["question", "questiontext", "question text", "text", "prompt"],
  type: ["type", "questiontype", "question type"],
  optionA: ["optiona", "option a", "choicea", "choice a", "a"],
  optionB: ["optionb", "option b", "choiceb", "choice b", "b"],
  optionC: ["optionc", "option c", "choicec", "choice c", "c"],
  optionD: ["optiond", "option d", "choiced", "choice d", "d"],
  correctAnswer: ["correctanswer", "correct answer", "answer", "correct"],
  marks: ["marks", "mark", "points", "score"],
};

// Parses a question bank CSV into records: { id, question, type, options[],
// correctAnswer, marks }. Expects a "question" column plus optional id, type,
// option A-D, correct answer and marks columns (any order/casing).
export function parseQuestionsCSV(text) {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  return mapRowsToRecords(rows, QUESTION_HEADER_ALIASES)
    .filter((record) => record.question)
    .map((record) => ({
      id: record.id || null,
      question: record.question,
      type: (record.type || "MCQ_SINGLE").toUpperCase(),
      options: [record.optionA, record.optionB, record.optionC, record.optionD].filter(Boolean),
      correctAnswer: record.correctAnswer || "",
      marks: Number(record.marks) || 1,
    }));
}
