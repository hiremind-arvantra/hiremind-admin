import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminHeader from "@/modules/admin/components/AdminHeader";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";

import type { Metadata } from "next";

// Behind a login and cross-tenant; keep it out of search results entirely.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/* Platform-admin shell — same geometry as the candidate and recruiter shells. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="h-screen flex flex-col overflow-hidden app-canvas">
        <AdminHeader />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
            <div className="app-page">{children}</div>
          </main>
        </div>
      </div>
    </RequireAdmin>
  );
}
