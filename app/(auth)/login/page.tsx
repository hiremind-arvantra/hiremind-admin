import AdminLoginPage from "@/modules/admin/AdminLoginPage";

import { privatePageMetadata } from "@/lib/seo";

// Nothing in this app should be indexed, and there is no public entry point to it.
export const metadata = privatePageMetadata("Admin Sign In");

/*
 * This app serves one audience, so there is no hostname branching left: the login
 * route is simply the administrator form. There is deliberately no sign-up — admin
 * accounts are created by hand and /auth/register refuses the account type.
 */
export default function Login() {
  return <AdminLoginPage />;
}
