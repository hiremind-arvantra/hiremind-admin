"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";

import { AdminError, formatNumber, useAdminResource } from "./components/AdminData";
import { RangeSelect } from "./components/RangeSelect";
import { fetchAuditLogs } from "./services/admin.service";

import type { ReportRange } from "./types";

const PAGE_SIZE = 20;

/* Timestamps are rendered in UTC so the server and the browser agree (SSR hydration). */
const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
};

/* Audit Logs — who did what, across every agency. Read-only by design. */
export default function AuditLogsPage() {
  const [range, setRange] = useState<ReportRange>("LAST_30_DAYS");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useAdminResource(
    () => fetchAuditLogs({ search: debounced, page, pageSize: PAGE_SIZE, range }),
    [debounced, page, range],
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        eyebrow={
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Reports & Audit", href: "/admin/reports" },
              { label: "Audit Logs" },
            ]}
          />
        }
        title="Audit Logs"
        subtitle="Every administrative and agency action recorded across the platform."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />

      <div className="tab-line mb-4" role="tablist" aria-label="Reports sections">
        <Link href="/admin/reports" className="tab" role="tab" aria-selected="false">Reports</Link>
        <span className="tab tab-active" role="tab" aria-selected="true">Audit Logs</span>
      </div>

      {error && <AdminError message={error} onRetry={reload} />}

      {!error && (
        <section className="card p-5 max-w-[1100px]">
          <label className="relative block w-full sm:w-72 mb-4">
            <span className="sr-only">Search audit logs</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by user, action or entity…"
              className="field-input h-10"
            />
          </label>

          {loading && !data && <p className="text-body-sm text-ink-500">Loading audit logs…</p>}

          {data && (data.rows.length === 0 ? (
            <p className="empty-state">No audit entries for this period.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th scope="col">When (UTC)</th>
                      <th scope="col">Actor</th>
                      <th scope="col">Action</th>
                      <th scope="col">Entity</th>
                      <th scope="col">Agency</th>
                      <th scope="col">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <tr key={row.id}>
                        <td className="text-ink-500 whitespace-nowrap">{formatTimestamp(row.createdAt)}</td>
                        <td>
                          <span className="block font-semibold text-ink-900">{row.actorName}</span>
                          <span className="block text-caption text-ink-500">{row.actorEmail}</span>
                        </td>
                        <td><span className="badge badge-neutral">{row.action}</span></td>
                        <td className="text-ink-700">
                          {row.entityType}
                          {row.entityLabel ? <span className="text-ink-500"> · {row.entityLabel}</span> : null}
                        </td>
                        <td className="text-ink-600">{row.agencyName ?? "—"}</td>
                        <td className="text-ink-500">{row.ipAddress ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <p className="text-caption text-ink-500">
                  Showing {(data.page - 1) * data.pageSize + 1}–{(data.page - 1) * data.pageSize + data.rows.length} of{" "}
                  {formatNumber(data.total)} entries
                </p>
                {totalPages > 1 && <Pagination page={data.page} totalPages={totalPages} onChange={setPage} />}
              </div>
            </>
          ))}
        </section>
      )}
    </>
  );
}
