"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import ProgrammingSandboxSkeleton from "@/components/sandbox/ProgrammingSandboxSkeleton";
import {
    buildProgrammingToolHref,
    PROGRAMMING_TOOL_ORDER,
    type SandboxToolEntry,
} from "@/lib/sandbox/toolRegistry";
import type { CodeLanguage } from "@/lib/practice/types";

const ProgrammingSandbox = dynamic(
    () => import("@/components/sandbox/ProgrammingSandbox"),
    {
        ssr: false,
        loading: () => <ProgrammingSandboxSkeleton />,
    }
);

const LinearAlgebraSandbox = dynamic(
    () => import("@/components/sandbox/LinearAlgebraSandox"),
    {
        ssr: false,
        loading: () => <div className="ui-soft p-4">Loading Linear Algebra…</div>,
    }
);

export default function SandboxToolClient({
                                              locale,
                                              entry,
                                          }: {
    locale: string;
    entry: SandboxToolEntry;
}) {
    if (entry.kind === "programming") {
        const routeLanguageMap: Partial<Record<CodeLanguage, string>> =
            Object.fromEntries(
                PROGRAMMING_TOOL_ORDER.map((tool) => [
                    tool,
                    buildProgrammingToolHref(locale, tool),
                ])
            );

        return (
            <ProgrammingSandbox
                initialLanguage={entry.initialLanguage}
                toolSlug={entry.toolSlug}
                title={entry.title}
                routeLanguageMap={routeLanguageMap}
            />
        );
    }

    if (entry.kind === "math") {
        return <LinearAlgebraSandbox />;
    }

    return <div className="ui-soft p-4">Unknown Sandbox</div>;
}