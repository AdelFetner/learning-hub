"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Interactive retrieval-practice quiz, provided by the hub (lessons author no
// JS). Authored with string attributes only — MDX mangles object/array
// expression attributes, so options are a pipe-delimited string.
//
//   <Quiz>
//     <Q prompt="..." options="a|b|c" answer="1" explain="..." />
//   </Quiz>
//
// Each <Q> registers with the surrounding <Quiz> on mount and reports its
// result on answer, so the score summary doesn't depend on inspecting child
// element types (fragile across the MDX/RSC boundary).

type QuizCtx = { register: () => () => void; report: (correct: boolean) => void };
const Ctx = createContext<QuizCtx | null>(null);

export function Quiz({ children }: { children: ReactNode }) {
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);

  const register = useCallback(() => {
    setTotal((n) => n + 1);
    return () => setTotal((n) => n - 1);
  }, []);
  const report = useCallback((isCorrect: boolean) => {
    setAnswered((n) => n + 1);
    if (isCorrect) setCorrect((n) => n + 1);
  }, []);
  const ctxValue = useMemo(() => ({ register, report }), [register, report]);

  const done = total > 0 && answered === total;

  return (
    <Ctx.Provider value={ctxValue}>
      <div className="my-6 space-y-4">{children}</div>
      {done && (
        <div className="mt-4 rounded border border-border bg-secondary/60 px-4 py-3 text-[0.95rem]">
          <strong className="nums">
            {correct} / {total}
          </strong>{" "}
          from memory.{" "}
          {correct === total
            ? "Solid — that's the lesson sticking."
            : "Tell your teacher which ones felt shaky; it can re-explain from another angle."}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function Q({
  prompt,
  options,
  answer,
  explain,
}: {
  prompt: string;
  options: string;
  answer: string | number;
  explain: string;
}) {
  const opts = options.split("|").map((s) => s.trim());
  const correctIdx = Number(answer);
  const ctx = useContext(Ctx);
  const [picked, setPicked] = useState<number | null>(null);
  const locked = picked !== null;

  useEffect(() => ctx?.register(), [ctx]);

  const choose = (i: number) => {
    if (locked) return;
    setPicked(i);
    ctx?.report(i === correctIdx);
  };

  return (
    <div className="rounded border border-border bg-card px-4 py-3">
      <div className="mb-2 text-[0.97rem]">{prompt}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map((opt, i) => {
          const isAnswer = i === correctIdx;
          const isPicked = i === picked;
          let cls = "border-border bg-background hover:border-primary";
          if (locked && isAnswer) cls = "border-[#3f6b4f] bg-[#3f6b4f]/10 text-[#3f6b4f]";
          else if (locked && isPicked) cls = "border-destructive bg-destructive/10 text-destructive";
          else if (locked) cls = "border-border opacity-60";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(i)}
              disabled={locked}
              className={`nums rounded border px-3 py-1.5 text-[0.9rem] transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {locked && <p className="mt-2 text-[0.85rem] text-muted-foreground">{explain}</p>}
    </div>
  );
}
