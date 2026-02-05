"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";
import MatrixEntryInput from "@/components/practice/MatrixEntryInput";

function toNumber(cell: string) {
  const t = (cell ?? "").trim();
  if (!t) return 0;
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function hadamard(a: number[], b: number[]) {
  if (a.length !== b.length) return null;
  return a.map((x, i) => x * b[i]);
}

function outer(a: number[], b: number[]) {
  return a.map((ai) => b.map((bj) => ai * bj));
}

function colVecGridFromNums(v: number[]) {
  return v.map((x) => [String(x)]);
}

function matGridFromNums(M: number[][]) {
  return M.map((row) => row.map((x) => String(x)));
}

export default function HadamardOuterSketch() {
  // column vectors: rows = length, cols = 1
  const [aGrid, setAGrid] = useState<string[][]>([
    ["5"],
    ["4"],
    ["8"],
    ["2"],
  ]);
  const [bGrid, setBGrid] = useState<string[][]>([
    ["1"],
    ["0"],
    ["2"],
    ["-1"],
  ]);

  const a = useMemo(() => aGrid.map((r) => toNumber(r?.[0] ?? "")), [aGrid]);
  const b = useMemo(() => bGrid.map((r) => toNumber(r?.[0] ?? "")), [bGrid]);

  const h = useMemo(() => hadamard(a, b), [a, b]);
  const o = useMemo(() => outer(a, b), [a, b]);

  const ok = a.length === b.length;

  const hud = useMemo(() => {
    return String.raw`
**Other vector multiplications**

### Hadamard (element-wise)
$$
\mathbf{a}\odot\mathbf{b}=(a_1b_1,\ a_2b_2,\ \dots)
$$

- Only valid when lengths match.  
- Here: **${ok ? "defined ✅" : "undefined ❌ (length mismatch)"}**

### Outer product
$$
\mathbf{a}\mathbf{b}^T
$$

- Always produces a **matrix** of size $\text{len}(a)\times\text{len}(b)$.  
- Useful for building rank-1 matrices and for understanding $\text{col}\cdot\text{row}$.

Try editing values below and watch how outputs change.
`.trim();
  }, [ok]);

  const aRows = Math.max(1, aGrid.length);
  const bRows = Math.max(1, bGrid.length);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-5">
          
            <div className="mb-2 ">
              {/* <div className="mb-2 text-xs font-extrabold text-white/70">a</div> */}
              <MatrixEntryInput
                labelLatex={String.raw`\mathbf{a}=`}
                rows={aRows}
                cols={1}
                value={aGrid}
                onChange={setAGrid}
                cellWidthClass="w-20"
              />
            </div>

            {/* b */}
            <div className="mb-2 ">
              {/* <div className="mb-2 text-xs font-extrabold text-white/70">b</div> */}
              <MatrixEntryInput
                labelLatex={String.raw`\mathbf{b}=`}
                rows={bRows}
                cols={1}
                value={bGrid}
                onChange={setBGrid}
                cellWidthClass="w-20"
              />
            </div>

            {/* Hadamard */}
            <div>
              <div className="mb-2 text-xs font-extrabold text-white/70">
                Hadamard a ⊙ b
              </div>

              {h ? (
                <MatrixEntryInput
                  labelLatex={String.raw`\mathbf{a}\odot\mathbf{b}=`}
                  rows={h.length}
                  cols={1}
                  value={colVecGridFromNums(h)}
                  onChange={() => {}}
                  readOnly
                  cellWidthClass="w-20"
                />
              ) : (
                <div className="text-xs text-rose-200/80">
                  Lengths must match.
                </div>
              )}
            </div>

            {/* Outer */}
            <div>
              <div className="mb-2 text-xs font-extrabold text-white/70">
                Outer a bᵀ
              </div>

              <MatrixEntryInput
                labelLatex={String.raw`\mathbf{a}\mathbf{b}^T=`}
                rows={a.length}
                cols={b.length}
                value={matGridFromNums(o)}
                onChange={() => {}}
                readOnly
                cellWidthClass="w-20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown
            className="text-sm text-white/80 [&_.katex]:text-white/90"
            content={hud}
          />
        </div>
      </div>
    </div>
  );
}
