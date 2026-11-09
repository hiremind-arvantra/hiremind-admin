"use client";

import { useSidebarDrawer } from "./useSidebarDrawer";

/** Header menu button (below md) that opens the shell's off-canvas sidebar. */
export default function SidebarMenuButton() {
  const [open, setOpen] = useSidebarDrawer();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="app-sidebar"
      className="md:hidden w-10 h-10 shrink-0 rounded-xl grid place-items-center text-ink-700 hover:bg-ink-100 transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
