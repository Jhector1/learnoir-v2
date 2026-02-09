"use client";

import React, { useMemo, useState } from "react";
import type { Exercise } from "@/lib/practice/types";
import type { QItem } from "./practiceType";

import MathMarkdown from "@/components/math/MathMarkdown";
import MatrixInputPanel from "./MatrixInputPanel";

function cn(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function matrixToText(values: number[][]) {
  // nice copy format: rows on new lines, columns space-separated
  return values.map((r) => r.join(" ")).join("\n");
}

function matrixToGridStrings(values: number[][]) {
  return values.map((row) => row.map((v) => String(v)));
}

export default function RevealAnswerCard({
  exercise,
  current,
  result,
  updateCurrent,
}: {
  exercise: Exercise;
  current: QItem;
  result: any;
  updateCurrent: (patch: Partial<QItem>) => void;
}) {
  // Prefer new API shape, fallback to old `expected`
  const reveal = (result?.revealAnswer ??
    result?.reveal ??
    result?.expected) as any;

  const [copied, setCopied] = useState(false);

  const model = useMemo(() => {
    if (!reveal || typeof reveal !== "object") return null;

    const kind = String(reveal.kind ?? exercise.kind);

    // Build:
    // - display node
    // - copyText
    // - fillPatch (optional)
    if (kind === "numeric") {
      const v = reveal.value;
      const copyText = v == null ? "" : String(v);
      return {
        title: "Answer",
        copyText,
        fillPatch: copyText ? ({ num: copyText } as Partial<QItem>) : null,
        node: (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <MathMarkdown
              content={`$$${copyText || "\\text{(empty)}"}$$`}
              className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-white"
            />
          </div>
        ),
      };
    }

    if (kind === "code_input") {
      const lang = String(reveal.language ?? current.codeLang ?? "python");
      const code = String(reveal.solutionCode ?? reveal.code ?? "");
      const stdin = String(reveal.stdin ?? "");

      const copyText = code.trim() ? code : "";
      return {
        title: `Solution code (${lang})`,
        copyText,
        fillPatch: copyText
          ? ({
              code: copyText,
              codeLang: lang as any,
              codeStdin: stdin,
            } as Partial<QItem>)
          : null,
        node: (
          <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-3 py-2">
              <div className="text-[11px] font-extrabold text-white/70">
                {lang.toUpperCase()}
              </div>
              <div className="text-[11px] text-white/45">
                Copy/paste into the editor, then Submit.
              </div>
            </div>
            <pre className="p-3 text-xs leading-relaxed text-white/85 overflow-x-auto">
              {code ? (
                <MathMarkdown
                  content={code}
                  className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-white"
                />
              ) : (
                "// (no solutionCode provided)"
              )}
            </pre>

            {stdin ? (
              <div className="border-t border-white/10 px-3 py-2">
                <div className="text-[11px] font-extrabold text-white/60">
                  stdin
                </div>
                <pre className="mt-1 text-xs text-white/80 overflow-x-auto">
                  {stdin}
                </pre>
              </div>
            ) : null}
          </div>
        ),
      };
    }

    if (kind === "matrix_input") {
      const values = Array.isArray(reveal.values)
        ? (reveal.values as number[][])
        : [];
      const rows = values.length;
      const cols = values[0]?.length ?? 0;

      const copyText = rows && cols ? matrixToText(values) : "";
      return {
        title: "Matrix answer",
        copyText,
        fillPatch:
          rows && cols
            ? ({
                matRows: rows,
                matCols: cols,
                mat: matrixToGridStrings(values),
              } as Partial<QItem>)
            : null,
        node: (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <MatrixInputPanel
              labelLatex={
                (reveal.labelLatex as string) ?? String.raw`\mathbf{A}=`
              }
              rows={rows}
              cols={cols}
              allowResize={false}
              value={matrixToGridStrings(values)}
              readOnly={true}
              requiredRows={rows}
              requiredCols={cols}
              onShapeChange={() => {}}
              onChange={() => {}}
            />
          </div>
        ),
      };
    }

    // Single choice (try to show label)
    if (kind === "single_choice") {
      const optionId = String(reveal.optionId ?? "");
      const options = (exercise as any)?.options ?? [];
      const found = options.find((o: any) => String(o.id) === optionId);
      const label =
        found?.label ??
        found?.text ??
        found?.markdown ??
        found?.latex ??
        optionId;

      return {
        title: "Correct choice",
        copyText: optionId,
        fillPatch: optionId ? ({ single: optionId } as Partial<QItem>) : null,
        node: (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/70 font-extrabold">Option</div>
            <div className="mt-1 text-sm text-white/90">
              <MathMarkdown
                content={String(label)}
                className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-white"
              />
            </div>
            <div className="mt-2 text-[11px] text-white/50">id: {optionId}</div>
          </div>
        ),
      };
    }

    // Multi choice
    if (kind === "multi_choice") {
      const optionIds = Array.isArray(reveal.optionIds)
        ? reveal.optionIds.map(String)
        : [];
      const copyText = optionIds.join(", ");
      return {
        title: "Correct choices",
        copyText,
        fillPatch: optionIds.length
          ? ({ multi: optionIds } as Partial<QItem>)
          : null,
        node: (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/70 font-extrabold">Options</div>
            <div className="mt-1 text-sm text-white/90">{copyText || "—"}</div>
          </div>
        ),
      };
    }

    // Vectors (minimal display)
    if (kind === "vector_drag_target" || kind === "vector_drag_dot") {
      const sol = reveal.solutionA ?? reveal.targetA ?? null;
      const b = reveal.b ?? null;
      const copyText = sol ? JSON.stringify(sol) : "";
      return {
        title: "One valid vector answer",
        copyText,
        fillPatch: sol ? ({ dragA: sol,...(b ? { dragB: b } : {}) } as Partial<QItem>) : null,
        node: (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/80">
            <div className="font-extrabold text-white/85">a</div>
            <pre className="mt-1 overflow-x-auto">
              {JSON.stringify(sol, null, 2)}
            </pre>
            {b ? (
              <>
                <div className="mt-3 font-extrabold text-white/85">b</div>
                <pre className="mt-1 overflow-x-auto">
                  {JSON.stringify(b, null, 2)}
                </pre>
              </>
            ) : null}
          </div>
        ),
      };
    }

    return null;
  }, [reveal, exercise, current.codeLang]);

  if (!model) return null;

  async function onCopy() {
    if (!model.copyText) return;
    const ok = await copyToClipboard(model.copyText);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function onFill() {
    if (!model.fillPatch) return;
    updateCurrent({ ...model.fillPatch, submitted: false, result: null });
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-extrabold text-white/70">
          Revealed answer
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCopy}
            disabled={!model.copyText}
            className={cn(
              "rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-extrabold hover:bg-white/15 disabled:opacity-50",
            )}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>

          <button
            onClick={onFill}
            disabled={!model.fillPatch}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-extrabold hover:bg-white/15 disabled:opacity-50"
            title="Fill the input with the revealed answer"
          >
            Fill answer
          </button>
        </div>
      </div>

      <div className="mt-2">{model.node}</div>
    </div>
  );
}
