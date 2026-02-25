// src/components/review/sketches/analyticGeometry/_GeoPlaceholder.tsx
"use client";

import React from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

export default function GeoPlaceholder(props: {
    title: string;
    markdown?: string;
}) {
    return (
        <div className="ui-card p-4">
            <div className="text-sm font-extrabold text-neutral-700 dark:text-white/80">
                {props.title}
            </div>
            <div className="mt-2 text-xs text-neutral-600 dark:text-white/70">
                Sketch not implemented yet (this placeholder prevents “Unknown sketch”).
            </div>
            {props.markdown ? (
                <div className="mt-3 ui-soft p-3">
                    <MathMarkdown content={props.markdown} />
                </div>
            ) : null}
        </div>
    );
}
