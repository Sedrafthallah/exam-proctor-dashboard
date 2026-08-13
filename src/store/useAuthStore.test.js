import { describe, it, expect, beforeEach } from "vitest";
import useAuthStore from "./useAuthStore";

describe("hasPermission", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it("returns false when no user is logged in", () => {
    expect(useAuthStore.getState().hasPermission("ViewExamSession")).toBe(false);
  });

  it("returns true for any permission when role is SUPER_ADMIN, even with no permissions array", () => {
    useAuthStore.setState({ user: { role: "SUPER_ADMIN", permissions: [] } });
    expect(useAuthStore.getState().hasPermission("ManageRoles")).toBe(true);
  });

  it("returns true when the permission is present in the user's permissions array", () => {
    useAuthStore.setState({ user: { role: "ADMIN", permissions: ["ViewExamSession", "ViewStudents"] } });
    expect(useAuthStore.getState().hasPermission("ViewExamSession")).toBe(true);
  });

  it("returns false when the permission is NOT present in the user's permissions array", () => {
    useAuthStore.setState({ user: { role: "ADMIN", permissions: ["ViewStudents"] } });
    expect(useAuthStore.getState().hasPermission("ManageRoles")).toBe(false);
  });

  it("returns false for a Proctor account with a restricted permission set", () => {
    useAuthStore.setState({
      user: { role: "PROCTOR", permissions: ["ViewExamSession", "MonitorExamSession"] },
    });
    expect(useAuthStore.getState().hasPermission("DeleteUser")).toBe(false);
    expect(useAuthStore.getState().hasPermission("MonitorExamSession")).toBe(true);
  });

  it("does not throw when permissions is an empty array (e.g. backend returned no permissions yet)", () => {
    useAuthStore.setState({ user: { role: "ADMIN", permissions: [] } });
    expect(() => useAuthStore.getState().hasPermission("ViewExamSession")).not.toThrow();
    expect(useAuthStore.getState().hasPermission("ViewExamSession")).toBe(false);
  });
});
