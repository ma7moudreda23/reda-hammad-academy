// Renders a course schedule that the admin uploaded as an image or a PDF.
// Image → shown inline. PDF → embedded in an iframe with an "open" link.
export function CourseSchedule({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  if (!url) return null;
  const isPdf = /\.pdf(\?|$)/i.test(url);
  const heading = title.trim() || "جدول الدورة";

  return (
    <div className={className}>
      <h2 className="mb-5 text-2xl font-extrabold text-brand-900">{heading}</h2>
      {isPdf ? (
        <div className="overflow-hidden rounded-card border border-brand-100 bg-brand-50">
          <iframe
            src={url}
            title={heading}
            className="h-[80vh] max-h-[900px] w-full"
          />
          <div className="border-t border-brand-100 bg-white px-4 py-3 text-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
            >
              فتح / تحميل الجدول
            </a>
          </div>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt={heading}
          loading="lazy"
          decoding="async"
          className="w-full rounded-card border border-brand-100"
        />
      )}
    </div>
  );
}
