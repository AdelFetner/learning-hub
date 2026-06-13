import { Suspense } from "react";
import Link from "next/link";
import type { Topic } from "@/lib/content";
import {
  TopicBadge,
  TopicBadgeFallback,
  TopicRetention,
  TopicRetentionFallback,
} from "@/components/topic-anki";

export function TopicCard({ topic }: { topic: Topic }) {
  const href = `/topics/${encodeURIComponent(topic.slug)}`;
  return (
    <Link
      href={href}
      className="block rounded border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[1.2rem]">{topic.title}</h2>
        <Suspense fallback={<TopicBadgeFallback />}>
          <TopicBadge deck={topic.deck} />
        </Suspense>
      </div>
      <p className="my-2 text-[0.88rem] text-muted-foreground">{topic.summary}</p>
      <Suspense fallback={<TopicRetentionFallback />}>
        <TopicRetention deck={topic.deck} />
      </Suspense>
      <div className="flex justify-between text-[0.76rem] italic text-muted-foreground">
        <span>
          <span className="nums">{topic.lessonCount}</span>{" "}
          {topic.lessonCount === 1 ? "lesson" : "lessons"} ·{" "}
          <span className="nums">{topic.referenceCount}</span>{" "}
          {topic.referenceCount === 1 ? "reference" : "references"}
        </span>
        {topic.recordCount > 0 && (
          <span>
            <span className="nums">{topic.recordCount}</span>{" "}
            {topic.recordCount === 1 ? "record" : "records"}
          </span>
        )}
      </div>
    </Link>
  );
}
