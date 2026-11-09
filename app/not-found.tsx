import Link from "next/link";

/*
 * In-app 404. Deliberately plain: this app has no marketing chrome, and pulling the
 * marketing Footer in here is what used to drag the whole marketing module along
 * with it.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center app-canvas px-4">
      <div className="text-center max-w-md">
        <p className="eyebrow text-brand-600">404</p>
        <h1 className="page-title mt-2">This page doesn&apos;t exist</h1>
        <p className="page-subtitle mt-2">
          The link may be out of date, or the page may have moved.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Go back
        </Link>
      </div>
    </main>
  );
}
