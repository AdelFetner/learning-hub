import { Suspense } from "react";
import Link from "next/link";
import { listTopics, recentLessons } from "@/lib/content";
import { Shell } from "@/components/shell";
import { TopicCard } from "@/components/topic-card";
import { StatTile, AnkiTiles, AnkiTilesFallback } from "@/components/stat-tiles";

// Read the filesystem on every request so freshly written lessons appear
// without a rebuild. Anki stats stream in via Suspense below.
export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const topics = listTopics();
  const recent = recentLessons(6);
  const lessonTotal = topics.reduce((s, t) => s + t.lessonCount, 0);

  return (
    <Shell>
      <h1 className="text-[1.9rem]">Welcome back</h1>
      <p className="mt-1 text-[0.95rem] italic text-muted-foreground">
        {topics.length} {topics.length === 1 ? "topic" : "topics"} · {lessonTotal}{" "}
        {lessonTotal === 1 ? "lesson" : "lessons"}
      </p>

      <div className="my-7 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        <Suspense fallback={<AnkiTilesFallback />}>
          <AnkiTiles />
        </Suspense>
        <StatTile n={topics.length} label={topics.length === 1 ? "topic" : "topics"} />
        <StatTile n={lessonTotal} label={lessonTotal === 1 ? "lesson" : "lessons"} />
      </div>

      <h3 className="mb-4 text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
        Topics
      </h3>
      {topics.length === 0 ? (
        <p className="text-muted-foreground">
          No topics yet. Run <code className="nums">/teach</code> in a new folder under{" "}
          <code className="nums">topics/</code> to begin.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
          {topics.map((t) => (
            <TopicCard key={t.slug} topic={t} />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
            Recent lessons
          </h3>
          <div>
            {recent.map((l) => (
              <Link
                key={`${l.topicSlug}/${l.slug}`}
                href={`/topics/${encodeURIComponent(l.topicSlug)}/lessons/${encodeURIComponent(
                  l.slug
                )}`}
                className="flex items-baseline gap-4 border-t border-border py-2.5 text-[0.95rem] last:border-b hover:text-primary"
              >
                {l.number && (
                  <span className="nums text-[0.75rem] text-muted-foreground">{l.number}</span>
                )}
                <span className="border-b border-[#d4cbb4]">{l.title}</span>
                <span className="ml-auto text-[0.78rem] italic text-muted-foreground">
                  {l.topicTitle}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}
