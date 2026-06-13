import { getAnkiSnapshot, deckByName } from "@/lib/anki";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function TopicBadgeFallback() {
  return <Skeleton className="h-5 w-12 bg-muted" />;
}

export async function TopicBadge({ deck }: { deck: string | null }) {
  const snap = await getAnkiSnapshot();
  const stat = deckByName(snap, deck);
  if (!snap.reachable || !stat) return null;
  if (stat.toStudy > 0) {
    return (
      <Badge className="nums bg-primary text-primary-foreground">{stat.toStudy} to study</Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      clear
    </Badge>
  );
}

export function TopicRetentionFallback() {
  return <Skeleton className="my-2 h-[3px] w-full bg-muted" />;
}

export async function TopicRetention({ deck }: { deck: string | null }) {
  const snap = await getAnkiSnapshot();
  const stat = deckByName(snap, deck);
  if (!snap.reachable || !stat || stat.retention === null) return null;
  return (
    <div className="mb-2">
      <Progress value={Math.round(stat.retention * 100)} className="h-[3px] bg-secondary" />
      <p className="mt-1.5 text-[0.76rem] italic text-muted-foreground">
        <span className="nums">{stat.resting}</span> of{" "}
        <span className="nums">{stat.total}</span> cards resting
      </p>
    </div>
  );
}
