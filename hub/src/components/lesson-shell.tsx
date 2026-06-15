import Link from "next/link";

// Slim breadcrumb above a natively-rendered lesson/reference, inside the hub.
export function LessonShell({
  topicTitle,
  topicHref,
  title,
  children,
}: {
  topicTitle: string;
  topicHref: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-6 py-2.5 text-[0.9rem]">
        <Link href={topicHref} className="italic text-muted-foreground hover:text-primary">
          ← {topicTitle}
        </Link>
        <span className="text-border">/</span>
        <span className="truncate">{title}</span>
      </header>
      <article className="lesson-prose mx-auto w-full max-w-[42rem] px-6 py-10">{children}</article>
    </div>
  );
}
