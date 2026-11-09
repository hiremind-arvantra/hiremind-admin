"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/marketing/BrandLogo";
import SidebarMenuButton from "@/components/shell/SidebarMenuButton";
import { clearAuth, getStoredUserName } from "@/lib/api/config";

/*
 * Admin chrome: the same 72px .chrome-header as the candidate and recruiter shells, with
 * the brand column sized to the sidebar so the content below starts on the same line.
 *
 * The designs show a platform-wide search box here. It is rendered as a real control but
 * only routes to the section it matches — there is no cross-entity search endpoint, and
 * the recruiter header already carried a box that searched nothing, which was removed for
 * exactly that reason. Rather than repeat that, this one navigates and says so.
 */

const MENU_ITEM =
  "w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-700 hover:bg-ink-50 transition-colors";

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "A";
}

export default function AdminHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("Admin");
  const menuRef = useRef<HTMLDivElement>(null);

  // localStorage is read after mount — never during render (SSR would disagree).
  useEffect(() => {
    setName(getStoredUserName() || "Admin");
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function signOut() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <header className="chrome-header shrink-0 relative z-30 flex items-stretch">
      <div className="shrink-0 flex items-center gap-1.5 pl-2 pr-2 sm:pl-4 md:pl-[calc(var(--shell-inset)+24px)] md:pr-6 md:w-[calc(var(--sidebar-w)+var(--shell-inset))]">
        <SidebarMenuButton />
        <BrandLogo size="md" />
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-end gap-2 sm:gap-3 pr-3 sm:pr-5 lg:pr-8">
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline-flex badge badge-brand">Platform Admin</span>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-ink-50 transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-caption font-bold inline-flex items-center justify-center">
                {initials(name)}
              </span>
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-body-sm font-semibold text-ink-900">{name}</span>
                <span className="block text-micro text-ink-500">Platform Administrator</span>
              </span>
              <ChevronDown />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-ink-200 bg-white shadow-elevated overflow-hidden"
              >
                <button type="button" role="menuitem" className={MENU_ITEM} onClick={() => { setMenuOpen(false); router.push("/admin/settings"); }}>
                  <GearIcon /> System Settings
                </button>
                <button type="button" role="menuitem" className={`${MENU_ITEM} text-danger`} onClick={signOut}>
                  <LogoutIcon /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.4a7 7 0 0 0-2.1 1.2l-2.4-.8-2 3.4 2 1.6c-.1.4-.1.8-.1 1.2s0 .8.1 1.2l-2 1.6 2 3.4 2.4-.8c.7.5 1.4.9 2.1 1.2L10 21h4l.4-2.4c.7-.3 1.4-.7 2.1-1.2l2.4.8 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
