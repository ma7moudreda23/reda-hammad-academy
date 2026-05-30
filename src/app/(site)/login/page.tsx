import type { Metadata } from "next";
import { PLATFORM_URL } from "@/lib/site";
import { LoginRedirect } from "@/components/LoginRedirect";

export const metadata: Metadata = {
  title: "الدخول للمنصة | أكاديمية رضا حماد التعليمية",
  description: "انتقل إلى منصة التعلّم الخاصة بأكاديمية رضا حماد التعليمية.",
};

export default function LoginPage() {
  return <LoginRedirect platformUrl={PLATFORM_URL} />;
}
