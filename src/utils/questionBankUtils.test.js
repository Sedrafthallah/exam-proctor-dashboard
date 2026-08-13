import { describe, it, expect } from "vitest";
import { getStatusConfig } from "./questionBankUtils";

describe("getStatusConfig (questionBankUtils)", () => {
  it("returns the correct color/label for a known status", () => {
    expect(getStatusConfig("LOCKED")).toEqual({ color: "warning", label: "Locked" });
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(getStatusConfig("  locked  ")).toEqual({ color: "warning", label: "Locked" });
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
