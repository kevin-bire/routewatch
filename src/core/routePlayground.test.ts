import {
  setPlayground,
  getPlayground,
  removePlayground,
  getAllPlaygrounds,
  clearPlaygrounds,
  makeKey,
} from "./routePlayground";

beforeEach(() => {
  clearPlaygrounds();
});

describe("makeKey", () => {
  it("uppercases the method", () => {
    expect(makeKey("get", "/users")).toBe("GET:/users");
  });

  it("preserves path with colons", () => {
    expect(makeKey("post", "/api/v1/items")).toBe("POST:/api/v1/items");
  });
});

describe("setPlayground / getPlayground", () => {
  it("stores and retrieves a playground config", () => {
    const config = { exampleBody: { name: "Alice" }, exampleHeaders: { Authorization: "Bearer token" } };
    setPlayground("post", "/users", config);
    expect(getPlayground("POST", "/users")).toEqual(config);
  });

  it("returns undefined for unknown route", () => {
    expect(getPlayground("get", "/unknown")).toBeUndefined();
  });

  it("overwrites existing config", () => {
    setPlayground("get", "/items", { description: "old" });
    setPlayground("get", "/items", { description: "new" });
    expect(getPlayground("get", "/items")?.description).toBe("new");
  });
});

describe("removePlayground", () => {
  it("removes an existing config and returns true", () => {
    setPlayground("delete", "/items/:id", { description: "delete item" });
    expect(removePlayground("delete", "/items/:id")).toBe(true);
    expect(getPlayground("delete", "/items/:id")).toBeUndefined();
  });

  it("returns false when config does not exist", () => {
    expect(removePlayground("get", "/nonexistent")).toBe(false);
  });
});

describe("getAllPlaygrounds", () => {
  it("returns all stored configs", () => {
    setPlayground("get", "/a", { description: "A" });
    setPlayground("post", "/b", { description: "B" });
    const all = getAllPlaygrounds();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.config.description)).toEqual(
      expect.arrayContaining(["A", "B"])
    );
  });

  it("returns empty array when store is empty", () => {
    expect(getAllPlaygrounds()).toEqual([]);
  });
});

describe("clearPlaygrounds", () => {
  it("clears all entries", () => {
    setPlayground("get", "/x", {});
    clearPlaygrounds();
    expect(getAllPlaygrounds()).toHaveLength(0);
  });
});
