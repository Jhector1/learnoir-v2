import type { RunResult } from "@/lib/code/runCode";
import {CodeLanguage} from "@/lib/practice/types";

export type TerminalDock = "bottom" | "right";

export type TermLine =
    | { type: "sys"; text: string; runId?: number }
    | { type: "out"; text: string; runId?: number }
    | { type: "in"; text: string; runId?: number }
    | { type: "err"; text: string; runId?: number };

export type OnRun = (args: {
    language: CodeLanguage;
    code: string;
    stdin: string;
}) => Promise<RunResult>;

export type ControlledProps = {
    language: CodeLanguage;
    onChangeLanguage: (l: CodeLanguage) => void;

    code: string;
    onChangeCode: (code: string) => void;

    terminalDock?: TerminalDock;
    onChangeTerminalDock?: (d: TerminalDock) => void;
};

export type UncontrolledProps = {
    initialLanguage?: CodeLanguage;
    initialCode?: string;

    initialTerminalDock?: TerminalDock;
    initialTerminalSize?: number;
};
export type CodeRunnerFrame = "card" | "plain";

export type CommonProps = {
    title?: string;
    height?: number | "auto";
    frame?: CodeRunnerFrame;
    className?: string;
    hintMarkdown?: string;

    showHeaderBar?: boolean;
    showEditor?: boolean;
    showTerminal?: boolean;
    showHint?: boolean;

    fixedLanguage?: CodeLanguage;
    allowedLanguages?: CodeLanguage[];
    showLanguagePicker?: boolean;

    allowReset?: boolean;
    allowRun?: boolean;
    disabled?: boolean;

    resetTerminalOnRun?: boolean;

    fixedTerminalDock?: TerminalDock;

    showEditorThemeToggle?: boolean;
    showTerminalDockToggle?: boolean;

    onRun?: OnRun;
};

export type CodeRunnerProps =
    | (CommonProps & ControlledProps)
    | (CommonProps & UncontrolledProps);

export function isControlled(p: CodeRunnerProps): p is CommonProps & ControlledProps {
    return (p as any).code !== undefined && typeof (p as any).onChangeCode === "function";
}
