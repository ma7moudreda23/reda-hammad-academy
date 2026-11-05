"use client";

import { PromoCounter, usePromo } from "@/components/PromoCounter";

export function CoursePagePrice({
  slug,
  hasPromo,
  price,
  oldPrice,
  priceNote,
  currency,
}: {
  slug: string;
  hasPromo: boolean;
  price: string;
  oldPrice: string;
  priceNote: string;
  currency: string;
}) {
  const promo = usePromo(slug, hasPromo);
  // Once the discount runs out, the old price is what a student actually pays.
  const fullPrice = promo?.ended && oldPrice;
  const shown = fullPrice || price;

  return (
    <>
      {shown && (
        <p className="mt-6 flex items-baseline gap-3">
          {oldPrice && !fullPrice && (
            <span className="text-3xl font-black text-brand-900/45 line-through decoration-red-500 decoration-[3px]">
              {oldPrice}
            </span>
          )}
          <span className="text-3xl font-black text-brand-700">
            {shown}
            {currency ? ` ${currency}` : ""}
          </span>
        </p>
      )}
      {priceNote && !promo?.ended && (
        <p className="mt-2 text-sm font-bold text-accent-600">{priceNote}</p>
      )}
      {promo && <PromoCounter status={promo} />}
    </>
  );
}
