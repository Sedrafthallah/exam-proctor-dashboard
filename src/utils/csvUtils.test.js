import { describe, it, expect } from "vitest";
import { parseStudentsCSV, parseQuestionsCSV } from "./csvUtils";

// csvUtils.js does not export the internal row-level parser (parseCsvRows) or
// a generic parseCsv function — the actual public entry points are
// parseStudentsCSV / parseQuestionsCSV, which parse raw CSV text into header-
// mapped records. These tests exercise the underlying parser (quoted fields,
// escaped quotes, mixed line endings) through parseStudentsCSV.
describe("parseStudentsCSV", () => {
  it("parses a simple comma-delimited row correctly", () => {
    const csv = "id,name,email\nS1,Ali,ali@example.com";
    expect(parseStudentsCSV(csv)).toEqual([
      { id: "S1", name: "Ali", email: "ali@example.com" },
    ]);
  });

  it("handles a quoted field containing a comma", () => {
    const csv = 'id,name,email\nS1,"Smith, Jane",jane@example.com';
    expect(parseStudentsCSV(csv)).toEqual([
      { id: "S1", name: "Smith, Jane", email: "jane@example.com" },
    ]);
  });

  it("handles an escaped double-quote inside a quoted field", () => {
    const csv = 'id,name,email\nS1,"Say ""hi""",jane@example.com';
    expect(parseStudentsCSV(csv)).toEqual([
      { id: "S1", name: 'Say "hi"', email: "jane@example.com" },
    ]);
  });

  it("handles multiple rows separated by CRLF and LF line endings", () => {
    const csv = "id,name,email\r\nS1,Ali,ali@example.com\nS2,Rana,rana@example.com";
    expect(parseStudentsCSV(csv)).toEqual([
      { id: "S1", name: "Ali", email: "ali@example.com" },
      { id: "S2", name: "Rana", email: "rana@example.com" },
    ]);
  });

  it("returns an empty result for empty input rather than throwing", () => {
    expect(() => parseStudentsCSV("")).not.toThrow();
    expect(parseStudentsCSV("")).toEqual([]);
  });
});

describe("parseQuestionsCSV", () => {
  it("parses quoted fields and normalizes type/options/marks", () => {
    const csv =
      'question,type,optionA,optionB,correct,marks\n' +
      '"What is 2, plus 2?",mcq_single,"3","4",4,2';
    expect(parseQuestionsCSV(csv)).toEqual([
      {
        id: null,
        question: "What is 2, plus 2?",
        type: "MCQ_SINGLE",
        options: ["3", "4"],
        correctAnswer: "4",
        marks: 2,
      },
    ]);
  });

  it("returns an empty result for empty input rather than throwing", () => {
    expect(() => parseQuestionsCSV("")).not.toThrow();
    expect(parseQuestionsCSV("")).toEqual([]);
  });
});
