import { create } from "zustand";

export const INITIAL_STUDENTS = [
  {
    id: "S-20211847",
    name: "Layla Mansour",
    email: "layla.m@std.damascus.edu",
    status: "REGISTERED",
  },
  {
    id: "S-20210934",
    name: "Omar Khalil",
    email: "omar.k@std.damascus.edu",
    status: "REGISTERED",
  },
  {
    id: "S-20213302",
    name: "Nour Haidar",
    email: "nour.h@std.damascus.edu",
    status: "REGISTERED",
  },
  {
    id: "S-20209981",
    name: "Yousef Aziz",
    email: "yousef.a@std.damascus.edu",
    status: "REGISTERED",
  },
  {
    id: "S-20214410",
    name: "Sara Deeb",
    email: "sara.d@std.damascus.edu",
    status: "NO_PHOTO",
  },
  {
    id: "S-20211205",
    name: "Karim Nseir",
    email: "karim.n@std.damascus.edu",
    status: "REGISTERED",
  },
  {
    id: "S-20212876",
    name: "Dima Suleiman",
    email: "dima.s@std.damascus.edu",
    status: "REGISTERED",
  },
  {
    id: "S-20210467",
    name: "Bassel Rahal",
    email: "bassel.r@std.damascus.edu",
    status: "NO_PHOTO",
  },
];

const useStudentStore = create((set, get) => ({
  students: INITIAL_STUDENTS,

  // Bulk-imports parsed CSV rows ({ id, name, email }). Rows whose ID already
  // exists in the roster are skipped rather than overwriting the existing record.
  // CSVs never carry a photo, so imported students land as NO_PHOTO until one
  // is uploaded from their row.
  bulkRegisterStudents: (records) => {
    const existingIds = new Set(get().students.map((s) => s.id));
    const newStudents = [];
    let skipped = 0;

    records.forEach((record) => {
      if (existingIds.has(record.id)) {
        skipped += 1;
        return;
      }
      existingIds.add(record.id);
      newStudents.push({
        id: record.id,
        name: record.name,
        email: record.email || "",
        status: "NO_PHOTO",
      });
    });

    if (newStudents.length > 0) {
      set((state) => ({ students: [...state.students, ...newStudents] }));
    }

    return { added: newStudents, addedCount: newStudents.length, skippedCount: skipped };
  },
}));

export default useStudentStore;
