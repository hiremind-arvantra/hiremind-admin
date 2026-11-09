"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/marketing/BrandLogo";
import { clearAuth } from "@/lib/api/config";

import { loginAdmin } from "./services/adminAuth.service";

/*
 * Platform-administrator sign-in.
 *
 * Served only on the admin hostname. Three things are deliberately absent:
 *
 *  - No role picker. The hostname already decided.
 *  - No "create an account" link, and no route behind one. Administrators are created
 *    by hand; /auth/register refuses the account type, so offering sign-up would
 *    advertise a door that is bolted shut.
 *  - No social or SSO buttons, since none are wired for this account type.
 *
 * Like the candidate and recruiter login pages, reaching this page clears any existing
 * session — on mount and on `pageshow`, the one event a back/forward-cache restore
 * fires. Walking Back to the login page and pressing Forward therefore lands on a shell
 * with no token, which bounces straight back here.
 */

/** Only a path inside this site, and only one inside the admin panel. */
function requestedPath(): string | null {
  if (typeof window === "undefined") return null;
  const target = new URLSearchParams(window.location.search).get("next");
  if (!target || !target.startsWith("/") || target.startsWith("//")) return null;
  return target.startsWith("/admin") ? target : null;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reset = () => clearAuth();
    reset();
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { mustResetPassword } = await loginAdmin(trimmed, password, rememberMe);
      const next = requestedPath();
      if (mustResetPassword) {
        router.replace(`/set-password?next=${encodeURIComponent(next ?? "/admin")}`);
        return;
      }
      // replace, not push: Back should not return to a login form that has just
      // cleared the session it would need.
      router.replace(next ?? "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col app-canvas">
      <header className="chrome-header shrink-0 border-b-transparent relative z-10">
        <div className="site-container h-full flex items-center justify-between gap-3">
          <BrandLogo size="md" />
          <span className="badge badge-brand">Admin</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          <div className="card-elevated p-6 sm:p-8 animate-fade-up">
            <div className="flex flex-col items-center text-center">
              <span className="icon-tile bg-brand-50 text-brand-600 mb-3">
                <ShieldIcon />
              </span>
              <h1 className="text-heading font-bold text-ink-900 font-display">Platform Admin</h1>
              <p className="mt-1.5 text-body-sm text-ink-500">
                Sign in to manage agencies, plans, roles and platform settings.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              {error && (
                <p role="alert" className="alert alert-danger text-body-sm">
                  {error}
                </p>
              )}

              <div>
                <label className="field-label" htmlFor="admin-email">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  className="field-input"
                  placeholder="you@arvantra-ai.com"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="admin-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    className="field-input pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-body-sm text-ink-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  Keep me signed in
                </label>
                <a href="/forgot-password" className="text-body-sm font-medium text-brand-600 hover:text-brand-700">
                  Forgot password?
                </a>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full mt-1">
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-caption text-ink-500">
            Administrator accounts are provisioned by the platform team. There is no self
            sign-up.
          </p>
        </div>
      </main>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
      <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.3 4.2M6.3 6.3A17.6 17.6 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 3.3-.6" strokeLinecap="round" />
    </svg>
  );
}
