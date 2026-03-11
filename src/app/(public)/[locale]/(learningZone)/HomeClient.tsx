"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Check,
    ChevronRight,
    Globe,
    GraduationCap,
    MessageCircleMore,
    Sparkles,
    TimerReset,
} from "lucide-react";

import { Button } from "@/components/home/ui/button";
import { CardContent } from "@/components/home/ui/card";
import { Progress } from "@/components/home/ui/progress";
import { cn } from "@/lib/cn";

type Choice = {
    label: string;
    value: string;
    hint?: string;
};

type OnboardingData = {
    preferredLanguage: string;
    learningInterests: string[];
    level: string;
    studyTime: string;
    discoverySource: string;
};

type StepId =
    | "preferredLanguage"
    | "learningInterests"
    | "level"
    | "studyTime"
    | "discoverySource";

type StepConfig = {
    id: StepId;
    title: string;
    description: string;
    mode: "single" | "multi";
    choices: Choice[];
};

type SubjectCard = {
    slug: string;
    title: string;
    description: string;
    badge: string;
};

const STORAGE_KEY = "zoeskoul.home.onboarding.v1";
const DISMISSED_KEY = "zoeskoul.home.avatar.dismissed.v1";

const SUBJECTS: SubjectCard[] = [
    {
        slug: "python",
        title: "Python",
        description: "Hands-on foundations, exercises, and guided practice.",
        badge: "Most popular",
    },
    {
        slug: "linear-algebra",
        title: "Linear Algebra",
        description: "Visual intuition, formulas, and problem-solving paths.",
        badge: "STEM",
    },
    {
        slug: "ai-chatgpt-kickstart",
        title: "AI & ChatGPT",
        description: "Practical prompting, workflows, and AI literacy.",
        badge: "Career-ready",
    },
    {
        slug: "haitian-creole",
        title: "Haitian Creole",
        description: "Conversational lessons with a warm, guided learning flow.",
        badge: "Language",
    },
];

const STEP_CONFIG: StepConfig[] = [
    {
        id: "preferredLanguage",
        title: "What language should I use for your experience?",
        description:
            "This helps set the tone and default UI language where available.",
        mode: "single",
        choices: [
            { label: "English", value: "english" },
            { label: "Français", value: "french" },
            { label: "Kreyòl", value: "haitian-creole" },
        ],
    },
    {
        id: "learningInterests",
        title: "What would you like to learn first?",
        description:
            "Choose one or more areas so your home stays focused and useful.",
        mode: "multi",
        choices: [
            { label: "Python", value: "python" },
            { label: "Linear Algebra", value: "linear-algebra" },
            { label: "AI & ChatGPT", value: "ai-chatgpt-kickstart" },
            { label: "Haitian Creole", value: "haitian-creole" },
            { label: "Cybersecurity", value: "cybersecurity" },
        ],
    },
    {
        id: "level",
        title: "What best describes your level right now?",
        description:
            "I’ll use this to soften or increase the difficulty of what you see first.",
        mode: "single",
        choices: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
        ],
    },
    {
        id: "studyTime",
        title: "How much time do you want to study each week?",
        description: "I’ll use this to suggest a more realistic pace.",
        mode: "single",
        choices: [
            { label: "1–2 hours", value: "1-2-hours" },
            { label: "3–5 hours", value: "3-5-hours" },
            { label: "6+ hours", value: "6-plus-hours" },
        ],
    },
    {
        id: "discoverySource",
        title: "How did you hear about us?",
        description:
            "This helps improve onboarding and channel quality over time.",
        mode: "single",
        choices: [
            { label: "Search", value: "search" },
            { label: "Friend or colleague", value: "friend" },
            { label: "Social media", value: "social" },
            { label: "School or work", value: "school-work" },
            { label: "Other", value: "other" },
        ],
    },
];

const DEFAULT_DATA: OnboardingData = {
    preferredLanguage: "",
    learningInterests: [],
    level: "",
    studyTime: "",
    discoverySource: "",
};

function Surface({
                     children,
                     className,
                 }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4",
                "bg-white/82 border-black/5 shadow-[0_18px_50px_-32px_rgba(0,0,0,0.24)] backdrop-blur-xl",
                "dark:bg-white/[0.06] dark:border-white/10 dark:shadow-none",
                className,
            )}
        >
            {children}
        </div>
    );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-neutral-500 dark:text-white/45">
            {children}
        </div>
    );
}

function readStoredOnboarding(): { completed: boolean; data: OnboardingData } {
    if (typeof window === "undefined") {
        return { completed: false, data: DEFAULT_DATA };
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { completed: false, data: DEFAULT_DATA };

        const parsed = JSON.parse(raw) as {
            completed?: boolean;
            data?: Partial<OnboardingData>;
        };

        return {
            completed: Boolean(parsed?.completed),
            data: {
                ...DEFAULT_DATA,
                ...(parsed?.data ?? {}),
                learningInterests: Array.isArray(parsed?.data?.learningInterests)
                    ? parsed.data!.learningInterests!
                    : [],
            },
        };
    } catch {
        return { completed: false, data: DEFAULT_DATA };
    }
}

function saveStoredOnboarding(completed: boolean, data: OnboardingData) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, data }));
}

function useTypewriter(text: string, speed = 18, shouldAnimate = true) {
    const [displayed, setDisplayed] = useState(shouldAnimate ? "" : text);

    useEffect(() => {
        if (!shouldAnimate) {
            setDisplayed(text);
            return;
        }

        setDisplayed("");
        let i = 0;

        const timer = window.setInterval(() => {
            i += 1;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) window.clearInterval(timer);
        }, speed);

        return () => window.clearInterval(timer);
    }, [text, speed, shouldAnimate]);

    return displayed;
}

function mapLanguageLabel(value: string) {
    const map: Record<string, string> = {
        english: "English",
        french: "Français",
        "haitian-creole": "Kreyòl",
    };
    return map[value] ?? "Not set";
}

function mapLevelLabel(value: string) {
    const map: Record<string, string> = {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
    };
    return map[value] ?? "Not set";
}

function mapTimeLabel(value: string) {
    const map: Record<string, string> = {
        "1-2-hours": "1–2 hours",
        "3-5-hours": "3–5 hours",
        "6-plus-hours": "6+ hours",
    };
    return map[value] ?? "Not set";
}

function titleFromSlug(slug: string) {
    return SUBJECTS.find((s) => s.slug === slug)?.title ?? slug;
}

function getRecommendedSubjects(data: OnboardingData) {
    if (!data.learningInterests.length) return SUBJECTS;
    const selected = new Set(data.learningInterests);
    const prioritized = SUBJECTS.filter((subject) => selected.has(subject.slug));
    const fallback = SUBJECTS.filter((subject) => !selected.has(subject.slug));
    return [...prioritized, ...fallback].slice(0, 4);
}

function buildWelcomeMessage(data: OnboardingData, returning: boolean) {
    const interestText = data.learningInterests.length
        ? data.learningInterests.map(titleFromSlug).slice(0, 2).join(" and ")
        : "your goals";

    if (returning) {
        return `Welcome back. I kept your space focused on ${interestText}, with a ${mapLevelLabel(
            data.level,
        ).toLowerCase()} path and a ${mapTimeLabel(
            data.studyTime,
        ).toLowerCase()} study pace.`;
    }

    return `Welcome. I’ll help shape your learning space around ${interestText}, in ${mapLanguageLabel(
        data.preferredLanguage,
    )}, with a pace that feels realistic from day one.`;
}

function SparkDot({ className }: { className?: string }) {
    return (
        <motion.div
            className={cn(
                "absolute size-1 rounded-full bg-emerald-400/35 dark:bg-emerald-300/20",
                className,
            )}
            animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

function GuideAvatar({ speaking }: { speaking: boolean }) {
    const reduceMotion = useReducedMotion();

    return (
        <div className="relative flex h-[78px] w-[78px] items-center justify-center sm:h-[86px] sm:w-[86px]">
            <motion.div
                className="absolute inset-2 rounded-full bg-emerald-300/18 blur-xl dark:bg-emerald-300/10"
                animate={
                    reduceMotion
                        ? undefined
                        : { scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }
                }
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <SparkDot className="left-2 top-3" />
            <SparkDot className="right-3 top-2" />
            <SparkDot className="bottom-3 right-2" />

            <motion.div
                className={cn(
                    "relative flex h-[64px] w-[64px] items-center justify-center rounded-[1rem] border backdrop-blur-xl sm:h-[70px] sm:w-[70px]",
                    "bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,248,250,0.9))] border-black/5 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.28)]",
                    "dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] dark:border-white/10 dark:shadow-none",
                )}
                animate={
                    reduceMotion ? undefined : { y: [0, -2, 0], rotate: [0, -1, 1, 0] }
                }
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="absolute inset-1.5 rounded-[0.85rem] border border-black/5 dark:border-white/10" />

                <div className="relative flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            className="h-3.5 w-3.5 rounded-full bg-neutral-900 sm:h-4 sm:w-4 dark:bg-white/90"
                            animate={
                                reduceMotion ? undefined : { scaleY: [1, 1, 0.12, 1, 1] }
                            }
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                times: [0, 0.42, 0.46, 0.5, 1],
                            }}
                            style={{ transformOrigin: "center center" }}
                        />
                        <motion.div
                            className="h-3.5 w-3.5 rounded-full bg-neutral-900 sm:h-4 sm:w-4 dark:bg-white/90"
                            animate={
                                reduceMotion ? undefined : { scaleY: [1, 1, 0.12, 1, 1] }
                            }
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                times: [0, 0.42, 0.46, 0.5, 1],
                            }}
                            style={{ transformOrigin: "center center" }}
                        />
                    </div>

                    <motion.div
                        className="h-2 rounded-full bg-neutral-900/90 dark:bg-white/85"
                        animate={
                            reduceMotion
                                ? undefined
                                : speaking
                                    ? {
                                        width: [12, 18, 10, 16, 12],
                                        borderRadius: [999, 8, 999, 8, 999],
                                    }
                                    : { width: 14 }
                        }
                        transition={{
                            duration: 1.05,
                            repeat: speaking ? Infinity : 0,
                            ease: "easeInOut",
                        }}
                    />

                    <div className="flex items-center gap-1 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-300/10 dark:text-emerald-200">
                        <Sparkles className="size-2" />
                        Guide
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function SpeechBubble({
                          text,
                          animate = true,
                          side = "right",
                      }: {
    text: string;
    animate?: boolean;
    side?: "left" | "right";
}) {
    const reduceMotion = useReducedMotion();
    const rendered = useTypewriter(text, 15, animate && !reduceMotion);

    return (
        <div className="relative w-[min(220px,62vw)] sm:w-[250px]">
            <div
                className={cn(
                    "relative rounded-[16px] border px-3 py-2.5",
                    "bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(247,248,250,0.955))]",
                    "border-black/5 shadow-[0_14px_32px_-22px_rgba(0,0,0,0.24),0_6px_12px_-10px_rgba(0,0,0,0.15)]",
                    "dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.05))] dark:border-white/10 dark:shadow-none",
                )}
            >
                <div
                    className={cn(
                        "absolute top-[18px] h-2.5 w-2.5 rotate-45 bg-[linear-gradient(180deg,rgba(247,248,250,0.98),rgba(241,243,246,0.95))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.05))]",
                        side === "right"
                            ? "-right-[5px] border-r border-t border-black/5 dark:border-white/10"
                            : "-left-[5px] border-b border-l border-black/5 dark:border-white/10",
                    )}
                />

                <p className="text-[12px] leading-5 text-neutral-700 dark:text-white/72 sm:text-[13px]">
                    {rendered}
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-neutral-900/65 align-middle dark:bg-white/70" />
                </p>
            </div>
        </div>
    );
}

function AvatarWithQuestion({
                                text,
                                speaking,
                                side = "right",
                            }: {
    text: string;
    speaking: boolean;
    side?: "left" | "right";
}) {
    return (
        <div className="mx-auto flex w-full max-w-[360px] items-start justify-center">
            <div
                className={cn(
                    "flex items-start gap-2.5 sm:gap-3",
                    side === "left" ? "flex-row-reverse" : "flex-row",
                )}
            >
                <div className="pt-1">
                    <GuideAvatar speaking={speaking} />
                </div>
                <div className="pt-1.5">
                    <SpeechBubble text={text} side={side} />
                </div>
            </div>
        </div>
    );
}

function ChoiceButton({
                          active,
                          label,
                          hint,
                          onClick,
                      }: {
    active: boolean;
    label: string;
    hint?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cn(
                "group flex w-full items-start justify-between gap-4 rounded-xl border px-3.5 py-3 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
                active
                    ? "border-emerald-500/30 bg-emerald-500/10 ring-1 ring-emerald-500/20 dark:border-emerald-300/20 dark:bg-emerald-300/10"
                    : "border-black/5 bg-white/70 hover:border-emerald-500/20 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-300/20 dark:hover:bg-white/[0.05]",
            )}
        >
            <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-900 dark:text-white/90">
                    {label}
                </div>
                {hint ? (
                    <div className="mt-1 text-xs text-neutral-500 dark:text-white/60">
                        {hint}
                    </div>
                ) : null}
            </div>

            <div
                className={cn(
                    "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    active
                        ? "border-emerald-500 bg-emerald-600 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-black"
                        : "border-black/10 dark:border-white/15",
                )}
            >
                {active ? <Check className="size-3" /> : null}
            </div>
        </button>
    );
}

function OnboardingPanel({
                             data,
                             setData,
                             onSkip,
                             onFinish,
                         }: {
    data: OnboardingData;
    setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
    onSkip: () => void;
    onFinish: (finalData: OnboardingData) => void;
}) {
    const [stepIndex, setStepIndex] = useState(0);

    const step = STEP_CONFIG[stepIndex];
    const total = STEP_CONFIG.length;
    const progress = ((stepIndex + 1) / total) * 100;

    const currentValue = data[step.id];
    const canContinue = Array.isArray(currentValue)
        ? currentValue.length > 0
        : Boolean(currentValue);

    const questionText = useMemo(
        () => `${step.title} ${step.description}`,
        [step],
    );

    const handleToggle = (value: string) => {
        setData((prev) => {
            if (step.mode === "multi") {
                const set = new Set(prev[step.id] as string[]);
                if (set.has(value)) set.delete(value);
                else set.add(value);
                return { ...prev, [step.id]: Array.from(set) } as OnboardingData;
            }
            return { ...prev, [step.id]: value } as OnboardingData;
        });
    };

    const handleContinue = () => {
        if (!canContinue) return;
        if (stepIndex === total - 1) {
            onFinish(data);
            return;
        }
        setStepIndex((n) => n + 1);
    };

    const handleBack = () => setStepIndex((n) => Math.max(0, n - 1));

    const side: "left" | "right" = stepIndex % 2 === 0 ? "right" : "left";

    return (
        <div className="space-y-4">
            <AvatarWithQuestion text={questionText} speaking side={side} />

            <Surface className="mx-auto max-w-[520px] p-0">
                <CardContent className="p-4 sm:p-4.5">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-900 dark:text-white/90">
                                Personalize your space
                            </div>
                            <div className="mt-1 text-sm leading-5.5 text-neutral-500 dark:text-white/60">
                                Answer a few quick questions. You can edit everything later.
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            className="h-8 w-full text-sm sm:w-auto dark:hover:bg-white/10"
                        >
                            Skip
                        </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                        <Progress value={progress} className="h-1.5" />
                        <div className="text-[11px] text-neutral-500 dark:text-white/55">
                            Step {stepIndex + 1} of {total}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2.5">
                        {step.choices.map((choice) => {
                            const active = Array.isArray(currentValue)
                                ? currentValue.includes(choice.value)
                                : currentValue === choice.value;

                            return (
                                <ChoiceButton
                                    key={choice.value}
                                    active={active}
                                    label={choice.label}
                                    hint={choice.hint}
                                    onClick={() => handleToggle(choice.value)}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={stepIndex === 0}
                            className="h-8 w-full text-sm sm:w-auto dark:hover:bg-white/10"
                        >
                            Back
                        </Button>

                        <Button
                            onClick={handleContinue}
                            disabled={!canContinue}
                            className="h-8 w-full gap-1.5 text-sm sm:w-auto"
                        >
                            {stepIndex === total - 1 ? "Finish setup" : "Continue"}
                            <ChevronRight className="size-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Surface>
        </div>
    );
}

function PersonalizedHighlights({ data }: { data: OnboardingData }) {
    const cards = [
        {
            icon: Globe,
            title: "Language",
            value: mapLanguageLabel(data.preferredLanguage),
            text: "Your interface can default to the language you feel most comfortable using.",
        },
        {
            icon: GraduationCap,
            title: "Level",
            value: mapLevelLabel(data.level),
            text: "Recommended lessons and examples can be adjusted to fit your current comfort level.",
        },
        {
            icon: TimerReset,
            title: "Weekly pace",
            value: mapTimeLabel(data.studyTime),
            text: "Your home can stay realistic instead of overwhelming, with smarter suggested next steps.",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Surface key={card.title} className="p-0">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-2 text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-300/10 dark:text-emerald-200">
                                    <Icon className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="text-sm text-neutral-500 dark:text-white/55">
                                        {card.title}
                                    </div>
                                    <div className="mt-1 font-semibold text-neutral-900 dark:text-white/90">
                                        {card.value}
                                    </div>
                                </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/65">
                                {card.text}
                            </p>
                        </CardContent>
                    </Surface>
                );
            })}
        </div>
    );
}

function SubjectGrid({ data }: { data: OnboardingData }) {
    const reduceMotion = useReducedMotion();
    const subjects = getRecommendedSubjects(data);

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {subjects.map((subject) => (
                <Link key={subject.slug} href={`/subjects/${subject.slug}`} className="group block">
                    <motion.div whileHover={reduceMotion ? undefined : { y: -3 }}>
                        <Surface className="h-full p-0 transition-colors group-hover:border-emerald-500/20 dark:group-hover:border-emerald-300/20">
                            <CardContent className="flex h-full flex-col p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-300/15 dark:bg-emerald-300/10 dark:text-emerald-200">
                                        {subject.badge}
                                    </div>

                                    <ArrowRight className="size-4 text-neutral-500 transition-transform group-hover:translate-x-0.5 dark:text-white/50" />
                                </div>

                                <div className="mt-3 text-base font-semibold text-neutral-900 dark:text-white/90">
                                    {subject.title}
                                </div>

                                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/65">
                                    {subject.description}
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-white/90">
                                    Explore course
                                    <ChevronRight className="size-4" />
                                </div>
                            </CardContent>
                        </Surface>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}

export default function HomePageAvatarOnboarding() {
    const reduceMotion = useReducedMotion();

    const [hydrated, setHydrated] = useState(false);
    const [onboardingData, setOnboardingData] =
        useState<OnboardingData>(DEFAULT_DATA);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [bubbleCollapsed, setBubbleCollapsed] = useState(false);

    const heroRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const stored = readStoredOnboarding();
        setOnboardingData(stored.data);
        setCompleted(stored.completed);

        const dismissed =
            typeof window !== "undefined" &&
            window.localStorage.getItem(DISMISSED_KEY) === "1";

        setShowOnboarding(!stored.completed && !dismissed);
        setBubbleCollapsed(Boolean(stored.completed || dismissed));
        setHydrated(true);
    }, []);

    const welcomeText = useMemo(
        () => buildWelcomeMessage(onboardingData, completed),
        [onboardingData, completed],
    );

    const interestSummary = useMemo(() => {
        if (!onboardingData.learningInterests.length) {
            return "Choose a path and start learning at your pace.";
        }

        return `Focused on ${onboardingData.learningInterests
            .map(titleFromSlug)
            .join(", ")}. Start where it matters most.`;
    }, [onboardingData.learningInterests]);

    const handleFinish = (data: OnboardingData) => {
        setOnboardingData(data);
        setCompleted(true);
        setShowOnboarding(false);
        setBubbleCollapsed(true);
        saveStoredOnboarding(true, data);
    };

    const handleSkip = () => {
        setShowOnboarding(false);
        setBubbleCollapsed(true);

        if (typeof window !== "undefined") {
            window.localStorage.setItem(DISMISSED_KEY, "1");
        }
    };

    const reopenAssistant = () => {
        setShowOnboarding(true);
        setBubbleCollapsed(false);

        if (typeof window !== "undefined") {
            window.localStorage.removeItem(DISMISSED_KEY);
        }
    };

    const resetPreferences = () => {
        setOnboardingData(DEFAULT_DATA);
        setCompleted(false);
        setShowOnboarding(true);
        setBubbleCollapsed(false);

        if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEY);
            window.localStorage.removeItem(DISMISSED_KEY);
        }

        heroRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
        });
    };

    useEffect(() => {
        if (!hydrated) return;
        if (completed) saveStoredOnboarding(true, onboardingData);
    }, [hydrated, completed, onboardingData]);

    const firstVisitGate = hydrated && showOnboarding && !completed;

    return (
        <main
            className={cn(
                "relative min-h-screen overflow-hidden pb-24 text-neutral-900 dark:text-white/90 sm:pb-28",
                "bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(16,185,129,0.14),transparent_60%),radial-gradient(1000px_500px_at_100%_0%,rgba(59,130,246,0.10),transparent_58%),linear-gradient(180deg,#f8fffb_0%,#ffffff_40%,#f7f8ff_100%)]",
                "dark:bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(1000px_500px_at_100%_0%,rgba(59,130,246,0.10),transparent_55%),linear-gradient(180deg,#0c1018_0%,#0b0d12_45%,#0b0d12_100%)]",
            )}
        >
            <div
                className="pointer-events-none absolute -top-20 left-[-10%] h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-300/10"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute right-[-8%] top-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-300/10"
                aria-hidden
            />

            <section ref={heroRef} className="relative overflow-hidden">
                <div className="ui-container relative py-6 sm:py-8 lg:py-10">
                    <AnimatePresence mode="wait">
                        {firstVisitGate ? (
                            <motion.div
                                key="gate-only"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.28 }}
                                className="mx-auto max-w-[760px]"
                            >
                                <Surface className="p-4 sm:p-5 lg:p-6">
                                    <div className="mx-auto max-w-[520px] text-center">
                                        <SectionKicker>Welcome</SectionKicker>

                                        <h1 className="mt-2 text-[26px] font-black tracking-tight sm:text-[34px]">
                                            Let’s personalize your learning space.
                                        </h1>

                                        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/70">
                                            Answer a few quick questions or skip for now. Once you’re done,
                                            the rest of the homepage will appear.
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <OnboardingPanel
                                            data={onboardingData}
                                            setData={setOnboardingData}
                                            onSkip={handleSkip}
                                            onFinish={handleFinish}
                                        />
                                    </div>
                                </Surface>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="full-home"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.32 }}
                                className="grid gap-4 lg:gap-6"
                            >
                                <Surface>
                                    <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(220px,0.95fr)] xl:gap-10">
                                        <div className="order-2 min-w-0 xl:order-1">
                                            <SectionKicker>Personalized learning</SectionKicker>

                                            <motion.h1
                                                initial={{ opacity: 0, y: 14 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="mt-2 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
                                            >
                                                A calm homepage that welcomes, guides, and grows with the learner.
                                            </motion.h1>

                                            <motion.p
                                                initial={{ opacity: 0, y: 14 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.08, duration: 0.5 }}
                                                className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-white/70 sm:text-[15px] sm:leading-7"
                                            >
                                                {completed
                                                    ? welcomeText
                                                    : "First-time visitors meet a light animated guide that collects just enough information to make the experience feel personal, clean, and helpful from the start."}
                                            </motion.p>

                                            <motion.div
                                                initial={{ opacity: 0, y: 14 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.16, duration: 0.5 }}
                                                className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                                            >
                                                <Button size="lg" className="gap-2 sm:w-auto" asChild>
                                                    <Link
                                                        href={
                                                            completed && onboardingData.learningInterests[0]
                                                                ? `/subjects/${onboardingData.learningInterests[0]}`
                                                                : "/subjects"
                                                        }
                                                    >
                                                        {completed ? "Continue learning" : "Explore subjects"}
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>

                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    onClick={completed ? resetPreferences : reopenAssistant}
                                                    className="sm:w-auto dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                                                >
                                                    {completed ? "Edit preferences" : "Open welcome guide"}
                                                </Button>
                                            </motion.div>
                                        </div>

                                        <div className="order-1 xl:order-2">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className="relative mx-auto w-full max-w-[280px]"
                                            >
                                                <div className="space-y-3">
                                                    {!bubbleCollapsed ? (
                                                        <AvatarWithQuestion
                                                            text={welcomeText}
                                                            speaking={!completed}
                                                            side="right"
                                                        />
                                                    ) : (
                                                        <div className="flex justify-center">
                                                            <GuideAvatar speaking={false} />
                                                        </div>
                                                    )}

                                                    <Surface className="p-0">
                                                        <CardContent className="p-4">
                                                            <div className="flex flex-col gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-semibold text-neutral-900 dark:text-white/90">
                                                                        {completed
                                                                            ? "Your space is personalized"
                                                                            : "Welcome guide is ready"}
                                                                    </div>
                                                                    <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-white/65">
                                                                        {interestSummary}
                                                                    </p>
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={reopenAssistant}
                                                                    className="w-full dark:hover:bg-white/10"
                                                                >
                                                                    {completed ? "Update" : "Start"}
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Surface>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </Surface>

                                <Surface>
                                    <div className="max-w-2xl">
                                        <SectionKicker>Personalized home</SectionKicker>
                                        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                                            Clean by default. More tailored over time.
                                        </h2>
                                        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/70 sm:text-[15px] sm:leading-7">
                                            The homepage stays minimal on day one, then becomes smarter
                                            as preferences, enrollments, and progress data grow.
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <PersonalizedHighlights data={onboardingData} />
                                    </div>
                                </Surface>

                                <div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <SectionKicker>Recommended paths</SectionKicker>
                                            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                                                Start with what matters most.
                                            </h2>
                                        </div>

                                        <Link
                                            href="/subjects"
                                            className="inline-flex items-center gap-2 text-sm font-extrabold text-neutral-900 transition-opacity hover:opacity-70 dark:text-white/90"
                                        >
                                            View all subjects
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    </div>

                                    <div className="mt-6">
                                        <SubjectGrid data={onboardingData} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {hydrated && completed ? (
                <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        type="button"
                        onClick={reopenAssistant}
                        className={cn(
                            "flex items-center gap-3 rounded-full border px-3 py-3 sm:px-4",
                            "border-black/5 bg-white/88 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.28)] backdrop-blur-xl",
                            "dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none",
                        )}
                    >
                        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
                            <MessageCircleMore className="size-4" />
                        </div>

                        <div className="hidden text-left sm:block">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white/90">
                                Need anything?
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-white/55">
                                Update your preferences
                            </div>
                        </div>
                    </motion.button>
                </div>
            ) : null}
        </main>
    );
}