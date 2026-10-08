import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import app from "../src/app";
import { setupTestDb, teardownTestDb } from "../src/db/migrate.test";

const request = supertest(app);

describe("Auth", () => {
  before(async () => {
    await setupTestDb();
  });

  after(async () => {
    await teardownTestDb();
  });

  describe("POST /api/v1/auth/register", () => {
    test("should register a new user and return token", async () => {
      const res = await request
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@vaultly.com",
          password: "password123",
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.data.email, "test@vaultly.com");
      assert.ok(!res.body.data.password);
    });

    test("should return 409 when email already exists", async () => {
      const res = await request
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@vaultly.com",
          password: "password123",
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    test("should login and return token", async () => {
      const res = await request
        .post("/api/v1/auth/login")
        .send({ email: "test@vaultly.com", password: "password123" });

      assert.equal(res.status, 200);
      assert.ok(res.body.token);
      assert.ok(!res.body.data.password);
    });

    test("should return 401 for wrong password", async () => {
      const res = await request
        .post("/api/v1/auth/login")
        .send({ email: "test@vaultly.com", password: "wrongpassword" });

      assert.equal(res.status, 401);
      assert.equal(res.body.message, "invalid credentials");
    });

    test("should return 401 for non-existent email", async () => {
      const res = await request
        .post("/api/v1/auth/login")
        .send({ email: "nobody@vaultly.com", password: "password123" });

      assert.equal(res.status, 401);
      assert.equal(res.body.message, "invalid credentials");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    test("should return current user with valid token", async () => {
      const loginRes = await request
        .post("/api/v1/auth/login")
        .send({ email: "test@vaultly.com", password: "password123" });

      const token = loginRes.body.token;

      const res = await request
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.email, "test@vaultly.com");
    });

    test("should return 401 with no token", async () => {
      const res = await request.get("/api/v1/auth/me");
      assert.equal(res.status, 401);
    });
  });
});
