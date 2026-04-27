import {
  recordHit,
  getMetrics,
  getMetricForRoute,
  clearMetrics,
} from "./routeMetrics";

beforeEach(() => {
  clearMetrics();
});

describe("recordHit", () => {
  it("creates a new metric entry on first hit", () => {
    recordHit("GET", "/users");
    const metric = getMetricForRoute("GET", "/users");
    expect(metric).toBeDefined();
    expect(metric?.hitCount).toBe(1);
    expect(metric?.lastAccessedAt).toBeInstanceOf(Date);
  });

  it("increments hitCount on subsequent hits", () => {
    recordHit("GET", "/users");
    recordHit("GET", "/users");
    recordHit("GET", "/users");
    expect(getMetricForRoute("GET", "/users")?.hitCount).toBe(3);
  });

  it("normalises method to uppercase", () => {
    recordHit("post", "/items");
    const metric = getMetricForRoute("POST", "/items");
    expect(metric?.method).toBe("POST");
  });

  it("calculates running average response time", () => {
    recordHit("GET", "/ping", 100);
    recordHit("GET", "/ping", 200);
    const metric = getMetricForRoute("GET", "/ping");
    expect(metric?.avgResponseTimeMs).toBeCloseTo(150);
  });

  it("stores null avgResponseTimeMs when not provided", () => {
    recordHit("DELETE", "/items/1");
    expect(getMetricForRoute("DELETE", "/items/1")?.avgResponseTimeMs).toBeNull();
  });
});

describe("getMetrics", () => {
  it("returns all recorded metrics", () => {
    recordHit("GET", "/a");
    recordHit("POST", "/b");
    expect(getMetrics()).toHaveLength(2);
  });

  it("returns empty array when no metrics recorded", () => {
    expect(getMetrics()).toEqual([]);
  });
});

describe("clearMetrics", () => {
  it("removes all stored metrics", () => {
    recordHit("GET", "/x");
    clearMetrics();
    expect(getMetrics()).toHaveLength(0);
  });
});
