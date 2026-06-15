import { notFound } from "next/navigation";
import { getTopic, resolveDocFile } from "@/lib/content";
import { renderDoc } from "@/lib/mdx";
import { LessonShell } from "@/components/lesson-shell";

function ErrorPanel({ error }: { error: string }) {
  return (
    <div className="rounded border border-destructive/40 bg-destructive/5 px-4 py-3">
      <p className="font-medium text-destructive">This lesson failed to render.</p>
      <p className="mt-1 text-[0.9rem] text-muted-foreground">{error}</p>
      <p className="mt-2 text-[0.85rem] text-muted-foreground">
        Check the MDX in the source file; every other page is unaffected.
      </p>
    </div>
  );
}

// Renders a lesson or reference MDX natively inside the hub chrome. Shared by
// both viewer pages. A render failure shows a panel, never a 500.
export async function DocView({
  topicSlug,
  kind,
  file,
}: {
  topicSlug: string;
  kind: "lessons" | "reference";
  file: string;
}) {
  const abs = resolveDocFile(topicSlug, kind, file);
  if (!abs) notFound();

  const detail = getTopic(topicSlug);
  if (!detail) notFound();

  const list = kind === "lessons" ? detail.lessons : detail.references;
  const ref = list.find((d) => d.slug === file);

  const rendered = await renderDoc(abs);
  const title = (rendered.ok && rendered.frontmatter.title) || ref?.title || file;

  return (
    <LessonShell
      topicTitle={detail.title}
      topicHref={`/topics/${encodeURIComponent(topicSlug)}`}
      title={title}
    >
      {rendered.ok ? rendered.content : <ErrorPanel error={rendered.error} />}
    </LessonShell>
  );
}
