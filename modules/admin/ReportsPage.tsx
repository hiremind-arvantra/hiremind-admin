"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";

import {
  AdminError,
  AdminStatCard,
  StatRowSkeleton,
  formatDelta,
  formatNumber,
  useAdminResource,
} from "./components/AdminData";
import { RangeSelect } from "./components/RangeSelect";
import { TrendChart } from "./components/TrendChart";
import { fetchReports } from "./services/admin.service";

import type { ReportRange } from "./types";

const QUICK_REPORTS = [
  { title: "Agency Report", detail: "Agencies, plan, users and status.", href: "/admin/agencies" },
  { title: "User Report", detail: "User count, roles and activity.", href: "/admin/roles" },
  { title: "Candidate Report", detail: "Candidate registrations and profile status.", href: "/admin/reports" },
  { title: "Job Posting Report", detail: "Jobs created, open/closed and applications.", href: "/admin/reports" },
  { title: "Plan & Revenue Report", detail: "Plan subscriptions, renewals and usage.", href: "/admin/plans" },
];

/* Reports — platform-wide usage, with the audit trail on its own route. */
export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>("LAST_30_DAYS");
  const { data, loading, error, reload } = useAdminResource(() => fetchReports(range), [range]);

  return (
    <>
      <PageHeader
        eyebrow={<Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Reports & Audit" }]} />}
        title="Reports & Audit"
        subtitle="View platform reports, usage analytics and audit logs to monitor activities and ensure compliance."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <div className="tab-line mb-4" role="tablist" aria-label="Reports sections">
        <span className="tab tab-active" role="tab" aria-selected="true">Reports</span>
        <Link href="/admin/reports/audit" className="tab" role="tab" aria-selected="false">Audit Logs</Link>
      </div>

      {error && <AdminError message={error} onRetry={reload} />}
      {!error && (loading || !data) && <StatRowSkeleton />}

      {!error && data && (
        <div className="space-y-4 max-w-[1100px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard stat={data.stats.totalAgencies} />
            <AdminStatCard stat={data.stats.totalUsers} />
            <AdminStatCard stat={data.stats.totalCandidates} />
            <AdminStatCard stat={data.stats.totalJobPostings} />
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <section className="card p-5" aria-labelledby="usage-overview">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h2 id="usage-overview" className="section-title">Usage Overview</h2>
                <ul className="flex items-center gap-4 text-caption text-ink-500">
                  <li className="flex items-center gap-1.5"><Dot className="bg-brand-600" /> Candidates</li>
                  <li className="flex items-center gap-1.5"><Dot className="bg-cobalt-500" /> Job Postings</li>
                  <li className="flex items-center gap-1.5"><Dot className="bg-brand-300" /> Users</li>
                </ul>
              </div>
              <TrendChart
                points={data.usage}
                caption="Platform usage over the selected period"
                series={[
                  { key: "candidates", label: "Candidates", color: "var(--color-brand-600)" },
                  { key: "jobPostings", label: "Job Postings", color: "var(--color-cobalt-500)" },
                  { key: "users", label: "Users", color: "var(--color-brand-300)" },
                ]}
              />
            </section>

            <section className="card p-5" aria-labelledby="quick-reports">
              <h2 id="quick-reports" className="section-title mb-3">Quick Reports</h2>
              <ul className="space-y-2">
                {QUICK_REPORTS.map((report) => (
                  <li key={report.title}>
                    <Link
                      href={report.href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3 hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block text-body-sm font-semibold text-ink-900">{report.title}</span>
                        <span className="block text-caption text-ink-500 truncate">{report.detail}</span>
                      </span>
                      <span className="text-brand-600 shrink-0" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="card p-5" aria-labelledby="activity-summary">
            <h2 id="activity-summary" className="section-title mb-3">Recent Activity Summary</h2>
            {data.activity.length === 0 ? (
              <p className="empty-state text-body-sm">No activity in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th scope="col">Activity</th>
                      <th scope="col">Count</th>
                      <th scope="col">Change (vs. previous period)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.activity.map((row) => (
                      <tr key={row.activity}>
                        <td className="font-medium text-ink-800">{row.activity}</td>
                        <td>{formatNumber(row.count)}</td>
                        <td>
                          {row.changePercent === null ? (
                            <span className="text-ink-400">—</span>
                          ) : (
                            <span className={row.changePercent >= 0 ? "badge badge-success" : "badge badge-warn"}>
                              {formatDelta(row.changePercent)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`inline-block w-2 h-2 rounded-full ${className}`} />;
}
