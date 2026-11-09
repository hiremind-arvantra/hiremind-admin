"use client";

/* ─────────────────────────────────────────────────────────────────────────────
 * App-wide pagination control — Prev / numbered pages / Next with disabled
 * states. 1-based `page`. Use this everywhere instead of bespoke pager markup.
 *
 *   const [page, setPage] = useState(1);
 *   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
 * ───────────────────────────────────────────────────────────────────────────── */
export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Compact page list with ellipses: always shows page 1, the last page, and the
 * current page ±1; gaps collapse to "…". For small totals every page shows. */
function pageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export function Pagination({ page, totalPages, onChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const go = (next: number) => {
    if (next >= 1 && next <= totalPages && next !== page) onChange(next);
  };
  const navCls =
    "w-9 h-9 rounded-xl border border-ink-200 bg-white text-ink-500 grid place-items-center hover:border-brand-300 hover:text-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-ink-200 disabled:hover:text-ink-500";

  return (
    <nav aria-label="Pagination" className={`flex items-center gap-1 ${className}`}>
      <button type="button" onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" className={navCls}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      {pageItems(page, totalPages).map((item, i) =>
        item === "ellipsis" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-400 select-none">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? "page" : undefined}
            className={`min-w-9 h-9 px-2 rounded-xl text-body-sm font-semibold transition-colors ${
              item === page
                ? "bg-[image:var(--gradient-brand)] text-white shadow-glow"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button type="button" onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Next page" className={navCls}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
      </button>
    </nav>
  );
}
