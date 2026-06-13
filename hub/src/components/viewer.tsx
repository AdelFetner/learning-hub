import Link from "next/link";

// Full-bleed viewer for a self-contained lesson/reference document. The HTML
// is served verbatim by the /raw route and embedded in an iframe so its own
// styles and quiz scripts run untouched (see docs/adr/0001). The lesson
// scrolls inside its own document; only this slim bar is hub chrome.
export function DocViewer({
  title,
  topicTitle,
  topicHref,
  rawSrc,
}: {
  title: string;
  topicTitle: string;
  topicHref: string;
  rawSrc: string;
}) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2.5 text-[0.9rem]">
        <Link href={topicHref} className="italic text-muted-foreground hover:text-primary">
          ← {topicTitle}
        </Link>
        <span className="text-border">/</span>
        <span className="truncate">{title}</span>
        <a
          href={rawSrc}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[0.8rem] italic text-muted-foreground hover:text-primary"
        >
          open standalone ↗
        </a>
      </header>
      <iframe
        src={rawSrc}
        title={title}
        className="w-full flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
