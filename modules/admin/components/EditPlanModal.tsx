"use client";

import { useEffect, useRef, useState } from "react";

import { updatePlan } from "../services/admin.service";

import type { AdminPlan, PlanLimits } from "../types";

/*
 * Edit Plan.
 *
 * Prices are entered in rupees but held and sent in paise — the browser never handles a
 * fractional rupee, which is why the plan catalog is authoritative server-side in the
 * first place.
 *
 * A blank limit means "unlimited" rather than zero. Zero would be a real limit that
 * blocks everything, so the two are kept distinct all the way to the API (null vs 0).
 */

const LIMIT_FIELDS: { key: keyof PlanLimits; label: string }[] = [
  { key: "agencyUsers", label: "Agency users" },
  { key: "candidates", label: "Candidates" },
  { key: "jobPostings", label: "Job postings" },
  { key: "resumeParsesPerMonth", label: "Résumé parses / month" },
];

const toRupees = (paise: number): string => String(Math.round(paise / 100));
const toPaise = (rupees: string): number => Math.round((Number(rupees) || 0) * 100);
const limitToInput = (value: number | null): string => (value === null ? "" : String(value));
const inputToLimit = (value: string): number | null => (value.trim() === "" ? null : Number(value) || 0);

export function EditPlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: AdminPlan;
  onClose: () => void;
  onSaved: (plan: AdminPlan) => void;
}) {
  const [name, setName] = useState(plan.name);
  const [tagline, setTagline] = useState(plan.tagline ?? "");
  const [monthly, setMonthly] = useState(toRupees(plan.monthlyPaise));
  const [yearly, setYearly] = useState(toRupees(plan.yearlyPaise));
  const [mostPopular, setMostPopular] = useState(plan.mostPopular);
  const [active, setActive] = useState(plan.active);
  const [limits, setLimits] = useState<Record<keyof PlanLimits, string>>({
    agencyUsers: limitToInput(plan.limits.agencyUsers),
    candidates: limitToInput(plan.limits.candidates),
    jobPostings: limitToInput(plan.limits.jobPostings),
    resumeParsesPerMonth: limitToInput(plan.limits.resumeParsesPerMonth),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape closes; focus moves into the dialog so the keyboard starts inside it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const saved = await updatePlan(plan.key, {
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        monthlyPaise: toPaise(monthly),
        yearlyPaise: toPaise(yearly),
        mostPopular,
        active,
        limits: {
          agencyUsers: inputToLimit(limits.agencyUsers),
          candidates: inputToLimit(limits.candidates),
          jobPostings: inputToLimit(limits.jobPostings),
          resumeParsesPerMonth: inputToLimit(limits.resumeParsesPerMonth),
        },
        features: plan.features.map((feature) => ({
          label: feature.label,
          value: feature.value,
          included: feature.included,
        })),
      });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-plan-title"
        className="relative card card-elevated w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
      >
        <h2 id="edit-plan-title" className="text-title-lg font-bold text-ink-900">Edit {plan.name}</h2>
        <p className="mt-1 text-body-sm text-ink-500">
          Changes apply to new subscriptions immediately. Existing subscriptions keep the price they were created with.
        </p>

        <form className="mt-5 space-y-4" onSubmit={submit}>
          {error && <p role="alert" className="field-error">{error}</p>}

          <div>
            <label className="field-label" htmlFor="plan-name">Plan name</label>
            <input id="plan-name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="field-label" htmlFor="plan-tagline">Tagline</label>
            <input id="plan-tagline" className="field-input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="plan-monthly">Monthly price (₹)</label>
              <input id="plan-monthly" type="number" min={0} className="field-input" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="plan-yearly">Yearly price (₹)</label>
              <input id="plan-yearly" type="number" min={0} className="field-input" value={yearly} onChange={(e) => setYearly(e.target.value)} />
            </div>
          </div>

          <fieldset>
            <legend className="field-label">Limits</legend>
            <p className="field-hint mb-2">Leave a field blank for unlimited.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LIMIT_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="field-label" htmlFor={`limit-${field.key}`}>{field.label}</label>
                  <input
                    id={`limit-${field.key}`}
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    className="field-input"
                    value={limits[field.key]}
                    onChange={(e) => setLimits((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-body-sm text-ink-700">
              <input type="checkbox" checked={mostPopular} onChange={(e) => setMostPopular(e.target.checked)} className="w-4 h-4 accent-brand-600" />
              Mark as most popular
            </label>
            <label className="inline-flex items-center gap-2 text-body-sm text-ink-700">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-brand-600" />
              Plan is active
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Plan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
