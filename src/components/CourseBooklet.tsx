"use client";

import { useEffect, useRef, useState } from "react";
import type { Booklet } from "@/lib/booklets";

type PageFlip = {
  loadFromHTML(pages: NodeListOf<Element>): void;
  on(event: "flip", handler: () => void): void;
  flipNext(): void;
  flipPrev(): void;
  getCurrentPageIndex(): number;
  destroy(): void;
};
type PageFlipGlobal = { PageFlip: new (el: HTMLElement, settings: object) => PageFlip };

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="66 182 230 230"><path fill="#FFFFFF" d="M 72.433594 206.101562 C 89.164062 205.144531 134.574219 205.144531 171.621094 205.382812 C 201.496094 206.101562 224.675781 229.28125 224.675781 258.441406 C 224.675781 279.472656 212.25 292.855469 199.105469 306.242188 L 175.921875 293.097656 L 156.5625 303.851562 L 156.5625 379.375 L 113.0625 405.1875 L 113.0625 253.183594 L 174.488281 287.597656 C 187.15625 281.386719 192.414062 273.5 192.414062 260.832031 C 192.414062 246.011719 182.375 235.496094 172.335938 235.496094 L 115.933594 235.496094 C 96.332031 235.496094 83.1875 222.113281 72.433594 206.101562 Z M 72.433594 206.101562 "/><path fill="#E2B653" d="M 173.054688 299.789062 L 195.757812 313.890625 L 195.757812 345.199219 L 173.054688 359.0625 Z M 173.054688 299.789062 "/><path fill="#3D7BFF" d="M 201.015625 309.109375 L 244.992188 282.339844 L 244.992188 214.941406 L 290.402344 186.742188 L 290.402344 407.816406 L 244.992188 380.332031 L 244.992188 317.714844 L 201.015625 343.527344 Z M 201.015625 309.109375 "/></svg>`;

let library: Promise<PageFlipGlobal> | null = null;

function loadLibrary(): Promise<PageFlipGlobal> {
  library ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/page-flip.js";
    script.onload = () => resolve((window as unknown as { St: PageFlipGlobal }).St);
    script.onerror = () => {
      library = null;
      reject(new Error("page-flip failed to load"));
    };
    document.head.appendChild(script);
  });
  return library;
}

function pagesHtml({ folder, pageCount, levelName }: Booklet): string {
  const images = Array.from({ length: pageCount }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `<div class="booklet-page"><img src="/booklets/${folder}/${n}.jpg" alt="صفحة ${i + 1} من مذكرة ${levelName}" width="909" height="1287" decoding="async"></div>`;
  });
  const end = `<div class="booklet-page"><div class="booklet-end">${LOGO}<h3>هذه صفحات مختارة من مذكرة<br><span>${levelName}</span></h3>
<ul><li>375 سؤالًا بالعربية والإنجليزية</li><li>20 حصة مسجّلة + 20 حصة مباشرة · 30 ساعة تدريبية</li><li>أكثر من 50 اختبارًا على المهارات واختبارات محاكية</li></ul>
<div>للتسجيل والاستفسار واتساب</div><div class="booklet-phone">054 085 8626</div><small>فكّر أذكى.. وحل أسرع</small></div></div>`;
  const back = `<div class="booklet-page"><div class="booklet-end">${LOGO}<h3>أكاديمية رضا حماد</h3><small>REDA HAMMAD ACADEMY</small></div></div>`;
  return [...images, end, back].join("");
}

// The book only starts loading when the visitor scrolls near it, so its pages
// cost nothing to anyone who never gets this far down the course page.
export function CourseBooklet({ booklet }: { booklet: Booklet }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const swipeStart = useRef<number | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<"waiting" | "ready" | "failed">("waiting");
  const total = booklet.pageCount + 2;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    const start = async () => {
      try {
        const { PageFlip } = await loadLibrary();
        if (cancelled) return;
        host.innerHTML = `<div class="booklet-book">${pagesHtml(booklet)}</div>`;
        const book = host.firstElementChild as HTMLElement;
        const flip = new PageFlip(book, {
          width: 520,
          height: 735,
          size: "stretch",
          minWidth: 280,
          maxWidth: 560,
          minHeight: 396,
          maxHeight: 792,
          showCover: true,
          maxShadowOpacity: 0.4,
          mobileScrollSupport: true,
          useMouseEvents: false,
        });
        flip.loadFromHTML(book.querySelectorAll(".booklet-page"));
        flip.on("flip", () => setPage(flip.getCurrentPageIndex()));
        flipRef.current = flip;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void start();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(host);

    return () => {
      cancelled = true;
      observer.disconnect();
      flipRef.current?.destroy();
      flipRef.current = null;
      host.innerHTML = "";
    };
  }, [booklet]);

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const flip = flipRef.current;
    if (swipeStart.current === null || !flip) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 40) {
      if (dx > 0) flip.flipNext();
      else flip.flipPrev();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left + rect.width / 2) flip.flipNext();
    else flip.flipPrev();
  }

  const button =
    "cursor-pointer whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-500 hover:text-brand-900 disabled:cursor-default disabled:opacity-40 sm:px-5 sm:py-2.5 sm:text-base";

  return (
    <section className="mt-14 overflow-hidden rounded-card bg-[#061b3b] p-4 text-white sm:p-8">
      <h2 className="text-center text-2xl font-extrabold">
        تصفّح مذكرة <span className="text-accent-400">{booklet.levelName}</span>
      </h2>
      <p className="mt-2 text-center text-sm text-white/65">صفحات مختارة من المذكرة ثنائية اللغة</p>

      <div className="mx-auto mt-6 max-w-4xl">
        <div
          ref={hostRef}
          onPointerDown={(e) => {
            swipeStart.current = e.clientX;
          }}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          onPointerUp={onPointerUp}
          className="booklet-flip min-h-[396px]"
        />
        {status === "failed" ? (
          <p className="mt-4 text-center text-sm text-white/65">تعذّر تحميل المذكرة. حدّث الصفحة وحاول مرة أخرى.</p>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button type="button" className={button} disabled={status !== "ready"} onClick={() => flipRef.current?.flipPrev()}>
                → السابقة
              </button>
              <span dir="ltr" className="min-w-16 text-center text-sm font-bold text-white/70">
                {page + 1} / {total}
              </span>
              <button type="button" className={button} disabled={status !== "ready"} onClick={() => flipRef.current?.flipNext()}>
                التالية ←
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-white/50">
              اضغط على الصفحة اليسرى للتقدّم، أو اسحب بإصبعك، أو استخدم الأزرار
            </p>
          </>
        )}
      </div>
    </section>
  );
}
