"use client";

import * as React from "react";
import dynamic from "next/dynamic";

type SandboxSlug = "programming" | "sql" | "linear-algebra" | "tools";

function SandboxOnly({ sandboxSlug }: { sandboxSlug: string }) {
    const Comp = React.useMemo(() => {
        switch (sandboxSlug as SandboxSlug) {
            case "programming":
                return dynamic(() => import("@/components/sandbox/ProgrammingSandbox"), {
                    ssr: false,
                    loading: () => <div className="ui-soft p-4">Loading Programming…</div>,
                });

            case "linear-algebra":
                return dynamic(() => import("@/components/sandbox/LinearAlgebraSandox"), {
                    ssr: false,
                    loading: () => <div className="ui-soft p-4">Loading Linear Algebra…</div>,
                });

            default:
                return null;
        }
    }, [sandboxSlug]);

    if (!Comp) return <div className="ui-soft p-4">Unknown Sandbox</div>;
    return <Comp />;
}

export default function SandboxSlugClient({
                                              locale,
                                              sandboxSlug,
                                          }: {
    locale: string;
    sandboxSlug: string;
}) {
    return <SandboxOnly sandboxSlug={sandboxSlug} />;
}