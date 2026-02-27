// src/components/tools/panes/CodeToolPane.tsx
"use client";

import React from "react";
import CodeRunner from "@/components/code/runner/CodeRunner";
import { CodeLanguage } from "@/lib/practice/types";
import {useElementSize} from "@/components/tools/hooks/useElementSize";
// import { useElementSize } from "@/lib/ui/useElementSize";

export default function CodeToolPane(props: {
    height: number; // keep it, but we won't rely on it
    toolLang: CodeLanguage;
    toolCode: string;
    toolStdin: string;
    onChangeCode: (c: string) => void;
    onChangeStdin: (s: string) => void;
}) {
    const { toolLang, toolCode, toolStdin, onChangeCode, onChangeStdin } = props;

    // ✅ Real, always-correct pane size (updates immediately + on any layout change)
    const { ref, size } = useElementSize<HTMLDivElement>();

    // ✅ Never pass 0 — 0 causes Monaco/xterm to compute “nothing”, then only fixes on resize
    const runnerH = Math.max(320, size.h);

    return (
        <div ref={ref} className="h-full min-h-0 w-full flex flex-col overflow-hidden">
            <CodeRunner
                frame="plain"
                title="Run code"
                showHint={false}
                height={runnerH-50}
                showTerminalDockToggle
                showEditorThemeToggle
                fixedLanguage={toolLang}
                showLanguagePicker={false}
                code={toolCode}
                onChangeCode={onChangeCode}
                // stdin={toolStdin}
                // onChangeStdin={onChangeStdin}
            />
        </div>
    );
}