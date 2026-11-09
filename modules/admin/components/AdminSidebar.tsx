"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarFrame from "@/components/shell/SidebarFrame";

/*
 * Platform-admin navigation.
 *
 * Two groups expand (Roles & Permissions, Reports & Audit) because their children are
 * destinations in their own right in the designs. A group auto-opens when the current
 * route is inside it, so a deep link never lands with its own section collapsed.
 */

interface Child {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: Child[];
}

const ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/admin/agencies", label: "Agencies", icon: <BuildingIcon /> },
  {
    href: "/admin/roles",
    label: "Roles & Permissions",
    icon: <UsersIcon />,
    children: [
      { href: "/admin/roles", label: "Roles", icon: <UsersIcon /> },
      { href: "/admin/roles/permissions", label: "Permissions", icon: <ShieldIcon /> },
    ],
  },
  { href: "/admin/plans", label: "Plans & Pricing", icon: <LayersIcon /> },
  {
    href: "/admin/reports",
    label: "Reports & Audit",
    icon: <ChartIcon />,
    children: [
      { href: "/admin/reports", label: "Reports", icon: <ChartIcon /> },
      { href: "/admin/reports/audit", label: "Audit Logs", icon: <ClockIcon /> },
    ],
  },
  { href: "/admin/settings", label: "Settings", icon: <GearIcon /> },
];

const isInside = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function AdminSidebar() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // Auto-open the group containing the current route, without closing one the
  // user opened themselves.
  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      for (const item of ITEMS) {
        if (item.children && isInside(pathname, item.href)) next[item.href] = true;
      }
      return next;
    });
  }, [pathname]);

  return (
    <SidebarFrame label="Admin navigation">
      <nav
        aria-label="Admin"
        className="flex-1 min-h-0 overflow-y-auto px-3 pt-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="eyebrow text-ink-400 px-3 pb-2">Admin Panel</div>
        <ul className="space-y-1">
          {ITEMS.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : isInside(pathname, item.href);
            const expanded = Boolean(open[item.href]);

            if (!item.children) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`nav-item ${active ? "nav-item-active" : ""}`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => setOpen((prev) => ({ ...prev, [item.href]: !prev[item.href] }))}
                  aria-expanded={expanded}
                  className={`nav-item w-full text-left ${active ? "nav-item-active" : ""}`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  <ChevronIcon className={expanded ? "rotate-180" : ""} />
                </button>
                {expanded && (
                  <ul className="mt-1 space-y-1 pl-3">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? "page" : undefined}
                            className={`nav-item ${childActive ? "nav-item-active" : ""}`}
                          >
                            {child.icon}
                            <span className="flex-1">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-3 pt-2 shrink-0">
        <div className="relative overflow-hidden rounded-2xl p-4 text-white bg-[image:var(--gradient-brand)] shadow-glow">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 w-28 h-28 rounded-full bg-white/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <HeadsetIcon />
              <span className="text-body-sm font-bold">Need Help?</span>
            </div>
            <p className="text-micro text-white/85 mb-3 leading-snug">
              Contact the HireMind Admin Support Team.
            </p>
            <a
              href="mailto:support@arvantra-ai.com"
              className="w-full h-9 bg-white text-brand-700 text-caption font-bold rounded-lg inline-flex items-center justify-center gap-1.5 hover:bg-brand-50 transition-colors"
            >
              Get Support <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </SidebarFrame>
  );
}

/* ── Icons (inline so the shell has no icon-library dependency) ───────────── */

function HomeIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="3" width="11" height="18" rx="1.5" />
      <path d="M15 8h5v13h-5" strokeLinecap="round" />
      <path d="M8 7h3M8 11h3M8 15h3" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      <path d="M16 11.2a3 3 0 1 0-1.2-5.7M17 19.5c0-2.2-.9-3.9-2.3-4.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" strokeLinejoin="round" />
      <path d="m3 13 9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1 2 2 0 1 1-4 0 1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.6 4.4a2 2 0 1 1 4 0 1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7 2 2 0 1 1 0 4 1.6 1.6 0 0 0-.8.0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 transition-transform ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 13v-1a8 8 0 1 1 16 0v1" strokeLinecap="round" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
    </svg>
  );
}
