"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCardShell, { AuthGlyph } from "./AuthCardShell";
import { forgotPassword } from "../services/auth.service";

/**
 * Forgot-password step 1: the user enters their email + account type; we call
 * POST /auth/forgot-password which (for a matching account) creates a reset token
 * and emails a link to /reset-password?token=…. We always show the same success
 * message to avoid leaking which emails are registered.
 */
export default function ForgotPasswordPage() {
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Enter a valid email address.");
    }
    setSending(true);
    try {
      await forgotPassword(email, role);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthCardShell>
      {sent ? (
        <div>
          <AuthGlyph kind="send" tone="success" />
          <h1 className="page-title mt-5">Check your email</h1>
          <p className="page-subtitle">
            If an account exists for <span className="font-semibold text-ink-800 break-all">{email}</span>, we&apos;ve sent a
            password reset link. It expires in 30 minutes.
          </p>
          <Link href="/login" className="mt-7 btn btn-primary btn-lg w-full">
            Back to Login
          </Link>
          <button type="button" onClick={() => setSent(false)} className="mt-2 btn btn-ghost w-full text-brand-700">
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <AuthGlyph kind="key" />
          <h1 className="page-title mt-5">Forgot your password?</h1>
          <p className="page-subtitle">
            Enter the email linked to your account and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            <div>
              <span id="fp-role-label" className="field-label">Account type</span>
              <div role="group" aria-labelledby="fp-role-label" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-ink-100/80 border border-ink-200/60">
                {(["candidate", "recruiter"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`min-h-10 px-2 py-1.5 rounded-lg text-body-sm font-semibold leading-tight transition-[background-color,color,box-shadow] ${
                      role === r
                        ? "bg-white text-ink-900 shadow-card ring-1 ring-ink-200/60"
                        : "text-ink-500 hover:text-ink-800"
                    }`}
                  >
                    {r === "candidate" ? "Candidate" : "Recruitment Company"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="field-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="Enter your email address"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "fp-error" : undefined}
                className={`field-input ${error ? "border-danger/70 hover:border-danger focus:border-danger" : ""}`}
              />
              {error && <p id="fp-error" role="alert" className="field-error">{error}</p>}
            </div>

            <button type="submit" disabled={sending}
              className="btn btn-primary btn-lg w-full">
              {sending ? "Sending…" : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 pt-5 border-t border-ink-200/70 text-center text-body-sm text-ink-500">
            Remembered it?{" "}
            <Link href="/login" className="text-brand-700 font-semibold hover:text-brand-800">Back to Login</Link>
          </p>
        </>
      )}
    </AuthCardShell>
  );
}
