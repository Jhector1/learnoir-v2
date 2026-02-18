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
import type { Lang } from "@/lib/code/runCode";

export type RegisterArgs = {
    lang: Lang;
    code: string;
    stdin?: string;
    onPatch: (patch: any) => void;
};

export type ReviewToolsValue = {
    registerCodeInput: (id: string, args: RegisterArgs) => void;
    unregisterCodeInput: (id: string) => void;

    requestBind: (id: string) => void;
    requestBindNext: (afterId: string) => void;
    unbindCodeInput: () => void;

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
                                        autoBindFirst = true,
                                        resetKey,
                                    }: {
    children: React.ReactNode;
    ensureVisible?: () => void;

    onBindToToolsPanel: (args: { id: string } & RegisterArgs) => void;
    onUnbindFromToolsPanel?: () => void;

    externalBoundId?: string | null;
    autoBindFirst?: boolean;
    resetKey?: string;
}) {
    const registryRef = useRef(new Map<string, RegisterArgs>());
    const orderRef = useRef<string[]>([]);
    const pendingNextAfterRef = useRef<string | null>(null);

    const [boundId, setBoundId] = useState<string | null>(externalBoundId ?? null);
    const [requestedId, setRequestedId] = useState<string | null>(null);

    // ✅ CRITICAL: triggers autoBindFirst after first register (refresh-safe)
    const [registryTick, setRegistryTick] = useState(0);

    // (optional) avoid strict-mode unbind flicker
    const unbindTimersRef = useRef(new Map<string, number>());

    const clearUnbindTimer = useCallback((id: string) => {
        const t = unbindTimersRef.current.get(id);
        if (t) window.clearTimeout(t);
        unbindTimersRef.current.delete(id);
    }, []);

    // ✅ reset registry/order (topic switch / reset)
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
            pendingNextAfterRef.current = null;

            setRequestedId(null);
            setBoundId(externalBoundId ?? null);

            // bump to re-run autoBindFirst if needed
            setRegistryTick((x) => x + 1);
        }

        lastResetRef.current = resetKey;
    }, [resetKey, externalBoundId]);

    // ✅ keep provider boundId consistent with external tool state
    useEffect(() => {
        if (externalBoundId === undefined) return;
        const next = externalBoundId ?? null;

        setBoundId((cur) => (cur === next ? cur : next));

        if (next == null) {
            setRequestedId(null);
            pendingNextAfterRef.current = null;
        }
    }, [externalBoundId]);

    const bindNow = useCallback(
        (id: string) => {
            const snap = registryRef.current.get(id);
            if (!snap) {
                setRequestedId(id); // wait until register
                return;
            }

            pendingNextAfterRef.current = null;

            ensureVisible?.();
            onBindToToolsPanel({ id, ...snap });
            setBoundId(id);
            setRequestedId(null);
        },
        [ensureVisible, onBindToToolsPanel],
    );

    const requestBind = useCallback(
        (id: string) => {
            pendingNextAfterRef.current = null;
            setRequestedId(id);
            bindNow(id);
        },
        [bindNow],
    );

    const findNextRegistered = useCallback((afterId: string) => {
        const order = orderRef.current;
        const start = order.indexOf(afterId);
        if (start < 0) return null;

        for (let j = start + 1; j < order.length; j++) {
            const id = order[j];
            if (registryRef.current.has(id)) return id;
        }
        return null;
    }, []);

    const requestBindNext = useCallback(
        (afterId: string) => {
            const nextId = findNextRegistered(afterId);
            if (nextId) {
                requestBind(nextId);
                return;
            }
            pendingNextAfterRef.current = afterId;
        },
        [findNextRegistered, requestBind],
    );

    const unbindCodeInput = useCallback(() => {
        setBoundId(null);
        setRequestedId(null);
        pendingNextAfterRef.current = null;
        onUnbindFromToolsPanel?.();
    }, [onUnbindFromToolsPanel]);

    const registerCodeInput = useCallback(
        (id: string, args: RegisterArgs) => {
            clearUnbindTimer(id);

            const had = registryRef.current.has(id);
            if (!orderRef.current.includes(id)) orderRef.current.push(id);
            registryRef.current.set(id, args);

            // ✅ bump tick only when first time seen OR was missing before
            if (!had) setRegistryTick((x) => x + 1);

            if (requestedId === id) {
                defer(() => bindNow(id));
                return;
            }

            const after = pendingNextAfterRef.current;
            if (after) {
                const nextId = findNextRegistered(after);
                if (nextId) {
                    pendingNextAfterRef.current = null;
                    defer(() => requestBind(nextId));
                    return;
                }
            }

            const curBound = (externalBoundId ?? boundId) ?? null;
            if (curBound === id) {
                defer(() => onBindToToolsPanel({ id, ...args }));
            }
        },
        [
            clearUnbindTimer,
            requestedId,
            bindNow,
            findNextRegistered,
            requestBind,
            externalBoundId,
            boundId,
            onBindToToolsPanel,
        ],
    );

    const unregisterCodeInput = useCallback(
        (id: string) => {
            registryRef.current.delete(id);
            setRegistryTick((x) => x + 1); // ✅ bump so autoBindFirst can pick another

            // keep order stable; do NOT remove from orderRef

            // ✅ deferred unbind: avoids StrictMode dev "fake unmount" flicker
            const t = window.setTimeout(() => {
                unbindTimersRef.current.delete(id);

                const effectiveBound = (externalBoundId ?? boundId) ?? null;
                if (effectiveBound === id && !registryRef.current.has(id)) {
                    setBoundId(null);
                    setRequestedId(null);
                    pendingNextAfterRef.current = null;
                    onUnbindFromToolsPanel?.();
                }
            }, 0);

            unbindTimersRef.current.set(id, t);

            if (requestedId === id) setRequestedId(null);
            if (pendingNextAfterRef.current === id) pendingNextAfterRef.current = null;
        },
        [externalBoundId, boundId, requestedId, onUnbindFromToolsPanel],
    );

    const isBound = useCallback(
        (id: string) => (externalBoundId ?? boundId) === id,
        [externalBoundId, boundId],
    );

    // ✅ Auto-bind first registered id (NOW refresh-safe)
    useEffect(() => {
        if (!autoBindFirst) return;

        const effectiveBound = (externalBoundId ?? boundId) ?? null;
        if (effectiveBound) return;
        if (requestedId) return;

        const first = orderRef.current.find((id) => registryRef.current.has(id));
        if (!first) return;

        defer(() => requestBind(first));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoBindFirst, externalBoundId, boundId, requestedId, registryTick]);

    const value = useMemo<ReviewToolsValue>(
        () => ({
            registerCodeInput,
            unregisterCodeInput,
            requestBind,
            requestBindNext,
            unbindCodeInput,
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
