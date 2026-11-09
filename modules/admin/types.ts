/*
 * Platform-admin DTOs.
 *
 * These mirror the `/api/company/admin/**` and `/api/users/admin/**` contracts added for
 * the admin panel (see hiremind_dev/ADMIN-PANEL.md). Everything here is cross-tenant: the
 * admin is the only identity allowed to read across agencies, so every one of these
 * endpoints is gated on AccountType.PLATFORM_ADMIN server-side.
 */

export type AgencyStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED" | "DRAFT";
export type PlanKey = "basic" | "pro" | "enterprise";
export type BillingPeriod = "monthly" | "yearly";

/** A single KPI tile on the dashboard / agencies / reports headers. */
export interface AdminStat {
  label: string;
  value: number;
  /** Percentage change vs. the previous window, e.g. 12 for "+12%". Null when unknown. */
  deltaPercent: number | null;
}

export interface PlatformStats {
  totalAgencies: AdminStat;
  totalUsers: AdminStat;
  activePlans: AdminStat;
  activeSubscriptions: AdminStat;
}

/** One point on the Platform Overview chart. */
export interface PlatformTrendPoint {
  bucket: string;
  agencies: number;
  users: number;
  subscriptions: number;
}

export interface PlatformOverview {
  stats: PlatformStats;
  trend: PlatformTrendPoint[];
  recentAgencies: AgencyRow[];
  planSummary: PlanSummaryRow[];
}

export interface PlanSummaryRow {
  key: PlanKey;
  name: string;
  monthlyPaise: number;
  agencyCount: number;
}

export interface AgencyRow {
  id: string;
  companyName: string;
  planKey: PlanKey | null;
  planName: string | null;
  userCount: number;
  roleCount: number;
  status: AgencyStatus;
  subscriptionEndsOn: string | null;
  createdOn: string;
}

export interface AgencyListResponse {
  stats: {
    totalAgencies: AdminStat;
    totalAgencyUsers: AdminStat;
    activeAgencies: AdminStat;
    suspendedAgencies: AdminStat;
  };
  rows: AgencyRow[];
  page: number;
  pageSize: number;
  total: number;
}

/* ── Roles & permissions ──────────────────────────────────────────────────── */

export type PermissionAction = "view" | "create" | "edit" | "delete" | "manage";

export const PERMISSION_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete", "manage"];

/** The modules a role can be granted actions on. Order drives the table rows. */
export const PERMISSION_MODULES = [
  "jobs",
  "candidates",
  "clients",
  "users",
  "roles",
  "reports",
  "settings",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const MODULE_LABEL: Record<PermissionModule, string> = {
  jobs: "Jobs",
  candidates: "Candidates",
  clients: "Clients",
  users: "Users",
  roles: "Roles & Permissions",
  reports: "Reports & Analytics",
  settings: "Agency Settings",
};

/** `permissions[module][action]` — absent means not granted. */
export type PermissionMatrix = Partial<Record<PermissionModule, Partial<Record<PermissionAction, boolean>>>>;

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  /** Denormalised count shown in the roles list. */
  permissionCount: number;
  assignedUserCount: number;
  /** True for roles the platform ships; these cannot be deleted. */
  systemRole: boolean;
  permissions: PermissionMatrix;
  createdOn: string;
}

export interface RoleAssignedUser {
  id: string;
  fullName: string;
  email: string;
  agencyName: string | null;
  status: string;
  assignedOn: string;
}

export interface SaveRoleRequest {
  name: string;
  description?: string;
  active: boolean;
  permissions: PermissionMatrix;
}

/* ── Plans & pricing ──────────────────────────────────────────────────────── */

export interface PlanFeature {
  id: string;
  label: string;
  /** Display value in the comparison table, e.g. "Up to 10" or "Unlimited". */
  value: string;
  included: boolean;
}

export interface AdminPlan {
  key: PlanKey;
  name: string;
  tagline: string | null;
  monthlyPaise: number;
  yearlyPaise: number;
  mostPopular: boolean;
  active: boolean;
  features: PlanFeature[];
  limits: PlanLimits;
  agencyCount: number;
}

export interface PlanLimits {
  /** null means unlimited. */
  agencyUsers: number | null;
  candidates: number | null;
  jobPostings: number | null;
  resumeParsesPerMonth: number | null;
}

export interface SavePlanRequest {
  name: string;
  tagline?: string;
  monthlyPaise: number;
  yearlyPaise: number;
  mostPopular: boolean;
  active: boolean;
  limits: PlanLimits;
  features: { label: string; value: string; included: boolean }[];
}

export interface PricingSettings {
  currency: string;
  taxPercent: number;
  yearlyDiscountPercent: number;
  trialDays: number;
  gracePeriodDays: number;
  invoicePrefix: string;
}

export interface PlanRevenueRow {
  key: PlanKey;
  name: string;
  activeSubscriptions: number;
  monthlyRevenuePaise: number;
  yearlyRevenuePaise: number;
  renewalsDue: number;
}

/* ── Reports & audit ──────────────────────────────────────────────────────── */

export type ReportRange = "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS" | "LAST_12_MONTHS";

export interface ReportsOverview {
  stats: {
    totalAgencies: AdminStat;
    totalUsers: AdminStat;
    totalCandidates: AdminStat;
    totalJobPostings: AdminStat;
  };
  usage: { bucket: string; candidates: number; jobPostings: number; users: number }[];
  activity: { activity: string; count: number; changePercent: number | null }[];
}

export interface AuditLogRow {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityLabel: string | null;
  agencyName: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogResponse {
  rows: AuditLogRow[];
  page: number;
  pageSize: number;
  total: number;
}

/* ── System settings ──────────────────────────────────────────────────────── */

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  allowAgencySelfSignup: boolean;
  resumeMaxSizeMb: number;
  parsePreviewRateLimit: number;
  sessionTimeoutMinutes: number;
}
