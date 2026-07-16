// Mock exports for the Reports page — no export backend exists yet, so these
// build the files client-side from the data already in the store.

export function downloadTextFile(filename, content, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function toCsvValue(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(rows) {
  return rows.map((row) => row.map(toCsvValue).join(",")).join("\r\n");
}

// A stand-in for the real SHA-256 manifest hash the backend export service
// will compute — deterministic per session/response-count so repeated
// downloads of the same data look consistent.
function mockManifestHash(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0").repeat(8).slice(0, 64);
}

export function buildGradingPackageCsv(session, responses) {
  const header = [
    "Student ID",
    "Student Name",
    "Submission",
    "Identity Match %",
    "Auto Score",
    "Max Score",
    "Violations",
  ];
  const rows = responses.map((r) => [
    r.id,
    r.name,
    r.submission,
    r.identityMatch ?? "manual",
    r.autoScore,
    r.maxScore,
    r.violations,
  ]);
  return toCsv([header, ...rows]);
}

export function buildGradingPackageJson(session, responses) {
  return JSON.stringify(
    {
      session: {
        id: session.id,
        title: session.sessionTitle,
        courseCode: session.courseCode,
      },
      questionBank: session.questionBank,
      responses: responses.map((r) => ({
        studentId: r.id,
        studentName: r.name,
        submission: r.submission,
        identityMatch: r.identityMatch,
        autoScore: r.autoScore,
        maxScore: r.maxScore,
        violations: r.violations,
      })),
      manifest: {
        algorithm: "SHA-256",
        hash: mockManifestHash(`${session.id}-${responses.length}`),
      },
    },
    null,
    2,
  );
}

export function buildSignedAuditLog(session, responses) {
  const incidents = responses
    .filter((r) => r.violations > 0 || r.submission === "TERMINATED")
    .map((r) => ({
      studentId: r.id,
      studentName: r.name,
      submission: r.submission,
      violationCount: r.violations,
    }));

  return JSON.stringify(
    {
      session: {
        id: session.id,
        title: session.sessionTitle,
        courseCode: session.courseCode,
      },
      incidents,
      signature: {
        algorithm: "SHA-256",
        hash: mockManifestHash(`audit-${session.id}-${incidents.length}`),
        signedAt: new Date().toISOString(),
      },
    },
    null,
    2,
  );
}
