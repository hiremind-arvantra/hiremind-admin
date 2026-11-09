import { Suspense } from "react";
import SetPasswordPage from "@/modules/auth/components/SetPasswordPage";

import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Set Password");

export default function SetPassword() {
  return (
    <Suspense>
      <SetPasswordPage />
    </Suspense>
  );
}
