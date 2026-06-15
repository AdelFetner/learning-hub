import "server-only";
import fs from "node:fs";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import { compileMDX } from "next-mdx-remote/rsc";
import { lessonComponents } from "@/components/lesson";

// Lesson/reference frontmatter (all optional except title, which falls back).
export type LessonFrontmatter = {
  title?: string;
  kicker?: string;
  summary?: string;
  minutes?: number;
  primarySource?: { href: string; label: string };
};

export type RenderedDoc =
  | { ok: true; content: React.ReactElement; frontmatter: LessonFrontmatter }
  | { ok: false; error: string };

/**
 * Compile an MDX file from disk at request time and render it with the fixed
 * lesson component palette. Never throws — a malformed lesson resolves to
 * { ok: false } so the page can show a panel instead of a 500.
 *
 * `rehype-raw` is deliberately NOT enabled: raw <script>/<html> in a lesson
 * must not execute. Interactivity comes only from the provided components.
 */
export async function renderDoc(absPath: string): Promise<RenderedDoc> {
  let raw: string;
  try {
    raw = fs.readFileSync(absPath, "utf8");
  } catch {
    return { ok: false, error: "File could not be read." };
  }

  // Parse frontmatter ourselves so listings can read titles cheaply elsewhere.
  const { content: body, data } = matter(raw);

  try {
    const { content } = await compileMDX<LessonFrontmatter>({
      source: body,
      components: lessonComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: { remarkPlugins: [remarkGfm] },
      },
    });
    return { ok: true, content, frontmatter: data as LessonFrontmatter };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown MDX error.";
    return { ok: false, error: message };
  }
}

/** Read just the frontmatter (no compile) — for listings/titles. */
export function readFrontmatter(absPath: string): LessonFrontmatter {
  try {
    return matter(fs.readFileSync(absPath, "utf8")).data as LessonFrontmatter;
  } catch {
    return {};
  }
}
