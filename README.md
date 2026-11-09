# HireMind — Platform Admin

The platform operator's panel: agencies, roles & permissions, plans & pricing, reports,
audit logs and system settings. Served on its own hostname (`karupaswamy.hiremind.co.in`
in production — deliberately not `admin.`, so it stays out of subdomain wordlists).

**There is no sign-up, by design.** Administrator accounts are created by hand and
`/auth/register` refuses `PLATFORM_ADMIN` outright, because that endpoint is public. See
`hiremind_dev/ADMIN-PANEL.md` for how to create the first one.

> The obscure hostname is obscurity, not access control. What actually protects this app
> is the `PLATFORM_ADMIN` check that every `/company/admin/**` endpoint performs
> server-side. Never treat the hostname as a boundary.

## Routes

| Route | Screen |
|---|---|
| `/login` | Administrator sign-in |
| `/admin` | Dashboard — platform KPIs, trend, recent agencies, plan summary |
| `/admin/agencies` | Every agency, with status changes |
| `/admin/roles` | Roles and the permission matrix |
| `/admin/roles/permissions` | The matrix read the other way: who holds each permission |
| `/admin/plans` | Plan catalog, pricing settings, feature comparison |
| `/admin/reports` | Platform usage reports |
| `/admin/reports/audit` | Audit trail |
| `/admin/settings` | Platform-wide configuration |

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # before every deploy
npx tsc --noEmit
```

With no `.env.local`, the API rewrites fall back to `localhost:5001/5002/5003`, so a
native local backend works with nothing to set. To develop against the deployed backend
instead, create `.env.local`:

```
USERS_API_URL=https://api.hiremind.co.in/user-service
COMPANY_API_URL=https://api.hiremind.co.in/company-service
```

> **The rewrites are evaluated at build time.** Changing these needs a dev-server restart
> locally, and a rebuild in Docker — they are build args, not runtime env. Never prefix
> them with `NEXT_PUBLIC_`: that exposes them to the browser and bypasses the proxy that
> exists so there is no CORS anywhere.

## How this app was split out

Split from `hiremind_web`, which keeps the marketing website. Each app is **fully
self-contained** — its own copy of the design system (`app/globals.css`), `components/ui`,
`components/shell`, `lib/` and the parts of `modules/auth` it needs. Nothing is shared at
build time, so each repo clones, installs and deploys on its own.

The cost of that choice is duplication: **a fix to a shared component must be applied in
every app that carries it.** The files below exist in more than one repo and will drift
apart silently if only one copy is changed.

| Shared with | Files |
|---|---|
| candidate, recruiter, website | `app/globals.css`, `components/ui/**`, `components/shell/**`, `lib/api/config.ts`, `lib/utils.ts`, `lib/seo.ts` |
| candidate, recruiter, website | `modules/auth/components/{ForgotPasswordPage,ResetPasswordPage,SetPasswordPage,AuthCardShell}.tsx` |

There is no `proxy.ts` and no `lib/hosts.ts` here. Those existed to decide which app a
hostname should serve; this app *is* one app on one hostname, so the audience is settled
by which repo is deployed, not by a `Host` header. The login route is correspondingly
simple — no role picker, no chooser.
