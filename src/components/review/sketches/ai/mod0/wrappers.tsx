"use client";
import React from "react";

/**
 * Optional: subject-level wrappers (backgrounds, guardrails, etc.)
 * You can ignore this for now; it's here for future “special subject” needs.
 */
export function AiSketchWrapper({ children }: { children: React.ReactNode }) {
    return <div className="w-full">{children}</div>;
}
