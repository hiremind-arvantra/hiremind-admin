"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";

import {
  AdminError,
  AdminStatCard,
  StatRowSkeleton,
  formatDate,
  formatNumber,
  statusBadgeClass,
  useAdminResource,
} from "./components/AdminData";
import { deleteAgency, fetchAgencies, setAgencyStatus } from "./services/admin.service";

import type { AgencyRow, AgencyStatus } from "./types";

const TABS: { key: "ALL" | AgencyStatus; label: string }[] = [
  { key: "ALL", label: "All Agencies" },
  { key: "ACTIVE", label: "Active" },
  { key: "SUSPENDED", label: "Suspended" },
];

const PAGE_SIZE = 10;

/*
 * Agencies — the cross-tenant list of every recruitment company on the platform.
 *
 * Status changes and deletes are the only writes an admin makes here, and both are
 * confirmed before they fire: suspending an agency signs out its whole team, and the
 * delete is not reversible from this screen.
 */
export default function AgenciesPage() {
  const [tab, setTab] = useState<"ALL" | AgencyStatus>("ALL");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Typing shouldn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useAdminResource(
    () => fetchAgencies({ status: tab, search: debounced, page, pageSize: PAGE_SIZE }),
    [tab, debounced, page],
  );

  async function changeStatus(agency: AgencyRow, status: AgencyStatus) {
    const verb = status === "ACTIVE" ? "reactivate" : status.toLowerCase();
    if (!window.confirm(`${verb[0].toUpperCase()}${verb.slice(1)} ${agency.companyName}? Their team will be affected immediately.`)) return;
    setBusyId(agency.id);
    try {
      await setAgencyStatus(agency.id, status);
      setNotice(`${agency.companyName} is now ${status.toLowerCase()}.`);
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not change the status.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeAgency(agency: AgencyRow) {
    if (!window.confirm(`Delete ${agency.companyName}? This cannot be undone from here.`)) return;
    setBusyId(agency.id);
    try {
      await deleteAgency(agency.id);
      setNotice(`${agency.companyName} was deleted.`);
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not delete the agency.");
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        eyebrow={<Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Agencies" }]} />}
        title="Agencies"
        subtitle="Create and manage recruitment agencies, their plans, users, roles and permissions."
      />

      {notice && (
        <div role="status" className="alert alert-info mb-4 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      {error && <AdminError message={error} onRetry={reload} />}

      {!error && (loading && !data) && <StatRowSkeleton />}

      {!error && data && (
        <div className="space-y-4 max-w-[1100px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard stat={data.stats.totalAgencies} />
            <AdminStatCard stat={data.stats.totalAgencyUsers} />
            <AdminStatCard stat={data.stats.activeAgencies} />
            <AdminStatCard stat={data.stats.suspendedAgencies} />
          </div>

          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="tab-line" role="tablist" aria-label="Filter agencies by status">
                {TABS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.key}
                    onClick={() => { setTab(item.key); setPage(1); }}
                    className={`tab ${tab === item.key ? "tab-active" : ""}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="relative block w-full sm:w-64">
                <span className="sr-only">Search agencies</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search agencies…"
                  className="field-input h-10 pl-9"
                />
                <SearchIcon />
              </label>
            </div>

            {data.rows.length === 0 ? (
              <p className="empty-state">No agencies match this filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th scope="col">Agency Name</th>
                      <th scope="col">Plan</th>
                      <th scope="col">Users</th>
                      <th scope="col">Roles</th>
                      <th scope="col">Status</th>
                      <th scope="col">Subscription</th>
                      <th scope="col">Created On</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((agency) => (
                      <tr key={agency.id}>
                        <td className="font-semibold text-ink-900">{agency.companyName}</td>
                        <td>{agency.planName ? <span className="badge badge-brand">{agency.planName}</span> : <span className="text-ink-400">—</span>}</td>
                        <td>{formatNumber(agency.userCount)}</td>
                        <td>{formatNumber(agency.roleCount)}</td>
                        <td><span className={statusBadgeClass(agency.status)}>{agency.status}</span></td>
                        <td className="text-ink-500">{formatDate(agency.subscriptionEndsOn)}</td>
                        <td className="text-ink-500">{formatDate(agency.createdOn)}</td>
                        <td>
                          <RowMenu
                            agency={agency}
                            busy={busyId === agency.id}
                            onStatus={changeStatus}
                            onDelete={removeAgency}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <p className="text-caption text-ink-500">
                Showing {data.rows.length === 0 ? 0 : (data.page - 1) * data.pageSize + 1}–
                {(data.page - 1) * data.pageSize + data.rows.length} of {formatNumber(data.total)} agencies
              </p>
              {totalPages > 1 && (
                <Pagination page={data.page} totalPages={totalPages} onChange={setPage} />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

/** Per-row actions. Click-toggled with a click-outside effect — never CSS hover. */
function RowMenu({
  agency,
  busy,
  onStatus,
  onDelete,
}: {
  agency: AgencyRow;
  busy: boolean;
  onStatus: (agency: AgencyRow, status: AgencyStatus) => void;
  onDelete: (agency: AgencyRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const item = "w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-700 hover:bg-ink-50 transition-colors text-left";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Actions for ${agency.companyName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="btn btn-ghost btn-icon btn-sm"
      >
        {busy ? <span className="text-micro">…</span> : <DotsIcon />}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-ink-200 bg-white shadow-elevated overflow-hidden z-20">
          {agency.status !== "ACTIVE" && (
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onStatus(agency, "ACTIVE"); }}>
              Set Active
            </button>
          )}
          {agency.status !== "SUSPENDED" && (
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onStatus(agency, "SUSPENDED"); }}>
              Suspend
            </button>
          )}
          {agency.status !== "CANCELLED" && (
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onStatus(agency, "CANCELLED"); }}>
              Cancel Subscription
            </button>
          )}
          <button type="button" role="menuitem" className={`${item} text-danger`} onClick={() => { setOpen(false); onDelete(agency); }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}
