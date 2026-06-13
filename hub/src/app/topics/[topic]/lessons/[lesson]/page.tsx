import { notFound } from "next/navigation";
import { getTopic, resolveDocFile } from "@/lib/content";
import { DocViewer } from "@/components/viewer";

export const dynamic = "force-dynamic";

export default async function LessonViewer({
  params,
}: {
  params: Promise<{ topic: string; lesson: string }>;
}) {
  const { topic, lesson } = await params;
  const topicSlug = decodeURIComponent(topic);
  const file = decodeURIComponent(lesson);

  if (!resolveDocFile(topicSlug, "lessons", file)) notFound();
  const detail = getTopic(topicSlug);
  if (!detail) notFound();

  const ref = detail.lessons.find((l) => l.slug === file);

  return (
    <DocViewer
      title={ref?.title ?? file}
      topicTitle={detail.title}
      topicHref={`/topics/${encodeURIComponent(topicSlug)}`}
      rawSrc={`/raw/${encodeURIComponent(topicSlug)}/lessons/${encodeURIComponent(file)}`}
    />
  );
}
