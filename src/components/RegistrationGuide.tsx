import type { HomeContent } from "@/lib/content";
import { PromoVideo } from "@/components/PromoVideo";

type Guide = HomeContent["registrationGuide"];

// Shared "how to register" block. Rendered on the homepage (when enabled) and on
// any course page whose showRegistrationGuide toggle is on. Text + optional
// image or video, laid out side by side on wide screens.
export function RegistrationGuide({
  data,
  className = "",
}: {
  data: Guide;
  className?: string;
}) {
  if (!data) return null;
  const hasVideo = data.mediaType === "video" && !!data.videoUrl;
  const hasImage = data.mediaType === "image" && !!data.imageUrl;
  const hasMedia = hasVideo || hasImage;
  if (!data.body && !hasMedia && !data.subtitle) return null;

  return (
    <section className={`mx-auto max-w-6xl px-5 ${className}`}>
      <div className="rounded-card border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-brand-900 sm:text-3xl">{data.title}</h2>
          {data.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-brand-900/65">{data.subtitle}</p>
          )}
        </div>

        <div
          className={`mt-7 grid items-center gap-8 ${hasMedia && data.body ? "lg:grid-cols-2" : ""}`}
        >
          {hasMedia && (
            <div className="overflow-hidden rounded-card border border-brand-100 bg-brand-50">
              {hasVideo ? (
                <div className="aspect-video w-full bg-black">
                  <PromoVideo url={data.videoUrl} autoplay={false} title={data.title} />
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={data.imageUrl}
                  alt={data.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-contain"
                />
              )}
            </div>
          )}

          {data.body && (
            <div className="whitespace-pre-line text-lg leading-8 text-brand-900/75">
              {data.body}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
