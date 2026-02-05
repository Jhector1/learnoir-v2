// src/lib/practice/uiHelpers.ts
import type { CodeLanguage, Exercise, SubmitAnswer, TopicSlug, Vec3 } from "@/lib/practice/types";
import type { QItem } from "@/components/practice/practiceType";

export function resizeGrid(prev: string[][], rows: number, cols: number) {
  const r = Math.max(1, Math.floor(rows));
  const c = Math.max(1, Math.floor(cols));
  return Array.from({ length: r }, (_, i) =>
    Array.from({ length: c }, (_, j) => String(prev?.[i]?.[j] ?? "")),
  );
}

export function cloneVec(v: any): Vec3 {
  return { x: Number(v?.x ?? 0), y: Number(v?.y ?? 0), z: Number(v?.z ?? 0) };
}
function getRequiredMatrixShape(ex: any): { rows: number; cols: number } | null {
  const r = Number(ex?.rows);
  const c = Number(ex?.cols);
  if (Number.isFinite(r) && Number.isFinite(c) && r >= 1 && c >= 1) {
    return { rows: Math.floor(r), cols: Math.floor(c) };
  }
  return null;
}
/**
 * Turn a QItem (UI state) into a SubmitAnswer (API payload).
 * Shared by PracticeClient and QuizBlock.
 */
export function buildSubmitAnswerFromItem(item: QItem): SubmitAnswer | undefined {
  const ex = item.exercise;
  if (ex.kind === "text_input") {
    const v = String((item as any).text ?? "").trim();
    if (!v) return undefined;
    return { kind: "text_input", value: v };
  }
if (ex.kind === "drag_reorder") {
  const tokensRaw = Array.isArray((ex as any).tokens) ? (ex as any).tokens : [];
  const tokenIds = tokensRaw.map((t: any) => String(t?.id ?? t));

  const orderRaw = Array.isArray((item as any).reorder) ? (item as any).reorder : [];
  const orderIds = orderRaw.map((x: any) => String(x?.id ?? x));

  // must have full ordering
  if (!orderIds.length || orderIds.length !== tokenIds.length) return undefined;

  // must be a permutation of tokenIds
  const tokenSet = new Set(tokenIds);
  if (orderIds.some((id) => !tokenSet.has(id))) return undefined;
  if (new Set(orderIds).size !== tokenIds.length) return undefined;

  return { kind: "drag_reorder", order: orderIds };
}


  if (ex.kind === "voice_input") {
    const transcript = String((item as any).voiceTranscript ?? "").trim();
    if (!transcript) return undefined;

    const audioId = String((item as any).voiceAudioId ?? "").trim();
    return {
      kind: "voice_input",
      transcript,
      ...(audioId ? { audioId } : {}),
    };
  }

  if (ex.kind === "single_choice") {
    if (!item.single) return undefined;
    return { kind: "single_choice", optionId: item.single };
  }

  if (ex.kind === "multi_choice") {
    if (!item.multi?.length) return undefined;
    return { kind: "multi_choice", optionIds: item.multi };
  }

  if (ex.kind === "numeric") {
    if (!item.num?.trim()) return undefined;
    const v = Number(item.num);
    if (!Number.isFinite(v)) return undefined;
    return { kind: "numeric", value: v };
  }

  if (ex.kind === "vector_drag_target") {
    return {
      kind: "vector_drag_target",
      a: { ...item.dragA },
      b: { ...item.dragB },
    };
  }

  if (ex.kind === "vector_drag_dot") {
    return { kind: "vector_drag_dot", a: { ...item.dragA } };
  }

  // if (ex.kind === "matrix_input") {
  //   const rows = Math.max(1, Math.floor(item.matRows || 0));
  //   const cols = Math.max(1, Math.floor(item.matCols || 0));

  //   if (!item.mat || item.mat.length !== rows) return undefined;
  //   for (const row of item.mat) {
  //     if (!Array.isArray(row) || row.length !== cols) return undefined;
  //   }

  //   const values: number[][] = [];
  //   for (let r = 0; r < rows; r++) {
  //     const row: number[] = [];
  //     for (let c = 0; c < cols; c++) {
  //       const raw = String(item.mat[r][c] ?? "").trim();
  //       if (!raw) return undefined;

  //       const v = Number(raw);
  //       if (!Number.isFinite(v)) return undefined;

  //       row.push((ex as any).integerOnly ? Math.trunc(v) : v);
  //     }
  //     values.push(row);
  //   }
  //   return { kind: "matrix_input", values };
  // }
  if (ex.kind === "matrix_input") {
    const rows = Math.max(1, Math.floor(item.matRows || 0));
    const cols = Math.max(1, Math.floor(item.matCols || 0));

    // ✅ NEW: if exercise declares a required shape, enforce it WITHOUT revealing it
    const req = getRequiredMatrixShape(ex as any);
    if (req && (rows !== req.rows || cols !== req.cols)) return undefined;

    if (!item.mat || item.mat.length !== rows) return undefined;
    for (const row of item.mat) {
      if (!Array.isArray(row) || row.length !== cols) return undefined;
    }

    const values: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        const raw = String(item.mat[r][c] ?? "").trim();
        if (!raw) return undefined;

        const v = Number(raw);
        if (!Number.isFinite(v)) return undefined;

        row.push((ex as any).integerOnly ? Math.trunc(v) : v);
      }
      values.push(row);
    }
    return { kind: "matrix_input", values };
  }

  if (ex.kind === "code_input") {
    const code = String(item.code ?? "").trim();
    if (!code) return undefined;

    // NOTE: your validate route currently accepts python|java
    const langRaw = String(item.codeLang ?? (ex as any).language ?? "python");
    const language: CodeLanguage = langRaw === "java" ? "java" : "python";

    return {
      kind: "code_input",
      language,
      code,
      stdin: String(item.codeStdin ?? ""),
    };
  }

  return undefined;
}
function normDim(n: unknown, fallback: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(1, Math.floor(v));
}

/**
 * Create the initial QItem state for any Exercise.
 * Shared by PracticeClient and QuizBlock.
 */
export function initItemFromExercise(ex: Exercise, key: string): QItem {
  let a: Vec3 = { x: 0, y: 0, z: 0 };
  let b: Vec3 = { x: 2, y: 1, z: 0 };

  if (ex.kind === "vector_drag_target") {
    a = cloneVec((ex as any).initialA);
    b = cloneVec((ex as any).initialB ?? { x: 2, y: 1, z: 0 });
  } else if (ex.kind === "vector_drag_dot") {
    a = cloneVec((ex as any).initialA);
    b = cloneVec((ex as any).b ?? { x: 2, y: 1, z: 0 });
  }

  // const exDiff = String((ex as any).difficulty ?? "easy");
  // const allowDimEdit =
  //   ex.kind === "matrix_input" && (exDiff === "medium" || exDiff === "hard");

  // const matRows =
  //   ex.kind === "matrix_input"
  //     ? allowDimEdit
  //       ? 2
  //       : Number((ex as any).rows ?? 2)
  //     : 0;

  // const matCols =
  //   ex.kind === "matrix_input"
  //     ? allowDimEdit
  //       ? 2
  //       : Number((ex as any).cols ?? 2)
  //     : 0;

  // const mat = ex.kind === "matrix_input" ? resizeGrid([], matRows, matCols) : [];



  // const exAny = ex as any;

  // const allowResize = ex.kind === "matrix_input" && Boolean(exAny.allowResize);

  // // default shape always comes from exercise (or falls back)
  // const baseRows = ex.kind === "matrix_input" ? normDim(exAny.rows, 2) : 0;
  // const baseCols = ex.kind === "matrix_input" ? normDim(exAny.cols, 2) : 0;

  // // if you want “editable dims on hard”, do it in the GENERATOR:
  // // exercise.allowResize = true, and optionally rows/cols = starting shape

  // const matRows = ex.kind === "matrix_input" ? baseRows : 0;
  // const matCols = ex.kind === "matrix_input" ? baseCols : 0;

  // // optionally support initialValues
  // const seed = ex.kind === "matrix_input" && Array.isArray(exAny.initialValues)
  //   ? exAny.initialValues
  //   : [];

  // const mat = ex.kind === "matrix_input" ? resizeGrid(seed, matRows, matCols) : [];


const exAny = ex as any;
const reorder =
  ex.kind === "drag_reorder" && Array.isArray(exAny.tokens)
    ? exAny.tokens.map((t: any) => String(t?.id ?? t))
    : [];



const allowResize = ex.kind === "matrix_input" && Boolean(exAny.allowResize);

// ✅ If allowResize=true → default UI grid is 2×2
// ✅ Else → default comes from exercise.rows/exercise.cols (or 2×2 fallback)
// const matRows =
//   ex.kind === "matrix_input"
//     ? (allowResize ? 2 : normDim(exAny.rows, 2))
//     : 0;

// const matCols =
//   ex.kind === "matrix_input"
//     ? (allowResize ? 2 : normDim(exAny.cols, 2))
//     : 0;

// const seed =
//   ex.kind === "matrix_input" && Array.isArray(exAny.initialValues)
//     ? exAny.initialValues
//     : [];

// const mat = ex.kind === "matrix_input"
//   ? resizeGrid(seed, matRows, matCols)
//   : [];
// const exAny = ex as any;

// ✅ matrix_input always starts as 2×2 (user must resize to the correct shape)
const matRows = ex.kind === "matrix_input" ? 2 : 0;
const matCols = ex.kind === "matrix_input" ? 2 : 0;

// optional initialValues (will be cropped into 2×2)
const seed =
  ex.kind === "matrix_input" && Array.isArray(exAny.initialValues)
    ? exAny.initialValues
    : [];

const mat =
  ex.kind === "matrix_input"
    ? resizeGrid(seed, matRows, matCols)
    : [];


  const base: QItem = {
    key,
    exercise: ex,

    single: "",
    multi: [],
    num: "",

    dragA: a,
    dragB: b,

    matRows,
    matCols,
    mat,

    result: null,
    submitted: false,
    revealed: false,
    attempts: 0,

    // code_input defaults
    codeLang: "python",
    code: "",
    codeStdin: "",

     text: "",
    reorder,
    voiceTranscript: "",
    voiceAudioId: ""
  };
  if (ex.kind === "text_input") {
    return {
      ...base,
      text: (ex as any).starterText ?? "",
    };
  }

  if (ex.kind === "code_input") {
    const lang = (ex as any).language ?? "python";
    return {
      ...base,
      codeLang: lang,
      code: (ex as any).starterCode ?? "",
      codeStdin: "",
    };
  }

  return base;
}

/**
 * Client still trusts DB topic slugs.
 */
export function normalizeTopicValue(v: string | null | undefined): TopicSlug | "all" {
  const raw = String(v ?? "").trim();
  if (!raw || raw === "all") return "all";
  return raw as TopicSlug;
}
