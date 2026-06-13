import { notFound } from "next/navigation";
import { getTopic, resolveDocFile } from "@/lib/content";
import { DocViewer } from "@/components/viewer";

export const dynamic = "force-dynamic";

export default async function ReferenceViewer({
  params,
}: {
  params: Promise<{ topic: string; ref: string }>;
}) {
  const { topic, ref } = await params;
  const topicSlug = decodeURIComponent(topic);
  const file = decodeURIComponent(ref);

  if (!resolveDocFile(topicSlug, "reference", file)) notFound();
  const detail = getTopic(topicSlug);
  if (!detail) notFound();

  const doc = detail.references.find((r) => r.slug === file);

  return (
    <DocViewer
      title={doc?.title ?? file}
      topicTitle={detail.title}
      topicHref={`/topics/${encodeURIComponent(topicSlug)}`}
      rawSrc={`/raw/${encodeURIComponent(topicSlug)}/reference/${encodeURIComponent(file)}`}
    />
  );
}
