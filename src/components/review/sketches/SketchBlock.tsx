// src/components/review/sketches/SketchBlock.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import type { SavedSketchState } from "./types";
import type { SketchEntry } from "./registryTypes";
import type { SketchSpec } from "./specTypes";

import { getSketchEntry } from "./registry";
import { defaultStateForSpec } from "./defaults";
import { migrateSketchState } from "./migrate";
import { useDebouncedEmit } from "./_shared/useDebouncedEmit";
import { cn, SKETCH_BTN, SKETCH_BTN_PRIMARY } from "./_shared/sketchUi";
import { SketchShell } from "./_shared/shells";
import SketchRenderer from "./SketchRenderer";

function mergeSpec(base: SketchSpec, patch?: Record<string, unknown>): SketchSpec {
    if (!patch) return base;
    return { ...(base as any), ...(patch as any) } as SketchSpec;
}

export default function SketchBlock(props: {
    cardId: string;
    title?: string;
    sketchId: string;
    height?: number;
    propsPatch?: Record<string, unknown>;

    initialState?: SavedSketchState | null;
    onStateChange?: (s: SavedSketchState) => void;

    done?: boolean;
    onMarkDone?: () => void;

    prereqsMet?: boolean;
    locked?: boolean;
}) {
    const {
        cardId,
        title,
        sketchId,
        height,
        propsPatch,
        initialState,
        onStateChange,
        done = false,
        onMarkDone,
        prereqsMet = true,
        locked = false,
    } = props;

    const entry: SketchEntry | null = useMemo(() => getSketchEntry(sketchId), [sketchId]);
    const [confirmReset, setConfirmReset] = useState(false);

    const resolved = useMemo(() => {
        if (!entry) return null;

        if (entry.kind === "custom") {
            const s0 = initialState ?? entry.defaultState ?? null;
            return { entry, spec: null as any, state: s0 };
        }

        const spec = mergeSpec(entry.spec, propsPatch);
        const base0 = initialState ?? entry.defaultState ?? defaultStateForSpec(spec);
        const migrated = migrateSketchState(spec, base0);
        return { entry, spec, state: migrated };
    }, [entry, initialState, propsPatch]);

    const [state, setState] = useState<SavedSketchState | null>(() => resolved?.state ?? null);

    // keep state in sync when switching cards/sketches
    React.useEffect(() => {
        setState(resolved?.state ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardId, sketchId]);

    const emit = useCallback((s: SavedSketchState) => onStateChange?.(s), [onStateChange]);
    useDebouncedEmit(state, (s) => s && emit(s), { enabled: Boolean(onStateChange), delayMs: 350 });

    const readOnly = locked || !prereqsMet;

    if (!entry) {
        return (
            <div className="ui-soft p-3 text-xs font-extrabold text-neutral-700 dark:text-white/70">
                Unknown sketchId: <span className="font-mono">{sketchId}</span>
            </div>
        );
    }

    const footer = (
        <div className="flex flex-wrap items-center justify-between gap-2">
            {!prereqsMet ? (
                <div className="ui-sketch-muted font-extrabold">
                    Finish “Mark as read” items in this topic first.
                </div>
            ) : locked ? (
                <div className="ui-sketch-muted font-extrabold">Locked.</div>
            ) : (
                <div className="ui-sketch-muted font-extrabold">Progress saves automatically.</div>
            )}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={SKETCH_BTN}
                    onClick={() => setConfirmReset(true)}
                    disabled={readOnly}
                >
                    Reset
                </button>

                {onMarkDone ? (
                    <button
                        type="button"
                        className={cn(SKETCH_BTN_PRIMARY, done && "opacity-70")}
                        onClick={onMarkDone}
                        disabled={!prereqsMet}
                        title="Mark this learning card as read"
                    >
                        {done ? "✓ Marked as read" : "Mark as read"}
                    </button>
                ) : null}
            </div>
        </div>
    );

    // ✅ CUSTOM
    if (entry.kind === "custom") {
        const Comp = entry.Component;

        return (
            <>
                <SketchShell
                    title={title}
                    height={height}
                    left={
                        <Comp
                            value={state}
                            onChange={(next) => {
                                setState(next);
                                onStateChange?.(next); // immediate prime
                            }}
                            readOnly={readOnly}
                            height={height}
                            title={title}
                        />
                    }
                    footer={footer}
                />

                <ConfirmDialog
                    open={confirmReset}
                    onOpenChange={setConfirmReset}
                    danger
                    title="Reset this sketch?"
                    confirmLabel="Reset"
                    description={
                        <div className="grid gap-2">
                            <div>This will clear your inputs for this card.</div>
                            <div className="ui-sketch-muted font-extrabold">This can’t be undone.</div>
                        </div>
                    }
                    onConfirm={() => {
                        const fresh = initialState ?? entry.defaultState ?? null;
                        if (fresh) {
                            setState(fresh);
                            onStateChange?.(fresh);
                        } else {
                            setState({ version: 1, updatedAt: new Date().toISOString(), data: {} });
                        }
                    }}
                />
            </>
        );
    }

    // ✅ ARCHETYPE
    const spec: SketchSpec = resolved?.spec;
    const s: SavedSketchState = state ?? defaultStateForSpec(spec);

    return (
        <>
            <SketchShell
                title={title ?? spec.title}
                subtitle={spec.subtitle}
                tone={spec.tone}
                height={height}
                rightMarkdown={spec.hudMarkdown}
                left={
                    <SketchRenderer
                        spec={spec}
                        value={s}
                        onChange={(next) => {
                            setState(next);
                            onStateChange?.(next); // immediate prime
                        }}
                        readOnly={readOnly}
                    />
                }
                footer={footer}
            />

            <ConfirmDialog
                open={confirmReset}
                onOpenChange={setConfirmReset}
                danger
                title="Reset this sketch?"
                confirmLabel="Reset"
                description={
                    <div className="grid gap-2">
                        <div>This will clear your inputs for this card.</div>
                        <div className="ui-sketch-muted font-extrabold">This can’t be undone.</div>
                    </div>
                }
                onConfirm={() => {
                    const fresh = defaultStateForSpec(spec);
                    setState(fresh);
                    onStateChange?.(fresh);
                }}
            />
        </>
    );
}



// "use client";
//
// import React, { useCallback, useMemo, useState } from "react";
// import ConfirmDialog from "@/components/ui/ConfirmDialog";
//
// import type { SavedSketchState } from "./types";
// import type { SketchEntry } from "./registryTypes";
// import type { SketchSpec } from "./specTypes";
//
// import { getSketchEntry } from "./registry";
// import { defaultStateForSpec } from "./defaults";
// import { migrateSketchState } from "./migrate";
// import { useDebouncedEmit } from "./_shared/useDebouncedEmit";
// import { cn, SKETCH_BTN, SKETCH_BTN_PRIMARY } from "./_shared/sketchUi";
// import { SketchShell } from "./_shared/shells";
// import SketchRenderer from "./SketchRenderer";
//
// function mergeSpec(base: SketchSpec, patch?: Record<string, unknown>): SketchSpec {
//     if (!patch) return base;
//     // shallow merge only (safe + predictable)
//     return { ...(base as any), ...(patch as any) } as SketchSpec;
// }
//
// export default function SketchBlock({
//                                         cardId,
//                                         title,
//                                         sketchId,
//                                         height,
//                                         propsPatch,
//
//                                         // state
//                                         initialState,
//                                         onStateChange,
//
//                                         // optional “mark as read” integration
//                                         done = false,
//                                         onMarkDone,
//
//                                         prereqsMet = true,
//                                         locked = false,
//                                     }: {
//     cardId: string;
//     title?: string;
//     sketchId: string;
//     height?: number;
//     propsPatch?: Record<string, unknown>;
//
//     initialState?: SavedSketchState | null;
//     onStateChange?: (s: SavedSketchState) => void;
//
//     done?: boolean;
//     onMarkDone?: () => void;
//
//     prereqsMet?: boolean;
//     locked?: boolean;
// }) {
//     const entry: SketchEntry | null = useMemo(() => getSketchEntry(sketchId), [sketchId]);
//
//     const [confirmReset, setConfirmReset] = useState(false);
//
//     const resolved = useMemo(() => {
//         if (!entry) return null;
//
//         if (entry.kind === "custom") {
//             const s0 = initialState ?? entry.defaultState ?? null;
//             return { entry, spec: null as any, state: s0 };
//         }
//
//         const spec = mergeSpec(entry.spec, propsPatch);
//         const base0 = initialState ?? entry.defaultState ?? defaultStateForSpec(spec);
//         const migrated = migrateSketchState(spec, base0);
//         return { entry, spec, state: migrated ?? defaultStateForSpec(spec) };
//     }, [entry, initialState, propsPatch]);
//
//     const [state, setState] = useState<SavedSketchState | null>(() => resolved?.state ?? null);
//
//     // keep state in sync when switching cards/sketches
//     React.useEffect(() => {
//         setState(resolved?.state ?? null);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [cardId, sketchId]);
//
//     const emit = useCallback((s: SavedSketchState) => onStateChange?.(s), [onStateChange]);
//     useDebouncedEmit(state, (s) => s && emit(s), { enabled: Boolean(onStateChange), delayMs: 350 });
//
//     const readOnly = locked || !prereqsMet;
//
//     function applyPatch(nextData: unknown, specVersion?: number) {
//         const next: SavedSketchState = {
//             version: specVersion ?? (state?.version ?? 0),
//             updatedAt: new Date().toISOString(),
//             data: nextData,
//         };
//         setState(next);
//         onStateChange?.(next); // immediate prime (nice UX)
//     }
//
//     if (!entry) {
//         return (
//             <div className="mt-2 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-xs font-extrabold text-rose-700 dark:text-rose-200/90">
//                 Unknown sketchId: <span className="font-mono">{sketchId}</span>
//             </div>
//         );
//     }
//
//     // Custom sketch: still inside same shell contract
//     if (entry.kind === "custom") {
//         const Comp = entry.Component;
//         return (
//             <SketchShell title={title} height={height} left={
//                 <Comp
//                     spec={null}
//                     value={state}
//                     onChange={(s) => setState(s)}
//                     readOnly={readOnly}
//                     height={height}
//                     title={title}
//                 />
//             } />
//         );
//     }
//
//     const spec: SketchSpec = resolved?.spec;
//     const s: SavedSketchState = state ?? defaultStateForSpec(spec);
//
//     return (
//         <>
//             <SketchShell
//                 title={title ?? spec.title}
//                 subtitle={spec.subtitle}
//                 tone={spec.tone}
//                 height={height}
//                 rightMarkdown={spec.hudMarkdown}
//                 left={
//                     <SketchRenderer
//                         spec={spec}
//                         value={s}
//                         onChange={(next) => setState(next)}
//                         readOnly={readOnly}
//                     />
//                 }
//                 footer={
//                     <div className="flex flex-wrap items-center justify-between gap-2">
//                         {!prereqsMet ? (
//                             <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
//                                 Finish “Mark as read” items in this topic first.
//                             </div>
//                         ) : locked ? (
//                             <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
//                                 Locked.
//                             </div>
//                         ) : (
//                             <div className="text-xs font-extrabold text-neutral-500 dark:text-white/50">
//                                 Progress saves automatically.
//                             </div>
//                         )}
//
//                         <div className="flex items-center gap-2">
//                             <button type="button" className={SKETCH_BTN} onClick={() => setConfirmReset(true)} disabled={readOnly}>
//                                 Reset
//                             </button>
//
//                             {onMarkDone ? (
//                                 <button
//                                     type="button"
//                                     className={cn(SKETCH_BTN_PRIMARY, done && "opacity-70")}
//                                     onClick={onMarkDone}
//                                     disabled={!prereqsMet}
//                                     title="Mark this learning card as read"
//                                 >
//                                     {done ? "✓ Marked as read" : "Mark as read"}
//                                 </button>
//                             ) : null}
//                         </div>
//                     </div>
//                 }
//             />
//
//             <ConfirmDialog
//                 open={confirmReset}
//                 onOpenChange={setConfirmReset}
//                 danger
//                 title="Reset this sketch?"
//                 confirmLabel="Reset"
//                 description={
//                     <div className="grid gap-2">
//                         <div>This will clear your inputs for this card.</div>
//                         <div className="text-xs font-extrabold text-neutral-500 dark:text-white/60">
//                             This can’t be undone.
//                         </div>
//                     </div>
//                 }
//                 onConfirm={() => {
//                     const fresh = defaultStateForSpec(spec);
//                     setState(fresh);
//                     onStateChange?.(fresh);
//                 }}
//             />
//         </>
//     );
// }
