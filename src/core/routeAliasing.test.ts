import {
  addAlias,
  getAliases,
  resolveOriginal,
  getAllAliases,
  removeAlias,
  clearAliases,
} from "./routeAliasing";

beforeEach(() => {
  clearAliases();
});

describe("addAlias", () => {
  it("registers aliases for a route", () => {
    addAlias("GET", "/users", ["/members", "/accounts"]);
    expect(getAliases("GET", "/users")).toEqual(["/members", "/accounts"]);
  });

  it("merges aliases on subsequent calls", () => {
    addAlias("GET", "/users", ["/members"]);
    addAlias("GET", "/users", ["/accounts"]);
    expect(getAliases("GET", "/users")).toEqual(["/members", "/accounts"]);
  });

  it("deduplicates aliases", () => {
    addAlias("GET", "/users", ["/members", "/members"]);
    expect(getAliases("GET", "/users")).toHaveLength(1);
  });

  it("is case-insensitive for method", () => {
    addAlias("get", "/users", ["/members"]);
    expect(getAliases("GET", "/users")).toEqual(["/members"]);
  });
});

describe("resolveOriginal", () => {
  it("returns the original path for a known alias", () => {
    addAlias("POST", "/items", ["/products"]);
    expect(resolveOriginal("POST", "/products")).toBe("/items");
  });

  it("returns null for an unknown alias", () => {
    expect(resolveOriginal("GET", "/unknown")).toBeNull();
  });

  it("is case-insensitive for method", () => {
    addAlias("DELETE", "/items", ["/products"]);
    expect(resolveOriginal("delete", "/products")).toBe("/items");
  });
});

describe("getAllAliases", () => {
  it("returns all registered alias entries", () => {
    addAlias("GET", "/a", ["/alpha"]);
    addAlias("POST", "/b", ["/beta"]);
    expect(getAllAliases()).toHaveLength(2);
  });

  it("returns empty array when no aliases registered", () => {
    expect(getAllAliases()).toEqual([]);
  });
});

describe("removeAlias", () => {
  it("removes an existing alias entry", () => {
    addAlias("GET", "/users", ["/members"]);
    expect(removeAlias("GET", "/users")).toBe(true);
    expect(getAliases("GET", "/users")).toEqual([]);
  });

  it("returns false when entry does not exist", () => {
    expect(removeAlias("GET", "/nonexistent")).toBe(false);
  });
});

describe("clearAliases", () => {
  it("removes all alias entries", () => {
    addAlias("GET", "/a", ["/alpha"]);
    addAlias("POST", "/b", ["/beta"]);
    clearAliases();
    expect(getAllAliases()).toEqual([]);
  });
});
