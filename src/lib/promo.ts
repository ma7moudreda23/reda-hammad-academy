import { unstable_cache } from "next/cache";

export type PromoStatus = {
  code: string;
  total: number;
  remaining: number;
  ended: boolean;
};

export type PromoProblem =
  | "no-key"
  | "bad-key"
  | "no-permission"
  | "not-found"
  | "no-limit"
  | "unreachable";

export type PromoCheck = { status: PromoStatus } | { problem: PromoProblem; detail?: string };

type Coupon = { id?: string; max_redemptions?: number | null; times_redeemed?: number };
type PromotionCode = {
  code: string;
  active: boolean;
  max_redemptions: number | null;
  times_redeemed: number;
  // Newer Stripe API versions nest the coupon under `promotion`.
  coupon?: Coupon | string | null;
  promotion?: { coupon?: Coupon | string | null } | null;
};

// Stripe's own wording names the missing permission. Any key in it is masked.
async function problemFromResponse(res: Response): Promise<PromoCheck> {
  const body = await res.json().catch(() => null);
  const message: string = body?.error?.message ?? "";
  const detail = message.replace(/\b(rk|sk|pk)_(test|live)_[\w*]+/g, "$1_$2_***") || undefined;
  console.error("promo: Stripe responded", res.status, detail);
  if (res.status === 401) return { problem: "bad-key", detail };
  if (res.status === 403) return { problem: "no-permission", detail };
  return { problem: "unreachable", detail };
}

// Stripe is the source of truth for how many times a code was redeemed, so the
// site keeps no counter of its own. Uses a read-only restricted key.
export async function checkPromoCode(code: string, key: string | undefined): Promise<PromoCheck> {
  const apiKey = key?.trim();
  if (!apiKey) return { problem: "no-key" };
  const stripe = (path: string) =>
    fetch(`https://api.stripe.com/v1/${path}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(4000),
    });

  try {
    const res = await stripe(`promotion_codes?code=${encodeURIComponent(code)}&limit=10`);
    if (!res.ok) return problemFromResponse(res);
    const { data } = (await res.json()) as { data: PromotionCode[] };
    // An inactive old code can share its name with the live one.
    const promo = data.find((p) => p.active) ?? data[0];
    if (!promo) return { problem: "not-found" };

    let total = promo.max_redemptions;
    let used = promo.times_redeemed;
    if (!total) {
      // The limit can also be set on the coupon behind the code.
      let coupon = promo.promotion?.coupon ?? promo.coupon;
      if (typeof coupon === "string") {
        const couponRes = await stripe(`coupons/${encodeURIComponent(coupon)}`);
        if (!couponRes.ok) return problemFromResponse(couponRes);
        coupon = (await couponRes.json()) as Coupon;
      }
      total = coupon?.max_redemptions ?? null;
      used = coupon?.times_redeemed ?? 0;
    }
    if (!total) return { problem: "no-limit" };

    const remaining = Math.max(0, total - used);
    return {
      status: {
        code: promo.code,
        total,
        remaining,
        ended: !promo.active || remaining === 0,
      },
    };
  } catch (e) {
    console.error("promo: Stripe request failed", e);
    return { problem: "unreachable" };
  }
}

export const getPromoStatus = unstable_cache(
  async (code: string): Promise<PromoStatus | null> => {
    const check = await checkPromoCode(code, process.env.STRIPE_PROMO_KEY);
    return "status" in check ? check.status : null;
  },
  ["promo-status"],
  { revalidate: 60 },
);
