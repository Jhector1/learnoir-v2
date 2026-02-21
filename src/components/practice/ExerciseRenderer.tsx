"use client";

import React, {useCallback, useEffect, useRef} from "react";
import type {Exercise} from "@/lib/practice/types";
import type {VectorPadState} from "@/components/vectorpad/types";
import type {Lang} from "@/lib/code/runCode";

import NumericExerciseUI from "./kinds/NumericExerciseUI";
import SingleChoiceExerciseUI from "./kinds/SingleChoiceExerciseUI";
import MultiChoiceExerciseUI from "./kinds/MultiChoiceExerciseUI";
import VectorDragTargetExerciseUI from "./kinds/VectorDragTargetExerciseUI";
import VectorDragDotExerciseUI from "./kinds/VectorDragDotExerciseUI";
import CodeInputExerciseUI from "./kinds/CodeInputExerciseUI";

// ✅ NEW kinds
import TextInputExerciseUI from "./kinds/TextInputExerciseUI";
import DragReorderExerciseUI from "./kinds/DragReorderExerciseUI";
import VoiceInputExerciseUI from "./kinds/VoiceInputExerciseUI";

import type {QItem} from "./practiceType";
import MatrixInputPanel from "./MatrixInputPanel";
import {resizeGrid} from "@/lib/practice/matrixHelpers";

// ✅ minimal tools API (don’t import review context from practice layer)
// ...imports unchanged
// "use client";

// import React, { useCallback, useEffect, useRef } from "react";
// keep the rest of your imports

// ✅ minimal tools API (don’t import review context from practice layer)
type CodeToolsApi = {
    registerCodeInput: (
        id: string,
        args: {
            lang: Lang;
            code: string;
            stdin?: string;
            onPatch: (patch: any) => void;
        },
    ) => void;
    unregisterCodeInput: (id: string) => void;

    requestBind: (id: string) => void;
    requestBindNext: (afterId: string) => void;
    unbindCodeInput: () => void;

    isBound: (id: string) => boolean;
    boundId: string | null;

    ensureVisible?: () => void;
};

function CodeInputWithTools(props: {
    exercise: any;
    current: any;
    lockInputs: boolean;
    checked: boolean;
    ok: boolean | null;
    readOnly: boolean;
    resetCheckPatch: () => any;

    codeTools: CodeToolsApi;
    codeInputId: string;

    updateCurrent: (patch: any) => void;
}) {
    const {
        exercise,
        current,
        lockInputs,
        checked,
        ok,
        readOnly,
        resetCheckPatch,
        codeTools,
        codeInputId,
        updateCurrent,
    } = props;

    const curLang = ((current as any).codeLang ?? "python") as Lang;
    const curCode = (current as any).code ?? "";
    const curStdin = (current as any).codeStdin ?? "";

    const onPatch = useCallback((patch: any) => updateCurrent(patch), [updateCurrent]);

    // 1) register/unregister ONCE per id
    useEffect(() => {
        codeTools.registerCodeInput(codeInputId, {
            lang: curLang,
            code: curCode,
            stdin: curStdin,
            onPatch,
        });

        return () => codeTools.unregisterCodeInput(codeInputId);
        // only per id + stable callback
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeTools, codeInputId, onPatch]);

    // 2) update snapshot when values change (NO cleanup)
    const didFirstSnapshot = useRef(false);
    useEffect(() => {
        if (!didFirstSnapshot.current) {
            didFirstSnapshot.current = true;
            return; // avoid double-call noise on mount
        }

        codeTools.registerCodeInput(codeInputId, {
            lang: curLang,
            code: curCode,
            stdin: curStdin,
            onPatch,
        });
    }, [codeTools, codeInputId, curLang, curCode, curStdin, onPatch]);

    const toolsBoundToThis = codeTools.isBound(codeInputId);
    const toolsUnbound = codeTools.boundId == null;

    return (
        <CodeInputExerciseUI
            exercise={exercise}
            code={curCode}
            stdin={curStdin}
            language={curLang}
            onChangeCode={(code) => updateCurrent({ code, ...resetCheckPatch() })}
            onChangeStdin={(codeStdin) => updateCurrent({ codeStdin, ...resetCheckPatch() })}
            onChangeLanguage={(codeLang) => updateCurrent({ codeLang, ...resetCheckPatch() })}
            disabled={lockInputs}
            checked={checked}
            ok={ok}
            readOnly={readOnly}
            variant="tools"
            toolsBound={toolsBoundToThis}
            toolsUnbound={toolsUnbound}
            autoBindMode="never"
            onUseTools={() => {
                codeTools.ensureVisible?.();
                codeTools.requestBind(codeInputId);
            }}
        />
    );
}

// ...rest of ExerciseRenderer unchanged


export default function ExerciseRenderer({
                                             exercise,
                                             current,
                                             busy,
                                             isAssignmentRun,
                                             maxAttempts,
                                             padRef,
                                             updateCurrent,
                                             readOnly = false,

                                             // ✅ NEW (optional): provide correct item (built from expected) during review
                                             reviewCorrectItem = null,

                                             // ✅ NEW (optional): route code_input to Tools panel
                                             codeRunnerMode = "embedded",
                                             codeTools = null,
                                             codeInputId,
                                         }: {
    exercise: Exercise;
    current: QItem;
    busy: boolean;
    isAssignmentRun: boolean;
    maxAttempts: number;
    padRef: React.MutableRefObject<VectorPadState>;
    updateCurrent: (patch: Partial<QItem>) => void;
    readOnly?: boolean;

    reviewCorrectItem?: QItem | null;

    codeRunnerMode?: "embedded" | "tools";
    codeTools?: CodeToolsApi | null;
    codeInputId?: string;
}) {
    const attempts = current.attempts ?? 0;

    // ✅ "any result exists" includes reveal result objects (even when ok=null)
    const hasAnyResult = Boolean(current.submitted || current.result);

    // ✅ only treat ok as graded when boolean (reveal often sets ok=null)
    const ok: boolean | null = typeof current.result?.ok === "boolean" ? current.result.ok : null;

    // ✅ checked for STYLING should mean "graded", not merely "result object exists"
    // (prevents Reveal from forcing red/green states)
    const checked = Boolean(current.submitted || ok !== null);

    const outOfAttempts = isAssignmentRun && attempts >= maxAttempts && ok !== true;

    // lock if readOnly, busy, already correct, or no attempts left
    const lockInputs = readOnly || busy || ok === true || outOfAttempts;

    // when user edits after checking/reveal, clear result/submitted (back to “unchecked” look)
    function resetCheckPatch() {
        if (readOnly) return {}; // ✅ don't mutate in summary/review
        return hasAnyResult ? {submitted: false, result: null} : {};
    }

    // -----------------------------
    // numeric
    // -----------------------------
    if (exercise.kind === "numeric") {
        return (
            <NumericExerciseUI
                exercise={exercise}
                value={current.num}
                onChange={(num) => updateCurrent({num, ...resetCheckPatch()})}
                disabled={lockInputs}
                checked={checked}
                ok={ok}
            />
        );
    }

    // -----------------------------
    // single_choice
    // -----------------------------
    if (exercise.kind === "single_choice") {
        const reviewCorrectId =
            reviewCorrectItem && typeof (reviewCorrectItem as any).single === "string"
                ? String((reviewCorrectItem as any).single)
                : null;

        return (
            <SingleChoiceExerciseUI
                exercise={exercise}
                value={current.single}
                onChange={(id) => updateCurrent({single: id, ...resetCheckPatch()})}
                disabled={lockInputs}
                checked={checked}
                ok={ok}
                reviewCorrectId={reviewCorrectId}
            />
        );
    }

    // -----------------------------
    // multi_choice
    // -----------------------------
    if (exercise.kind === "multi_choice") {
        const reviewCorrectIds =
            reviewCorrectItem && Array.isArray((reviewCorrectItem as any).multi)
                ? (reviewCorrectItem as any).multi.map((x: any) => String(x))
                : null;

        return (
            <MultiChoiceExerciseUI
                exercise={exercise}
                value={current.multi}
                onChange={(ids) => updateCurrent({multi: ids, ...resetCheckPatch()})}
                disabled={lockInputs}
                checked={checked}
                ok={ok}
                reviewCorrectIds={reviewCorrectIds}
            />
        );
    }

    // -----------------------------
    // text_input ✅
    // -----------------------------
    if (exercise.kind === "text_input") {
        const reviewCorrectText =
            reviewCorrectItem && typeof (reviewCorrectItem as any).text === "string"
                ? String((reviewCorrectItem as any).text)
                : null;

        return (
            <TextInputExerciseUI
                exercise={exercise as any}
                value={(current as any).text ?? ""}
                onChange={(text) => updateCurrent({text, ...resetCheckPatch()})}
                disabled={lockInputs}
                checked={checked}
                ok={ok}
                reviewCorrectText={reviewCorrectText}
            />
        );
    }

    // -----------------------------
    // drag_reorder ✅
    // -----------------------------
    if (exercise.kind === "drag_reorder") {
        const curOrder =
            Array.isArray((current as any).reorder)
                ? (current as any).reorder.map(String)
                : Array.isArray((current as any).reorderIds)
                    ? (current as any).reorderIds.map(String) // legacy fallback
                    : [];

        const reviewCorrectTokenIds =
            reviewCorrectItem && Array.isArray((reviewCorrectItem as any).reorder)
                ? (reviewCorrectItem as any).reorder.map((x: any) => String(x))
                : reviewCorrectItem && Array.isArray((reviewCorrectItem as any).reorderIds)
                    ? (reviewCorrectItem as any).reorderIds.map((x: any) => String(x))
                    : null;

        return (
            <DragReorderExerciseUI
                exercise={exercise as any}
                tokenIds={curOrder}
                onChange={(ids) => updateCurrent({ reorder: ids, ...resetCheckPatch() })}
                disabled={lockInputs}
                checked={checked}
                ok={ok}
                reviewCorrectTokenIds={reviewCorrectTokenIds}
            />
        );
    }
    // -----------------------------
    // voice_input ✅
    // -----------------------------
    if (exercise.kind === "voice_input") {
        const reviewCorrectTranscript =
            reviewCorrectItem && typeof (reviewCorrectItem as any).voiceTranscript === "string"
                ? String((reviewCorrectItem as any).voiceTranscript)
                : null;

        return (
            <VoiceInputExerciseUI
                exercise={exercise as any}
                transcript={(current as any).voiceTranscript ?? ""}
                onChangeTranscript={(voiceTranscript) =>
                    updateCurrent({voiceTranscript, ...resetCheckPatch()})
                }
                disabled={lockInputs}
                checked={checked}
                ok={ok}
                reviewCorrectTranscript={reviewCorrectTranscript}
            />
        );
    }

    // -----------------------------
    // matrix_input
    // -----------------------------
    if (exercise.kind === "matrix_input") {
        const exAny = exercise as any;
        const allowResize = true;
        const panelReadOnly = lockInputs;

        return (
            <MatrixInputPanel
                labelLatex={exAny.labelLatex ?? String.raw`\mathbf{A}=`}
                rows={current.matRows}
                cols={current.matCols}
                allowResize={allowResize}
                value={current.mat}
                readOnly={panelReadOnly}
                requiredRows={exAny.rows}
                requiredCols={exAny.cols}
                onShapeChange={(r, c) => {
                    updateCurrent({
                        matRows: r,
                        matCols: c,
                        mat: resizeGrid(current.mat, r, c),
                        ...(hasAnyResult ? {submitted: false, result: null} : {}),
                    });
                }}
                onChange={(next) =>
                    updateCurrent({
                        mat: next,
                        ...(hasAnyResult ? {submitted: false, result: null} : {}),
                    })
                }
            />
        );
    }

    // -----------------------------
    // vector_drag_target
    // -----------------------------
    if (exercise.kind === "vector_drag_target") {
        return (
            <VectorDragTargetExerciseUI
                key={(exercise as any).id ?? (exercise as any).key ?? current.key}
                exercise={exercise}
                a={current.dragA}
                b={current.dragB}
                onChange={(a, b) => updateCurrent({dragA: a, dragB: b, ...resetCheckPatch()})}
                padRef={padRef}
                disabled={lockInputs}
            />
        );
    }

    // -----------------------------
    // vector_drag_dot
    // -----------------------------
    if (exercise.kind === "vector_drag_dot") {
        return (
            <VectorDragDotExerciseUI
                exercise={exercise}
                a={current.dragA}
                onChange={(a) => updateCurrent({dragA: a, ...resetCheckPatch()})}
                padRef={padRef}
                disabled={lockInputs}
            />
        );
    }

    // -----------------------------
// code_input ✅ ToolsPanel support
// -----------------------------
// -----------------------------
// code_input ✅ ToolsPanel support
// -----------------------------
    if (exercise.kind === "code_input") {
        const useTools = codeRunnerMode === "tools" && !!codeTools && !!codeInputId;

        if (useTools) {
            return (
                <CodeInputWithTools
                    exercise={exercise as any}
                    current={current}
                    lockInputs={lockInputs}
                    checked={checked}
                    ok={ok}
                    readOnly={readOnly}
                    resetCheckPatch={resetCheckPatch}
                    codeTools={codeTools!}
                    codeInputId={codeInputId!}
                    updateCurrent={updateCurrent}
                />
            );
        }

        // ✅ embedded fallback (important)
        const curLang = ((current as any).codeLang ?? "python") as Lang;
        const curCode = (current as any).code ?? "";
        const curStdin = (current as any).codeStdin ?? "";

        return (
            <CodeInputExerciseUI
                exercise={exercise as any}
                code={curCode}
                stdin={curStdin}
                language={curLang}
                onChangeCode={(code) => updateCurrent({ code, ...resetCheckPatch() })}
                onChangeStdin={(codeStdin) => updateCurrent({ codeStdin, ...resetCheckPatch() })}
                onChangeLanguage={(codeLang) => updateCurrent({ codeLang, ...resetCheckPatch() })}
                disabled={lockInputs}
                checked={checked}
                ok={ok}
                readOnly={readOnly}
                variant="embedded"
            />
        );
    }
}






