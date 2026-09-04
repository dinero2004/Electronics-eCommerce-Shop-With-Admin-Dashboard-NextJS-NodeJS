const crypto = require("crypto");
const Stripe = require("stripe");
const prisma = require("../utills/db");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("Stripe is not configured. Add STRIPE_SECRET_KEY or use explicit local mock mode.");
    error.statusCode = 503;
    throw error;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function calculateOrder(products) {
  const subtotal = products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = 5;
  const tax = Math.round(subtotal * 0.2);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

async function createCheckoutSession(request, response, next) {
  try {
    const { orderId } = request.body || {};
    if (!orderId || typeof orderId !== "string") {
      return response.status(400).json({ error: "A valid orderId is required" });
    }

    const order = await prisma.customer_order.findUnique({
      where: { id: orderId },
      include: { products: { include: { product: true } } },
    });

    if (!order) return response.status(404).json({ error: "Order not found" });
    if (request.user.role !== "admin" && order.email !== request.user.email) {
      return response.status(403).json({ error: "This order does not belong to your account" });
    }
    if (order.products.length === 0) {
      return response.status(400).json({ error: "The order does not contain any products" });
    }

    const totals = calculateOrder(order.products);
    const mockEnabled =
      process.env.PAYMENTS_MODE === "mock" &&
      process.env.ALLOW_MOCK_PAYMENTS === "true";

    if (mockEnabled) {
      const mockSessionId = `mock_${crypto.randomUUID()}`;
      await prisma.customer_order.update({
        where: { id: order.id },
        data: {
          total: totals.subtotal,
          status: "confirmed",
          paymentStatus: "paid_mock",
          stripeSessionId: mockSessionId,
        },
      });
      return response.json({
        mode: "mock",
        url: `${FRONTEND_URL}/checkout/success?order_id=${encodeURIComponent(order.id)}&mock=true`,
      });
    }

    const stripe = stripeClient();
    const lineItems = order.products.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: "chf",
        unit_amount: product.price * 100,
        product_data: { name: product.title },
      },
    }));
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "chf",
        unit_amount: (totals.shipping + totals.tax) * 100,
        product_data: { name: "Shipping and tax" },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: totals.total <= 5000 ? ["card", "twint"] : ["card"],
      line_items: lineItems,
      customer_email: order.email,
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout?payment=cancelled`,
      metadata: { orderId: order.id },
    });

    await prisma.customer_order.update({
      where: { id: order.id },
      data: {
        total: totals.subtotal,
        paymentStatus: "processing",
        stripeSessionId: session.id,
      },
    });

    return response.json({ mode: "stripe", url: session.url });
  } catch (error) {
    return next(error);
  }
}

async function handleWebhook(request, response) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return response.status(503).json({ error: "Stripe webhook secret is not configured" });
    }

    const signature = request.headers["stripe-signature"];
    const event = stripeClient().webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      await prisma.customer_order.update({
        where: { id: orderId },
        data: { status: "confirmed", paymentStatus: "paid", stripeSessionId: session.id },
      });
    } else if (orderId && event.type === "checkout.session.async_payment_failed") {
      await prisma.customer_order.update({
        where: { id: orderId },
        data: { paymentStatus: "failed", stripeSessionId: session.id },
      });
    }

    return response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook rejected:", error.message);
    return response.status(400).json({ error: "Invalid Stripe webhook" });
  }
}

async function getPaymentStatus(request, response, next) {
  try {
    const sessionId = typeof request.query.session_id === "string" ? request.query.session_id : null;
    const orderId = typeof request.query.order_id === "string" ? request.query.order_id : null;
    if (!sessionId && !orderId) {
      return response.status(400).json({ error: "A session_id or order_id is required" });
    }

    let order = await prisma.customer_order.findFirst({
      where: sessionId ? { stripeSessionId: sessionId } : { id: orderId },
      select: { id: true, email: true, status: true, paymentStatus: true, stripeSessionId: true },
    });
    if (!order) return response.status(404).json({ error: "Payment was not found" });
    if (request.user.role !== "admin" && order.email !== request.user.email) {
      return response.status(403).json({ error: "This payment does not belong to your account" });
    }

    // Local Stripe testing should still confirm a completed Checkout Session when
    // the Stripe CLI webhook forwarder is not running. The server verifies the
    // session directly; the browser never gets to declare an order as paid.
    if (
      order.paymentStatus === "processing" &&
      order.stripeSessionId?.startsWith("cs_") &&
      process.env.PAYMENTS_MODE !== "mock"
    ) {
      const session = await stripeClient().checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === "paid" && session.metadata?.orderId === order.id) {
        order = await prisma.customer_order.update({
          where: { id: order.id },
          data: { status: "confirmed", paymentStatus: "paid" },
          select: { id: true, email: true, status: true, paymentStatus: true, stripeSessionId: true },
        });
      }
    }

    return response.json({
      orderId: order.id,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      paid: ["paid", "paid_mock"].includes(order.paymentStatus),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createCheckoutSession, handleWebhook, getPaymentStatus };
