import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { ExamIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "اختبارات تجريبية نسمو 2 | هدية أكاديمية رضا حماد",
  description:
    "هدية مجانية من أكاديمية رضا حماد: اختبارات تجريبية نسمو 2 في الرياضيات والفيزياء والكيمياء والأحياء والعلوم بالعربي والإنجليزي، جاهزة للتحميل.",
};

// Paste the Google Drive share link of each file. A subject without an English
// file just leaves `en` out.
type Subject = { ar: string; arLink: string; en?: string; enLink?: string };
const SUBJECTS: Subject[] = [
  {
    ar: "رياضيات 1",
    arLink:
      "https://drive.google.com/file/d/1YZvgYdGbEjqBfcbkciZxTQtxa_JJtcqZ/view",
    en: "Mathematics 1",
    enLink:
      "https://drive.google.com/file/d/1IjlDx1RVJKk7tN_lpHbFbOde7KG9sTZm/view",
  },
  {
    ar: "رياضيات 2",
    arLink:
      "https://drive.google.com/file/d/1rCcic5-wW2OEdKIlaz8hJTnGUP3TG0ex/view",
    en: "Mathematics 2",
    enLink:
      "https://drive.google.com/file/d/1eJ3gyMt_N38gvQE8-E1LCC9yf64InIJe/view",
  },
  {
    ar: "فيزياء",
    arLink:
      "https://drive.google.com/file/d/1FtuTAZi70ZW2Od7yHrrci1GTU89hG_Xx/view",
    en: "Physics",
    enLink:
      "https://drive.google.com/file/d/1a4c7rh6-eJkNVF7gE_cXm2gnoAz-WD7p/view",
  },
  {
    ar: "كيمياء",
    arLink:
      "https://drive.google.com/file/d/1XDJxngGcmZnyQE7UQMub-pSKZf9Fm22A/view",
    en: "Chemistry",
    enLink:
      "https://drive.google.com/file/d/1nUcjJUcFwfmbtsz53Mlxobsd71pXPAYE/view",
  },
  {
    ar: "أحياء",
    arLink:
      "https://drive.google.com/file/d/1cchQVb7eQGyhWLrd-SVfaX986z5MWeR0/view",
  },
  {
    ar: "علوم",
    arLink:
      "https://drive.google.com/file/d/1aSWpDFwhIl0P6gPtFkJGe3NBB1xhUbzw/view",
  },
];

// Turns a Drive share link into a direct download link.
function driveDownload(link: string): string {
  const id =
    link.match(/\/d\/([\w-]+)/)?.[1] ?? link.match(/[?&]id=([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : link;
}

function FileButton({
  label,
  link,
  ltr,
}: {
  label: string;
  link: string;
  ltr?: boolean;
}) {
  const inner = (
    <>
      <span className="text-base font-black sm:text-lg">{label}</span>
      <span className="text-xs font-bold opacity-75">
        {link
          ? ltr
            ? "Download ⬇"
            : "تحميل ⬇"
          : ltr
            ? "Coming soon"
            : "قريبًا"}
      </span>
    </>
  );
  const cls =
    "flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-center transition";
  if (!link) {
    return (
      <div
        dir={ltr ? "ltr" : undefined}
        className={`${cls} border border-dashed border-brand-200 text-brand-900/45`}
      >
        {inner}
      </div>
    );
  }
  return (
    <a
      href={driveDownload(link)}
      target="_blank"
      rel="noopener noreferrer"
      dir={ltr ? "ltr" : undefined}
      className={`${cls} bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:-translate-y-0.5 hover:bg-brand-700`}
    >
      {inner}
    </a>
  );
}

export default function GiftsPage() {
  return (
    <div className="pt-28 sm:pt-32">
      <section className="relative overflow-hidden bg-grid py-14">
        <div className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-800">
              🎁 هدية مجانية من الأكاديمية
            </span>
            <h1 className="mt-5 text-3xl font-black text-brand-900 sm:text-5xl">
              اختبارات تجريبية نسمو 2
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-900/65">
              اختر المادة واللغة، وحمّل الاختبار مباشرة.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-5 pb-24">
        <div className="grid gap-4">
          {SUBJECTS.map((s) => (
            <div
              key={s.ar}
              className="rounded-card border border-brand-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <ExamIcon className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-black text-brand-900">
                  {s.ar}
                  {s.en && (
                    <>
                      {" "}
                      <span className="text-brand-900/40">|</span>{" "}
                      <span dir="ltr" className="text-brand-900/60">
                        {s.en}
                      </span>
                    </>
                  )}
                </h2>
              </div>
              <div className={`grid gap-3 ${s.en ? "grid-cols-2" : ""}`}>
                <FileButton label={s.ar} link={s.arLink} />
                {s.en && <FileButton label={s.en} link={s.enLink ?? ""} ltr />}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
