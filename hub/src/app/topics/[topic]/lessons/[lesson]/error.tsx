"use client";

import Link from "next/link";

// Backstop: if anything escapes renderDoc's own try/catch, this keeps the
// failure contained to the lesson segment instead of crashing the app.
export default function LessonError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[42rem] px-6 py-16">
      <h1 className="text-[1.4rem]">This lesson couldn&apos;t be displayed.</h1>
      <p className="mt-2 text-muted-foreground">
        Something went wrong rendering this page. Other lessons are unaffected.
      </p>
      <div className="mt-4 flex gap-4 text-[0.9rem]">
        <button type="button" onClick={reset} className="text-primary underline underline-offset-2">
          Try again
        </button>
        <Link href="/" className="text-primary underline underline-offset-2">
          Back to overview
        </Link>
      </div>
    </div>
  );
}
