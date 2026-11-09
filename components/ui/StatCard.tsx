import Link from "next/link";

/*
 * KPI surface shared by the candidate and recruiter dashboards: label, large tabular
 * value (with optional inline sub text), icon tile, optional delta badge.
 */
export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  /** Classes for the icon tile, e.g. "bg-green-50 text-green-600". */
  iconClassName?: string;
  delta?: React.ReactNode;
  href?: string;
  className?: string;
}

export function StatCard({ label, value, sub, icon, iconClassName, delta, href, className = "" }: StatCardProps) {
  const body = (
    <>
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-caption font-medium text-ink-500 leading-snug">{label}</div>
          <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
            <span className="kpi-value">{value}</span>
            {sub && <span className="text-caption text-ink-400">{sub}</span>}
          </div>
        </div>
        {icon && <span className={`icon-tile ${iconClassName ?? "bg-brand-50 text-brand-600"}`}>{icon}</span>}
      </div>
      {delta && <div className="relative mt-3 badge badge-success">{delta}</div>}
    </>
  );

  const cls = `card stat-card px-5 py-4 block ${className}`;
  if (href) {
    return (
      <Link href={href} className={`${cls} card-interactive`}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}
