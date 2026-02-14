// src/components/practice/PracticeReviewList.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import type { Exercise } from "@/lib/practice/types";
import type { VectorPadState } from "@/components/vectorpad/types";
import { defaultVectorPadState } from "@/components/vectorpad/defaultState";

import ExerciseRenderer from "./ExerciseRenderer";
import type { QItem } from "./practiceType";

import SingleChoiceExerciseUI from "./kinds/SingleChoiceExerciseUI";
import MultiChoiceExerciseUI from "./kinds/MultiChoiceExerciseUI";
import CodeInputExerciseUI from "./kinds/CodeInputExerciseUI";

import { buildCorrectItemFromExpected } from "@/features/practice/client/usePracticeEngine";
import type { Lang } from "@/lib/code/runCode";

function normalizeMath(md: string) {
  const s = String(md ?? "");
  const ttWrapped = s.replace(
    /\\\(\s*\\texttt\{([\s\S]*?)\}\s*\\\)/g,
    (_m, inner) => `\`${String(inner).trim()}\``,
  );
  const tt = ttWrapped.replace(
    /\\texttt\{([\s\S]*?)\}/g,
    (_m, inner) => `\`${String(inner).trim()}\``,
  );
  const inline = tt.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${String(inner).trim()}$`);
  const display = inline.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `$$\n${String(inner).trim()}\n$$`);
  return display;
}

function statusFor(q: QItem) {
  if (q.revealed) return { label: "Revealed", tone: "sky" as const };
  if (q.result?.ok === true) return { label: "✓ Correct", tone: "emerald" as const };
  if (q.result) return { label: "✕ Not correct", tone: "rose" as const };
  return { label: "Not checked", tone: "neutral" as const };
}

function cardClass(tone: "neutral" | "emerald" | "rose" | "sky") {
  if (tone === "emerald") return "border-emerald-300/20 bg-emerald-300/10";
  if (tone === "rose") return "border-rose-300/20 bg-rose-300/10";
  if (tone === "sky") return "border-sky-300/20 bg-sky-300/10";
  return "border-white/10 bg-white/[0.03]";
}

function extractExpected(result: any) {
  return result?.expected ?? result?.revealAnswer ?? result?.reveal ?? result?.solution ?? null;
}

function ReadOnlyPracticeCard({
  q,
  index,
  maxAttempts,
  isLockedRun,
}: {
  q: QItem;
  index: number;
  maxAttempts: number;
  isLockedRun: boolean;
}) {
  const exercise = q.exercise as Exercise | undefined;

  const padRef = useRef<{ current: VectorPadState }>({
    current: defaultVectorPadState(),
  });

  // keep vector displays stable (uneditable in review)
  useEffect(() => {
    const pr = padRef.current.current;
    if (!pr) return;
    pr.mode = "2d";
    if ((q as any).dragA) pr.a = { ...(q as any).dragA } as any;
    if ((q as any).dragB) pr.b = { ...(q as any).dragB } as any;
  }, [q]);

  const st = statusFor(q);
  const explanation = (q.result as any)?.explanation ?? null;
  const expected = extractExpected(q.result);

  const checked = Boolean(q.submitted) || Boolean(q.result) || Boolean(q.revealed);
  const ok = q.result?.ok ?? null;

  // only used when incorrect AND expected is available (unlocked runs)
  const correctItem = useMemo(() => {
    if (ok !== false) return null;
    if (!expected) return null;
    return buildCorrectItemFromExpected(q, expected);
  }, [q, expected, ok]);

  // For in-place highlight (single/multi/code)
  const reviewSingleCorrectId = useMemo(() => {
    const id = (correctItem as any)?.single;
    return typeof id === "string" && id.length ? id : null;
  }, [correctItem]);

  const reviewMultiCorrectIds = useMemo(() => {
    const ids = (correctItem as any)?.multi;
    return Array.isArray(ids) && ids.length ? ids.map((x: any) => String(x)) : null;
  }, [correctItem]);

  const reviewCodeCorrect = useMemo(() => {
    const ci: any = correctItem as any;
    if (!ci) return null;

    const code = typeof ci.code === "string" ? ci.code : null;
    if (!code) return null;

    const language = (ci.codeLang ?? q.codeLang) as Lang;
    const stdin = typeof ci.codeStdin === "string" ? ci.codeStdin : (q.codeStdin ?? "");

    return { language, code, stdin };
  }, [correctItem, q.codeLang, q.codeStdin]);

  // Make ExerciseRenderer show “checked” styling even if current.submitted is false in history
  const currentForReview = useMemo<QItem>(() => {
    return {
      ...q,
      submitted: checked ? true : Boolean(q.submitted),
    };
  }, [q, checked]);

  if (!exercise) return null;

  const showHiddenNote = ok === false && !expected;

  return (
    // <div className={`rounded-2xl border p-3 ${cardClass(st.tone)}`}>
        <div className={`rounded-2xl border border-white/10 p-3 `}>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-black text-white/55">
            Question {index + 1}
            {typeof (exercise as any).topic !== "undefined" ? (
              <> • {String((exercise as any).topic).toUpperCase()}</>
            ) : null}
            <> • {String(exercise.kind).replaceAll("_", " ")}</>
          </div>

          {exercise.title ? (
            <div className="mt-1 text-xs font-black text-white/70">{String(exercise.title)}</div>
          ) : null}
        </div>

        <div className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-extrabold text-white/75">
          {st.label}
        </div>
      </div>

      {exercise.prompt ? (
        <MathMarkdown
          className="
            mt-2 text-sm text-white/80
            [&_.katex]:text-white/90
            [&_.katex-display]:overflow-x-auto
            [&_.katex-display]:py-2
          "
          content={normalizeMath(String(exercise.prompt))}
        />
      ) : null}

      <div className="mt-3">
        {/* ✅ In-place highlight for single/multi/code (no second ExerciseRenderer needed) */}
        {exercise.kind === "single_choice" ? (
          <SingleChoiceExerciseUI
            exercise={exercise}
            value={q.single}
            onChange={() => {}}
            disabled={true}
            checked={checked}
            ok={ok}
            reviewCorrectId={reviewSingleCorrectId}
          />
        ) : exercise.kind === "multi_choice" ? (
          <MultiChoiceExerciseUI
            exercise={exercise}
            value={Array.isArray(q.multi) ? q.multi : []}
            onChange={() => {}}
            disabled={true}
            checked={checked}
            ok={ok}
            reviewCorrectIds={reviewMultiCorrectIds}
          />
        ) : exercise.kind === "code_input" ? (
          <CodeInputExerciseUI
            exercise={exercise as any}
            code={q.code ?? ""}
            stdin={q.codeStdin ?? ""}
            language={(q.codeLang ?? "python") as Lang}
            onChangeCode={() => {}}
            onChangeStdin={() => {}}
            onChangeLanguage={() => {}}
            disabled={true}
            checked={checked}
            ok={ok}
            readOnly={true}
            reviewCorrect={reviewCodeCorrect}
          />
        ) : (
          // fallback: use your normal renderer (numeric/matrix/vector/etc.)
          <ExerciseRenderer
            exercise={exercise}
            current={currentForReview}
            busy={false}
            isAssignmentRun={false}
            maxAttempts={maxAttempts}
            padRef={padRef.current as any}
            updateCurrent={() => {}}
            readOnly
          />
        )}

        {showHiddenNote ? (
          <div className="mt-3 text-[11px] font-extrabold text-white/55">
            Correct answer is hidden for this run.
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-white/60">
          <div>
            Attempts:{" "}
            <span className="text-white/80">
              {q.attempts ?? 0}/{isLockedRun ? maxAttempts : "∞"}
            </span>
          </div>

          <div>
            {ok === true ? (
              <span className="text-emerald-200/90">✓ Correct</span>
            ) : q.result ? (
              <span className="text-rose-200/90">✕ Not correct</span>
            ) : (
              <span className="text-white/50">Not checked yet</span>
            )}
          </div>
        </div>

        {/* Optional: still keep details for explanation/expected JSON */}
        {expected || explanation ? (
          <details className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <summary className="cursor-pointer text-xs font-extrabold text-white/70">
              Show expected / explanation
            </summary>

            {expected ? (
              <div className="mt-2">
                <div className="text-[11px] font-black text-white/60">Expected</div>
                <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] text-white/75">
                  {typeof expected === "string" ? expected : JSON.stringify(expected, null, 2)}
                </pre>
              </div>
            ) : null}

            {explanation ? (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="text-[11px] font-black text-white/60">Explanation</div>
                <MathMarkdown
                  className="mt-1 text-xs text-white/75 [&_.katex]:text-white/90"
                  content={normalizeMath(String(explanation))}
                />
              </div>
            ) : null}
          </details>
        ) : null}
      </div>
    </div>
  );
}

export default function PracticeReviewList({
  stack,
  showOnlyIncorrect,
  maxAttempts,
  isLockedRun,
}: {
  stack: QItem[];
  showOnlyIncorrect: boolean;
  maxAttempts: number;
  isLockedRun: boolean;
}) {
  const list = useMemo(() => {
    const base = Array.isArray(stack) ? stack : [];
    return showOnlyIncorrect ? base.filter((q) => q.result?.ok === false) : base;
  }, [stack, showOnlyIncorrect]);

  if (!list.length) {
    return (
      <div className="p-4 text-xs font-extrabold text-white/60">
        {showOnlyIncorrect ? "No incorrect questions." : "No questions yet."}
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4">
      {list.map((q, i) => (
        <ReadOnlyPracticeCard
          key={(q as any).key ?? (q as any).instanceId ?? i}
          q={q}
          index={i}
          maxAttempts={maxAttempts}
          isLockedRun={isLockedRun}
        />
      ))}
    </div>
  );
}
