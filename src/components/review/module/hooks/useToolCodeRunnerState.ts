"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeLanguage } from "@/lib/practice/types";
import { useDebouncedCommit } from "@/lib/client/persistence/useDebouncedCommit";
import { useFlushOnPageExit } from "@/lib/client/persistence/useFlushOnPageExit";

type BoundTarget = { id: string; onPatch: (patch: any) => void };
type ToolSnap = { lang: CodeLanguage; code: string; stdin: string };

function snapKey(s: ToolSnap) {
    return `${s.lang}::${s.stdin}::${s.code}`;
}

export function useToolCodeRunnerState(args: {
    progress: any;
    progressHydrated: boolean;
    setProgress: (updater: any) => void;
    viewTid: string;

    toolKey?: string;
    defaultLang?: CodeLanguage;
    defaultCode?: string;
    defaultStdin?: string;

    rightCollapsed: boolean;
    rightW: number;

    toolSaveDelayMs?: number;
}) {
    const {
        progress,
        progressHydrated,
        setProgress,
        viewTid,
        toolKey = "codeRunner",
        defaultLang = "python",
        defaultCode = `print("hello world")`,
        defaultStdin = "",
        rightCollapsed,
        rightW,
        toolSaveDelayMs = 700,
    } = args;

    const versionStr = useMemo(() => {
        const moduleV = (progress as any)?.quizVersion ?? 0;
        const topicV = (progress as any)?.topics?.[viewTid]?.quizVersion ?? 0;
        return `${moduleV}.${topicV}`;
    }, [progress, viewTid]);

    const boundRef = useRef<BoundTarget | null>(null);
    const [boundId, setBoundId] = useState<string | null>(null);
    const boundDirtyRef = useRef(false);

    const isBound = useCallback((id: string) => boundRef.current?.id === id, []);

    const clearBoundState = useCallback(() => {
        boundRef.current = null;
        boundDirtyRef.current = false;
        setBoundId(null);
    }, []);

    const saved = useMemo(() => {
        return (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;
    }, [progress, viewTid, toolKey]);

    const initialLang = (saved?.lang as CodeLanguage) ?? defaultLang;
    const initialCode = typeof saved?.code === "string" ? saved.code : defaultCode;
    const initialStdin = typeof saved?.stdin === "string" ? saved.stdin : defaultStdin;

    const [toolLang, setToolLang0] = useState<CodeLanguage>(initialLang);
    const [toolCode, setToolCode0] = useState<string>(initialCode);
    const [toolStdin, setToolStdin0] = useState<string>(initialStdin);

    const toolSnap = useMemo<ToolSnap>(
        () => ({
            lang: toolLang,
            code: toolCode,
            stdin: toolStdin,
        }),
        [toolLang, toolCode, toolStdin],
    );

    const commitToolToProgress = useCallback(
        async (latest: ToolSnap) => {
            setProgress((p: any) => {
                const tp0: any = p.topics?.[viewTid] ?? {};
                const toolState = { ...(tp0.toolState ?? {}) };

                toolState[toolKey] = {
                    lang: latest.lang,
                    code: latest.code,
                    stdin: latest.stdin,
                };

                return {
                    ...p,
                    topics: {
                        ...(p.topics ?? {}),
                        [viewTid]: { ...tp0, toolState },
                    },
                };
            });
        },
        [setProgress, viewTid, toolKey],
    );

    const { prime, flush, cancel } = useDebouncedCommit({
        value: toolSnap,
        enabled: progressHydrated,
        delayMs: toolSaveDelayMs,
        serialize: snapKey,
        commit: async (latest) => {
            await commitToolToProgress(latest);
        },
    });

    useEffect(() => {
        clearBoundState();
    }, [viewTid, clearBoundState]);

    const lastVersionRef = useRef<string | null>(null);
    useEffect(() => {
        if (!progressHydrated) return;

        if (lastVersionRef.current == null) {
            lastVersionRef.current = versionStr;
            return;
        }

        if (lastVersionRef.current !== versionStr) {
            clearBoundState();
        }

        lastVersionRef.current = versionStr;
    }, [progressHydrated, versionStr, clearBoundState]);

    useEffect(() => {
        if (!progressHydrated) return;
        if (boundRef.current) return;

        const s = (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;

        const nextLang = (s?.lang as CodeLanguage) ?? defaultLang;
        const nextCode = typeof s?.code === "string" ? s.code : defaultCode;
        const nextStdin = typeof s?.stdin === "string" ? s.stdin : defaultStdin;

        setToolLang0(nextLang);
        setToolCode0(nextCode);
        setToolStdin0(nextStdin);

        prime({
            lang: nextLang,
            code: nextCode,
            stdin: nextStdin,
        });
    }, [
        viewTid,
        progressHydrated,
        versionStr,
        toolKey,
        progress,
        defaultLang,
        defaultCode,
        defaultStdin,
        prime,
    ]);

    const bindCodeInput = useCallback(
        (args2: {
            id: string;
            lang: CodeLanguage;
            code: string;
            stdin?: string;
            onPatch: (patch: any) => void;
        }) => {
            const wasSameId = boundRef.current?.id === args2.id;

            boundRef.current = { id: args2.id, onPatch: args2.onPatch };
            setBoundId(args2.id);

            if (wasSameId && boundDirtyRef.current) return;

            boundDirtyRef.current = false;

            const nextSnap: ToolSnap = {
                lang: args2.lang,
                code: typeof args2.code === "string" ? args2.code : "",
                stdin: typeof args2.stdin === "string" ? args2.stdin : "",
            };

            setToolLang0(nextSnap.lang);
            setToolCode0(nextSnap.code);
            setToolStdin0(nextSnap.stdin);

            prime(nextSnap);
        },
        [prime],
    );

    const unbindCodeInput = useCallback(() => {
        cancel();
        clearBoundState();
    }, [cancel, clearBoundState]);

    useFlushOnPageExit(() => {
        cancel();
        void flush();
    }, progressHydrated);

    useEffect(() => {
        return () => {
            cancel();
            void flush();
        };
    }, [cancel, flush]);

    const setToolLang = useCallback((l: CodeLanguage) => {
        setToolLang0(l);

        const b = boundRef.current;
        if (b) {
            boundDirtyRef.current = true;
            b.onPatch({ codeLang: l, submitted: false, result: null });
        }
    }, []);

    const setToolCode = useCallback((c: string) => {
        setToolCode0(c);

        const b = boundRef.current;
        if (b) {
            boundDirtyRef.current = true;
            b.onPatch({ code: c, submitted: false, result: null });
        }
    }, []);

    const setToolStdin = useCallback((s: string) => {
        setToolStdin0(s);

        const b = boundRef.current;
        if (b) {
            boundDirtyRef.current = true;
            b.onPatch({ codeStdin: s, submitted: false, result: null });
        }
    }, []);

    const saveDebounced = useCallback(
        (nextLang: CodeLanguage, nextCode: string, nextStdin?: string) => {
            setToolLang0(nextLang);
            setToolCode0(nextCode);
            setToolStdin0(typeof nextStdin === "string" ? nextStdin : "");
        },
        [],
    );

    const rightBodyRef = useRef<HTMLDivElement | null>(null);
    const [rightBodyH, setRightBodyH] = useState(520);

    useEffect(() => {
        if (rightCollapsed) return;
        const el = rightBodyRef.current;
        if (!el) return;

        const update = () => setRightBodyH(el.clientHeight - 100 || 520);
        update();

        if (typeof ResizeObserver === "undefined") return;

        const ro = new ResizeObserver(() => update());
        ro.observe(el);
        return () => ro.disconnect();
    }, [rightCollapsed, rightW]);

    const codeRunnerRegionH = Math.max(280, rightBodyH);

    return {
        rightBodyRef,
        codeRunnerRegionH,

        toolLang,
        toolCode,
        toolStdin,

        setToolLang,
        setToolCode,
        setToolStdin,

        saveDebounced,
        commitToolNow: flush,

        bindCodeInput,
        unbindCodeInput,
        boundId,
        isBound,
    };
}