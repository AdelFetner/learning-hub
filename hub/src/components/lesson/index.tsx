import type { ReactNode } from "react";
import { Quiz, Q } from "./quiz";

// The FIXED component palette handed to compileMDX. Lessons may use only these
// names (plus markdown) — no <style>, <script>, or import. Element overrides
// carry the editorial theme so styling lives here, not in the lesson.

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 text-[0.75rem] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

function Lede({ children }: { children: ReactNode }) {
  return <p className="mb-6 text-[1.05rem] italic text-muted-foreground">{children}</p>;
}

function Callout({ tone = "note", children }: { tone?: "note" | "warn"; children: ReactNode }) {
  const accent = tone === "warn" ? "border-l-destructive" : "border-l-primary";
  return (
    <aside className={`my-5 border-l-2 ${accent} bg-secondary/40 px-4 py-2 text-[0.95rem]`}>
      {children}
    </aside>
  );
}

function Primary({
  href,
  source,
  children,
}: {
  href: string;
  source: string;
  children?: ReactNode;
}) {
  return (
    <aside className="my-6 rounded border border-border bg-card px-4 py-3 text-[0.92rem]">
      <span className="text-muted-foreground">Primary source: </span>
      <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
        {source}
      </a>
      {children ? <div className="mt-1 text-muted-foreground">{children}</div> : null}
    </aside>
  );
}

// <Cards> wraps <Card front="..." back="..." /> children — string attributes
// only (MDX mangles object/array expression attributes).
function Cards({ children }: { children: ReactNode }) {
  return (
    <div className="my-6">
      <p className="mb-2 text-[0.85rem] text-muted-foreground">
        These cards are in your Anki deck — review them in the Anki app when they come due.
      </p>
      <table className="w-full border-collapse text-[0.9rem]">
        <thead>
          <tr>
            <th className="border-b border-border py-1.5 pr-4 text-left font-normal italic text-muted-foreground">
              Front
            </th>
            <th className="border-b border-border py-1.5 text-left font-normal italic text-muted-foreground">
              Back
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Card({ front, back }: { front: string; back: string }) {
  return (
    <tr>
      <td className="border-b border-[#efece3] py-1.5 pr-4 align-top">{front}</td>
      <td className="border-b border-[#efece3] py-1.5 align-top">{back}</td>
    </tr>
  );
}

// Markdown element overrides — themed, and scoped to the rendered article so
// they don't rely on global descendant selectors (the quiz island sits inline).
const elements = {
  h1: (p: { children?: ReactNode }) => <h1 className="mt-0 mb-3 text-[1.6rem] leading-tight">{p.children}</h1>,
  h2: (p: { children?: ReactNode }) => (
    <h2 className="mt-8 mb-2 border-b border-border pb-1 text-[1.2rem] font-normal">{p.children}</h2>
  ),
  h3: (p: { children?: ReactNode }) => <h3 className="mt-6 mb-2 text-[1.05rem] font-normal">{p.children}</h3>,
  p: (p: { children?: ReactNode }) => <p className="my-3 leading-[1.7]">{p.children}</p>,
  ul: (p: { children?: ReactNode }) => <ul className="my-3 list-disc pl-6">{p.children}</ul>,
  ol: (p: { children?: ReactNode }) => <ol className="my-3 list-decimal pl-6">{p.children}</ol>,
  li: (p: { children?: ReactNode }) => <li className="my-1">{p.children}</li>,
  a: (p: { href?: string; children?: ReactNode }) => (
    <a href={p.href} className="text-primary underline underline-offset-2">
      {p.children}
    </a>
  ),
  code: (p: { children?: ReactNode }) => (
    <code className="nums rounded bg-secondary px-1.5 py-0.5 text-[0.85em]">{p.children}</code>
  ),
  pre: (p: { children?: ReactNode }) => (
    <pre className="my-4 overflow-x-auto rounded border border-border bg-secondary/50 p-3 text-[0.85em]">
      {p.children}
    </pre>
  ),
  table: (p: { children?: ReactNode }) => (
    <table className="my-4 w-full border-collapse text-[0.9rem]">{p.children}</table>
  ),
  th: (p: { children?: ReactNode }) => (
    <th className="border-b border-border py-1.5 pr-4 text-left font-normal italic text-muted-foreground">
      {p.children}
    </th>
  ),
  td: (p: { children?: ReactNode }) => (
    <td className="border-b border-[#efece3] py-1.5 pr-4 align-top">{p.children}</td>
  ),
  blockquote: (p: { children?: ReactNode }) => (
    <blockquote className="my-4 border-l-2 border-border pl-4 italic text-muted-foreground">
      {p.children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
};

export const lessonComponents = {
  Kicker,
  Lede,
  Callout,
  Primary,
  Cards,
  Card,
  Quiz,
  Q,
  ...elements,
};
