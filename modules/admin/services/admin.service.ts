/*
 * Platform-admin API client.
 *
 * Every call here is cross-tenant and is rejected server-side for anyone whose JWT does
 * not carry accountType=PLATFORM_ADMIN. The browser gate (RequireAdmin) only decides what
 * is *shown*; these endpoints decide what is *allowed*.
 *
 * Admin endpoints live under the existing service prefixes rather than a new service:
 *   /api/company/company/admin/**  — agencies, plans, reports, audit, settings
 *
 * That doubled "company" is not a typo: /api/company is the Next.js rewrite prefix, and
 * the controller itself is mounted at /company/admin under the service's
 * /company-service context path. Dropping either half yields a bare 500 from the
 * catch-all handler rather than a 404, which is a genuinely confusing way to lose an
 * afternoon.
 */
import { API, getAccessToken } from "@/lib/api/config";

import type {
  AdminPlan,
  AdminRole,
  AgencyListResponse,
  AgencyStatus,
  AuditLogResponse,
  PlanRevenueRow,
  PlatformOverview,
  PricingSettings,
  ReportRange,
  ReportsOverview,
  RoleAssignedUser,
  SavePlanRequest,
  SaveRoleRequest,
  SystemSettings,
} from "../types";

const authHeaders = () => ({ Authorization: `Bearer ${getAccessToken()}` });
const jsonHeaders = () => ({ "Content-Type": "application/json", ...authHeaders() });

/** Unwraps the ApiResponse envelope, turning a non-2xx into a thrown Error. */
async function unwrap<T>(res: Response, what: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message ?? `Failed to ${what} (${res.status})`);
  }
  return json?.data as T;
}

const qs = (params: Record<string, string | number | undefined | null>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
};

/* ── Dashboard ────────────────────────────────────────────────────────────── */

/** GET /company/admin/overview — KPI tiles, trend, recent agencies, plan summary. */
export async function fetchPlatformOverview(range: ReportRange = "LAST_30_DAYS"): Promise<PlatformOverview> {
  const res = await fetch(`${API.COMPANY}/company/admin/overview${qs({ range })}`, { headers: authHeaders() });
  return unwrap<PlatformOverview>(res, "load the platform overview");
}

/* ── Agencies ─────────────────────────────────────────────────────────────── */

export interface AgencyQuery {
  status?: "ALL" | AgencyStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** GET /company/admin/agencies — paginated, with the four header KPIs. */
export async function fetchAgencies(query: AgencyQuery = {}): Promise<AgencyListResponse> {
  const { status = "ALL", search, page = 1, pageSize = 10 } = query;
  const res = await fetch(`${API.COMPANY}/company/admin/agencies${qs({ status, search, page, pageSize })}`, {
    headers: authHeaders(),
  });
  return unwrap<AgencyListResponse>(res, "load agencies");
}

/** PATCH /company/admin/agencies/{id}/status — Active / Suspended / Cancelled. */
export async function setAgencyStatus(id: string, status: AgencyStatus): Promise<void> {
  const res = await fetch(`${API.COMPANY}/company/admin/agencies/${id}/status`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ status }),
  });
  await unwrap<void>(res, "change the agency status");
}

/** DELETE /company/admin/agencies/{id} — soft delete. */
export async function deleteAgency(id: string): Promise<void> {
  const res = await fetch(`${API.COMPANY}/company/admin/agencies/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await unwrap<void>(res, "delete the agency");
}

/* ── Roles & permissions ──────────────────────────────────────────────────── */

/** GET /company/admin/roles — every role with its permission matrix. */
export async function fetchRoles(): Promise<AdminRole[]> {
  const res = await fetch(`${API.COMPANY}/company/admin/roles`, { headers: authHeaders() });
  return unwrap<AdminRole[]>(res, "load roles");
}

/** GET /company/admin/roles/{id}/users — the Assigned Users tab. */
export async function fetchRoleUsers(roleId: string): Promise<RoleAssignedUser[]> {
  const res = await fetch(`${API.COMPANY}/company/admin/roles/${roleId}/users`, { headers: authHeaders() });
  return unwrap<RoleAssignedUser[]>(res, "load the users assigned to this role");
}

/** POST /company/admin/roles — create a role. */
export async function createRole(payload: SaveRoleRequest): Promise<AdminRole> {
  const res = await fetch(`${API.COMPANY}/company/admin/roles`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return unwrap<AdminRole>(res, "create the role");
}

/** PUT /company/admin/roles/{id} — rename, toggle, or save the permission matrix. */
export async function updateRole(id: string, payload: SaveRoleRequest): Promise<AdminRole> {
  const res = await fetch(`${API.COMPANY}/company/admin/roles/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return unwrap<AdminRole>(res, "save the role");
}

/** DELETE /company/admin/roles/{id} — blocked server-side for system roles. */
export async function deleteRole(id: string): Promise<void> {
  const res = await fetch(`${API.COMPANY}/company/admin/roles/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await unwrap<void>(res, "delete the role");
}

/* ── Plans & pricing ──────────────────────────────────────────────────────── */

/** GET /company/admin/plans — the plan catalog with limits, features and agency counts. */
export async function fetchPlans(): Promise<AdminPlan[]> {
  const res = await fetch(`${API.COMPANY}/company/admin/plans`, { headers: authHeaders() });
  return unwrap<AdminPlan[]>(res, "load plans");
}

/** PUT /company/admin/plans/{key} — the Edit Plan modal. */
export async function updatePlan(key: string, payload: SavePlanRequest): Promise<AdminPlan> {
  const res = await fetch(`${API.COMPANY}/company/admin/plans/${key}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return unwrap<AdminPlan>(res, "save the plan");
}

/** GET /company/admin/pricing-settings — currency, tax, trial and invoice config. */
export async function fetchPricingSettings(): Promise<PricingSettings> {
  const res = await fetch(`${API.COMPANY}/company/admin/pricing-settings`, { headers: authHeaders() });
  return unwrap<PricingSettings>(res, "load pricing settings");
}

/** PUT /company/admin/pricing-settings */
export async function savePricingSettings(payload: PricingSettings): Promise<PricingSettings> {
  const res = await fetch(`${API.COMPANY}/company/admin/pricing-settings`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return unwrap<PricingSettings>(res, "save pricing settings");
}

/** GET /company/admin/plan-revenue — subscriptions, revenue and renewals per plan. */
export async function fetchPlanRevenue(range: ReportRange = "LAST_30_DAYS"): Promise<PlanRevenueRow[]> {
  const res = await fetch(`${API.COMPANY}/company/admin/plan-revenue${qs({ range })}`, { headers: authHeaders() });
  return unwrap<PlanRevenueRow[]>(res, "load plan revenue");
}

/* ── Reports & audit ──────────────────────────────────────────────────────── */

/** GET /company/admin/reports — KPI tiles, usage trend and the activity summary. */
export async function fetchReports(range: ReportRange = "LAST_30_DAYS"): Promise<ReportsOverview> {
  const res = await fetch(`${API.COMPANY}/company/admin/reports${qs({ range })}`, { headers: authHeaders() });
  return unwrap<ReportsOverview>(res, "load reports");
}

export interface AuditQuery {
  search?: string;
  action?: string;
  page?: number;
  pageSize?: number;
  range?: ReportRange;
}

/** GET /company/admin/audit-logs — paginated audit trail. */
export async function fetchAuditLogs(query: AuditQuery = {}): Promise<AuditLogResponse> {
  const { search, action, page = 1, pageSize = 20, range = "LAST_30_DAYS" } = query;
  const res = await fetch(`${API.COMPANY}/company/admin/audit-logs${qs({ search, action, page, pageSize, range })}`, {
    headers: authHeaders(),
  });
  return unwrap<AuditLogResponse>(res, "load audit logs");
}

/* ── System settings ──────────────────────────────────────────────────────── */

/** GET /company/admin/settings */
export async function fetchSystemSettings(): Promise<SystemSettings> {
  const res = await fetch(`${API.COMPANY}/company/admin/settings`, { headers: authHeaders() });
  return unwrap<SystemSettings>(res, "load system settings");
}

/** PUT /company/admin/settings */
export async function saveSystemSettings(payload: SystemSettings): Promise<SystemSettings> {
  const res = await fetch(`${API.COMPANY}/company/admin/settings`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return unwrap<SystemSettings>(res, "save system settings");
}
