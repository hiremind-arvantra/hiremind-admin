"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/marketing/BrandLogo";
import { useSidebarDrawer } from "./useSidebarDrawer";

/*
 * Shared sidebar chrome for the candidate and recruiter shells: one width, one surface,
 * and one mobile behaviour — below md the panel is an off-canvas drawer opened from the
 * header's menu button, closed by the backdrop, Escape, its close button, or navigating.
 */
export default function SidebarFrame({ label, children }: { label: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useSidebarDrawer();

  useEffect(() => { setOpen(false); }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-[2px] animate-fade-in"
        />
      )}
      <aside
        id="app-sidebar"
        aria-label={label}
        // A tap on any link inside the drawer closes it, including the current route.
        onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}
        className={`chrome-sidebar fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 transition-transform duration-300 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0 shadow-float" : "-translate-x-[calc(100%_+_var(--shell-inset)_*_2)]"
        }`}
      >
        <div className="md:hidden flex items-center justify-between h-[var(--header-h)] px-4 border-b border-ink-200/80 shrink-0">
          <BrandLogo size="sm" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-10 h-10 rounded-xl grid place-items-center text-ink-600 hover:bg-ink-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
