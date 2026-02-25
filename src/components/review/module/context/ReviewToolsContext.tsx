// src/components/review/module/context/ReviewToolsContext.tsx
"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {CodeLanguage} from "@/lib/practice/types";


export type RegisterArgs = {
    lang: CodeLanguage;
    code: string;
    stdin?: string;
    onPatch: (patch: any) => void;
};

export type CodeInputMeta = {
    /** Global ordering across the page (smaller = earlier). */
    order: number;
    /** If false, skip for binding (locked/unavailable). */
    eligible: boolean;
    /** If true, skip for binding (answered/flow-complete). */
    done: boolean;
};

export type ReviewToolsValue = {
    registerCodeInput: (id: string, args: RegisterArgs) => void;
    unregisterCodeInput: (id: string) => void;

    /**
     * Deterministic: Tools always binds to the first unanswered eligible code_input.
     * requestBind / requestBindNext are kept for compatibility, but they reconcile to that rule.
     */
    requestBind: (id: string) => void;
    requestBindNext: (afterId: string) => void;
    unbindCodeInput: () => void;

    /** NEW: QuizPracticeCard reports ordering + completion/unlock status */
    setCodeInputMeta: (id: string, meta: Partial<CodeInputMeta>) => void;

    boundId: string | null;
    isBound: (id: string) => boolean;

    ensureVisible?: () => void;
};

const Ctx = createContext<ReviewToolsValue | null>(null);

function defer(fn: () => void) {
    if (typeof queueMicrotask === "function") queueMicrotask(fn);
    else Promise.resolve().then(fn);
}

export function ReviewToolsProvider({
                                        children,
                                        ensureVisible,
                                        onBindToToolsPanel,
                                        onUnbindFromToolsPanel,

                                        externalBoundId,

                                        /**
                                         * "first_unanswered" = deterministic mode required by your spec
                                         * "first_registered" = legacy fallback
                                         */
                                        mode = "first_unanswered",

                                        resetKey,
                                    }: {
    children: React.ReactNode;
    ensureVisible?: () => void;

    onBindToToolsPanel: (args: { id: string } & RegisterArgs) => void;
    onUnbindFromToolsPanel?: () => void;

    externalBoundId?: string | null;

    mode?: "first_unanswered" | "first_registered";
    resetKey?: string;
}) {
    const registryRef = useRef(new Map<string, RegisterArgs>());
    const orderRef = useRef<string[]>([]);
    const metaRef = useRef(new Map<string, CodeInputMeta>());

    const [boundId, setBoundId] = useState<string | null>(externalBoundId ?? null);
    const [requestedId, setRequestedId] = useState<string | null>(null);

    const [registryTick, setRegistryTick] = useState(0);
    const [metaTick, setMetaTick] = useState(0);

    // (optional) avoid strict-mode unbind flicker
    const unbindTimersRef = useRef(new Map<string, number>());

    const clearUnbindTimer = useCallback((id: string) => {
        const t = unbindTimersRef.current.get(id);
        if (t) window.clearTimeout(t);
        unbindTimersRef.current.delete(id);
    }, []);
    useEffect(() => {
        return () => {
            for (const t of unbindTimersRef.current.values()) window.clearTimeout(t);
            unbindTimersRef.current.clear();
        };
    }, []);
    // ✅ reset registry/order/meta (topic switch / reset)
    const lastResetRef = useRef<string | null>(null);
    useEffect(() => {
        if (!resetKey) return;

        if (lastResetRef.current == null) {
            lastResetRef.current = resetKey;
            return;
        }

        if (lastResetRef.current !== resetKey) {
            registryRef.current.clear();
            orderRef.current = [];
            metaRef.current.clear();
            // setBoundId(null); // ✅ always clear locally

            onUnbindFromToolsPanel?.();  // ✅ clears externalBoundId too


            setRequestedId(null);
            setBoundId(externalBoundId ?? null);

            setRegistryTick((x) => x + 1);
            setMetaTick((x) => x + 1);
        }

        lastResetRef.current = resetKey;
    }, [resetKey, externalBoundId, onUnbindFromToolsPanel]);

    // ✅ keep provider boundId consistent with external tool state
    useEffect(() => {
        if (externalBoundId === undefined) return;
        const next = externalBoundId ?? null;

        setBoundId((cur) => (cur === next ? cur : next));

        if (next == null) {
            setRequestedId(null);
        }
    }, [externalBoundId]);

    const unbindCodeInput = useCallback(() => {
        setBoundId(null);
        setRequestedId(null);
        onUnbindFromToolsPanel?.();
    }, [onUnbindFromToolsPanel]);

    const isBound = useCallback(
        (id: string) => (externalBoundId ?? boundId) === id,
        [externalBoundId, boundId],
    );

    const bindNow = useCallback(
        (id: string) => {
            const snap = registryRef.current.get(id);
            if (!snap) {
                setRequestedId(id); // wait until register
                return;
            }

            ensureVisible?.();
            onBindToToolsPanel({ id, ...snap });
            setBoundId(id);
            setRequestedId(null);
        },
        [ensureVisible, onBindToToolsPanel],
    );

    const pickFirstUnanswered = useCallback((): string | null => {
        // choose min(meta.order) among eligible && !done
        let bestId: string | null = null;
        let bestOrder = Number.POSITIVE_INFINITY;

        for (const [id, m] of metaRef.current.entries()) {
            if (!m) continue;
            if (!m.eligible) continue;
            if (m.done) continue;
            const ord = Number.isFinite(m.order) ? m.order : Number.POSITIVE_INFINITY;

            if (ord < bestOrder) {
                bestOrder = ord;
                bestId = id;
            } else if (ord === bestOrder && bestId != null) {
                // deterministic tie-breaker
                if (id < bestId) bestId = id;
            }
        }
        return bestId;
    }, []);

    const pickFirstRegistered = useCallback((): string | null => {
        const first = orderRef.current.find((id) => registryRef.current.has(id));
        return first ?? null;
    }, []);

    const reconcileBinding = useCallback(() => {
        const effectiveBound = (externalBoundId ?? boundId) ?? null;

        let desired: string | null = null;

        if (mode === "first_unanswered") {
            desired = pickFirstUnanswered();
        } else {
            desired = pickFirstRegistered();
        }

        if (!desired) {
            // If there's nothing to do, unbind to be deterministic.
            if (effectiveBound != null) unbindCodeInput();
            return;
        }

        if (effectiveBound === desired) return;

        defer(() => bindNow(desired!));
    }, [
        externalBoundId,
        boundId,
        mode,
        pickFirstUnanswered,
        pickFirstRegistered,
        unbindCodeInput,
        bindNow,
    ]);

    // ✅ main reconciliation loop (deterministic)
    useEffect(() => {
        reconcileBinding();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registryTick, metaTick, mode]);

    // kept for compatibility, but deterministic behavior overrides target
    const requestBind = useCallback(
        (_id: string) => {
            reconcileBinding();
        },
        [reconcileBinding],
    );
    useEffect(() => {
        reconcileBinding();
    }, [reconcileBinding, externalBoundId]);
    // kept for compatibility, but deterministic behavior overrides target
    const requestBindNext = useCallback(
        (_afterId: string) => {
            reconcileBinding();
        },
        [reconcileBinding],
    );

    const setCodeInputMeta = useCallback((id: string, patch: Partial<CodeInputMeta>) => {
        const cur = metaRef.current.get(id);
        const next: CodeInputMeta = {
            order: patch.order ?? cur?.order ?? Number.POSITIVE_INFINITY,
            eligible: patch.eligible ?? cur?.eligible ?? false,
            done: patch.done ?? cur?.done ?? false,
        };

        // avoid infinite ticks for identical writes
        const same =
            cur &&
            cur.order === next.order &&
            cur.eligible === next.eligible &&
            cur.done === next.done;

        metaRef.current.set(id, next);
        if (!same) setMetaTick((x) => x + 1);
    }, []);

    const registerCodeInput = useCallback(
        (id: string, args: RegisterArgs) => {
            clearUnbindTimer(id);

            const had = registryRef.current.has(id);
            if (!orderRef.current.includes(id)) orderRef.current.push(id);

            registryRef.current.set(id, args);

            if (!had) setRegistryTick((x) => x + 1);

            // if someone requested this id before it registered
            if (requestedId === id) {
                defer(() => bindNow(id));
                return;
            }

            // if currently bound to this id, refresh ToolsPanel snapshot
            const curBound = (externalBoundId ?? boundId) ?? null;
            if (curBound === id) {
                defer(() => onBindToToolsPanel({ id, ...args }));
            }
        },
        [
            clearUnbindTimer,
            requestedId,
            bindNow,
            externalBoundId,
            boundId,
            onBindToToolsPanel,
        ],
    );

    const unregisterCodeInput = useCallback(
        (id: string) => {
            registryRef.current.delete(id);
            metaRef.current.delete(id); // ✅ important: remove from first-unanswered selection
            setRegistryTick((x) => x + 1);
            setMetaTick((x) => x + 1);

            // keep order stable; do NOT remove from orderRef

            // deferred unbind (strict mode)
            const t = window.setTimeout(() => {
                unbindTimersRef.current.delete(id);

                const effectiveBound = (externalBoundId ?? boundId) ?? null;
                if (effectiveBound === id && !registryRef.current.has(id)) {
                    unbindCodeInput();
                }
            }, 0);

            unbindTimersRef.current.set(id, t);

            if (requestedId === id) setRequestedId(null);
        },
        [externalBoundId, boundId, requestedId, unbindCodeInput],
    );

    const value = useMemo<ReviewToolsValue>(
        () => ({
            registerCodeInput,
            unregisterCodeInput,
            requestBind,
            requestBindNext,
            unbindCodeInput,

            setCodeInputMeta,

            boundId: (externalBoundId ?? boundId) ?? null,
            isBound,
            ensureVisible,
        }),
        [
            registerCodeInput,
            unregisterCodeInput,
            requestBind,
            requestBindNext,
            unbindCodeInput,
            setCodeInputMeta,
            externalBoundId,
            boundId,
            isBound,
            ensureVisible,
        ],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReviewTools() {
    return useContext(Ctx);
}