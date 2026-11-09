"use client";

import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";

import { AdminError, useAdminResource } from "./components/AdminData";
import { fetchSystemSettings, saveSystemSettings } from "./services/admin.service";

import type { SystemSettings } from "./types";

/*
 * System Settings — platform-wide configuration.
 *
 * Two of these change behaviour the moment they are saved, so they are called out rather
 * than sitting as plain switches: maintenance mode takes the apps offline for everyone,
 * and self-signup governs whether new agencies can register without an admin.
 */
export default function SettingsPage() {
  const { data, loading, error, reload } = useAdminResource(() => fetchSystemSettings(), []);
  const [form, setForm] = useState<SystemSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (form.maintenanceMode && !data?.maintenanceMode) {
      if (!window.confirm("Turning on maintenance mode takes the candidate and recruiter apps offline for everyone. Continue?")) return;
    }
    setSaving(true);
    setFailure(null);
    try {
      await saveSystemSettings(form);
      setNotice("Settings saved.");
      reload();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={<Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]} />}
        title="System Settings"
        subtitle="Platform-wide configuration for the candidate app, the recruiter app and the AI services."
      />

      {notice && (
        <div role="status" className="alert alert-success mb-4 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      {error && <AdminError message={error} onRetry={reload} />}
      {!error && loading && <p className="text-body-sm text-ink-500">Loading settings…</p>}

      {!error && form && (
        <form className="space-y-4 max-w-[1100px]" onSubmit={submit}>
          {failure && <p role="alert" className="field-error">{failure}</p>}

          <section className="card p-5" aria-labelledby="general">
            <h2 id="general" className="section-title mb-4">General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="platformName">Platform name</label>
                <input id="platformName" className="field-input" value={form.platformName} onChange={(e) => set("platformName", e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="supportEmail">Support email</label>
                <input id="supportEmail" type="email" className="field-input" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="defaultTimezone">Default time zone</label>
                <input id="defaultTimezone" className="field-input" value={form.defaultTimezone} onChange={(e) => set("defaultTimezone", e.target.value)} />
                <p className="field-hint">An IANA zone, e.g. Asia/Kolkata.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="sessionTimeoutMinutes">Session timeout (minutes)</label>
                <input id="sessionTimeoutMinutes" type="number" min={5} className="field-input" value={form.sessionTimeoutMinutes} onChange={(e) => set("sessionTimeoutMinutes", Number(e.target.value))} />
                <p className="field-hint">Mirrors JWT_ACCESS_TOKEN_MINUTES; existing tokens keep their original expiry.</p>
              </div>
            </div>
          </section>

          <section className="card p-5" aria-labelledby="uploads">
            <h2 id="uploads" className="section-title mb-4">Résumés &amp; Parsing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="resumeMaxSizeMb">Max résumé size (MB)</label>
                <input id="resumeMaxSizeMb" type="number" min={1} max={25} className="field-input" value={form.resumeMaxSizeMb} onChange={(e) => set("resumeMaxSizeMb", Number(e.target.value))} />
                <p className="field-hint">Must match the services&apos; multipart limit, or uploads fail with a 413 before any code runs.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="parsePreviewRateLimit">Parse-preview rate limit</label>
                <input id="parsePreviewRateLimit" type="number" min={1} className="field-input" value={form.parsePreviewRateLimit} onChange={(e) => set("parsePreviewRateLimit", Number(e.target.value))} />
                <p className="field-hint">Requests per IP per 10 minutes. In-memory and per node — it resets on restart.</p>
              </div>
            </div>
          </section>

          <section className="card p-5" aria-labelledby="access">
            <h2 id="access" className="section-title mb-4">Access</h2>
            <div className="space-y-3">
              <Toggle
                id="allowAgencySelfSignup"
                label="Allow agency self sign-up"
                hint="When off, only an admin can create a new agency."
                checked={form.allowAgencySelfSignup}
                onChange={(value) => set("allowAgencySelfSignup", value)}
              />
              <Toggle
                id="maintenanceMode"
                label="Maintenance mode"
                hint="Takes the candidate and recruiter apps offline for everyone. The admin panel stays reachable."
                checked={form.maintenanceMode}
                onChange={(value) => set("maintenanceMode", value)}
                danger
              />
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
  danger = false,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${danger && checked ? "border-danger/40 bg-danger/5" : "border-ink-200"}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={`${id}-hint`}
        className="mt-0.5 w-4 h-4 accent-brand-600"
      />
      <span className="min-w-0">
        <label htmlFor={id} className="block text-body-sm font-semibold text-ink-900">{label}</label>
        <span id={`${id}-hint`} className="block text-caption text-ink-500">{hint}</span>
      </span>
    </div>
  );
}
