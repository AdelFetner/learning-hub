import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/content";
import { Shell } from "@/components/shell";
import { TopicBadge, TopicBadgeFallback } from "@/components/topic-anki";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const detail = getTopic(decodeURIComponent(topic));
  if (!detail) notFound();

  const base = `/topics/${encodeURIComponent(detail.slug)}`;

  return (
    <Shell>
      <Link href="/" className="text-[0.8rem] italic text-muted-foreground hover:text-primary">
        ← all topics
      </Link>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <h1 className="text-[1.9rem]">{detail.title}</h1>
        <Suspense fallback={<TopicBadgeFallback />}>
          <TopicBadge deck={detail.deck} />
        </Suspense>
      </div>
      {detail.deck && (
        <p className="mt-1 text-[0.8rem] italic text-muted-foreground">
          Anki deck: <span className="nums">{detail.deck}</span>
        </p>
      )}

      {detail.missionHtml && (
        <section className="mt-7">
          <h3 className="mb-3 text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
            Mission
          </h3>
          <div className="doc max-w-[40rem]" dangerouslySetInnerHTML={{ __html: detail.missionHtml }} />
        </section>
      )}

      <section className="mt-9">
        <h3 className="mb-3 text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
          Lessons
        </h3>
        {detail.lessons.length === 0 ? (
          <p className="text-[0.9rem] italic text-muted-foreground">No lessons yet.</p>
        ) : (
          <div>
            {detail.lessons.map((l) => (
              <Link
                key={l.slug}
                href={`${base}/lessons/${encodeURIComponent(l.slug)}`}
                className="flex items-baseline gap-4 border-t border-border py-2.5 text-[0.97rem] last:border-b hover:text-primary"
              >
                {l.number && (
                  <span className="nums text-[0.75rem] text-muted-foreground">{l.number}</span>
                )}
                <span className="border-b border-[#d4cbb4]">{l.title}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {detail.references.length > 0 && (
        <section className="mt-9">
          <h3 className="mb-3 text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
            References
          </h3>
          <div className="flex flex-wrap gap-2">
            {detail.references.map((r) => (
              <Link
                key={r.slug}
                href={`${base}/references/${encodeURIComponent(r.slug)}`}
                className="rounded border border-border bg-card px-3 py-1.5 text-[0.88rem] hover:border-primary"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {detail.records.length > 0 && (
        <section className="mt-9">
          <h3 className="mb-3 text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
            Learning records
          </h3>
          <ol className="relative border-l border-border pl-5">
            {detail.records.map((rec) => (
              <li key={rec.slug} className="mb-5 last:mb-0">
                <span className="absolute -left-[5px] mt-2 size-2.5 rounded-full bg-primary" />
                <div className="text-[0.7rem] italic text-muted-foreground">
                  {rec.number ? `record ${rec.number}` : "record"}
                </div>
                <div className="doc" dangerouslySetInnerHTML={{ __html: rec.html }} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </Shell>
  );
}
