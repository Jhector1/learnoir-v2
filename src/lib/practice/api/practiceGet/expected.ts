// src/lib/practice/api/practiceGet/expected.ts
import { PracticeKind } from "@prisma/client";

function toNumberGrid(x: any): number[][] | null {
  if (!x) return null;

  // mathjs Matrix
  if (typeof x?.toArray === "function") x = x.toArray();

  // common wrapper { data: [[...]] }
  if (x && Array.isArray(x.data) && Array.isArray(x.data[0])) x = x.data;

  if (!Array.isArray(x) || !Array.isArray(x[0])) return null;

  const grid = x.map((row: any[]) => row.map((v: any) => Number(v)));

  if (!grid.length || !grid[0].length) return null;
  if (grid.some((r) => r.length !== grid[0].length)) return null;
  if (grid.some((r) => r.some((v) => !Number.isFinite(v)))) return null;

  return grid;
}

export function normalizeExpectedForSave(kind: PracticeKind, expected: any) {
  if (kind !== PracticeKind.matrix_input) return expected;

  // accept a few possible generator shapes, but SAVE canonically as { values: number[][] }
  const raw =
    expected?.values ??
    expected?.value ??
    expected?.matrix ??
    expected?.A ??
    expected?.grid;

  const grid = toNumberGrid(raw);

  if (!grid) {
    throw new Error(
      `Generator bug: matrix_input expected is missing 2D values. expected=${JSON.stringify(
        expected,
        null,
        2,
      )}`,
    );
  }

  return {
    ...(expected ?? {}),
    kind: "matrix_input",
    values: grid,
  };
}
