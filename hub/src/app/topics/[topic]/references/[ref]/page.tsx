import { DocView } from "@/components/doc-view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReferenceViewer({
  params,
}: {
  params: Promise<{ topic: string; ref: string }>;
}) {
  const { topic, ref } = await params;
  return (
    <DocView topicSlug={decodeURIComponent(topic)} kind="reference" file={decodeURIComponent(ref)} />
  );
}
