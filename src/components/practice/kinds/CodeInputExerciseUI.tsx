// src/components/practice/kinds/CodeInputExerciseUI.tsx
"use client";

import React from "react";
import type { Exercise } from "@/lib/practice/types";
import { type Lang, type RunResult } from "@/lib/code/runCode";
import CodeRunner from "@/components/code/CodeRunner";

type CodeInputExercise = Extract<Exercise, { kind: "code_input" }>;

export default function CodeInputExerciseUI({
  exercise,
  code,
  stdin,
  language,
  onChangeCode,
  onChangeStdin,
  onChangeLanguage,
  disabled,
  onRun,

  // ✅ review features
  checked = false,
  ok = null,
  reviewCorrect = null,

  // ✅ NEW: true in PracticeReviewList / ExerciseRenderer(readOnly)
  readOnly = false,
}: {
  exercise: CodeInputExercise;
  code: string;
  stdin: string;
  language: Lang;
  onChangeCode: (code: string) => void;
  onChangeStdin: (stdin: string) => void;
  onChangeLanguage: (l: Lang) => void;
  disabled: boolean;

  onRun?: (args: { language: Lang; code: string; stdin: string }) => Promise<RunResult>;

  checked?: boolean;
  ok?: boolean | null;
  reviewCorrect?: { language: Lang; code: string; stdin: string } | null;

  readOnly?: boolean;
}) {
  const showCorrect =
    checked && ok === false && reviewCorrect && typeof reviewCorrect.code === "string";

  const hideControls = readOnly; // ✅ only hide in review/readonly

  return (
    <div className="grid gap-3">
      <CodeRunner
        title={exercise.title}
        hintMarkdown={exercise.hint}
        height={exercise.editorHeight ?? 320}
        showLanguagePicker={hideControls ? false : (exercise.allowLanguageSwitch ?? true)}
        allowReset={hideControls ? false : true}
        allowRun={hideControls ? false : true}
        showEditorThemeToggle={hideControls ? false : true}
        disabled={disabled}
        language={language}
        onChangeLanguage={onChangeLanguage}
        code={code}
        onChangeCode={onChangeCode}
        stdin={stdin}
        onChangeStdin={onChangeStdin}
        onRun={onRun}
        fixedLanguage="python"
        fixedTerminalDock="bottom"
      />

      {showCorrect ? (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-3">
          <div className="text-[11px] font-black text-emerald-100/80">
            Correct solution
          </div>

          <div className="mt-2">
            <CodeRunner
              title={undefined as any}
              hintMarkdown={undefined as any}
              height={exercise.editorHeight ?? 260}
              showLanguagePicker={false}
              allowReset={false}
              allowRun={false}
              showEditorThemeToggle={false}
              disabled={true}
              language={reviewCorrect!.language}
              onChangeLanguage={() => {}}
              code={reviewCorrect!.code}
              onChangeCode={() => {}}
              stdin={reviewCorrect!.stdin ?? ""}
              onChangeStdin={() => {}}
              onRun={undefined}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
