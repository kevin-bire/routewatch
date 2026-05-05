import {
  setRetryPolicy,
  getRetryPolicy,
  removeRetryPolicy,
  getAllRetryPolicies,
  clearRetryPolicies,
  hasRetryPolicy,
  makeKey,
} from "./routeRetry";

beforeEach(() => {
  clearRetryPolicies();
});

describe("makeKey", () => {
  it("normalises method to uppercase", () => {
    expect(makeKey("get", "/users")).toBe("GET:/users");
  });
});

describe("setRetryPolicy", () => {
  it("stores a valid retry policy", () => {
    setRetryPolicy("GET", "/users", { maxAttempts: 3, backoffMs: 200 });
    expect(getRetryPolicy("GET", "/users")).toEqual({ maxAttempts: 3, backoffMs: 200 });
  });

  it("throws when maxAttempts < 1", () => {
    expect(() =>
      setRetryPolicy("GET", "/users", { maxAttempts: 0, backoffMs: 100 })
    ).toThrow("maxAttempts");
  });

  it("throws when backoffMs is negative", () => {
    expect(() =>
      setRetryPolicy("GET", "/users", { maxAttempts: 2, backoffMs: -1 })
    ).toThrow("backoffMs");
  });

  it("stores retryOn status codes", () => {
    setRetryPolicy("POST", "/orders", { maxAttempts: 2, backoffMs: 500, retryOn: [503, 429] });
    expect(getRetryPolicy("POST", "/orders")?.retryOn).toEqual([503, 429]);
  });
});

describe("getRetryPolicy", () => {
  it("returns undefined for unknown route", () => {
    expect(getRetryPolicy("DELETE", "/unknown")).toBeUndefined();
  });
});

describe("removeRetryPolicy", () => {
  it("removes an existing policy and returns true", () => {
    setRetryPolicy("GET", "/items", { maxAttempts: 1, backoffMs: 0 });
    expect(removeRetryPolicy("GET", "/items")).toBe(true);
    expect(getRetryPolicy("GET", "/items")).toBeUndefined();
  });

  it("returns false when policy does not exist", () => {
    expect(removeRetryPolicy("GET", "/ghost")).toBe(false);
  });
});

describe("getAllRetryPolicies", () => {
  it("returns all stored policies", () => {
    setRetryPolicy("GET", "/a", { maxAttempts: 2, backoffMs: 100 });
    setRetryPolicy("POST", "/b", { maxAttempts: 5, backoffMs: 300 });
    const all = getAllRetryPolicies();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all["GET:/a"]).toEqual({ maxAttempts: 2, backoffMs: 100 });
  });
});

describe("hasRetryPolicy", () => {
  it("returns true when policy exists", () => {
    setRetryPolicy("PATCH", "/resource", { maxAttempts: 3, backoffMs: 50 });
    expect(hasRetryPolicy("PATCH", "/resource")).toBe(true);
  });

  it("returns false when policy does not exist", () => {
    expect(hasRetryPolicy("PATCH", "/resource")).toBe(false);
  });
});
