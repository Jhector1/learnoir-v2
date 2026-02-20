// src/components/review/module/hooks/useToolCodeRunnerState.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/code/runCode";

type BoundTarget = { id: string; onPatch: (patch: any) => void };
type ToolSnap = { lang: Lang; code: string; stdin: string };

function snapKey(s: ToolSnap) {
    // ✅ stable dedupe key
    return `${s.lang}::${s.stdin}::${s.code}`;
}

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

    // optional tuning
    toolSaveDelayMs?: number; // default 700
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

    const isBound = useCallback((id: string) => boundRef.current?.id === id, []);

    // -----------------------------
    // Debounced save timer (tool -> progress)
    // -----------------------------
    const timerRef = useRef<number | null>(null);
    const clearPendingSave = useCallback(() => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    // -----------------------------
    // Unbind
    // -----------------------------
    const unbindCodeInput = useCallback(() => {
        clearPendingSave();
        boundRef.current = null;
        boundDirtyRef.current = false;
        setBoundId(null);
    }, [clearPendingSave]);

    // clear binding when topic changes
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

    const latestRef = useRef<ToolSnap>({
        lang: initialLang,
        code: initialCode,
        stdin: initialStdin,
    });

    useEffect(() => {
        latestRef.current = { lang: toolLang, code: toolCode, stdin: toolStdin };
    }, [toolLang, toolCode, toolStdin]);

    // ✅ prevent useless setProgress writes (reduces downstream PUT scheduling)
    const lastCommittedSnapRef = useRef<string>("");

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

        const snap: ToolSnap = { lang: nextLang, code: nextCode, stdin: nextStdin };
        latestRef.current = snap;

        // ✅ seed “committed” snapshot so we don't rewrite same value
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

    // -----------------------------
    // Bind a specific code_input question into the Tools panel
    // -----------------------------
    const bindCodeInput = useCallback(
        (args2: { id: string; lang: Lang; code: string; stdin?: string; onPatch: (patch: any) => void }) => {
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

            const snap: ToolSnap = { lang: nextLang, code: nextCode, stdin: nextStdin };
            latestRef.current = snap;
            // don't mark committed here; binding is not “saving”
        },
        [],
    );

    // -----------------------------
    // Commit tool state into progress (for persistence)
    // -----------------------------
    const commitToolNow = useCallback(() => {
        if (!progressHydrated) return;

        const latest = latestRef.current;
        const k = snapKey(latest);

        // ✅ no change => no setProgress
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
            }, toolSaveDelayMs);
        },
        [progressHydrated, commitToolNow, clearPendingSave, toolSaveDelayMs],
    );

    // ✅ always flush tool state when leaving / hiding tab
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
        window.addEventListener("pagehide", onHide);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") onHide();
        });
        return () => {
            window.removeEventListener("pagehide", onHide);
            // visibilitychange handler is anonymous above; if you want, store it in a ref; not required
        };
    }, [clearPendingSave, commitToolNow]);

    // -----------------------------
    // When tool changes AND bound -> patch question + reset checked state
    // (this ensures typed code is also stored in quizState via the question patch)
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
            // ✅ this is what makes “typed code” persist inside quiz progress
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

        // ✅ call this on editor changes (debounced)
        saveDebounced,

        // ✅ call this on “Run”, “Unbind”, topic switch, etc. if you want immediate persistence
        commitToolNow,

        bindCodeInput,
        unbindCodeInput,
        boundId,
        isBound,
    };
}