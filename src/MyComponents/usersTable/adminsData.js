// Keys match the permission keys stored on each user in useAuthStore (P01..P08).
export const PERMISSIONS = [
  {
    code: "P-01",
    key: "P01",
    title: "Question Bank: Author",
    description:
      "Create, edit and delete question banks up to T-24h. Upload via CSV.",
  },
  {
    code: "P-02",
    key: "P02",
    title: "Question Bank: View All",
    description: "Read-only access to all banks regardless of authorship.",
  },
  {
    code: "P-03",
    key: "P03",
    title: "Session: Manage",
    description:
      "Create, configure, schedule, publish and terminate sessions; manage rosters.",
  },
  {
    code: "P-04",
    key: "P04",
    title: "Session: Live Proctor",
    description:
      "Access the live dashboard, issue warnings, terminate student sessions.",
  },
  {
    code: "P-05",
    key: "P05",
    title: "Students: Register",
    description:
      "Register students, upload roster CSVs, attach ID photographs.",
  },

  {
    code: "P-06",
    key: "P06",
    title: "Reports: Export",
    description:
      "Export grading reports and signed incident/audit logs (CSV/JSON).",
  },
  {
    code: "P-07",
    key: "P07",
    title: "Reports: View Violations",
    description: "Read-only access to the violation and incident log.",
  },
];

export function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
