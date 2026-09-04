"use client";

import AuthShell from "@/components/auth/AuthShell";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertCircle, FiEye, FiEyeOff, FiLoader, FiLock, FiMail } from "react-icons/fi";

const inputClassName = "block w-full rounded-xl border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-brand-pine focus:ring-brand-pine";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestedPath = searchParams.get("callbackUrl");
  const callbackUrl = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/";

  useEffect(() => {
    if (searchParams.get("expired") === "true") setError("Your session expired. Please sign in again.");
    if (sessionStatus === "authenticated") router.replace(callbackUrl);
  }, [callbackUrl, router, searchParams, sessionStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    if (!isValidEmailAddressFormat(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Your password must contain at least 8 characters.");

    setIsSubmitting(true);
    const result = await signIn("credentials", { redirect: false, email, password });
    setIsSubmitting(false);
    if (result?.error) return setError("The email or password is incorrect.");
    toast.success("Welcome back");
    router.replace(callbackUrl);
    router.refresh();
  }

  if (sessionStatus === "loading") return <div className="min-h-[70vh] animate-pulse bg-slate-50" aria-label="Loading sign in" />;

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to your account" description="Access your cart, orders and secure Stripe sandbox checkout." footer={<p>New to My First Shop? <Link href="/register" className="font-bold text-brand-pine hover:text-brand-ink">Create an account</Link></p>}>
      {searchParams.get("registered") === "true" && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">Account created. You can sign in now.</div>}
      {error && <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert"><FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" /><span>{error}</span></div>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-800">Email address</label>
          <div className="relative mt-2"><FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className={inputClassName} /></div>
        </div>
        <div>
          <div className="flex items-center justify-between"><label htmlFor="password" className="block text-sm font-semibold text-slate-800">Password</label><span className="text-xs text-slate-500">8+ characters</span></div>
          <div className="relative mt-2">
            <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className={`${inputClassName} pr-12`} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-pine px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-sage focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting && <FiLoader className="animate-spin" aria-hidden="true" />}{isSubmitting ? "Signing in…" : "Sign in securely"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Your session is encrypted and expires automatically for added protection.</p>
    </AuthShell>
  );
}
