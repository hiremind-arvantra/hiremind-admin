import ForgotPasswordPage from "@/modules/auth/components/ForgotPasswordPage";

import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Forgot Password");

export default function Page() {
  return <ForgotPasswordPage />;
}
