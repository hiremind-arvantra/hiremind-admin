"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCardShell, { AuthGlyph } from "./AuthCardShell";
import { changePassword } from "../services/auth.service";
import { fetchCompanyProfile } from "../services/company.service";
import { isStrongPassword } from "./candidate-reg/shared/validators";

/**
 * Forced password reset for a provisioned (team-member) account on first login.
 * The user is already authenticated (tokens stored at login); they enter the
 * temporary password they were given plus a new password, then continue to the
 * `next` destination passed by the login page.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/company/dashboard";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentPassword) return setError("Enter your temporary password.");
    const strong = isStrongPassword(newPassword);
    if (strong) return setError(strong);
    if (newPassword !== confirm) return setError("Passwords do not match.");
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      if (next.startsWith("/company")) await fetchCompanyProfile().catch(() => {});
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthCardShell>
      <AuthGlyph kind="lock" />
      <h1 className="page-title mt-5">Set a new password</h1>
      <p className="page-subtitle">
        For security, please replace your temporary password before continuing.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        <Field id="currentPassword" label="Temporary password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter the password you were given" describedBy={error ? "set-password-error" : undefined} />
        <div className="pt-5 border-t border-ink-200/70 space-y-5">
          <Field id="newPassword" label="New password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 chars, mixed case, number, symbol" describedBy={error ? "set-password-error" : undefined} />
          <Field id="confirmPassword" label="Confirm new password" value={confirm} onChange={setConfirm} placeholder="Re-enter new password" describedBy={error ? "set-password-error" : undefined} />
        </div>

        {error && <p id="set-password-error" role="alert" className="alert alert-danger">{error}</p>}

        <button type="submit" disabled={saving}
          className="btn btn-primary btn-lg w-full">
          {saving ? "Saving…" : "Set password & continue"}
        </button>
      </form>
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
