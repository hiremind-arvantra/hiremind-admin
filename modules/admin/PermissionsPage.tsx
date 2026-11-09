"use client";

import Link from "next/link";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";

import { AdminError, useAdminResource } from "./components/AdminData";
import { fetchRoles } from "./services/admin.service";
import { MODULE_LABEL, PERMISSION_ACTIONS, PERMISSION_MODULES } from "./types";

/*
 * Permissions — the matrix read the other way round.
 *
 * Roles & Permissions answers "what can this role do"; this answers "who can do this",
 * which is the question asked during an access review. It is read-only on purpose: one
 * editable surface for permissions (the role page) means there is no chance of two
 * screens disagreeing about what was saved.
 */
export default function PermissionsPage() {
  const { data: roles, loading, error, reload } = useAdminResource(() => fetchRoles(), []);

  return (
    <>
      <PageHeader
        eyebrow={
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Roles & Permissions", href: "/admin/roles" },
              { label: "Permissions" },
            ]}
          />
        }
        title="Permissions"
        subtitle="Which roles hold each permission, across every module."
      />

      <div className="tab-line mb-4" role="tablist" aria-label="Roles sections">
        <Link href="/admin/roles" className="tab" role="tab" aria-selected="false">Roles</Link>
        <span className="tab tab-active" role="tab" aria-selected="true">Permissions</span>
      </div>

      {error && <AdminError message={error} onRetry={reload} />}
      {!error && loading && <p className="text-body-sm text-ink-500">Loading permissions…</p>}

      {!error && roles && (
        <div className="space-y-4 max-w-[1100px]">
          {PERMISSION_MODULES.map((module) => (
            <section key={module} className="card p-5" aria-labelledby={`module-${module}`}>
              <h2 id={`module-${module}`} className="section-title mb-3">{MODULE_LABEL[module]}</h2>
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th scope="col">Permission</th>
                      <th scope="col">Roles that hold it</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_ACTIONS.map((action) => {
                      const holders = roles.filter((role) => role.permissions?.[module]?.[action]);
                      return (
                        <tr key={action}>
                          <th scope="row" className="text-left font-medium text-ink-800 capitalize">{action}</th>
                          <td>
                            {holders.length === 0 ? (
                              <span className="text-ink-400">No role holds this</span>
                            ) : (
                              <span className="flex flex-wrap gap-1.5">
                                {holders.map((role) => (
                                  <Link key={role.id} href="/admin/roles" className="badge badge-brand hover:bg-brand-100 transition-colors">
                                    {role.name}
                                  </Link>
                                ))}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
