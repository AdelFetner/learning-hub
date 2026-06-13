import { getAnkiSnapshot } from "@/lib/anki";
import { Skeleton } from "@/components/ui/skeleton";

export function AnkiPillFallback() {
  return (
    <div className="mt-8 rounded border border-border bg-card p-3">
      <Skeleton className="h-3 w-24 bg-muted" />
      <Skeleton className="mt-2 h-3 w-16 bg-muted" />
    </div>
  );
}

export async function AnkiPill() {
  const snap = await getAnkiSnapshot();

  if (!snap.reachable) {
    return (
      <div className="mt-8 rounded border border-border bg-card p-3 text-[0.85rem] text-muted-foreground">
        <span className="mr-1.5 inline-block size-2 rounded-full bg-muted-foreground/50 align-middle" />
        Anki closed
        <p className="mt-1 text-[0.78rem] italic">Open Anki to see review stats.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded border border-border bg-card p-3 text-[0.85rem] text-muted-foreground">
      <span className="mr-1.5 inline-block size-2 rounded-full bg-[#3f6b4f] align-middle" />
      Anki connected
      <p className="mt-1 text-foreground">
        <span className="nums">{snap.totalToStudy}</span>{" "}
        {snap.totalToStudy === 1 ? "card" : "cards"} to study
      </p>
    </div>
  );
}
