import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { getVideo, getVideos, type VideoItem } from "@/lib/videos-api";
import { getTrendingPosts } from "@/lib/news-api";
import { setMeta, videoStructuredData } from "@/lib/seo";
import type { BlogPost } from "@/types/news";

/** One short video with our Telugu context, credit, structured data, latest news and more videos. */
export function VideoPage() {
  const { id = "" } = useParams();
  const [video, setVideo] = useState<VideoItem | null | undefined>(undefined);
  const [more, setMore] = useState<VideoItem[]>([]);
  const [news, setNews] = useState<BlogPost[]>([]);

  useEffect(() => {
    let alive = true;
    setVideo(undefined);
    getVideo(id).then((v) => {
      if (!alive) return;
      setVideo(v);
      if (v) {
        setMeta({ title: `${v.title} | VaartaNow వీడియో`, description: v.caption || v.title, canonical: `/videos/${v.id}`, image: v.thumbnail });
        videoStructuredData(v);
      }
    });
    getVideos(8).then((list) => alive && setMore(list.filter((v) => v.id !== id).slice(0, 4)));
    getTrendingPosts(5).then((list) => alive && setNews(list));
    window.scrollTo(0, 0);
    return () => {
      alive = false;
    };
  }, [id]);

  if (video === null) return <NotFoundPage />;

  return (
    <main className="container-shell grid gap-6 py-4 lg:grid-cols-[minmax(0,28rem)_1fr]">
      <div>{video ? <VideoCard video={video} showPageLink={false} /> : <Skeleton className="aspect-[9/16] w-full rounded-[1.4rem]" />}</div>

      <aside className="space-y-6">
        {news.length > 0 && (
          <section className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <h2 className="mb-3 text-base font-black">తాజా వార్తలు</h2>
            <ul className="space-y-2">
              {news.map((post) => (
                <li key={post.slug}>
                  <Link to={`/news/${post.slug}`} className="text-sm font-bold hover:text-[hsl(var(--primary))]">{post.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {more.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-black">మరిన్ని వీడియోలు</h2>
            <div className="grid grid-cols-2 gap-3">
              {more.map((v) => (
                <Link key={v.id} to={`/videos/${v.id}`} className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                  <img src={v.thumbnail} alt={v.title} loading="lazy" className="aspect-video w-full object-cover" />
                  <p className="line-clamp-2 p-2 text-xs font-bold">{v.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </aside>
    </main>
  );
}
