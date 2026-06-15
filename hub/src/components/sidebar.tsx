import { Suspense } from "react";
import Link from "next/link";
import { listTopics } from "@/lib/content";
import { NavLink } from "@/components/nav-link";
import { AnkiPill, AnkiPillFallback } from "@/components/anki-pill";

export function Sidebar() {
  const topics = listTopics();
  return (
    <aside className="w-full shrink-0 border-b border-border px-4 py-6 md:w-[235px] md:border-r md:border-b-0">
      <Link href="/" className="block px-2.5 text-[1.15rem]">
        Moni<span className="italic text-primary">memo</span>
      </Link>

      <nav className="mt-7 flex flex-col">
        <NavLink href="/" exact>
          Overview
        </NavLink>
        <div className="mt-3 mb-1 px-2.5 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          Topics
        </div>
        {topics.length === 0 ? (
          <p className="px-2.5 text-[0.85rem] italic text-muted-foreground">No topics yet.</p>
        ) : (
          topics.map((t) => (
            <NavLink key={t.slug} href={`/topics/${encodeURIComponent(t.slug)}`}>
              {t.title}
            </NavLink>
          ))
        )}
      </nav>

      <Suspense fallback={<AnkiPillFallback />}>
        <AnkiPill />
      </Suspense>
    </aside>
  );
}
