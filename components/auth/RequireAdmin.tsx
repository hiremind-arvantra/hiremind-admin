"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api/config";

/*
 * Gate for the platform-admin shell.
 *
 * Same contract as RequireAuth — mount, `pageshow` (the only event a back/forward-cache
 * restore fires) and `storage` (signing out in another tab) — plus one extra check: the
 * JWT's `accountType` claim must be PLATFORM_ADMIN. A recruiter or candidate who types
 * /admin is sent back to their own home rather than to the login page, because they *are*
 * signed in; bouncing them to /login would just loop them back here.
 *
 * Reading the claim is a convenience for routing, not a security decision. The token is
 * not verified here (the signature cannot be checked in the browser) — every /admin/**
 * endpoint re-validates it server-side and rejects a non-admin with INVALID_ACCOUNT_TYPE.
 * Treat this purely as "what should we show".
 */

type Claims = { accountType?: string; exp?: number };

/** Decodes a JWT payload without verifying it. Returns null on anything unexpected. */
export function readClaims(token: string | null): Claims | null {
  if (!token) return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;
  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Claims;
  } catch {
    return null;
  }
}

export const isPlatformAdmin = (token: string | null): boolean =>
  readClaims(token)?.accountType === "PLATFORM_ADMIN";

/** Where a signed-in non-admin belongs instead. */
function homeFor(accountType: string | undefined): string {
  if (accountType === "RECRUITMENT_COMPANY") return "/company/dashboard";
  if (accountType === "CANDIDATE") return "/dashboard";
  return "/login";
}

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => {
      const token = getAccessToken();
      if (!token) {
        setAllowed(false);
        const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${next}`);
        return;
      }
      const claims = readClaims(token);
      if (claims?.accountType === "PLATFORM_ADMIN") {
        setAllowed(true);
        return;
      }
      setAllowed(false);
      router.replace(homeFor(claims?.accountType));
    };

    check();
    window.addEventListener("pageshow", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("pageshow", check);
      window.removeEventListener("storage", check);
    };
  }, [router, pathname]);

  if (!allowed) return null;
  return <>{children}</>;
}
