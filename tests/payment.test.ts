import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import app from "../src/app";
import { setupTestDb, teardownTestDb } from "../src/db/migrate.test";

const request = supertest(app);

describe("Payments", () => {
  let token: string;
  let paymentId: string;

  before(async () => {
    await setupTestDb();

    const res = await request
      .post("/api/v1/auth/register")
      .send({
        name: "Payment User",
        email: "payment@vaultly.com",
        password: "password123",
      });

    token = res.body.token;
  });

  after(async () => {
    await teardownTestDb();
  });

  describe("POST /api/v1/payments/create-intent (Stripe)", () => {
    test("should create a Stripe payment intent", async () => {
      const res = await request
        .post("/api/v1/payments/create-intent")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 10000, currency: "usd", description: "Test payment" });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.clientSecret);
      assert.ok(res.body.data.payments.id);
      assert.equal(res.body.data.payments.status, "pending");
      assert.equal(res.body.data.payments.provider, "stripe");

      paymentId = res.body.data.payments.id;
    });

    test("should return 401 with no token", async () => {
      const res = await request
        .post("/api/v1/payments/create-intent")
        .send({ amount: 10000, currency: "usd" });

      assert.equal(res.status, 401);
    });

    test("should return 400 for invalid amount", async () => {
      const res = await request
        .post("/api/v1/payments/create-intent")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: -100, currency: "usd" });

      assert.equal(res.status, 400);
    });
  });

  describe("GET /api/v1/payments", () => {
    test("should return list of payments for current user", async () => {
      const res = await request
        .get("/api/v1/payments")
        .set("Authorization", `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });

    test("should return 401 with no token", async () => {
      const res = await request.get("/api/v1/payments");
      assert.equal(res.status, 401);
    });
  });

  describe("GET /api/v1/payments/:id", () => {
    test("should return payment by id", async () => {
      const res = await request
        .get(`/api/v1/payments/${paymentId}`)
        .set("Authorization", `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.id, paymentId);
    });

    test("should return 404 for non-existent payment", async () => {
      const res = await request
        .get("/api/v1/payments/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`);

      assert.equal(res.status, 404);
    });

    test("should return 401 with no token", async () => {
      const res = await request.get(`/api/v1/payments/${paymentId}`);
      assert.equal(res.status, 401);
    });
  });

  describe("POST /api/v1/webhook/stripe", () => {
    test("should return 400 for invalid signature", async () => {
      const res = await request
        .post("/api/v1/webhook/stripe")
        .set("stripe-signature", "invalid_signature")
        .set("Content-Type", "application/json")
        .send(
          Buffer.from(JSON.stringify({ type: "payment_intent.succeeded" })),
        );

      assert.equal(res.status, 400);
    });
  });
});
