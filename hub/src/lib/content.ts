import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import matter from "gray-matter";

// The hub is a read-only viewer over the repo's `topics/` directory, which
// sits one level up from `hub/`. Overridable for tests or unusual layouts.
export function topicsRoot(): string {
  return process.env.TOPICS_DIR
    ? path.resolve(process.env.TOPICS_DIR)
    : path.resolve(process.cwd(), "..", "topics");
}

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  deck: string | null;
  lessonCount: number;
  referenceCount: number;
  recordCount: number;
};

export type DocRef = {
  slug: string; // raw filename, used in URLs
  number: string | null;
  title: string;
  mtimeMs: number;
};

export type LearningRecord = {
  slug: string;
  number: string | null;
  title: string;
  html: string;
};

export type TopicDetail = Topic & {
  missionHtml: string;
  lessons: DocRef[];
  references: DocRef[];
  records: LearningRecord[];
};

export type RecentLesson = DocRef & { topicSlug: string; topicTitle: string };

// --- path safety -----------------------------------------------------------

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._ -]*$/;

export function isSafeSegment(seg: string): boolean {
  return (
    typeof seg === "string" &&
    SEGMENT.test(seg) &&
    !seg.includes("..") &&
    !seg.includes("/") &&
    !seg.includes("\\")
  );
}

/** Resolve segments under `root`, returning null if anything escapes it. */
export function resolveWithin(root: string, ...segs: string[]): string | null {
  if (!segs.every(isSafeSegment)) return null;
  const resolved = path.resolve(root, ...segs);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return resolved;
}

// --- helpers ---------------------------------------------------------------

function safeReaddir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function safeRead(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function humanize(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function leadingNumber(filename: string): string | null {
  const m = filename.match(/^(\d+)/);
  return m ? m[1] : null;
}

/** Display title for an MDX doc: frontmatter `title`, then first heading, then filename. */
function mdxTitle(raw: string | null, filename: string): string {
  if (raw) {
    const parsed = matter(raw);
    const fmTitle = (parsed.data as { title?: unknown }).title;
    if (typeof fmTitle === "string" && fmTitle.trim()) return fmTitle.trim();
    const h = parsed.content.match(/^#\s+(.+)$/m);
    if (h) return h[1].trim();
  }
  return humanize(filename);
}

function md(src: string): string {
  return marked.parse(src, { async: false }) as string;
}

function listDocs(dir: string): DocRef[] {
  return safeReaddir(dir)
    .filter((f) => f.toLowerCase().endsWith(".mdx"))
    .map((f) => {
      const full = path.join(dir, f);
      let mtimeMs = 0;
      try {
        mtimeMs = fs.statSync(full).mtimeMs;
      } catch {
        /* ignore */
      }
      return {
        slug: f,
        number: leadingNumber(f),
        title: mdxTitle(safeRead(full), f),
        mtimeMs,
      };
    })
    .sort((a, b) => {
      if (a.number && b.number) return Number(a.number) - Number(b.number);
      return a.slug.localeCompare(b.slug);
    });
}

// --- mission + ANKI parsing ------------------------------------------------

function parseMission(topicDir: string): { title: string; summary: string; html: string } {
  const raw = safeRead(path.join(topicDir, "MISSION.md"));
  if (!raw) {
    return { title: humanize(path.basename(topicDir)), summary: "", html: "" };
  }
  const titleMatch = raw.match(/^#\s+(?:Mission:\s*)?(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : humanize(path.basename(topicDir));

  // Summary: the body of the "## Why" section, else the first paragraph.
  let summary = "";
  const why = raw.match(/##\s+Why\s*\n+([\s\S]*?)(?:\n#{1,2}\s|\n*$)/i);
  if (why) {
    summary = why[1].replace(/\s+/g, " ").trim();
  } else {
    const para = raw
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("#"));
    summary = para ? para.replace(/\s+/g, " ").trim() : "";
  }
  if (summary.length > 260) summary = summary.slice(0, 257).trimEnd() + "…";

  return { title, summary, html: md(raw) };
}

/** The topic's Anki deck name from `ANKI.md` (the line under "## Deck"). */
function parseDeck(topicDir: string): string | null {
  const raw = safeRead(path.join(topicDir, "ANKI.md"));
  if (!raw) return null;
  const m = raw.match(/##\s+Deck\s*\n+\s*`([^`]+)`/i);
  return m ? m[1].trim() : null;
}

function parseRecords(topicDir: string): LearningRecord[] {
  const dir = path.join(topicDir, "learning-records");
  return safeReaddir(dir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .map((f) => {
      const raw = safeRead(path.join(dir, f)) ?? "";
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      return {
        slug: f,
        number: leadingNumber(f),
        title: titleMatch ? titleMatch[1].trim() : humanize(f),
        html: md(raw),
      };
    })
    .sort((a, b) => {
      if (a.number && b.number) return Number(a.number) - Number(b.number);
      return a.slug.localeCompare(b.slug);
    });
}

// --- public API ------------------------------------------------------------

export function listTopics(): Topic[] {
  const root = topicsRoot();
  return safeReaddir(root)
    .filter((name) => {
      try {
        return fs.statSync(path.join(root, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .map((slug) => {
      const dir = path.join(root, slug);
      const mission = parseMission(dir);
      return {
        slug,
        title: mission.title,
        summary: mission.summary,
        deck: parseDeck(dir),
        lessonCount: listDocs(path.join(dir, "lessons")).length,
        referenceCount: listDocs(path.join(dir, "reference")).length,
        recordCount: parseRecords(dir).length,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getTopic(slug: string): TopicDetail | null {
  const root = topicsRoot();
  const dir = resolveWithin(root, slug);
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;

  const mission = parseMission(dir);
  const lessons = listDocs(path.join(dir, "lessons"));
  const references = listDocs(path.join(dir, "reference"));
  const records = parseRecords(dir);

  return {
    slug,
    title: mission.title,
    summary: mission.summary,
    deck: parseDeck(dir),
    missionHtml: mission.html,
    lessons,
    references,
    records,
    lessonCount: lessons.length,
    referenceCount: references.length,
    recordCount: records.length,
  };
}

export function recentLessons(limit = 6): RecentLesson[] {
  const root = topicsRoot();
  const all: RecentLesson[] = [];
  for (const topic of listTopics()) {
    for (const lesson of listDocs(path.join(root, topic.slug, "lessons"))) {
      all.push({ ...lesson, topicSlug: topic.slug, topicTitle: topic.title });
    }
  }
  return all.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, limit);
}

/**
 * Resolve a lesson/reference MDX file. `kind` is the subdirectory ("lessons"
 * or "reference"). Returns the absolute path only if it is a real .mdx file
 * safely inside the topic (path-traversal guarded by resolveWithin).
 */
export function resolveDocFile(
  topic: string,
  kind: "lessons" | "reference",
  file: string
): string | null {
  if (kind !== "lessons" && kind !== "reference") return null;
  if (!file.toLowerCase().endsWith(".mdx")) return null;
  const abs = resolveWithin(topicsRoot(), topic, kind, file);
  if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) return null;
  return abs;
}
