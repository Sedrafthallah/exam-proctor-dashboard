import { describe, it, expect } from "vitest";
import { mapPermissionNamesToIds } from "./useRolesStore";

const mockCatalog = [
  { id: 1, name: "CreateExamSession" },
  { id: 2, name: "ViewExamSession" },
  { id: 6, name: "MonitorExamSession" },
];

describe("mapPermissionNamesToIds", () => {
  it("maps known permission names to their correct real ids", () => {
    expect(mapPermissionNamesToIds(["ViewExamSession", "MonitorExamSession"], mockCatalog))
      .toEqual([2, 6]);
  });

  it("silently drops names that have no match in the catalog (e.g. a stale/removed permission)", () => {
    expect(mapPermissionNamesToIds(["ViewExamSession", "SomeRemovedPermission"], mockCatalog))
      .toEqual([2]);
  });

  it("returns an empty array when given an empty names list", () => {
    expect(mapPermissionNamesToIds([], mockCatalog)).toEqual([]);
  });

  it("returns an empty array when the catalog itself is empty", () => {
    expect(mapPermissionNamesToIds(["ViewExamSession"], [])).toEqual([]);
  });
});
