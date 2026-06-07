import { getPaymentContent } from "@/lib/payment";
import { PaymentEditor } from "@/components/admin/PaymentEditor";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  const content = await getPaymentContent();
  return <PaymentEditor initial={content} />;
}
