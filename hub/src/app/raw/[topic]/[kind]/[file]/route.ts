import fs from "node:fs";
import { resolveDocFile } from "@/lib/content";

// Streams a lesson/reference HTML file byte-identical from disk, so its own
// styles and quiz scripts run exactly as authored. The viewer page embeds
// this route in an iframe. Read-only; path-safety lives in resolveDocFile.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ topic: string; kind: string; file: string }> }
) {
  const { topic, kind, file } = await ctx.params;

  if (kind !== "lessons" && kind !== "reference") {
    return new Response("Not found", { status: 404 });
  }

  const abs = resolveDocFile(topic, kind, file);
  if (!abs) return new Response("Not found", { status: 404 });

  const html = fs.readFileSync(abs);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      // Defence in depth: this content is local and same-origin only.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
