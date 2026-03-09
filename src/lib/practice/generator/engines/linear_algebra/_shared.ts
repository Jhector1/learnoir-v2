// import { PracticePurpose } from "@prisma/client";
//
// import type { TopicContext } from "@/lib/practice/generator/generatorTypes";
// import type { GenOut } from "@/lib/practice/generator/shared/expected";
// import type { RNG } from "@/lib/practice/generator/shared/rng";
// import type {
//     Difficulty,
//     ExerciseKind,
//     MatrixInputExercise,
//     NumericExercise,
// } from "@/lib/practice/types";
//
// import {
//     makeSingleChoiceOut,
//     makeSubjectModuleGenerator,
//     type Handler,
//     type HandlerArgs,
//     type TopicBundle,
// } from "@/lib/practice/generator/engines/utils";
//
// export type { Handler, HandlerArgs, TopicBundle };
//
// export type LAOptId = "a" | "b" | "c" | "d";
//
// export function laQ(key: string) {
//     return `quiz.${key}`;
// }
//
// export function buildLAOptions(key: string, ids: LAOptId[]) {
//     return ids.map((id) => ({
//         id,
//         text: `@:${laQ(key)}.options.${id}`,
//     }));
// }
//
// export function makeLinearAlgebraModuleGenerator(args: {
//     engineName: string;
//     ctx: TopicContext;
//     topics: readonly TopicBundle[];
//     defaultPurpose?: PracticePurpose;
//     enablePurpose?: boolean;
// }) {
//     return makeSubjectModuleGenerator(args);
// }
//
// export function makeLAStaticSingleChoiceHandler(
//     key: string,
//     answerOptionId: LAOptId,
//     optionIds: LAOptId[] = ["a", "b", "c", "d"],
//     make?: (
//         args: HandlerArgs,
//     ) => Partial<{
//         title: string;
//         prompt: string;
//         hint: string;
//     }>,
// ): Handler {
//     return (args: HandlerArgs) => {
//         const extra = make?.(args) ?? {};
//
//         return makeSingleChoiceOut({
//             archetype: key,
//             id: args.id,
//             topic: args.topic,
//             diff: args.diff,
//             title: extra.title ?? `@:${laQ(key)}.title`,
//             prompt: extra.prompt ?? `@:${laQ(key)}.prompt`,
//             hint: extra.hint ?? `@:${laQ(key)}.hint`,
//             options: buildLAOptions(key, optionIds),
//             answerOptionId,
//         });
//     };
// }
//
// export function makeLANumericOut(args: {
//     archetype: string;
//     id: string;
//     topic: string;
//     diff: Difficulty;
//     title: string;
//     prompt: string;
//     hint?: string;
//     value: number;
//     tolerance: number;
// }): GenOut<ExerciseKind> {
//     const exercise: NumericExercise = {
//         id: args.id,
//         topic: args.topic,
//         difficulty: args.diff,
//         kind: "numeric",
//         title: args.title,
//         prompt: args.prompt,
//         ...(args.hint ? { hint: args.hint } : {}),
//     };
//
//     return {
//         archetype: args.archetype,
//         exercise,
//         expected: {
//             kind: "numeric",
//             value: args.value,
//             tolerance: args.tolerance,
//         },
//     };
// }

// export function makeLAMatrixInputOut(args: {
//     archetype: string;
//     id: string;
//     topic: string;
//     diff: Difficulty;
//     title: string;
//     prompt: string;
//     hint?: string;
//     values: number[][];
//     tolerance?: number;
//     integerOnly?: boolean;
//     step?: number;
// }): GenOut<ExerciseKind> {
//     const rows = args.values.length;
//     const cols = args.values[0]?.length ?? 0;
//
//     const exercise: MatrixInputExercise = {
//         id: args.id,
//         topic: args.topic,
//         difficulty: args.diff,
//         kind: "matrix_input",
//         title: args.title,
//         prompt: args.prompt,
//         rows,
//         cols,
//         tolerance: args.tolerance ?? 0,
//         integerOnly: args.integerOnly ?? true,
//         step: args.step ?? 1,
//         ...(args.hint ? { hint: args.hint } : {}),
//     };
//
//     return {
//         archetype: args.archetype,
//         exercise,
//         expected: {
//             kind: "matrix_input",
//             rows,
//             cols,
//             values: args.values,
//             tolerance: args.tolerance ?? 0,
//         },
//     };
// }
//
// /* ----------------------------- math helpers ----------------------------- */
//
// export function fmtCol(v: number[]) {
//     return String.raw`\begin{bmatrix}${v.map(String).join("\\\\")}\end{bmatrix}`;
// }
//
// export function fmtRow(v: number[]) {
//     return String.raw`\begin{bmatrix}${v.join(" & ")}\end{bmatrix}`;
// }
//
// export function fmtVec2(x: number, y: number) {
//     return String.raw`\begin{bmatrix}${x}\\${y}\end{bmatrix}`;
// }
//
// export function vecToCol(v: number[]) {
//     return v.map((x) => [x]);
// }
//
// export function addVec(a: number[], b: number[]) {
//     return a.map((x, i) => x + b[i]);
// }
//
// export function subVec(a: number[], b: number[]) {
//     return a.map((x, i) => x - b[i]);
// }
//
// export function mulScalar(s: number, v: number[]) {
//     return v.map((x) => s * x);
// }
//
// export function dot(a: number[], b: number[]) {
//     let s = 0;
//     for (let i = 0; i < a.length; i++) s += a[i] * b[i];
//     return s;
// }

export function norm(a: number[]) {
    return Math.sqrt(dot(a, a));
}
//
// export function roundTo(x: number, d: number) {
//     const p = 10 ** d;
//     return Math.round(x * p) / p;
// }
//
// export function randNonZeroInt(rng: RNG, lo: number, hi: number) {
//     let v = 0;
//     while (v === 0) v = rng.int(lo, hi);
//     return v;
// }
//
// export function pickLen(rng: RNG, diff: Difficulty) {
//     return diff === "easy" ? 3 : diff === "medium" ? 4 : 5;
// }
//
// export function vecInts(rng: RNG, n: number, range: number, allowZero = true) {
//     let v = Array.from({ length: n }, () => rng.int(-range, range));
//
//     if (!allowZero) {
//         while (v.every((x) => x === 0)) {
//             v = Array.from({ length: n }, () => rng.int(-range, range));
//         }
//     }
//
//     return v;
// }










import { PracticePurpose } from "@prisma/client";

import type { TopicContext } from "@/lib/practice/generator/generatorTypes";
import type { GenOut } from "@/lib/practice/generator/shared/expected";
import type { RNG } from "@/lib/practice/generator/shared/rng";
import type {
    Difficulty,
    ExerciseKind,
    MatrixInputExercise,
    NumericExercise,
} from "@/lib/practice/types";

import {
    makeSingleChoiceOut,
    makeSubjectModuleGenerator,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
} from "@/lib/practice/generator/engines/utils";

export type { Handler, HandlerArgs, TopicBundle };

export type LAOptId = "a" | "b" | "c" | "d";

export function laQ(key: string) {
    return `quiz.${key}`;
}

export function buildLAOptions(key: string, ids: LAOptId[]) {
    return ids.map((id) => ({
        id,
        text: `@:${laQ(key)}.options.${id}`,
    }));
}

export function makeLinearAlgebraModuleGenerator(args: {
    engineName: string;
    ctx: TopicContext;
    topics: readonly TopicBundle[];
    defaultPurpose?: PracticePurpose;
    enablePurpose?: boolean;
}) {
    return makeSubjectModuleGenerator(args);
}

export function makeLAStaticSingleChoiceHandler(
    key: string,
    answerOptionId: LAOptId,
    optionIds: LAOptId[] = ["a", "b", "c", "d"],
    make?: (
        args: HandlerArgs,
    ) => Partial<{
        title: string;
        prompt: string;
        hint: string;
    }>,
): Handler {
    return ((args: HandlerArgs) => {
        const extra = make?.(args) ?? {};

        return makeSingleChoiceOut({
            archetype: key,
            id: args.id,
            topic: args.topic,
            diff: args.diff,
            title: extra.title ?? `@:${laQ(key)}.title`,
            prompt: extra.prompt ?? `@:${laQ(key)}.prompt`,
            hint: extra.hint ?? `@:${laQ(key)}.hint`,
            options: buildLAOptions(key, optionIds),
            answerOptionId,
        });
    }) as Handler;
}

export function makeLANumericOut(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    hint?: string;
    value: number;
    tolerance: number;
}): GenOut<ExerciseKind> {
    const exercise: NumericExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "numeric",
        title: args.title,
        prompt: args.prompt,
        ...(args.hint ? { hint: args.hint } : {}),
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: {
            kind: "numeric",
            value: args.value,
            tolerance: args.tolerance,
        },
    };
}

export function makeLAMatrixInputOut(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    hint?: string;
    values: number[][];
    tolerance?: number;
    integerOnly?: boolean;
    step?: number;
}): GenOut<ExerciseKind> {
    const rows = args.values.length;
    const cols = args.values[0]?.length ?? 0;

    const exercise: MatrixInputExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "matrix_input",
        title: args.title,
        prompt: args.prompt,
        rows,
        cols,
        tolerance: args.tolerance ?? 0,
        integerOnly: args.integerOnly ?? true,
        step: args.step ?? 1,
        ...(args.hint ? { hint: args.hint } : {}),
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: {
            kind: "matrix_input",
            rows,
            cols,
            values: args.values,
            tolerance: args.tolerance ?? 0,
        },
    };
}

/* ----------------------------- math helpers ----------------------------- */

export function fmtCol(v: number[]) {
    return String.raw`\begin{bmatrix}${v.map(String).join("\\\\")}\end{bmatrix}`;
}

export function fmtRow(v: number[]) {
    return String.raw`\begin{bmatrix}${v.join(" & ")}\end{bmatrix}`;
}

export function fmtMat(rows: number[][]) {
    return String.raw`\begin{bmatrix}${rows
        .map((r) => r.join(" & "))
        .join("\\\\")}\end{bmatrix}`;
}

export function fmtVec2(x: number, y: number) {
    return String.raw`\begin{bmatrix}${x}\\${y}\end{bmatrix}`;
}

export function vecToCol(v: number[]) {
    return v.map((x) => [x]);
}

export function addVec(a: number[], b: number[]) {
    return a.map((x, i) => x + b[i]);
}

export function subVec(a: number[], b: number[]) {
    return a.map((x, i) => x - b[i]);
}

export function mulScalar(s: number, v: number[]) {
    return v.map((x) => s * x);
}

export function dot(a: number[], b: number[]) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}

export function roundTo(x: number, d: number) {
    const p = 10 ** d;
    return Math.round(x * p) / p;
}

export function randNonZeroInt(rng: RNG, lo: number, hi: number) {
    let v = 0;
    while (v === 0) v = rng.int(lo, hi);
    return v;
}

export function pickLen(rng: RNG, diff: Difficulty) {
    return diff === "easy" ? 3 : diff === "medium" ? 4 : 5;
}

export function vecInts(rng: RNG, n: number, range: number, allowZero = true) {
    let v = Array.from({ length: n }, () => rng.int(-range, range));

    if (!allowZero) {
        while (v.every((x) => x === 0)) {
            v = Array.from({ length: n }, () => rng.int(-range, range));
        }
    }

    return v;
}