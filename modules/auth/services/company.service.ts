import {
  API,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  setUserId,
  setStoredCompanyName,
  setStoredCompanyLogoUrl,
  clearAuth,
} from "@/lib/api/config";
import type { CompanyRegStep1Data, CompanyRegStep2Data } from "../types/auth.types";

/** POST /auth/register with accountType=RECRUITMENT_COMPANY → stores tokens */
export async function registerCompanyUser(data: CompanyRegStep2Data): Promise<string> {
  const body = {
    accountType: "RECRUITMENT_COMPANY",
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    countryCode: data.countryCode || "+91",
    phoneNumber: data.mobile.trim(),
    password: data.password,
    confirmPassword: data.confirmPassword,
    timezone: data.timeZone || null,
  };

  const res = await fetch(`${API.USERS}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const details = json?.error?.details as Record<string, string> | null;
    const fieldMsg = details ? Object.values(details).join(", ") : null;
    throw new Error(fieldMsg ?? json?.message ?? `Registration failed (${res.status})`);
  }

  const { userId, accessToken, refreshToken } = json.data;
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  setUserId(userId);
  setStoredCompanyName(data.fullName.trim());
  return userId as string;
}

/** GET /company/profile — fetch profile after login; caches company name in localStorage */
export async function fetchCompanyProfile(): Promise<void> {
  const token = getAccessToken();
  if (!token) return;

  const res = await fetch(`${API.COMPANY}/company/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return;
  const json = await res.json().catch(() => null);
  const data = json?.data;
  if (data?.companyName) setStoredCompanyName(data.companyName);
  if (data?.logoUrl) setStoredCompanyLogoUrl(data.logoUrl);
}

export interface CompanyProfile {
  companyName: string;
  legalName: string;
  website: string;
  industry: string;
  companySize: string;
  foundedYear: string;
  companyType: string;
  gstNumber: string;
  panNumber: string;
  country: string;
  state: string;
  city: string;
  address: string;
  about: string;
  logoUrl: string | null;
  status: string | null;
}

/** GET /company/profile — full profile object for the settings page. */
export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${API.COMPANY}/company/profile`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const data = json?.data;
  if (!data) return null;

  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const profile: CompanyProfile = {
    companyName: str(data.companyName),
    legalName: str(data.legalName),
    website: str(data.website),
    industry: str(data.industry),
    companySize: str(data.companySize),
    foundedYear: str(data.foundedYear),
    companyType: str(data.companyType),
    gstNumber: str(data.gstNumber),
    panNumber: str(data.panNumber),
    country: str(data.country),
    state: str(data.state),
    city: str(data.city),
    address: str(data.address),
    about: str(data.about),
    logoUrl: data.logoUrl ?? null,
    status: data.status ?? null,
  };
  // Keep the header in sync while we're here.
  if (profile.companyName) setStoredCompanyName(profile.companyName);
  if (profile.logoUrl) setStoredCompanyLogoUrl(profile.logoUrl);
  return profile;
}

/** PUT /company/profile — save Step 1 company details; non-fatal if company_api is down */
export async function saveCompanyProfile(step1: CompanyRegStep1Data): Promise<void> {
  const token = getAccessToken();
  if (!token) return;

  const body = {
    companyName: step1.companyName.trim(),
    legalName: step1.legalName.trim(),
    website: step1.website?.trim() || null,
    industry: step1.industry,
    companySize: step1.companySize,
    foundedYear: step1.foundedYear?.trim() || null,
    companyType: step1.companyType,
    gstNumber: step1.gstNumber?.trim() || null,
    panNumber: step1.panNumber?.trim() || null,
    country: step1.country,
    state: step1.state,
    city: step1.city.trim(),
    address: step1.address.trim(),
    about: step1.about?.trim() || null,
  };

  const res = await fetch(`${API.COMPANY}/company/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message ?? `Failed to save company profile (${res.status})`);
  }

  setStoredCompanyName(step1.companyName.trim());
}

/** POST /company/logo/upload — multipart; returns logoKey or null on failure */
export async function uploadCompanyLogo(file: File): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API.COMPANY}/company/logo/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const data = json?.data;
  // Cache the presigned URL so CompanyHeader shows the logo immediately.
  if (data?.logoUrl) setStoredCompanyLogoUrl(data.logoUrl);
  return (data?.logoFileKey ?? null) as string | null;
}

/** DELETE /users/me — rollback if downstream company profile creation fails */
export async function deleteCurrentCompany(): Promise<void> {
  const token = getAccessToken();
  if (!token) return;
  await fetch(`${API.USERS}/users/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  clearAuth();
}
