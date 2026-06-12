import { getSession } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getSession();
  return <ChangePasswordForm email={session?.email ?? ""} />;
}
