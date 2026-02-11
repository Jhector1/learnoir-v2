"use client";

// import React, { useMemo, useState } from "react";
import FullIDE from "@/components/ide/fullide/FullIDE";
import {useMemo, useState} from "react";
import {Lang} from "@/lib/code/runCode";
import {LangRail, LANGS} from "@/components/ide/lang/LangRail";

export default function SandboxIdePage() {
    const [lang, setLang] = useState<Lang>("python");
    const active = useMemo(() => LANGS.find((x) => x.id === lang) ?? LANGS[0], [lang]);

    const storageKey = `learnoir.ide.workspace.v2.${lang}`;

    return (
        <div className="h-dvh w-dvw overflow-hidden bg-transparent">
            <div className="h-full min-h-0 grid grid-rows-[auto_1fr]">
                {/* Header */}
                {/*<div className="px-4 py-4">*/}
                {/*    <div className="ui-container !max-w-none">*/}
                {/*        <div className="flex flex-wrap items-end justify-between gap-3">*/}
                {/*            <div>*/}
                {/*                <div className="ui-section-title !text-xl">IDE Sandbox</div>*/}
                {/*                <div className="ui-section-subtitle !mt-1 !text-sm">*/}
                {/*                    Switching language loads that language’s workspace (stored separately).*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*            <div className="ui-soft px-3 py-2">*/}
                {/*                <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">*/}
                {/*                    Active*/}
                {/*                </div>*/}
                {/*                <div className="text-sm font-black text-neutral-900 dark:text-white/90">*/}
                {/*                    {active.label}*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Body */}
                <div className="min-h-0 px-4 pb-4">
                    <div className="h-full min-h-0 ui-container !max-w-none">
                        <div className="h-full min-h-0 flex gap-4">
                            <LangRail lang={lang} setLang={setLang} />

                            <section className="min-h-0 flex-1">
                                <FullIDE
                                    className="h-full"
                                    fullHeight
                                    storageKey={storageKey}
                                    language={lang}
                                    onChangeLanguage={setLang}
                                    resetOnForcedLanguageChange
                                />
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
