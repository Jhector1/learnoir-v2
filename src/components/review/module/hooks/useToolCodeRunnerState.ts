// src/components/review/module/hooks/useToolCodeRunnerState.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/code/runCode";

type BoundTarget = { id: string; onPatch: (patch: any) => void };

export function useToolCodeRunnerState(args: {
    progress: any;
    progressHydrated: boolean;
    setProgress: (updater: any) => void;
    viewTid: string;

    toolKey?: string;
    defaultLang?: Lang;
    defaultCode?: string;
    defaultStdin?: string;

    rightCollapsed: boolean;
    rightW: number;
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
    } = args;

    // ✅ version string must exist BEFORE effects that use it
    const versionStr = useMemo(() => {
        const moduleV = (progress as any)?.quizVersion ?? 0;
        const topicV = (progress as any)?.topics?.[viewTid]?.quizVersion ?? 0;
        return `${moduleV}.${topicV}`;
    }, [progress, viewTid]);

    // -----------------------------
    // Binding state (code_input question)
    // -----------------------------
    const boundRef = useRef<BoundTarget | null>(null);
    const [boundId, setBoundId] = useState<string | null>(null);

    const boundDirtyRef = useRef(false);

    // ✅ debounced save timer (needs to be cleared on reset)
    const timerRef = useRef<number | null>(null);

    const isBound = useCallback((id: string) => boundRef.current?.id === id, []);

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

    // clear binding when topic changes (prevents patching a stale question)
    useEffect(() => {
        unbindCodeInput();
    }, [viewTid, unbindCodeInput]);

    // ✅ ALSO clear binding when reset bumps quizVersion (module or topic reset)
    const lastVersionRef = useRef<string | null>(null);
    useEffect(() => {
        if (!progressHydrated) return;

        if (lastVersionRef.current == null) {
            lastVersionRef.current = versionStr;
            return;
        }

        if (lastVersionRef.current !== versionStr) {
            unbindCodeInput(); // allows restore to apply fresh snapshot/default
        }

        lastVersionRef.current = versionStr;
    }, [progressHydrated, versionStr, unbindCodeInput]);

    // -----------------------------
    // Load saved tool state (per topic) – only when NOT bound
    // -----------------------------
    const saved = useMemo(() => {
        return (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;
    }, [progress, viewTid, toolKey]);

    const initialLang = (saved?.lang as Lang) ?? defaultLang;
    const initialCode =
        typeof saved?.code === "string" && saved.code.trim().length ? saved.code : defaultCode;
    const initialStdin = typeof saved?.stdin === "string" ? saved.stdin : defaultStdin;

    const [toolLang, setToolLang0] = useState<Lang>(initialLang);
    const [toolCode, setToolCode0] = useState<string>(initialCode);
    const [toolStdin, setToolStdin0] = useState<string>(initialStdin);

    const latestRef = useRef<{ lang: Lang; code: string; stdin: string }>({
        lang: initialLang,
        code: initialCode,
        stdin: initialStdin,
    });

    useEffect(() => {
        latestRef.current = { lang: toolLang, code: toolCode, stdin: toolStdin };
    }, [toolLang, toolCode, toolStdin]);

    // restore saved tool state when topic/version changes AND NOT bound
    useEffect(() => {
        if (!progressHydrated) return;
        if (boundRef.current) return;

        const s = (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;
        const nextLang = (s?.lang as Lang) ?? defaultLang;
        const nextCode = typeof s?.code === "string" && s.code.trim().length ? s.code : defaultCode;
        const nextStdin = typeof s?.stdin === "string" ? s.stdin : defaultStdin;

        setToolLang0(nextLang);
        setToolCode0(nextCode);
        setToolStdin0(nextStdin);
        latestRef.current = { lang: nextLang, code: nextCode, stdin: nextStdin };
    }, [viewTid, progressHydrated, versionStr, toolKey, progress, defaultLang, defaultCode, defaultStdin]);

    // -----------------------------
    // Bind a specific code_input question into the Tools panel
    // -----------------------------
    const bindCodeInput = useCallback((args2: {
        id: string;
        lang: Lang;
        code: string;
        stdin?: string;
        onPatch: (patch: any) => void;
    }) => {
        const wasSameId = boundRef.current?.id === args2.id;

        boundRef.current = { id: args2.id, onPatch: args2.onPatch };
        setBoundId(args2.id);

        // if same id and user already edited Tools, do NOT overwrite editor
        if (wasSameId && boundDirtyRef.current) return;

        boundDirtyRef.current = false;

        const nextLang = args2.lang;
        const nextCode = args2.code ?? "";
        const nextStdin = typeof args2.stdin === "string" ? args2.stdin : "";

        setToolLang0(nextLang);
        setToolCode0(nextCode);
        setToolStdin0(nextStdin);

        latestRef.current = { lang: nextLang, code: nextCode, stdin: nextStdin };
    }, []);

    // -----------------------------
    // Commit tool state into progress (for persistence)
    // -----------------------------
    const commitToolNow = useCallback(() => {
        if (!progressHydrated) return;
        const latest = latestRef.current;

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
        (nextLang: Lang, nextCode: string, nextStdin?: string) => {
            if (!progressHydrated) return;
            clearPendingSave();

            timerRef.current = window.setTimeout(() => {
                latestRef.current = {
                    lang: nextLang,
                    code: nextCode,
                    stdin: typeof nextStdin === "string" ? nextStdin : latestRef.current.stdin,
                };
                commitToolNow();
            }, 600);
        },
        [progressHydrated, commitToolNow, clearPendingSave],
    );

    useEffect(() => {
        return () => {
            clearPendingSave();
            commitToolNow();
        };
    }, [clearPendingSave, commitToolNow]);

    useEffect(() => {
        const onHide = () => commitToolNow();
        window.addEventListener("pagehide", onHide);
        return () => window.removeEventListener("pagehide", onHide);
    }, [commitToolNow]);

    // -----------------------------
    // When tool changes AND bound -> patch question + reset checked state
    // -----------------------------
    const setToolLang = useCallback((l: Lang) => {
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

    // -----------------------------
    // Measure available height for CodeRunner
    // -----------------------------
    const rightBodyRef = useRef<HTMLDivElement | null>(null);
    const [rightBodyH, setRightBodyH] = useState(520);
// ...your existing file

// ✅ Commit tool state when leaving a topic (prevents losing last 600ms edits)
    useEffect(() => {
        return () => {
            clearPendingSave();
            commitToolNow();
        };
    }, [viewTid, clearPendingSave, commitToolNow]);

// keep the rest as-is

    useEffect(() => {
        if (rightCollapsed) return;
        const el = rightBodyRef.current;
        if (!el) return;

        const update = () => setRightBodyH(el.clientHeight-100 || 520);
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
