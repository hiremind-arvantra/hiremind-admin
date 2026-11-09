import Link from "next/link";

/*
 * The one page heading block for every authenticated page.
 *
 * The eyebrow slot (breadcrumbs, a back link, or nothing) always reserves its height,
 * so the title sits at exactly the same y on every route — list pages, detail pages and
 * forms alike. Actions align to the title's baseline on the right and wrap below on mobile.
 */
export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Breadcrumbs / back link. Leave empty — the space is still reserved. */
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, eyebrow, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-eyebrow">{eyebrow}</div>
      <div className="page-header-row">
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail for the PageHeader eyebrow slot. The last item is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-body-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="text-ink-500 hover:text-brand-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "font-medium text-ink-700" : "text-ink-500"}>
                  {item.label}
                </span>
              )}
              {!last && (
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-ink-300">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Back link for the PageHeader eyebrow slot. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ink-500 hover:text-brand-700 transition-colors">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}
