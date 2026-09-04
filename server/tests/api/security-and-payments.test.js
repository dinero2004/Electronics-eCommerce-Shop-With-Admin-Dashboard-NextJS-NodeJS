const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const request = require("supertest");
const { randomUUID } = require("node:crypto");
const { hkdf } = require("@panva/hkdf");
const { EncryptJWT } = require("jose");
const Stripe = require("stripe");

process.env.NODE_ENV = "test";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-auth-secret-at-least-32-characters";
process.env.PAYMENTS_MODE = "mock";
process.env.ALLOW_MOCK_PAYMENTS = "true";
process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_placeholder";

const app = require("../../app");
const prisma = require("../../utills/db");

let user;
let order;
let sessionCookie;

async function encodeSession(payload) {
  const key = await hkdf(
    "sha256",
    process.env.NEXTAUTH_SECRET,
    "",
    "NextAuth.js Generated Encryption Key",
    32
  );
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setJti(randomUUID())
    .encrypt(key);
}

before(async () => {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  user = await prisma.user.create({ data: { email: `api-test-${unique}@example.com`, role: "user" } });
  const product = await prisma.product.findFirst({ where: { inStock: { gt: 0 } } });
  assert.ok(product, "seeded in-stock product is required");
  order = await prisma.customer_order.create({
    data: {
      name: "API", lastname: "Tester", phone: "+41791234567", email: user.email,
      company: "Example AG", adress: "Test Street 1", apartment: "2A", postalCode: "8001",
      status: "pending", city: "Zurich", country: "Switzerland", total: product.price,
      products: { create: { productId: product.id, quantity: 2 } },
    },
  });
  const token = await encodeSession({ id: user.id, email: user.email, role: "user", sub: user.id });
  sessionCookie = `next-auth.session-token=${token}`;
});

after(async () => {
  if (order) {
    await prisma.customer_order_product.deleteMany({ where: { customerOrderId: order.id } });
    await prisma.customer_order.deleteMany({ where: { id: order.id } });
  }
  if (user) await prisma.user.deleteMany({ where: { id: user.id } });
  await prisma.$disconnect();
});

test("health endpoint is available", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "OK");
});

test("admin mutations reject unauthenticated requests", async () => {
  const response = await request(app).post("/api/products").send({});
  assert.equal(response.status, 401);
});

test("checkout sessions reject unauthenticated requests", async () => {
  const response = await request(app).post("/api/payments/checkout-session").send({ orderId: order.id });
  assert.equal(response.status, 401);
});

test("authenticated local checkout recalculates totals and marks mock payment", async () => {
  const response = await request(app).post("/api/payments/checkout-session").set("Cookie", sessionCookie).send({ orderId: order.id });
  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "mock");
  assert.match(response.body.url, /\/checkout\/success/);

  const updated = await prisma.customer_order.findUnique({ where: { id: order.id } });
  assert.equal(updated.paymentStatus, "paid_mock");
  assert.equal(updated.status, "confirmed");
  assert.ok(updated.total > order.total);
});

test("a valid Stripe webhook marks the order paid", async () => {
  const payload = JSON.stringify({
    id: "evt_test_checkout_complete",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_checkout_complete",
        object: "checkout.session",
        metadata: { orderId: order.id },
      },
    },
  });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });

  const response = await request(app)
    .post("/api/payments/webhook")
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);
  assert.equal(response.status, 200);

  const updated = await prisma.customer_order.findUnique({ where: { id: order.id } });
  assert.equal(updated.paymentStatus, "paid");
  assert.equal(updated.stripeSessionId, "cs_test_checkout_complete");

  const statusResponse = await request(app)
    .get(`/api/payments/status?session_id=${updated.stripeSessionId}`)
    .set("Cookie", sessionCookie);
  assert.equal(statusResponse.status, 200);
  assert.equal(statusResponse.body.paid, true);
});

test("webhook rejects an invalid Stripe signature", async () => {
  const response = await request(app)
    .post("/api/payments/webhook")
    .set("Content-Type", "application/json")
    .set("stripe-signature", "invalid")
    .send(JSON.stringify({ type: "checkout.session.completed" }));
  assert.equal(response.status, 400);
});
