import "server-only";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Read-only view of Anki state via the AnkiMCP add-on. The hub NEVER writes:
// it calls only `list_decks`. Reviews and scheduling stay in the Anki app.

const ANKI_URL = process.env.ANKI_MCP_URL ?? "http://127.0.0.1:3141/";
const CONNECT_TIMEOUT_MS = 1500;
const CACHE_TTL_MS = 4000;

export type DeckStat = {
  name: string;
  total: number;
  newCount: number;
  learn: number;
  review: number;
  /** Cards available to study right now: new + learning + review. */
  toStudy: number;
  /** Cards in a learned, resting state (not new, not waiting today). */
  resting: number;
  /** resting / total — "retention health", or null for an empty deck. */
  retention: number | null;
};

export type AnkiSnapshot =
  | { reachable: true; decks: DeckStat[]; totalToStudy: number; totalCards: number }
  | { reachable: false };

let cache: { at: number; value: AnkiSnapshot } | null = null;
let inflight: Promise<AnkiSnapshot> | null = null;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("anki-timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function toDeckStat(deck: Record<string, unknown>): DeckStat {
  const stats = (deck.stats as Record<string, unknown> | undefined) ?? {};
  const newCount = num(stats.new_count);
  const learn = num(stats.learn_count);
  const review = num(stats.review_count);
  const total = num(stats.total_in_deck);
  const toStudy = newCount + learn + review;
  const resting = Math.max(0, total - toStudy);
  return {
    name: typeof deck.name === "string" ? deck.name : "",
    total,
    newCount,
    learn,
    review,
    toStudy,
    resting,
    retention: total > 0 ? resting / total : null,
  };
}

async function query(): Promise<AnkiSnapshot> {
  const transport = new StreamableHTTPClientTransport(new URL(ANKI_URL));
  const client = new Client({ name: "monimemo", version: "1.0.0" });
  try {
    await withTimeout(client.connect(transport), CONNECT_TIMEOUT_MS);
    const res = (await withTimeout(
      client.callTool({ name: "list_decks", arguments: { include_stats: true } }),
      CONNECT_TIMEOUT_MS
    )) as { content?: Array<{ type?: string; text?: string }> };

    const textPart = res.content?.find((c) => c.type === "text")?.text;
    if (!textPart) return { reachable: false };

    const parsed = JSON.parse(textPart) as { decks?: Array<Record<string, unknown>> };
    const decks = (parsed.decks ?? [])
      .map(toDeckStat)
      // Hide Anki's built-in catch-all "Default" deck from the hub.
      .filter((d) => d.name && d.name !== "Default");

    return {
      reachable: true,
      decks,
      totalToStudy: decks.reduce((s, d) => s + d.toStudy, 0),
      totalCards: decks.reduce((s, d) => s + d.total, 0),
    };
  } catch {
    return { reachable: false };
  } finally {
    try {
      await client.close();
    } catch {
      /* ignore */
    }
  }
}

/** Cached snapshot of Anki state. Never throws; failure => { reachable: false }. */
export async function getAnkiSnapshot(): Promise<AnkiSnapshot> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.value;
  if (inflight !== null) return inflight;
  inflight = query()
    .then((value) => {
      cache = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Find a deck's stats by exact name (the topic's `ANKI.md` deck), if present. */
export function deckByName(snapshot: AnkiSnapshot, name: string | null): DeckStat | null {
  if (!name || !snapshot.reachable) return null;
  return snapshot.decks.find((d) => d.name === name) ?? null;
}
