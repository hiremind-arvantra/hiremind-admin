import { Suspense } from "react";
import ResetPasswordPage from "@/modules/auth/components/ResetPasswordPage";

import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Reset Password");

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
