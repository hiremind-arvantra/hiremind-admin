"use client";

import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";

import { AdminError, formatNumber, formatPaise, useAdminResource } from "./components/AdminData";
import { EditPlanModal } from "./components/EditPlanModal";
import { fetchPlanRevenue, fetchPlans, fetchPricingSettings, savePricingSettings } from "./services/admin.service";

import type { AdminPlan, PlanLimits, PricingSettings } from "./types";

type Tab = "plans" | "pricing" | "features";

const limitLabel = (value: number | null): string => (value === null ? "Unlimited" : `Up to ${formatNumber(value)}`);

const LIMIT_ROWS: { key: keyof PlanLimits; label: string }[] = [
  { key: "agencyUsers", label: "Agency Users" },
  { key: "candidates", label: "Candidates" },
  { key: "jobPostings", label: "Job Postings" },
  { key: "resumeParsesPerMonth", label: "Résumé Parsing / month" },
];

/*
 * Plans & Pricing — the plan catalog, the pricing configuration behind it, and the
 * feature comparison.
 *
 * Prices are held in paise end to end so the browser never rounds a rupee amount; the
 * Edit Plan modal is the only place they change, and it posts the whole plan at once.
 */
export default function PlansPage() {
  const [tab, setTab] = useState<Tab>("plans");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: plans, loading, error, reload } = useAdminResource(() => fetchPlans(), []);

  return (
    <>
      <PageHeader
        eyebrow={<Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Plans & Pricing" }]} />}
        title="Plans & Pricing"
        subtitle="Create and manage subscription plans, pricing, features and limits for agencies."
      />

      {notice && (
        <div role="status" className="alert alert-info mb-4 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      {error && <AdminError message={error} onRetry={reload} />}
      {!error && loading && <p className="text-body-sm text-ink-500">Loading plans…</p>}

      {!error && !loading && plans && (
        <div className="space-y-4 max-w-[1100px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="tab-line" role="tablist" aria-label="Plans sections">
              {([["plans", "Plans"], ["pricing", "Pricing Settings"], ["features", "Plan Features"]] as const).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={`tab ${tab === key ? "tab-active" : ""}`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>

            {tab === "plans" && (
              <div className="inline-flex rounded-xl border border-ink-200 p-1 bg-white" role="group" aria-label="Billing period">
                {(["monthly", "yearly"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={period === value}
                    onClick={() => setPeriod(value)}
                    className={`px-3 h-8 rounded-lg text-caption font-semibold capitalize transition-colors ${period === value ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>

          {tab === "plans" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <article key={plan.key} className={`card p-5 flex flex-col ${plan.mostPopular ? "card-highlight" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-title font-bold text-ink-900">{plan.name}</h2>
                        {plan.tagline && <p className="mt-1 text-caption text-ink-500">{plan.tagline}</p>}
                      </div>
                      {plan.mostPopular && <span className="badge badge-brand">Most Popular</span>}
                    </div>

                    <p className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-display-sm font-bold text-ink-900">
                        {formatPaise(period === "monthly" ? plan.monthlyPaise : plan.yearlyPaise)}
                      </span>
                      <span className="text-caption text-ink-500">/{period === "monthly" ? "month" : "year"}</span>
                    </p>
                    {plan.monthlyPaise === 0 && <span className="badge badge-neutral mt-1">Free Plan</span>}

                    <ul className="mt-4 space-y-2 flex-1">
                      {plan.features.filter((feature) => feature.included).map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2 text-body-sm text-ink-700">
                          <CheckIcon />
                          <span>{feature.label}{feature.value ? ` (${feature.value})` : ""}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 text-caption text-ink-500">
                      {formatNumber(plan.agencyCount)} {plan.agencyCount === 1 ? "agency" : "agencies"} on this plan
                    </p>

                    <button
                      type="button"
                      onClick={() => setEditing(plan)}
                      className={`btn mt-3 w-full ${plan.mostPopular ? "btn-primary" : "btn-outline"}`}
                    >
                      Edit Plan
                    </button>
                  </article>
                ))}
              </div>

              <section className="card p-5" aria-labelledby="feature-comparison">
                <h2 id="feature-comparison" className="section-title mb-3">Feature Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th scope="col">Feature</th>
                        {plans.map((plan) => <th key={plan.key} scope="col" className="text-center">{plan.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {LIMIT_ROWS.map((row) => (
                        <tr key={row.key}>
                          <th scope="row" className="text-left font-medium text-ink-800">{row.label}</th>
                          {plans.map((plan) => (
                            <td key={plan.key} className="text-center">{limitLabel(plan.limits[row.key])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {tab === "pricing" && <PricingSettingsPanel onSaved={() => setNotice("Pricing settings saved.")} />}

          {tab === "features" && <PlanFeaturesPanel plans={plans} />}
        </div>
      )}

      {editing && (
        <EditPlanModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={(plan) => {
            setEditing(null);
            setNotice(`${plan.name} saved.`);
            reload();
          }}
        />
      )}
    </>
  );
}

/* ── Pricing settings tab ─────────────────────────────────────────────────── */

function PricingSettingsPanel({ onSaved }: { onSaved: () => void }) {
  const { data, loading, error, reload } = useAdminResource(() => fetchPricingSettings(), []);
  const [form, setForm] = useState<PricingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading) return <p className="text-body-sm text-ink-500">Loading pricing settings…</p>;
  if (error) return <AdminError message={error} onRetry={reload} />;
  if (!form) return null;

  const set = <K extends keyof PricingSettings>(key: K, value: PricingSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFailure(null);
    try {
      await savePricingSettings(form);
      onSaved();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Could not save pricing settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card p-5 space-y-4" onSubmit={submit}>
      <h2 className="section-title">Pricing Settings</h2>
      {failure && <p role="alert" className="field-error">{failure}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Currency" htmlFor="currency">
          <input id="currency" className="field-input" value={form.currency} onChange={(e) => set("currency", e.target.value)} />
        </Field>
        <Field label="Invoice prefix" htmlFor="invoicePrefix">
          <input id="invoicePrefix" className="field-input" value={form.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} />
        </Field>
        <Field label="Tax (%)" htmlFor="taxPercent">
          <input id="taxPercent" type="number" min={0} max={100} className="field-input" value={form.taxPercent} onChange={(e) => set("taxPercent", Number(e.target.value))} />
        </Field>
        <Field label="Yearly discount (%)" htmlFor="yearlyDiscountPercent">
          <input id="yearlyDiscountPercent" type="number" min={0} max={100} className="field-input" value={form.yearlyDiscountPercent} onChange={(e) => set("yearlyDiscountPercent", Number(e.target.value))} />
        </Field>
        <Field label="Trial (days)" htmlFor="trialDays">
          <input id="trialDays" type="number" min={0} className="field-input" value={form.trialDays} onChange={(e) => set("trialDays", Number(e.target.value))} />
        </Field>
        <Field label="Grace period (days)" htmlFor="gracePeriodDays">
          <input id="gracePeriodDays" type="number" min={0} className="field-input" value={form.gracePeriodDays} onChange={(e) => set("gracePeriodDays", Number(e.target.value))} />
        </Field>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Settings"}</button>
      </div>
    </form>
  );
}

/* ── Plan features tab ────────────────────────────────────────────────────── */

function PlanFeaturesPanel({ plans }: { plans: AdminPlan[] }) {
  const { data: revenue } = useAdminResource(() => fetchPlanRevenue(), []);

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <section key={plan.key} className="card p-5" aria-labelledby={`features-${plan.key}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id={`features-${plan.key}`} className="section-title">{plan.name}</h2>
            <span className="text-caption text-ink-500">
              {formatNumber(plan.agencyCount)} {plan.agencyCount === 1 ? "agency" : "agencies"}
            </span>
          </div>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.features.map((feature) => (
              <li key={feature.id} className="flex items-center gap-2 text-body-sm">
                <span className={feature.included ? "text-success" : "text-ink-300"} aria-hidden="true">
                  {feature.included ? "✓" : "—"}
                </span>
                <span className={feature.included ? "text-ink-800" : "text-ink-400"}>
                  {feature.label}{feature.value ? `: ${feature.value}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {revenue && revenue.length > 0 && (
        <section className="card p-5" aria-labelledby="plan-revenue">
          <h2 id="plan-revenue" className="section-title mb-3">Plan &amp; Revenue</h2>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th scope="col">Plan</th>
                  <th scope="col">Active Subscriptions</th>
                  <th scope="col">Monthly Revenue</th>
                  <th scope="col">Yearly Revenue</th>
                  <th scope="col">Renewals Due</th>
                </tr>
              </thead>
              <tbody>
                {revenue.map((row) => (
                  <tr key={row.key}>
                    <td className="font-semibold text-ink-900">{row.name}</td>
                    <td>{formatNumber(row.activeSubscriptions)}</td>
                    <td>{formatPaise(row.monthlyRevenuePaise)}</td>
                    <td>{formatPaise(row.yearlyRevenuePaise)}</td>
                    <td>{formatNumber(row.renewalsDue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="field-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5 text-success">
      <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
