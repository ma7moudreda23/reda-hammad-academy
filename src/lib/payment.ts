import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, dbQuery } from "@/lib/db";
import { DEFAULT_PAYMENT, PAYMENT_KEY, type PaymentContent } from "@/lib/banks";
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from "@/lib/cache";

export { DEFAULT_PAYMENT, PAYMENT_KEY } from "@/lib/banks";
export type { PaymentContent, BankAccount } from "@/lib/banks";

const loadPaymentContent = unstable_cache(
  async (): Promise<PaymentContent> => {
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
  },
  ["payment-content"],
  { tags: [CACHE_TAGS.payment], revalidate: CONTENT_REVALIDATE_SECONDS },
);

export const getPaymentContent = cache(loadPaymentContent);

export async function savePaymentContent(content: PaymentContent): Promise<void> {
  const value = JSON.stringify(content);
  await prisma.siteSetting.upsert({
    where: { key: PAYMENT_KEY },
    create: { key: PAYMENT_KEY, value },
    update: { value },
  });
}
