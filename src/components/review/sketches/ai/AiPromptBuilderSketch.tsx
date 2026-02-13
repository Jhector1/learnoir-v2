"use client";

import React, { useMemo, useState } from "react";
import SketchShell from "./_shared/SketchShell";
import { cn, BTN_PRIMARY, BTN_SECONDARY, INPUT, LABEL, MUTED, PILL, SOFT } from "./_shared/aiUi";

type Task = "email" | "summary" | "plan" | "explain" | "study";
type Tone = "friendly" | "polite" | "formal";
type Format = "bullets" | "steps" | "short_paragraph";

const TASK_LABEL: Record<Task, string> = {
    email: "Write an email",
    summary: "Summarize text",
    plan: "Make a plan",
    explain: "Explain simply",
    study: "Make a study plan",
};

const TONE_LABEL: Record<Tone, string> = {
    friendly: "Friendly",
    polite: "Polite",
    formal: "Formal",
};

const FORMAT_LABEL: Record<Format, string> = {
    bullets: "Bullet points",
    steps: "Step-by-step",
    short_paragraph: "Short paragraph",
};

export default function AiPromptBuilderSketch({ height = 420 }: { height?: number }) {
    const [task, setTask] = useState<Task>("email");
    const [tone, setTone] = useState<Tone>("polite");
    const [format, setFormat] = useState<Format>("steps");
    const [audience, setAudience] = useState("my teacher");
    const [goal, setGoal] = useState("ask for an extension");
    const [details, setDetails] = useState("Keep it under 80 words. Mention I was sick.");

    const prompt = useMemo(() => {
        const fmt =
            format === "bullets"
                ? "Use bullet points."
                : format === "steps"
                    ? "Use numbered steps."
                    : "Write one short paragraph.";

        const lines = [
            `Task: ${TASK_LABEL[task]}.`,
            `Audience: ${audience || "someone"}.`,
            `Goal: ${goal || "help me"}.`,
            `Tone: ${TONE_LABEL[tone]}.`,
            `Format: ${fmt}`,
        ];

        if (details.trim()) lines.push(`Extra details: ${details.trim()}`);
        return lines.join("\n");
    }, [task, tone, format, audience, goal, details]);

    const clarity = useMemo(() => {
        let s = 0;
        if (task) s += 25;
        if (tone) s += 10;
        if (format) s += 15;
        if (audience.trim().length >= 3) s += 15;
        if (goal.trim().length >= 5) s += 25;
        if (details.trim().length >= 8) s += 10;
        return Math.min(100, s);
    }, [task, tone, format, audience, goal, details]);

    function fillExample() {
        setTask("summary");
        setTone("friendly");
        setFormat("bullets");
        setAudience("my class notes");
        setGoal("summarize this chapter");
        setDetails("Make it super simple. Include 3 key points and 1 example.");
    }

    const left = (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-lg font-extrabold">Prompt Builder</div>
                    <div className={cn(MUTED, "mt-1")}>Build a clear prompt using simple pieces.</div>
                </div>
                <div className={cn(PILL, "gap-2")}>
                    <span className={MUTED}>Clarity</span>
                    <span className="font-extrabold">{clarity}%</span>
                </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className={SOFT}>
                    <div className={LABEL}>Task</div>
                    <select
                        className={cn(INPUT, "mt-2")}
                        value={task}
                        onChange={(e) => setTask(e.target.value as Task)}
                    >
                        {(Object.keys(TASK_LABEL) as Task[]).map((k) => (
                            <option key={k} value={k}>
                                {TASK_LABEL[k]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={SOFT}>
                    <div className={LABEL}>Tone</div>
                    <select
                        className={cn(INPUT, "mt-2")}
                        value={tone}
                        onChange={(e) => setTone(e.target.value as Tone)}
                    >
                        {(Object.keys(TONE_LABEL) as Tone[]).map((k) => (
                            <option key={k} value={k}>
                                {TONE_LABEL[k]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={SOFT}>
                    <div className={LABEL}>Output format</div>
                    <select
                        className={cn(INPUT, "mt-2")}
                        value={format}
                        onChange={(e) => setFormat(e.target.value as Format)}
                    >
                        {(Object.keys(FORMAT_LABEL) as Format[]).map((k) => (
                            <option key={k} value={k}>
                                {FORMAT_LABEL[k]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className={SOFT}>
                    <div className={LABEL}>Audience</div>
                    <input
                        className={cn(INPUT, "mt-2")}
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="e.g., my teacher"
                    />
                </div>
                <div className={SOFT}>
                    <div className={LABEL}>Goal</div>
                    <input
                        className={cn(INPUT, "mt-2")}
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., ask for an extension"
                    />
                </div>
            </div>

            <div className={cn(SOFT, "mt-3")}>
                <div className={LABEL}>Extra details</div>
                <textarea
                    className={cn(INPUT, "mt-2", "min-h-[90px]")}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Constraints like word limit, must include…, avoid…"
                />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <button className={BTN_SECONDARY} onClick={fillExample}>
                    Fill example
                </button>
                <button className={BTN_PRIMARY} onClick={() => navigator.clipboard?.writeText(prompt)}>
                    Copy prompt
                </button>
            </div>

            <div className={cn(SOFT, "mt-3")}>
                <div className={LABEL}>Your prompt</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm font-semibold">{prompt}</pre>
            </div>
        </div>
    );

    const right = (
        <div>
            <div className="text-sm font-extrabold">Prompt recipe (80/20)</div>
            <div className={cn(MUTED, "mt-2")}>1) Goal</div>
            <div className={cn(MUTED)}>2) Context</div>
            <div className={cn(MUTED)}>3) Constraints</div>
            <div className={cn(MUTED)}>4) Output format</div>
            <div className={cn(MUTED, "mt-3")}>Small changes in Tone + Format make results cleaner.</div>
        </div>
    );

    return <SketchShell height={height} left={left} right={right} />;
}
