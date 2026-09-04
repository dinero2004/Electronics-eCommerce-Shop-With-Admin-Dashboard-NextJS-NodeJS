import Link from "next/link";
import type { ReactNode } from "react";
import { FiCheck, FiLock, FiShield } from "react-icons/fi";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

const benefits = [
  "Secure Stripe test checkout",
  "Card, wallet and TWINT ready",
  "Orders protected by your account",
];

export default function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="relative min-h-[calc(100vh-9rem)] overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-brand-sage/40 blur-3xl" />
        <div className="absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-brand-sand/50 blur-3xl" />
      </div>
      <div className="relative mx-auto grid min-h-[680px] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_80px_-32px_rgba(15,23,42,0.35)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-ink via-[#29443D] to-brand-pine p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10 bg-white/5" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-2xl" aria-hidden="true" />
          <Link href="/" className="relative inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide backdrop-blur">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist text-brand-ink"><FiShield aria-hidden="true" /></span>
            MY FIRST SHOP
          </Link>
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-mist"><FiLock aria-hidden="true" /> Secure shopping</span>
            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight">One account for a smoother checkout.</h2>
            <p className="mt-4 text-base leading-7 text-brand-mist/80">Save your order history, keep checkout details protected and test the complete Stripe payment flow with confidence.</p>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm font-medium text-brand-mist">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-sage text-brand-ink"><FiCheck aria-hidden="true" /></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-brand-mist/70">Sandbox payments · No real charges while testing</p>
        </section>
        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-pine lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-pine text-white"><FiShield aria-hidden="true" /></span>
              MY FIRST SHOP
            </Link>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-pine">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
