"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProductStore } from "../../_zustand/store";
import apiClient from "@/lib/api";

export default function CheckoutSuccessPage() {
  const clearCart = useProductStore((state) => state.clearCart);
  const [state, setState] = useState<"verifying" | "paid" | "processing" | "error">("verifying");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");
    const orderId = query.get("order_id");
    const statusQuery = sessionId
      ? `session_id=${encodeURIComponent(sessionId)}`
      : orderId
        ? `order_id=${encodeURIComponent(orderId)}`
        : "";

    if (!statusQuery) {
      setState("error");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const verify = async () => {
      attempts += 1;
      const response = await apiClient.get(`/api/payments/status?${statusQuery}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Payment verification failed");
      const result = await response.json();
      if (cancelled) return;
      if (result.paid) {
        setState("paid");
        clearCart();
        window.dispatchEvent(new CustomEvent("orderCompleted"));
      } else if (attempts < 6) {
        window.setTimeout(verify, 1500);
      } else {
        setState("processing");
      }
    };
    verify().catch(() => !cancelled && setState("error"));

    return () => {
      cancelled = true;
    };
  }, [clearCart]);

  const heading = state === "paid" ? "Payment received" : state === "processing" ? "Payment processing" : state === "error" ? "Payment not verified" : "Verifying payment";
  const message = state === "paid"
    ? "Thank you. Your order is confirmed and its payment status is now tracked by the shop."
    : state === "processing"
      ? "Stripe is still processing this payment. Keep your cart until confirmation arrives."
      : state === "error"
        ? "We could not verify this payment. Sign in with the purchasing account or contact support."
        : "Please wait while the shop verifies your payment status.";

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-6 py-20">
      <section className="w-full rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white" aria-hidden="true">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
        <p className="mt-3 text-gray-700">
          {message}
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
