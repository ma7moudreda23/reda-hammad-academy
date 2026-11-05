import type { CourseVideo } from "@/lib/curriculum";
import { PromoVideo } from "@/components/PromoVideo";

// Videos the admin added to a course, each under the name the admin gave it.
export function CourseVideos({ videos }: { videos: CourseVideo[] }) {
  return (
    <div className={`grid gap-6 ${videos.length > 1 ? "md:grid-cols-2" : ""}`}>
      {videos.map((video, i) => (
        <div key={i} className="rounded-card border border-brand-100 bg-white p-4 shadow-sm">
          {video.title && (
            <h2 className="mb-3 text-center text-xl font-black text-brand-900">{video.title}</h2>
          )}
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <PromoVideo url={video.url} autoplay={false} title={video.title || "فيديو"} />
          </div>
        </div>
      ))}
    </div>
  );
}
