import express, { Express } from "express";
import request from "supertest";
import { registerAnnotationRoutes } from "./annotationHandler";
import { clearAnnotations, setAnnotations } from "../core/routeAnnotation";

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  registerAnnotationRoutes(router);
  app.use("/_routewatch", router);
  return app;
}

beforeEach(() => clearAnnotations());

describe("GET /_routewatch/annotations", () => {
  it("returns empty object when no annotations", async () => {
    const res = await request(buildApp()).get("/_routewatch/annotations");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it("returns all annotations", async () => {
    setAnnotations("GET", "/users", { owner: "team-a" });
    const res = await request(buildApp()).get("/_routewatch/annotations");
    expect(res.body["GET:/users"]).toEqual({ owner: "team-a" });
  });
});

describe("GET /_routewatch/annotations/:method/:path", () => {
  it("returns 404 when not found", async () => {
    const res = await request(buildApp()).get(
      "/_routewatch/annotations/GET/%2Fmissing"
    );
    expect(res.status).toBe(404);
  });

  it("returns annotations for a route", async () => {
    setAnnotations("GET", "/users", { tier: "gold" });
    const res = await request(buildApp()).get(
      "/_routewatch/annotations/GET/%2Fusers"
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tier: "gold" });
  });
});

describe("POST /_routewatch/annotations/:method/:path", () => {
  it("sets annotations and returns success", async () => {
    const res = await request(buildApp())
      .post("/_routewatch/annotations/POST/%2Fitems")
      .send({ owner: "team-b", public: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 for invalid body", async () => {
    const res = await request(buildApp())
      .post("/_routewatch/annotations/POST/%2Fitems")
      .send(["bad"]);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /_routewatch/annotations/:method/:path/:key", () => {
  it("removes a single annotation key", async () => {
    setAnnotations("GET", "/users", { owner: "team-a", tier: "gold" });
    const res = await request(buildApp()).delete(
      "/_routewatch/annotations/GET/%2Fusers/tier"
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 for missing key", async () => {
    const res = await request(buildApp()).delete(
      "/_routewatch/annotations/GET/%2Fusers/nope"
    );
    expect(res.status).toBe(404);
  });
});

describe("DELETE /_routewatch/annotations/:method/:path", () => {
  it("removes all annotations for a route", async () => {
    setAnnotations("DELETE", "/items", { owner: "team-b" });
    const res = await request(buildApp()).delete(
      "/_routewatch/annotations/DELETE/%2Fitems"
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 when route not found", async () => {
    const res = await request(buildApp()).delete(
      "/_routewatch/annotations/DELETE/%2Fghost"
    );
    expect(res.status).toBe(404);
  });
});
