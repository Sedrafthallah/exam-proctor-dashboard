import { describe, it, expect } from "vitest";
import { getSessionStatus, isEditable, getStatusConfig } from "./sessionUtils";

function makeSession(overrides = {}) {
  return {
    scheduledStartUTC: new Date().toISOString(),
    duration: 60,
    gracePeriod: 10,
    archived: false,
    forceClosed: false,
    published: false,
    ...overrides,
  };
}

describe("getSessionStatus", () => {
  it("returns DRAFT for an unpublished session scheduled far in the future", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(),
      published: false,
    });
    expect(getSessionStatus(session)).toBe("DRAFT");
  });

  it("returns SCHEDULED for a published session scheduled far in the future", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(),
      published: true,
    });
    expect(getSessionStatus(session)).toBe("SCHEDULED");
  });

  it("returns LOCKED once inside the 24-hour pre-start window", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() + 12 * 60 * 60000).toISOString(),
      published: true,
    });
    expect(getSessionStatus(session)).toBe("LOCKED");
  });

  it("returns ACTIVE once the start time has passed but before end+grace", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() - 5 * 60000).toISOString(),
      duration: 60,
      gracePeriod: 10,
    });
    expect(getSessionStatus(session)).toBe("ACTIVE");
  });

  it("returns GRACE during the grace period after the scheduled end time", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() - 65 * 60000).toISOString(),
      duration: 60,
      gracePeriod: 10,
    });
    expect(getSessionStatus(session)).toBe("GRACE");
  });

  it("returns CLOSED once the grace period has fully elapsed", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() - 80 * 60000).toISOString(),
      duration: 60,
      gracePeriod: 10,
    });
    expect(getSessionStatus(session)).toBe("CLOSED");
  });

  it("returns CLOSED immediately for a force-closed session, ignoring the schedule entirely", () => {
    const session = makeSession({
      scheduledStartUTC: new Date(Date.now() + 60 * 60000).toISOString(),
      forceClosed: true,
    });
    expect(getSessionStatus(session)).toBe("CLOSED");
  });

  it("returns ARCHIVED regardless of any other field once archived is true", () => {
    const session = makeSession({ archived: true, forceClosed: false, published: true });
    expect(getSessionStatus(session)).toBe("ARCHIVED");
  });
});

describe("isEditable", () => {
  it("allows editing any field when status is DRAFT", () => {
    expect(isEditable("title", "DRAFT")).toBe(true);
    expect(isEditable("anyRandomField", "DRAFT")).toBe(true);
  });

  it("only allows proctor/roster fields when status is SCHEDULED", () => {
    expect(isEditable("proctor", "SCHEDULED")).toBe(true);
    expect(isEditable("roster", "SCHEDULED")).toBe(true);
    expect(isEditable("title", "SCHEDULED")).toBe(false);
  });

  it("disallows editing any field once LOCKED, ACTIVE, CLOSED, or ARCHIVED", () => {
    for (const status of ["LOCKED", "ACTIVE", "CLOSED", "ARCHIVED"]) {
      expect(isEditable("proctor", status)).toBe(false);
      expect(isEditable("title", status)).toBe(false);
    }
  });
});

describe("getStatusConfig (sessionUtils)", () => {
  it("returns the correct color/label for a known status", () => {
    expect(getStatusConfig("ACTIVE")).toEqual({ color: "success", label: "Active" });
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(getStatusConfig("  active  ")).toEqual({ color: "success", label: "Active" });
  });

  it("falls back to a default/unknown config for an unrecognized status instead of throwing", () => {
    const result = getStatusConfig("SomeNewStatusFromBackend");
    expect(result.color).toBe("default");
    expect(result.label).toBe("SomeNewStatusFromBackend");
  });

  it("handles an empty/null status without throwing", () => {
    expect(() => getStatusConfig(null)).not.toThrow();
    expect(getStatusConfig(null).label).toBe("Unknown");
  });
});
