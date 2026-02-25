"use client";

import React from "react";

import CodeRunner from "@/components/code/runner/CodeRunner";
import {CodeLanguage} from "@/lib/practice/types";

export default function CodeToolPane(props: {
    height: number;
    toolLang: CodeLanguage;
    toolCode: string;
    toolStdin: string;
    onChangeCode: (c: string) => void;
    onChangeStdin: (s: string) => void;
}) {
    const { height, toolLang, toolCode, toolStdin, onChangeCode, onChangeStdin } = props;

    return (
        <CodeRunner
            frame="plain"
            title="Run code"
            showHint={false}
            height={height}
            showTerminalDockToggle
            showEditorThemeToggle
            fixedLanguage={toolLang}
            showLanguagePicker={false}
            code={toolCode}
            onChangeCode={onChangeCode}
            // stdin={toolStdin}
            // onChangeStdin={onChangeStdin}
        />
    );
}