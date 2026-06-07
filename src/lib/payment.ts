import { prisma, dbQuery } from "@/lib/db";
import { DEFAULT_PAYMENT, PAYMENT_KEY, type PaymentContent } from "@/lib/banks";

export { DEFAULT_PAYMENT, PAYMENT_KEY } from "@/lib/banks";
export type { PaymentContent, BankAccount } from "@/lib/banks";

export async function getPaymentContent(): Promise<PaymentContent> {
  const row = await dbQuery(
    () => prisma.siteSetting.findUnique({ where: { key: PAYMENT_KEY } }),
    null,
  );
  if (!row?.value) return DEFAULT_PAYMENT;
  try {
    const parsed = JSON.parse(row.value);
    return {
      ...DEFAULT_PAYMENT,
      ...parsed,
      banks: Array.isArray(parsed.banks) ? parsed.banks : [],
    };
  } catch {
    return DEFAULT_PAYMENT;
  }
}

export async function savePaymentContent(content: PaymentContent): Promise<void> {
  const value = JSON.stringify(content);
  await prisma.siteSetting.upsert({
    where: { key: PAYMENT_KEY },
    create: { key: PAYMENT_KEY, value },
    update: { value },
  });
}
