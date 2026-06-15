import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = "http://127.0.0.1:3000";
const OUT = path.join(os.tmpdir(), "monimemo-ux");
fs.mkdirSync(OUT, { recursive: true });

const LESSON = `${BASE}/topics/http-status-codes/lessons/0001-status-classes-triage.mdx`;
const TOPIC = `${BASE}/topics/http-status-codes`;
const REF = `${BASE}/topics/http-status-codes/references/http-status-triage.mdx`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const issues = [];
page.on("console", (m) => {
  if (m.type() === "error") issues.push(`console.error: ${m.text()}`);
});
page.on("pageerror", (e) => issues.push(`pageerror: ${e.message}`));
page.on("requestfailed", (r) =>
  issues.push(`requestfailed: ${r.url()} — ${r.failure()?.errorText ?? ""}`)
);

const log = [];
const shot = (n) => page.screenshot({ path: path.join(OUT, n), fullPage: true });
async function go(url) {
  const r = await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return r?.status();
}

// 1. Overview
log.push(`overview: HTTP ${await go(BASE + "/")}`);
await shot("01-overview.png");

// 2. Topic page + logo navigation
log.push(`topic: HTTP ${await go(TOPIC)}`);
await shot("02-topic.png");
try {
  await page.locator('aside a[href="/"]').first().click();
  await page.waitForLoadState("networkidle");
  log.push(`logo click → ${page.url() === BASE + "/" ? "OK navigates to /" : "WRONG: " + page.url()}`);
} catch (e) {
  log.push(`logo click FAILED: ${e.message}`);
}

// 3. Lesson: native render (no iframe), quiz interaction, breadcrumb
log.push(`lesson: HTTP ${await go(LESSON)}`);
log.push(`lesson iframe count (want 0): ${await page.locator("iframe").count()}`);
await shot("03-lesson.png");
try {
  const btn = page.getByRole("button", { name: "server" }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(300);
    const explainVisible = (await page.getByText(/5xx = server class/).count()) > 0;
    log.push(`quiz: clicked an option, explanation shown: ${explainVisible}`);
    await shot("04-lesson-after-answer.png");
  } else {
    log.push("quiz: no 'server' option button found");
  }
} catch (e) {
  log.push(`quiz interaction FAILED: ${e.message}`);
}
try {
  await page.locator('header a[href^="/topics/"]').first().click();
  await page.waitForLoadState("networkidle");
  log.push(`lesson breadcrumb → ${page.url().endsWith("http-status-codes") ? "OK back to topic" : "URL: " + page.url()}`);
} catch (e) {
  log.push(`breadcrumb FAILED: ${e.message}`);
}

// 4. Reference
log.push(`reference: HTTP ${await go(REF)}`);
await shot("05-reference.png");

await browser.close();

console.log("=== UX AUDIT ===");
console.log(log.join("\n"));
console.log("\n=== CONSOLE / PAGE ISSUES (" + issues.length + ") ===");
console.log(issues.length ? [...new Set(issues)].join("\n") : "none");
console.log("\nscreenshots in: " + OUT);
