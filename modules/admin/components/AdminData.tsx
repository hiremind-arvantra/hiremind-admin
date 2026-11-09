"use client";

import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";

import type { AdminStat } from "../types";

/*
 * Shared loading plumbing for the admin pages.
 *
 * Every admin screen is "fetch one thing, show a skeleton, show an error with a retry, or
 * render". Centralising it keeps the pages themselves about their content, and means a
 * failed admin call always looks the same rather than each page inventing its own state.
 */

export interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAdminResource<T>(load: () => Promise<T>, deps: unknown[]): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // `load` is redefined on every render by callers; the dependency list they pass is the
  // real trigger, so it is what this follows.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    run()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [run, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}

/** Error panel with a retry, used by every admin screen. */
export function AdminError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card p-6 text-center" role="alert">
      <p className="text-body font-semibold text-ink-900">Couldn&apos;t load this</p>
      <p className="mt-1 text-body-sm text-ink-500">{message}</p>
      <button type="button" onClick={onRetry} className="btn btn-outline btn-sm mt-4">
        Try again
      </button>
    </div>
  );
}

/** A row of KPI skeletons sized like the real tiles, so nothing jumps on load. */
export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card px-5 py-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16 mt-3" />
        </div>
      ))}
    </div>
  );
}

/** Renders a KPI tile from the AdminStat shape, formatting the delta consistently. */
export function AdminStatCard({
  stat,
  icon,
  iconClassName,
}: {
  stat: AdminStat;
  icon?: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <StatCard
      label={stat.label}
      value={formatNumber(stat.value)}
      icon={icon}
      iconClassName={iconClassName}
      delta={stat.deltaPercent === null ? undefined : formatDelta(stat.deltaPercent)}
    />
  );
}

/* ── Formatters ───────────────────────────────────────────────────────────── */

export const formatNumber = (value: number): string => new Intl.NumberFormat("en-IN").format(value);

export const formatDelta = (percent: number): string =>
  `${percent >= 0 ? "↑" : "↓"} ${percent >= 0 ? "+" : ""}${percent}%`;

/** Paise → "₹4,999". Plans are stored in paise so the browser never sees a float. */
export const formatPaise = (paise: number): string =>
  `₹${new Intl.NumberFormat("en-IN").format(Math.round(paise / 100))}`;

/**
 * Dates are formatted with an explicit locale and UTC, never the visitor's locale — the
 * server renders these too, and a browser in another timezone would otherwise disagree
 * with the server markup and trip hydration.
 */
export const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

/** Maps a status to the design system's badge variants. */
export function statusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "badge badge-success";
    case "SUSPENDED":
      return "badge badge-warn";
    case "CANCELLED":
      return "badge badge-danger";
    default:
      return "badge badge-neutral";
  }
}
