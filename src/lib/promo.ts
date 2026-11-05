import { unstable_cache } from "next/cache";

export type PromoStatus = {
  code: string;
  total: number;
  remaining: number;
  ended: boolean;
};

// Stripe is the source of truth for how many times a code was redeemed, so the
// site keeps no counter of its own. Uses a read-only restricted key.
export async function fetchPromoStatus(code: string, key: string): Promise<PromoStatus | null> {
  const res = await fetch(
    `https://api.stripe.com/v1/promotion_codes?code=${encodeURIComponent(code)}&limit=10`,
    { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(4000) },
  );
  if (!res.ok) {
    console.error("promo: Stripe responded", res.status);
    return null;
  }
  const { data } = (await res.json()) as {
    data: { code: string; active: boolean; max_redemptions: number | null; times_redeemed: number }[];
  };
  // An inactive old code can share its name with the live one.
  const promo = data.find((p) => p.active) ?? data[0];
  if (!promo || !promo.max_redemptions) return null;

  const remaining = Math.max(0, promo.max_redemptions - promo.times_redeemed);
  return {
    code: promo.code,
    total: promo.max_redemptions,
    remaining,
    ended: !promo.active || remaining === 0,
  };
}

export const getPromoStatus = unstable_cache(
  async (code: string): Promise<PromoStatus | null> => {
    const key = process.env.STRIPE_PROMO_KEY;
    if (!key) return null;
    try {
      return await fetchPromoStatus(code, key);
    } catch (e) {
      console.error("promo: Stripe request failed", e);
      return null;
    }
  },
  ["promo-status"],
  { revalidate: 60 },
);
