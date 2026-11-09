/*
 * Admin sign-in.
 *
 * Deliberately separate from modules/auth/services/auth.service.ts rather than adding a
 * third entry to its role map. Candidate and recruiter sign-in share a form, a role
 * picker and a registration flow; admin shares none of them, and keeping the account
 * type out of that map means no UI can accidentally offer PLATFORM_ADMIN as a choice.
 *
 * There is no register counterpart here, and there never should be: /auth/register
 * refuses PLATFORM_ADMIN outright because it is a public endpoint. Administrator
 * accounts are created by hand — see hiremind_dev/ADMIN-PANEL.md.
 */
import {
  API,
  clearAuth,
  setAccessToken,
  setRefreshToken,
  setStoredUserName,
  setUserId,
} from "@/lib/api/config";

export interface AdminLoginResult {
  userId: string;
  mustResetPassword: boolean;
}

/** Reads the `accountType` claim without verifying the signature. Routing only. */
function claimedAccountType(token: string): string | null {
  const segments = token.split(".");
  if (segments.length < 2) return null;
  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return (JSON.parse(atob(padded)) as { accountType?: string }).accountType ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /auth/login with accountType=PLATFORM_ADMIN.
 *
 * The backend already refuses to authenticate a candidate or recruiter against this
 * account type — it compares the stored type with the requested one — so a non-admin
 * cannot sign in here even with correct credentials. The extra claim check below is
 * belt-and-braces against a token that somehow arrives without the claim: better to
 * clear it and show an error than to hand someone a half-authenticated admin shell.
 */
export async function loginAdmin(
  email: string,
  password: string,
  rememberMe = false,
): Promise<AdminLoginResult> {
  const res = await fetch(`${API.USERS}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountType: "PLATFORM_ADMIN",
      email: email.trim().toLowerCase(),
      password,
      rememberMe,
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // The service returns the same message for a wrong password and a wrong account
    // type, which is the right call — it does not tell an attacker which part was wrong.
    throw new Error(json?.message ?? `Sign-in failed (${res.status})`);
  }

  const { userId, accessToken, refreshToken, mustResetPassword, fullName } = json.data ?? {};
  if (!accessToken) {
    throw new Error("Sign-in failed — no session was returned.");
  }

  if (claimedAccountType(accessToken) !== "PLATFORM_ADMIN") {
    clearAuth();
    throw new Error("This account is not a platform administrator.");
  }

  setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
  if (userId) setUserId(userId);
  if (fullName) setStoredUserName(fullName);

  return { userId: userId as string, mustResetPassword: Boolean(mustResetPassword) };
}
