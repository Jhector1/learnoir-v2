"use client";

import FullIDE from "@/components/ide/fullide/FullIDE";
import { useMemo, useState } from "react";
import { LangRail, LANGS } from "@/components/ide/lang/LangRail";
import { CodeLanguage } from "@/lib/practice/types";
import { cn } from "@/components/ide/fullide/utils";

export default function ProgrammingIdeSandbox() {
    const [lang, setLang] = useState<CodeLanguage>("python");
    const [railCollapsed, setRailCollapsed] = useState(false);

    const active = useMemo(() => LANGS.find((x) => x.id === lang) ?? LANGS[0], [lang]);

    const storageKey = `${process.env.NEXT_PUBLIC_APP_NAME ?? "learnoir"}.ide.workspace.v2.${lang}`;

    return (
        <div className="h-[94dvh] w-full overflow-hidden bg-transparent">
            <div className="grid h-full min-h-0 w-full grid-rows-[auto_1fr]">
                {/* Mobile language bar */}
                <div className="border-b border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950 lg:hidden">
                    <div className="flex items-center gap-2 overflow-x-auto px-2 py-2">
                        {LANGS.map((item) => {
                            const selected = item.id === lang;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setLang(item.id as CodeLanguage)}
                                    className={cn(
                                        "shrink-0 border px-3 py-2 text-xs font-extrabold rounded-none",
                                        selected
                                            ? "border-emerald-600/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90"
                                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-950 dark:text-white/75 dark:hover:bg-white/[0.05]",
                                    )}
                                >
                                    {item.label}
                                </button>
                            );
                        })}

                        <div className="ml-auto shrink-0 text-[11px] font-extrabold text-neutral-500 dark:text-white/50">
                            {active.label}
                        </div>
                    </div>
                </div>

                {/* Desktop + IDE */}
                <div className="min-h-0 min-w-0 lg:flex">
                    <aside
                        className={cn(
                            "hidden h-full min-h-0 shrink-0 overflow-hidden border-r border-neutral-200 bg-white transition-[width] duration-300 ease-in-out dark:border-white/10 dark:bg-neutral-950 lg:block",
                            railCollapsed ? "w-[84px]" : "w-[220px]",
                        )}
                    >
                        <LangRail
                            lang={lang}
                            setLang={setLang}
                            collapsed={railCollapsed}
                            onToggleCollapsed={() => setRailCollapsed((v) => !v)}
                        />
                    </aside>

                    <main className="min-h-0 min-w-0 flex-1">
                        <FullIDE
                            className="h-full"
                            title="Programming IDE"
                            fullHeight
                            storageKey={storageKey}
                            language={lang}
                            onChangeLanguage={setLang}
                            resetOnForcedLanguageChange
                            showTopLanguageButtons={false}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
}