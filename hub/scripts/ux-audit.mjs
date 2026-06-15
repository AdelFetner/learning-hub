import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Thorough UX/bug audit of the running hub: multiple viewports, every page
// type and state, full quiz interaction, accessibility (axe), console errors.
// Screenshots land in a temp dir (printed at the end) for visual review.

const BASE = process.env.HUB_BASE ?? "http://127.0.0.1:3000";
const TOPIC = process.env.AUDIT_TOPIC ?? "http-status-codes"; // topic with a lesson
const EMPTY_TOPIC = process.env.AUDIT_EMPTY_TOPIC ?? "protein-beef-burritos"; // 0 lessons
const LESSON = `${BASE}/topics/${TOPIC}/lessons/0001-status-classes-triage.mdx`;
const REF = `${BASE}/topics/${TOPIC}/references/http-status-triage.mdx`;
const OUT = path.join(os.tmpdir(), "monimemo-ux");
fs.mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const report = [];
const a11y = [];
const consoleIssues = [];

const browser = await chromium.launch();

// --- Pass 1: responsive screenshots of the main pages at each viewport ---
for (const vp of viewports) {
  const vpage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  vpage.on("console", (m) => {
    if (m.type() === "error" && !/hmr|websocket/i.test(m.text()))
      consoleIssues.push(`[${vp.name}] console.error: ${m.text()}`);
  });
  vpage.on("pageerror", (e) => consoleIssues.push(`[${vp.name}] pageerror: ${e.message}`));
  for (const [label, url] of [
    ["overview", BASE + "/"],
    ["topic", `${BASE}/topics/${TOPIC}`],
    ["lesson", LESSON],
  ]) {
    const r = await vpage.goto(url, { waitUntil: "networkidle" });
    await vpage.waitForTimeout(300);
    await vpage.screenshot({ path: path.join(OUT, `${vp.name}-${label}.png`), fullPage: true });
    if (r?.status() !== 200) report.push(`${vp.name} ${label}: HTTP ${r?.status()}`);
  }
  await vpage.close();
}

// --- Pass 2: states & edge cases (desktop) ---
// axe-core/playwright requires a page from an explicit context.
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error" && !/hmr|websocket/i.test(m.text()))
    consoleIssues.push(`console.error: ${m.text()}`);
});
page.on("pageerror", (e) => consoleIssues.push(`pageerror: ${e.message}`));

let r = await page.goto(`${BASE}/topics/${EMPTY_TOPIC}`, { waitUntil: "networkidle" });
report.push(`empty topic (${EMPTY_TOPIC}): HTTP ${r?.status()}`);
await page.screenshot({ path: path.join(OUT, "state-empty-topic.png"), fullPage: true });

r = await page.goto(`${BASE}/topics/does-not-exist`, { waitUntil: "domcontentloaded" });
report.push(`missing topic: HTTP ${r?.status()} (expect 404)`);
await page.screenshot({ path: path.join(OUT, "state-404.png"), fullPage: true });

// --- Pass 3: full quiz interaction on the lesson ---
await page.goto(LESSON, { waitUntil: "networkidle" });
const correctByQ = [0, 1, 2, 0, 1];
const qBlocks = page.locator("div.rounded.border").filter({ has: page.locator("button") });
const qCount = await qBlocks.count();
report.push(`quiz: ${qCount} question blocks found`);
let answered = 0;
for (let i = 0; i < qCount; i++) {
  const buttons = qBlocks.nth(i).locator("button");
  if ((await buttons.count()) === 0) continue;
  await buttons.nth(correctByQ[i] ?? 0).click();
  answered++;
}
await page.waitForTimeout(400);
const summary = await page.getByText(/from memory/).count();
report.push(`quiz: answered ${answered}, score summary shown: ${summary > 0}`);
await page.screenshot({ path: path.join(OUT, "quiz-completed.png"), fullPage: true });

// --- Pass 4: accessibility (axe) ---
for (const [label, url] of [
  ["overview", BASE + "/"],
  ["topic", `${BASE}/topics/${TOPIC}`],
  ["lesson", LESSON],
  ["reference", REF],
]) {
  await page.goto(url, { waitUntil: "networkidle" });
  try {
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const v = res.violations.map((x) => `${x.id} (${x.impact}, ${x.nodes.length}×): ${x.help}`);
    a11y.push(`--- ${label} ---\n${v.length ? v.join("\n") : "no violations"}`);
  } catch (e) {
    a11y.push(`--- ${label} --- axe failed: ${e.message}`);
  }
}

await browser.close();

console.log("=== PAGES / INTERACTIONS ===");
console.log(report.join("\n"));
console.log("\n=== CONSOLE / PAGE ERRORS (" + consoleIssues.length + ") ===");
console.log(consoleIssues.length ? [...new Set(consoleIssues)].join("\n") : "none");
console.log("\n=== ACCESSIBILITY (axe wcag2a/aa) ===");
console.log(a11y.join("\n"));
console.log("\nscreenshots: " + OUT);
