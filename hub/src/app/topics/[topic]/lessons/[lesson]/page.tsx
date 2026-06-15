import { DocView } from "@/components/doc-view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LessonViewer({
  params,
}: {
  params: Promise<{ topic: string; lesson: string }>;
}) {
  const { topic, lesson } = await params;
  return (
    <DocView topicSlug={decodeURIComponent(topic)} kind="lessons" file={decodeURIComponent(lesson)} />
  );
}
