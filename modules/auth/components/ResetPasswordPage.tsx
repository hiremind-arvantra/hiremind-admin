"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCardShell, { AuthGlyph } from "./AuthCardShell";
import { resetPassword } from "../services/auth.service";
import { isStrongPassword } from "./candidate-reg/shared/validators";

/**
 * Forgot-password step 2: the user arrives from the emailed link
 * (/reset-password?token=…), enters a new password, and we call
 * POST /auth/reset-password. On success they return to login.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) return setError("This reset link is invalid or has expired. Please request a new one.");
    const strong = isStrongPassword(newPassword);
    if (strong) return setError(strong);
    if (newPassword !== confirm) return setError("Passwords do not match.");
    setSaving(true);
    try {
      await resetPassword(token, newPassword, confirm);
      setDone(true);
      setTimeout(() => router.push("/login"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthCardShell>
      {done ? (
        <div role="status">
          <AuthGlyph kind="check" tone="success" />
          <h1 className="page-title mt-5">Password updated</h1>
          <p className="page-subtitle flex items-center gap-2">
            <span aria-hidden="true" className="w-3.5 h-3.5 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
            Redirecting you to login…
          </p>
        </div>
      ) : !token ? (
        <div>
          <AuthGlyph kind="link" />
          <h1 className="page-title mt-5">Invalid reset link</h1>
          <p className="page-subtitle">This link is invalid or has expired.</p>
          <Link href="/forgot-password" className="mt-7 btn btn-primary btn-lg w-full">
            Request a new link
          </Link>
        </div>
      ) : (
        <>
          <AuthGlyph kind="lock" />
          <h1 className="page-title mt-5">Set a new password</h1>
          <p className="page-subtitle">Choose a strong password you haven&apos;t used before.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            <Field id="newPassword" label="New password" value={newPassword} onChange={(v) => { setNewPassword(v); setError(null); }} placeholder="At least 8 chars, mixed case, number, symbol" describedBy={error ? "reset-error" : undefined} />
            <Field id="confirmPassword" label="Confirm new password" value={confirm} onChange={(v) => { setConfirm(v); setError(null); }} placeholder="Re-enter new password" describedBy={error ? "reset-error" : undefined} />

            {error && <p id="reset-error" role="alert" className="alert alert-danger">{error}</p>}

            <button type="submit" disabled={saving}
              className="btn btn-primary btn-lg w-full">
              {saving ? "Saving…" : "Reset password"}
            </button>
          </form>
        </>
      )}
    </AuthCardShell>
  );
}

function Field({ id, label, value, onChange, placeholder, describedBy }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; describedBy?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input id={id} type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        aria-describedby={describedBy}
        className="field-input" />
    </div>
  );
}
