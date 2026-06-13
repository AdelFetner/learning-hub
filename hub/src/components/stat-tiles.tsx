import { getAnkiSnapshot } from "@/lib/anki";
import { Skeleton } from "@/components/ui/skeleton";

export function StatTile({
  n,
  label,
  glow = false,
}: {
  n: React.ReactNode;
  label: string;
  glow?: boolean;
}) {
  return (
    <div className="bg-card p-4">
      <div className={`nums text-[1.8rem] leading-none ${glow ? "text-primary" : ""}`}>{n}</div>
      <div className="mt-1 text-[0.78rem] italic text-muted-foreground">{label}</div>
    </div>
  );
}

export function AnkiTilesFallback() {
  return (
    <>
      <div className="bg-card p-4">
        <Skeleton className="h-7 w-10 bg-muted" />
        <Skeleton className="mt-2 h-3 w-20 bg-muted" />
      </div>
      <div className="bg-card p-4">
        <Skeleton className="h-7 w-10 bg-muted" />
        <Skeleton className="mt-2 h-3 w-20 bg-muted" />
      </div>
    </>
  );
}

export async function AnkiTiles() {
  const snap = await getAnkiSnapshot();
  if (!snap.reachable) {
    return (
      <>
        <StatTile n="—" label="cards to study" />
        <StatTile n="—" label="cards in Anki" />
      </>
    );
  }
  return (
    <>
      <StatTile n={snap.totalToStudy} label="cards to study" glow />
      <StatTile n={snap.totalCards} label="cards in Anki" />
    </>
  );
}
