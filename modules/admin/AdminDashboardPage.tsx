"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  AdminError,
  AdminStatCard,
  StatRowSkeleton,
  formatDate,
  formatNumber,
  formatPaise,
  statusBadgeClass,
  useAdminResource,
} from "./components/AdminData";
import { RangeSelect } from "./components/RangeSelect";
import { TrendChart } from "./components/TrendChart";
import { fetchPlatformOverview } from "./services/admin.service";

import type { ReportRange } from "./types";

/*
 * Admin Dashboard — the platform's own overview, not any one agency's.
 *
 * Every number here is cross-tenant and comes from one call, so the page makes a single
 * request per range rather than one per card.
 */
export default function AdminDashboardPage() {
  const [range, setRange] = useState<ReportRange>("LAST_30_DAYS");
  const { data, loading, error, reload } = useAdminResource(
    () => fetchPlatformOverview(range),
    [range],
  );

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage agencies, pricing, roles, permissions and platform configuration."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      {error && <AdminError message={error} onRetry={reload} />}

      {!error && (loading || !data) && (
        <div className="space-y-4">
          <StatRowSkeleton />
        </div>
      )}

      {!error && data && (
        <div className="space-y-4 max-w-[1100px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard stat={data.stats.totalAgencies} icon={<BuildingIcon />} iconClassName="bg-brand-50 text-brand-600" />
            <AdminStatCard stat={data.stats.totalUsers} icon={<UsersIcon />} iconClassName="bg-cobalt-50 text-cobalt-600" />
            <AdminStatCard stat={data.stats.activePlans} icon={<LayersIcon />} iconClassName="bg-green-50 text-green-600" />
            <AdminStatCard stat={data.stats.activeSubscriptions} icon={<DocIcon />} iconClassName="bg-peach-50 text-peach-600" />
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <section className="card p-5" aria-labelledby="platform-overview">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h2 id="platform-overview" className="section-title">Platform Overview</h2>
                <ul className="flex items-center gap-4 text-caption text-ink-500">
                  <li className="flex items-center gap-1.5"><Dot className="bg-brand-600" /> Agencies</li>
                  <li className="flex items-center gap-1.5"><Dot className="bg-cobalt-500" /> Users</li>
                  <li className="flex items-center gap-1.5"><Dot className="bg-brand-300" /> Subscriptions</li>
                </ul>
              </div>
              <TrendChart
                points={data.trend}
                series={[
                  { key: "users", label: "Users", color: "var(--color-cobalt-500)" },
                  { key: "agencies", label: "Agencies", color: "var(--color-brand-600)" },
                  { key: "subscriptions", label: "Subscriptions", color: "var(--color-brand-300)" },
                ]}
              />
            </section>

            <section className="card p-5" aria-labelledby="quick-actions">
              <h2 id="quick-actions" className="section-title mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction href="/admin/agencies" label="Agencies" icon={<BuildingIcon />} />
                <QuickAction href="/admin/roles" label="Create Role" icon={<UsersIcon />} />
                <QuickAction href="/admin/plans" label="Manage Plans" icon={<LayersIcon />} />
                <QuickAction href="/admin/reports" label="View Reports" icon={<ChartIcon />} />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <section className="card p-5 min-w-0" aria-labelledby="recent-agencies">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 id="recent-agencies" className="section-title">Recent Agencies</h2>
                <Link href="/admin/agencies" className="text-body-sm font-semibold text-brand-600 hover:text-brand-700">
                  View All <span aria-hidden="true">→</span>
                </Link>
              </div>
              {data.recentAgencies.length === 0 ? (
                <p className="empty-state text-body-sm">No agencies yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table data-table-compact w-full">
                    <thead>
                      <tr>
                        <th scope="col">Agency</th>
                        <th scope="col">Plan</th>
                        <th scope="col">Users</th>
                        <th scope="col">Status</th>
                        <th scope="col">Added On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAgencies.map((agency) => (
                        <tr key={agency.id}>
                          <td className="font-semibold text-ink-900">{agency.companyName}</td>
                          <td><span className="badge badge-brand">{agency.planName ?? "—"}</span></td>
                          <td>{formatNumber(agency.userCount)}</td>
                          <td><span className={statusBadgeClass(agency.status)}>{agency.status}</span></td>
                          <td className="text-ink-500">{formatDate(agency.createdOn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="card p-5" aria-labelledby="plan-summary">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 id="plan-summary" className="section-title">Plan Summary</h2>
                <Link href="/admin/plans" className="text-body-sm font-semibold text-brand-600 hover:text-brand-700">
                  Manage <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul className="space-y-3">
                {data.planSummary.map((plan) => (
                  <li key={plan.key} className="rounded-xl border border-ink-200 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-body-sm font-bold text-ink-900">{plan.name}</span>
                      <span className="text-body-sm font-semibold text-ink-700">
                        {formatPaise(plan.monthlyPaise)}
                        <span className="text-micro text-ink-400">/month</span>
                      </span>
                    </div>
                    <p className="mt-1 text-caption text-ink-500">
                      {formatNumber(plan.agencyCount)} {plan.agencyCount === 1 ? "agency" : "agencies"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-ink-200 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
    >
      <span className="icon-tile bg-brand-50 text-brand-600">{icon}</span>
      <span className="text-caption font-semibold text-ink-800">{label}</span>
    </Link>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`inline-block w-2 h-2 rounded-full ${className}`} />;
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="3" width="11" height="18" rx="1.5" />
      <path d="M15 8h5v13h-5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" strokeLinejoin="round" />
      <path d="m3 13 9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" strokeLinejoin="round" />
      <path d="M14 3v4h4M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </svg>
  );
}
