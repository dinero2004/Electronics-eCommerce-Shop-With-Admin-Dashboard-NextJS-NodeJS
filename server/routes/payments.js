const express = require("express");
const { createCheckoutSession, getPaymentStatus } = require("../controllers/payments");
const { requireUser } = require("../middleware/auth");

const router = express.Router();
router.post("/checkout-session", requireUser, createCheckoutSession);
router.get("/status", requireUser, getPaymentStatus);

module.exports = router;
