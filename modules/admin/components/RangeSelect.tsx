"use client";

import type { ReportRange } from "../types";

/*
 * The date-range control in the admin page headers. Matches the recruiter dashboard's
 * Hiring Overview select — a native <select> with the chevron drawn over it, so keyboard
 * and mobile behaviour come for free.
 */

const OPTIONS: { value: ReportRange; label: string }[] = [
  { value: "LAST_7_DAYS", label: "Last 7 Days" },
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days" },
  { value: "LAST_12_MONTHS", label: "Last 12 Months" },
];

export function RangeSelect({
  value,
  onChange,
  label = "Show data for",
}: {
  value: ReportRange;
  onChange: (range: ReportRange) => void;
  label?: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ReportRange)}
        className="appearance-none h-10 pl-3.5 pr-9 rounded-xl border border-ink-200 bg-white text-body-sm font-medium text-ink-800 hover:border-ink-300 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-400 transition-colors"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </label>
  );
}
