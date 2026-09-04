"use client";

import AuthShell from "@/components/auth/AuthShell";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertCircle, FiCheck, FiEye, FiEyeOff, FiLoader, FiLock, FiMail } from "react-icons/fi";

const inputClassName = "block w-full rounded-xl border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-brand-pine focus:ring-brand-pine";

export default function RegisterPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStatus === "authenticated") router.replace("/");
  }, [router, sessionStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    const acceptedTerms = form.get("terms") === "on";
    if (!isValidEmailAddressFormat(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Choose a password with at least 8 characters.");
    if (password !== confirmPassword) return setError("The passwords do not match.");
    if (!acceptedTerms) return setError("Please accept the terms and privacy policy.");

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = Array.isArray(result.details) ? result.details.map((item: { message?: string }) => item.message).filter(Boolean).join(", ") : result.error;
        throw new Error(detail || "We could not create your account.");
      }
      toast.success("Account created");
      router.push("/login?registered=true");
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "We could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sessionStatus === "loading") return <div className="min-h-[70vh] animate-pulse bg-slate-50" aria-label="Loading registration" />;

  return (
    <AuthShell eyebrow="Get started" title="Create your shop account" description="Register once, then test the complete product-to-payment journey." footer={<p>Already have an account? <Link href="/login" className="font-bold text-brand-pine hover:text-brand-ink">Sign in</Link></p>}>
      {error && <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert"><FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" /><span>{error}</span></div>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-800">Email address</label>
          <div className="relative mt-2"><FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className={inputClassName} /></div>
        </div>
        <div>
          <div className="flex items-center justify-between"><label htmlFor="password" className="block text-sm font-semibold text-slate-800">Password</label><span className="text-xs text-slate-500">Minimum 8 characters</span></div>
          <div className="relative mt-2">
            <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} className={`${inputClassName} pr-12`} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-800">Confirm password</label>
          <div className="relative mt-2"><FiCheck className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} className={inputClassName} /></div>
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600"><input name="terms" type="checkbox" required className="mt-1 rounded border-slate-300 text-brand-pine focus:ring-brand-pine" /><span>I accept the terms and privacy policy for this local shop template.</span></label>
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-pine px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-sage focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting && <FiLoader className="animate-spin" aria-hidden="true" />}{isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Stripe sandbox payments do not charge real money.</p>
    </AuthShell>
  );
}
