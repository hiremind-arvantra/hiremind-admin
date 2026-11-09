import { redirect } from "next/navigation";

/*
 * The root of this app.
 *
 * In the monolith, routeRequest() sent "/" to each audience's home. Splitting the apps
 * removed that layer along with lib/hosts.ts, which left the bare hostname 404ing — this
 * puts it back, in the one place that still needs it.
 *
 * RequireAuth (RequireAdmin for the admin app) decides what happens next: a signed-in
 * administrator lands on /admin, anyone else is bounced to /login.
 */
export default function Root() {
  redirect("/admin");
}
