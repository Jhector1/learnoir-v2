// src/components/review/module/hooks/useToolCodeRunnerState.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeLanguage } from "@/lib/practice/types";

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

    const timerRef = useRef<number | null>(null);

    const clearPendingSave = useCallback(() => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    const unbindCodeInput = useCallback(() => {
        clearPendingSave();
        boundRef.current = null;
        boundDirtyRef.current = false;
        setBoundId(null);
    }, [clearPendingSave]);

    useEffect(() => {
        unbindCodeInput();
    }, [viewTid, unbindCodeInput]);

    const lastVersionRef = useRef<string | null>(null);
    useEffect(() => {
        if (!progressHydrated) return;

        if (lastVersionRef.current == null) {
            lastVersionRef.current = versionStr;
            return;
        }

        if (lastVersionRef.current !== versionStr) {
            unbindCodeInput();
        }

        lastVersionRef.current = versionStr;
    }, [progressHydrated, versionStr, unbindCodeInput]);

    const saved = useMemo(() => {
        return (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;
    }, [progress, viewTid, toolKey]);

    const initialLang = (saved?.lang as CodeLanguage) ?? defaultLang;

    // Keep empty string if the user intentionally cleared the editor.
    // Only fall back when code is truly missing.
    const initialCode =
        typeof saved?.code === "string" ? saved.code : defaultCode;

    const initialStdin =
        typeof saved?.stdin === "string" ? saved.stdin : defaultStdin;

    const [toolLang, setToolLang0] = useState<CodeLanguage>(initialLang);
    const [toolCode, setToolCode0] = useState<string>(initialCode);
    const [toolStdin, setToolStdin0] = useState<string>(initialStdin);

    const latestRef = useRef<ToolSnap>({
        lang: initialLang,
        code: initialCode,
        stdin: initialStdin,
    });

    useEffect(() => {
        latestRef.current = { lang: toolLang, code: toolCode, stdin: toolStdin };
    }, [toolLang, toolCode, toolStdin]);

    const lastCommittedSnapRef = useRef<string>("");

    useEffect(() => {
        if (!progressHydrated) return;
        if (boundRef.current) return;

        const s = (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;

        const nextLang = (s?.lang as CodeLanguage) ?? defaultLang;

        // Keep "" as a valid saved value.
        const nextCode =
            typeof s?.code === "string" ? s.code : defaultCode;

        const nextStdin =
            typeof s?.stdin === "string" ? s.stdin : defaultStdin;

        setToolLang0(nextLang);
        setToolCode0(nextCode);
        setToolStdin0(nextStdin);

        const snap: ToolSnap = { lang: nextLang, code: nextCode, stdin: nextStdin };
        latestRef.current = snap;
        lastCommittedSnapRef.current = snapKey(snap);
    }, [
        viewTid,
        progressHydrated,
        versionStr,
        toolKey,
        progress,
        defaultLang,
        defaultCode,
        defaultStdin,
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

            const nextLang = args2.lang;
            const nextCode = typeof args2.code === "string" ? args2.code : "";
            const nextStdin = typeof args2.stdin === "string" ? args2.stdin : "";

            setToolLang0(nextLang);
            setToolCode0(nextCode);
            setToolStdin0(nextStdin);

            const snap: ToolSnap = { lang: nextLang, code: nextCode, stdin: nextStdin };
            latestRef.current = snap;
        },
        [],
    );

    const commitToolNow = useCallback(() => {
        if (!progressHydrated) return;

        const latest = latestRef.current;
        const k = snapKey(latest);

        if (k === lastCommittedSnapRef.current) return;
        lastCommittedSnapRef.current = k;

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
    }, [progressHydrated, setProgress, toolKey, viewTid]);

    const saveDebounced = useCallback(
        (nextLang: CodeLanguage, nextCode: string, nextStdin?: string) => {
            if (!progressHydrated) return;

            clearPendingSave();

            timerRef.current = window.setTimeout(() => {
                latestRef.current = {
                    lang: nextLang,
                    code: nextCode,
                    stdin: typeof nextStdin === "string" ? nextStdin : latestRef.current.stdin,
                };
                commitToolNow();
            }, toolSaveDelayMs);
        },
        [progressHydrated, clearPendingSave, commitToolNow, toolSaveDelayMs],
    );

    useEffect(() => {
        return () => {
            clearPendingSave();
            commitToolNow();
        };
    }, [clearPendingSave, commitToolNow]);

    useEffect(() => {
        const onHide = () => {
            clearPendingSave();
            commitToolNow();
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") onHide();
        };

        window.addEventListener("pagehide", onHide);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            window.removeEventListener("pagehide", onHide);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [clearPendingSave, commitToolNow]);

    const setToolLang = useCallback((l: CodeLanguage) => {
        setToolLang0(l);
        latestRef.current = { ...latestRef.current, lang: l };

        const b = boundRef.current;
        if (b) {
            boundDirtyRef.current = true;
            b.onPatch({ codeLang: l, submitted: false, result: null });
        }
    }, []);

    const setToolCode = useCallback((c: string) => {
        setToolCode0(c);
        latestRef.current = { ...latestRef.current, code: c };

        const b = boundRef.current;
        if (b) {
            boundDirtyRef.current = true;
            b.onPatch({ code: c, submitted: false, result: null });
        }
    }, []);

    const setToolStdin = useCallback((s: string) => {
        setToolStdin0(s);
        latestRef.current = { ...latestRef.current, stdin: s };

        const b = boundRef.current;
        if (b) {
            boundDirtyRef.current = true;
            b.onPatch({ codeStdin: s, submitted: false, result: null });
        }
    }, []);

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
        commitToolNow,

        bindCodeInput,
        unbindCodeInput,
        boundId,
        isBound,
    };
}