"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Breadcrumbs } from "@/components/ui/PageHeader";

import { AdminError, formatDate, useAdminResource } from "./components/AdminData";
import { createRole, deleteRole, fetchRoleUsers, fetchRoles, updateRole } from "./services/admin.service";
import {
  MODULE_LABEL,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from "./types";

import type {
  AdminRole,
  PermissionAction,
  PermissionMatrix,
  PermissionModule,
  RoleAssignedUser,
} from "./types";

type Tab = "permissions" | "users" | "details";

/*
 * Roles & Permissions.
 *
 * The permission matrix is edited locally and saved in one call — a checkbox per module
 * per action would otherwise be one request per click. `dirty` tracks whether the local
 * matrix has diverged from the server's, so Save is only offered when there is something
 * to save and navigating away mid-edit is an explicit discard.
 */
export default function RolesPage() {
  const { data: roles, loading, error, reload } = useAdminResource(() => fetchRoles(), []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("permissions");
  const [draft, setDraft] = useState<PermissionMatrix>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => roles?.find((role) => role.id === selectedId) ?? roles?.[0] ?? null,
    [roles, selectedId],
  );

  // Reset the working copy whenever the selected role changes or the list reloads.
  useEffect(() => {
    if (selected) {
      setDraft(structuredClone(selected.permissions ?? {}));
      setDirty(false);
    }
  }, [selected?.id, selected?.permissions]);

  const visibleRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || !roles) return roles ?? [];
    return roles.filter((role) => role.name.toLowerCase().includes(term));
  }, [roles, search]);

  function toggle(module: PermissionModule, action: PermissionAction) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const row = next[module] ?? {};
      row[action] = !row[action];
      next[module] = row;
      return next;
    });
    setDirty(true);
  }

  function toggleAll(on: boolean) {
    const next: PermissionMatrix = {};
    if (on) {
      for (const module of PERMISSION_MODULES) {
        next[module] = Object.fromEntries(PERMISSION_ACTIONS.map((a) => [a, true]));
      }
    }
    setDraft(next);
    setDirty(true);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateRole(selected.id, {
        name: selected.name,
        description: selected.description ?? undefined,
        active: selected.active,
        permissions: draft,
      });
      setNotice(`Saved permissions for ${selected.name}.`);
      setDirty(false);
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not save the role.");
    } finally {
      setSaving(false);
    }
  }

  async function addRole() {
    const name = window.prompt("Name the new role");
    if (!name?.trim()) return;
    try {
      const role = await createRole({ name: name.trim(), active: true, permissions: {} });
      setNotice(`Created ${role.name}.`);
      setSelectedId(role.id);
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not create the role.");
    }
  }

  async function removeRole(role: AdminRole) {
    if (role.systemRole) {
      setNotice(`${role.name} is a system role and cannot be deleted.`);
      return;
    }
    if (!window.confirm(`Delete the ${role.name} role? Users assigned to it will lose its permissions.`)) return;
    try {
      await deleteRole(role.id);
      setNotice(`Deleted ${role.name}.`);
      setSelectedId(null);
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not delete the role.");
    }
  }

  const allOn =
    PERMISSION_MODULES.every((module) =>
      PERMISSION_ACTIONS.every((action) => draft[module]?.[action]),
    );

  return (
    <>
      <PageHeader
        eyebrow={<Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Roles & Permissions" }]} />}
        title="Roles & Permissions"
        subtitle="Create roles, define permissions and manage access for agencies."
        actions={
          <button type="button" className="btn btn-primary" onClick={addRole}>
            + Create Role
          </button>
        }
      />

      {notice && (
        <div role="status" className="alert alert-info mb-4 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      {error && <AdminError message={error} onRetry={reload} />}

      {!error && loading && <p className="text-body-sm text-ink-500">Loading roles…</p>}

      {!error && !loading && roles && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4 max-w-[1100px]">
          {/* ── Role list ── */}
          <section className="card p-4" aria-labelledby="roles-list">
            <h2 id="roles-list" className="section-title mb-3">Roles ({roles.length})</h2>
            <label className="relative block mb-3">
              <span className="sr-only">Search roles</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search roles…"
                className="field-input h-9"
              />
            </label>
            {visibleRoles.length === 0 ? (
              <p className="empty-state text-body-sm">No roles match.</p>
            ) : (
              <ul className="space-y-1">
                {visibleRoles.map((role) => {
                  const active = selected?.id === role.id;
                  return (
                    <li key={role.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedId(role.id); setTab("permissions"); }}
                        aria-current={active ? "true" : undefined}
                        className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${active ? "bg-brand-50 border border-brand-200" : "hover:bg-ink-50 border border-transparent"}`}
                      >
                        <span className="block text-body-sm font-semibold text-ink-900">{role.name}</span>
                        <span className="block text-caption text-ink-500">
                          {role.permissionCount} permission{role.permissionCount === 1 ? "" : "s"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ── Selected role ── */}
          {selected ? (
            <section className="card p-5 min-w-0" aria-labelledby="role-detail">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="role-detail" className="text-title font-bold text-ink-900">{selected.name}</h2>
                  {selected.description && <p className="mt-1 text-body-sm text-ink-500">{selected.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={selected.active ? "badge badge-success" : "badge badge-neutral"}>
                    {selected.active ? "Active" : "Inactive"}
                  </span>
                  {!selected.systemRole && (
                    <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => removeRole(selected)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="tab-line mt-4" role="tablist" aria-label="Role detail sections">
                {([["permissions", "Permissions"], ["users", `Assigned Users (${selected.assignedUserCount})`], ["details", "Details"]] as const).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={tab === key}
                      onClick={() => setTab(key)}
                      className={`tab ${tab === key ? "tab-active" : ""}`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>

              {tab === "permissions" && (
                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-title-sm font-bold text-ink-900">Module Permissions</h3>
                      <p className="text-caption text-ink-500">Select the permissions this role will have across modules.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-body-sm font-medium text-ink-700">
                      <input
                        type="checkbox"
                        checked={allOn}
                        onChange={(event) => toggleAll(event.target.checked)}
                        className="w-4 h-4 accent-brand-600"
                      />
                      Select All
                    </label>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="data-table w-full">
                      <thead>
                        <tr>
                          <th scope="col">Module</th>
                          {PERMISSION_ACTIONS.map((action) => (
                            <th key={action} scope="col" className="capitalize text-center">{action}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PERMISSION_MODULES.map((module) => (
                          <tr key={module}>
                            <th scope="row" className="text-left font-medium text-ink-800">{MODULE_LABEL[module]}</th>
                            {PERMISSION_ACTIONS.map((action) => (
                              <td key={action} className="text-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(draft[module]?.[action])}
                                  onChange={() => toggle(module, action)}
                                  aria-label={`${action} ${MODULE_LABEL[module]}`}
                                  className="w-4 h-4 accent-brand-600"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={!dirty || saving}
                      onClick={() => { setDraft(structuredClone(selected.permissions ?? {})); setDirty(false); }}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={save}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {tab === "users" && <AssignedUsers roleId={selected.id} />}

              {tab === "details" && (
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Detail label="Role name" value={selected.name} />
                  <Detail label="Status" value={selected.active ? "Active" : "Inactive"} />
                  <Detail label="Permissions granted" value={String(selected.permissionCount)} />
                  <Detail label="Assigned users" value={String(selected.assignedUserCount)} />
                  <Detail label="System role" value={selected.systemRole ? "Yes — cannot be deleted" : "No"} />
                  <Detail label="Created" value={formatDate(selected.createdOn)} />
                  <div className="sm:col-span-2">
                    <Detail label="Description" value={selected.description ?? "—"} />
                  </div>
                </dl>
              )}
            </section>
          ) : (
            <section className="card p-8">
              <p className="empty-state">Select a role to view its permissions.</p>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function AssignedUsers({ roleId }: { roleId: string }) {
  const { data, loading, error, reload } = useAdminResource<RoleAssignedUser[]>(
    () => fetchRoleUsers(roleId),
    [roleId],
  );

  if (loading) return <p className="mt-4 text-body-sm text-ink-500">Loading users…</p>;
  if (error) return <div className="mt-4"><AdminError message={error} onRetry={reload} /></div>;
  if (!data || data.length === 0) return <p className="mt-4 empty-state">No users are assigned to this role.</p>;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="data-table w-full">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Agency</th>
            <th scope="col">Status</th>
            <th scope="col">Assigned</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td className="font-semibold text-ink-900">{user.fullName}</td>
              <td className="text-ink-600">{user.email}</td>
              <td className="text-ink-600">{user.agencyName ?? "—"}</td>
              <td><span className="badge badge-neutral">{user.status}</span></td>
              <td className="text-ink-500">{formatDate(user.assignedOn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption font-medium text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-body-sm text-ink-900">{value}</dd>
    </div>
  );
}
