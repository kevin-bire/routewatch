import {
  setAnnotations,
  getAnnotations,
  removeAnnotation,
  removeAnnotations,
  getAllAnnotations,
  clearAnnotations,
  makeKey,
} from "./routeAnnotation";

beforeEach(() => clearAnnotations());

describe("makeKey", () => {
  it("normalises method to uppercase", () => {
    expect(makeKey("get", "/users")).toBe("GET:/users");
  });
});

describe("setAnnotations / getAnnotations", () => {
  it("stores and retrieves annotations", () => {
    setAnnotations("GET", "/users", { owner: "team-a", public: true });
    expect(getAnnotations("GET", "/users")).toEqual({ owner: "team-a", public: true });
  });

  it("merges annotations on repeated calls", () => {
    setAnnotations("GET", "/users", { owner: "team-a" });
    setAnnotations("GET", "/users", { tier: "gold" });
    expect(getAnnotations("GET", "/users")).toEqual({ owner: "team-a", tier: "gold" });
  });

  it("returns undefined for unknown route", () => {
    expect(getAnnotations("POST", "/unknown")).toBeUndefined();
  });
});

describe("removeAnnotation", () => {
  it("removes a single annotation key", () => {
    setAnnotations("GET", "/users", { owner: "team-a", tier: "gold" });
    const result = removeAnnotation("GET", "/users", "tier");
    expect(result).toBe(true);
    expect(getAnnotations("GET", "/users")).toEqual({ owner: "team-a" });
  });

  it("removes entry entirely when no keys remain", () => {
    setAnnotations("GET", "/users", { owner: "team-a" });
    removeAnnotation("GET", "/users", "owner");
    expect(getAnnotations("GET", "/users")).toBeUndefined();
  });

  it("returns false for missing key", () => {
    expect(removeAnnotation("GET", "/users", "nope")).toBe(false);
  });
});

describe("removeAnnotations", () => {
  it("removes all annotations for a route", () => {
    setAnnotations("DELETE", "/items", { owner: "team-b" });
    expect(removeAnnotations("DELETE", "/items")).toBe(true);
    expect(getAnnotations("DELETE", "/items")).toBeUndefined();
  });

  it("returns false when route not found", () => {
    expect(removeAnnotations("DELETE", "/ghost")).toBe(false);
  });
});

describe("getAllAnnotations", () => {
  it("returns all stored annotations", () => {
    setAnnotations("GET", "/a", { x: 1 });
    setAnnotations("POST", "/b", { y: 2 });
    const all = getAllAnnotations();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["GET:/a"]).toEqual({ x: 1 });
  });
});
