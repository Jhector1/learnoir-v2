import { createHash } from "crypto";

import type {
    Difficulty,
    ExerciseKind,
    SingleChoiceExercise,
    MultiChoiceExercise,
    TextInputExercise,
    // DragReorderExercise,
} from "@/lib/practice/types";
// import type { GenOut } from "../../shared/expected";
// import type { RNG } from "../../shared/rng";
// import type { TopicContext } from "../../generatorTypes";

import type { PracticeKind } from "@prisma/client";
import {DragReorderExercise} from "@/lib/practice/types";
import {RNG} from "@/lib/practice/generator/shared/rng";
import {GenOut} from "@/lib/practice/generator/shared/expected";
import {TopicContext} from "@/lib/practice/generator/generatorTypes";

type HandlerArgs = {
    rng: RNG;
    diff: Difficulty;
    id: string;
    topic: string;
    variant: number;
};

type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;
type PoolItem = { key: string; w: number; kind?: PracticeKind };

function readPoolFromMeta(meta: any): PoolItem[] {
    const pool = meta?.pool;
    if (!Array.isArray(pool)) return [];
    return pool
        .map((p: any) => ({
            key: String(p?.key ?? "").trim(),
            w: Number(p?.w ?? 0),
            kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
        }))
        .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}

type TextExpected = { kind: "text_input"; answers: string[]; match?: "exact" | "includes" };
type DragExpected = { kind: "drag_reorder"; tokenIds: string[] };
type MultiExpected = { kind: "multi_choice"; optionIds: string[] };

function makeTextExpected(answers: string[], match: "exact" | "includes" = "includes"): TextExpected {
    return { kind: "text_input", answers, match };
}
function makeDragExpected(tokenIds: string[]): DragExpected {
    return { kind: "drag_reorder", tokenIds };
}
function makeMultiExpected(optionIds: string[]): MultiExpected {
    return { kind: "multi_choice", optionIds };
}

// --------------------------
// deterministic helpers
// --------------------------
function sha1Hex(s: string) {
    return createHash("sha1").update(s).digest("hex");
}

function u01(seed: string): number {
    const buf = createHash("sha1").update(seed).digest();
    const x = buf.readUInt32BE(0);
    return (x + 1) / (2 ** 32 + 2);
}

function hashInt(seed: string, mod: number) {
    const buf = createHash("sha1").update(seed).digest();
    const x = buf.readUInt32BE(0);
    return mod <= 0 ? 0 : x % mod;
}

function parseSlotFromSalt(s: unknown): number | null {
    const str = typeof s === "string" ? s : "";
    const m = str.match(/(?:^|\|)\s*(?:slot|q)\s*=\s*(\d+)\s*(?:\||$)/i);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) && n >= 1 ? n : null;
}

function quizBaseFromSalt(s: unknown): string {
    const str = typeof s === "string" ? s : "";
    const parts = str.split("|").map((p) => p.trim()).filter(Boolean);
    const drop = ["slot=", "q=", "try=", "seed=", "rep=", "nonce="];
    return parts.filter((p) => !drop.some((d) => p.toLowerCase().startsWith(d))).join("|");
}

function pickByIndex<T>(arr: T[], idx: number): T {
    if (!arr.length) throw new Error("pickByIndex: empty array");
    const i = ((idx % arr.length) + arr.length) % arr.length;
    return arr[i];
}

// stepping helper to avoid obvious patterns
function permIndex(i: number, mod: number, step: number, offset = 0) {
    if (mod <= 0) return 0;
    return (offset + i * step) % mod;
}

// --------------------------
// ✅ key-first slot picking (forces mixed UI)
// --------------------------
function weightedKeyPermutation(base: string, topic: string, pool: PoolItem[]) {
    const scored = pool.map((p) => {
        const u = u01(`${base}|${topic}|key=${p.key}`);
        const score = -Math.log(u) / p.w;
        return { p, score };
    });
    scored.sort((a, b) => a.score - b.score);
    return scored.map((s) => s.p);
}

function pickKeyVariantForSlot(args: {
    pool: PoolItem[];
    topic: string;
    salt: unknown;
    variantsPerKey: number;
}): { key: string; variant: number } | null {
    const slot = parseSlotFromSalt(args.salt);
    if (!slot) return null;

    const base = quizBaseFromSalt(args.salt) || "quiz";
    const keyOrder = weightedKeyPermutation(base, args.topic, args.pool);
    if (!keyOrder.length) return null;

    const idx = (slot - 1) % keyOrder.length; // rotates keys (mixes UI)
    const cycle = Math.floor((slot - 1) / keyOrder.length); // next loop changes variants

    const key = keyOrder[idx].key;
    const variant = hashInt(`${base}|${args.topic}|${key}|cycle=${cycle}`, Math.max(1, args.variantsPerKey));
    return { key, variant };
}

function dedupeKeyFor(topic: string, key: string, variant: number) {
    return sha1Hex(`${topic}|${key}|v=${variant}`).slice(0, 16);
}

// --------------------------
// variant factories
// --------------------------
const VARIANTS_PER_HANDLER = 64;

const GOOD_TASK_VERBS = ["Draft", "Summarize", "Organize", "Explain", "Rewrite", "Brainstorm", "Outline", "Clarify"];
const GOOD_TASK_OBJECTS = [
    "an email to a customer",
    "lecture notes into an outline",
    "a confusing paragraph in simpler words",
    "a to-do list from requirements",
    "a short study plan",
    "a job description into bullet points",
    "meeting notes into action items",
    "a first-pass answer with structure",
    "pros/cons for a decision",
    "a rubric for grading",
    "a README from a project description",
    "a list of questions to ask in an interview",
    "a draft tutorial for beginners",
    "a summary for a non-technical audience",
];

const WRONG_WEB = [
    "Real-time web browsing with guaranteed latest facts",
    "Checking today’s news without any verification",
    "Providing the newest stock price with certainty",
    "Reading live web pages directly (without tools)",
];
const WRONG_PRIVATE = [
    "Accessing your private accounts automatically",
    "Logging into your bank or email for you",
    "Viewing your private files without you sharing them",
    "Retrieving passwords from your device",
];

function bestForVariant(variant: number) {
    const good =
        `${pickByIndex(GOOD_TASK_VERBS, permIndex(variant, GOOD_TASK_VERBS.length, 3))} ` +
        `${pickByIndex(GOOD_TASK_OBJECTS, permIndex(variant, GOOD_TASK_OBJECTS.length, 5))}`;

    const wrongA = pickByIndex(WRONG_WEB, permIndex(variant, WRONG_WEB.length, 1));
    const wrongC = pickByIndex(WRONG_PRIVATE, permIndex(variant, WRONG_PRIVATE.length, 3));

    const prompts = [
        "Which task is ChatGPT typically best at?",
        "What’s a strong use-case for ChatGPT without extra tools?",
        "Which is the most appropriate use of ChatGPT here?",
        "Which task fits ChatGPT’s strengths the best?",
    ];
    const prompt = pickByIndex(prompts, permIndex(variant, prompts.length, 1));

    return { prompt, options: { a: wrongA, b: good, c: wrongC }, correct: "b" as const, hint: "Think: first draft + structure, then verify." };
}

const WORKFLOW_SETS: Array<[string, string, string]> = [
    ["Ask", "Refine", "Finalize"],
    ["Ask", "Add constraints", "Request final output"],
    ["Draft prompt", "Improve prompt", "Generate final"],
    ["Describe goal", "Provide examples/constraints", "Ask for final format"],
    ["Start broad", "Narrow with details", "Finalize deliverable"],
    ["Write draft", "Edit/clarify", "Publish final"],
];

function workflowVariant(variant: number) {
    return pickByIndex(WORKFLOW_SETS, permIndex(variant, WORKFLOW_SETS.length, 1));
}

const BULLET_COUNTS = [5, 6, 7];
const BULLET_CONCEPTS = [
    "compound interest",
    "SQL JOINs",
    "the dot product",
    "variables in Python",
    "debugging a bug report",
    "REST APIs",
    "recursion",
    "unit testing",
    "hash tables",
    "CSS flexbox",
    "asymptotic Big-O",
    "data normalization",
    "Git branching",
    "functions vs methods",
    "the mean vs median",
    "linear regression",
];
const AUDIENCES = [
    "a beginner",
    "a high school student",
    "a first-year college student",
    "a busy professional",
    "a 12-year-old",
    "someone learning English",
    "a non-technical manager",
    "a developer new to the topic",
];

function bulletsVariant(variant: number) {
    const bullets = pickByIndex(BULLET_COUNTS, permIndex(variant, BULLET_COUNTS.length, 1));
    const concept = pickByIndex(BULLET_CONCEPTS, permIndex(variant, BULLET_CONCEPTS.length, 7));
    const audience = pickByIndex(AUDIENCES, permIndex(variant, AUDIENCES.length, 3));
    return { bullets, concept, audience };
}

const PII_NAMES = ["Sarah Johnson", "Michael Lee", "Amy Rivera", "Daniel Kim", "Fatima Ali", "Noah Patel", "Sofia Martinez"];
const PII_ADDR = ["44 Oak St", "12 Pine Ave", "900 Lake Shore Dr", "7 Maple Rd", "210 Cedar Blvd"];
const PII_EMAIL = ["amy@example.com", "noah.patel@mail.com", "s.martinez@company.com", "dan.kim@school.edu"];
const PII_IDS = ["A-19384", "T-2041", "INV-8821", "REQ-7712", "ACC-55019"];
const PII_PHONE = ["(555) 123-8899", "(555) 202-4411", "(555) 987-1001"];

function redactVariant(variant: number) {
    const name = pickByIndex(PII_NAMES, permIndex(variant, PII_NAMES.length, 3));
    const addr = pickByIndex(PII_ADDR, permIndex(variant, PII_ADDR.length, 2));
    const id = pickByIndex(PII_IDS, permIndex(variant, PII_IDS.length, 5));
    const phone = pickByIndex(PII_PHONE, permIndex(variant, PII_PHONE.length, 1));
    const email = pickByIndex(PII_EMAIL, permIndex(variant, PII_EMAIL.length, 4));

    const templates = [
        `Redact this: "${name} at ${addr} has order #${id}" using placeholders.`,
        `Redact this: "${name}'s phone is ${phone} and ticket #${id}" using placeholders.`,
        `Redact this: "Customer ${name}, email ${email}, invoice ${id}" using placeholders.`,
    ];
    return { raw: pickByIndex(templates, permIndex(variant, templates.length, 1)) };
}

const SAFETY_PROMPTS = [
    "Which is safest to paste into ChatGPT?",
    "Which is safest to share with an AI assistant?",
    "Which item is most appropriate to include in a prompt?",
    "Which is the best privacy-safe choice?",
];
const SAFE_REDACTED = [
    "A redacted message using [CUSTOMER] and [ORDER_ID]",
    "A snippet with placeholders like [USER] and [SESSION_ID]",
    "An example with identifiers removed and roles substituted",
    "A short description with no personal identifiers",
];
const UNSAFE_SECRET = [
    "A screenshot with an API key visible",
    "A log line containing a JWT token",
    "A config file with DATABASE_URL and password",
    "A .env file with secrets",
];
const UNSAFE_PII = [
    "A support email with full name + address",
    "A photo of a passport/ID",
    "A medical record with patient name",
    "A spreadsheet with phone numbers and emails",
];

function safetyVariant(variant: number) {
    const prompt = pickByIndex(SAFETY_PROMPTS, permIndex(variant, SAFETY_PROMPTS.length, 1));
    const a = pickByIndex(UNSAFE_SECRET, permIndex(variant, UNSAFE_SECRET.length, 3));
    const b = pickByIndex(UNSAFE_PII, permIndex(variant, UNSAFE_PII.length, 1));
    const c = pickByIndex(SAFE_REDACTED, permIndex(variant, SAFE_REDACTED.length, 5));
    return { prompt, options: { a, b, c }, correct: "c" as const, hint: "Prefer placeholders and remove identifiers." };
}

const DATACONTROLS_PROMPTS = [
    "Where do you usually find Data Controls in ChatGPT?",
    "Where do you manage privacy/data settings in ChatGPT?",
    "Where can you change data sharing or training controls?",
    "Where do you find settings like Data Controls?",
];

function dataControlsVariant(variant: number) {
    return { prompt: pickByIndex(DATACONTROLS_PROMPTS, permIndex(variant, DATACONTROLS_PROMPTS.length, 1)) };
}

// --------------------------
// ✅ HANDLERS (ALL keys you referenced in AI_TOPICS)
// --------------------------
const HANDLERS: Record<string, Handler> = {
    // capabilities
    ai_capabilities_best_for_mcq: ({ diff, id, topic, variant }) => {
        const v = bestForVariant(variant);
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Best use-case",
            prompt: v.prompt,
            options: [
                { id: "a", text: v.options.a },
                { id: "b", text: v.options.b },
                { id: "c", text: v.options.c },
            ],
            hint: v.hint,
        };
        (ex as any).templateId = "ai_capabilities_best_for_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_capabilities_best_for_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: v.correct } };
    },

    ai_capabilities_examples_multi: ({ diff, id, topic, variant }) => {
        const prompt = "Which are good, realistic uses of ChatGPT (without extra tools)? Pick all that apply.";
        const good1 = pickByIndex(GOOD_TASK_OBJECTS, permIndex(variant, GOOD_TASK_OBJECTS.length, 3));
        const good2 = pickByIndex(GOOD_TASK_OBJECTS, permIndex(variant + 7, GOOD_TASK_OBJECTS.length, 5));
        const bad1 = pickByIndex(WRONG_WEB, permIndex(variant, WRONG_WEB.length, 1));
        const bad2 = pickByIndex(WRONG_PRIVATE, permIndex(variant, WRONG_PRIVATE.length, 2));

        const ex: MultiChoiceExercise = {
            id, topic, difficulty: diff, kind: "multi_choice",
            title: "Good uses (multi)",
            prompt,
            options: [
                { id: "a", text: `Draft/organize: ${good1}` },
                { id: "b", text: bad1 },
                { id: "c", text: `Explain/outline: ${good2}` },
                { id: "d", text: bad2 },
            ],
            hint: "Good: drafting, summarizing, explaining. Not good: guaranteed-live facts or private access.",
        };

        (ex as any).templateId = "ai_capabilities_examples_multi";
        (ex as any).params = { variant };

        return { archetype: `ai_capabilities_examples_multi@v${variant + 1}`, exercise: ex, expected: makeMultiExpected(["a", "c"]) };
    },

    ai_capabilities_limits_mcq: ({ diff, id, topic, variant }) => {
        const prompts = [
            "Which statement is most accurate about ChatGPT’s limitations?",
            "What should you assume about ChatGPT outputs by default?",
            "Which is the safest mindset with AI answers?",
        ];
        const prompt = pickByIndex(prompts, permIndex(variant, prompts.length, 1));

        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Limits",
            prompt,
            options: [
                { id: "a", text: "It always knows the latest real-world facts." },
                { id: "b", text: "It can be helpful, but you should verify important claims." },
                { id: "c", text: "It can automatically access your private accounts." },
            ],
            hint: "Use AI as a draft + helper, then verify important facts.",
        };

        (ex as any).templateId = "ai_capabilities_limits_mcq";
        (ex as any).params = { variant };

        return { archetype: `ai_capabilities_limits_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "b" } };
    },

    // workflow
    ai_workflow_order_drag: ({ diff, id, topic, variant }) => {
        const [t1, t2, t3] = workflowVariant(variant);
        const ex: DragReorderExercise = {
            id, topic, difficulty: diff, kind: "drag_reorder",
            title: "Workflow order",
            prompt: "Put the workflow in the correct order.",
            tokens: [
                { id: "t1", text: t1 },
                { id: "t2", text: t2 },
                { id: "t3", text: t3 },
            ],
            hint: "Start broad, then add constraints, then request final output.",
        };
        (ex as any).templateId = "ai_workflow_order_drag";
        (ex as any).params = { variant };
        return { archetype: `ai_workflow_order_drag@v${variant + 1}`, exercise: ex, expected: makeDragExpected(["t1", "t2", "t3"]) };
    },

    ai_workflow_refine_best_mcq: ({ diff, id, topic, variant }) => {
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Refine step",
            prompt: "What’s the best refinement after you get a first draft?",
            options: [
                { id: "a", text: "Ask for sources and request a stricter format/constraints." },
                { id: "b", text: "Stop and accept the first answer as final." },
                { id: "c", text: "Add private information to improve accuracy." },
            ],
            hint: "Refine = add constraints + ask for verification where needed.",
        };
        (ex as any).templateId = "ai_workflow_refine_best_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_workflow_refine_best_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "a" } };
    },

    ai_workflow_finalize_prompt_text: ({ diff, id, topic, variant }) => {
        const formats = ["bullets", "steps", "a table"];
        const f = pickByIndex(formats, permIndex(variant, formats.length, 1));

        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Finalize prompt",
            prompt: `Write a final prompt that asks for a clear output in ${f} and includes at least 2 constraints.`,
            placeholder: "Type your final prompt…",
            ui: "long",
            hint: "Include constraints like audience, length, tone, examples, etc.",
        };
        (ex as any).templateId = "ai_workflow_finalize_prompt_text";
        (ex as any).params = { variant, format: f };

        return { archetype: `ai_workflow_finalize_prompt_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected([f, "audience", "tone", "example", "limit"]) };
    },

    // asking format
    ai_format_choose_mcq: ({ diff, id, topic, variant }) => {
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Pick the best format request",
            prompt: "Which prompt best asks for a specific format?",
            options: [
                { id: "a", text: "Explain photosynthesis." },
                { id: "b", text: "Explain photosynthesis in 5 bullets for a beginner." },
                { id: "c", text: "Explain photosynthesis and also guess tomorrow’s news." },
            ],
            hint: "Best prompts specify: format + audience + constraints.",
        };
        (ex as any).templateId = "ai_format_choose_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_format_choose_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "b" } };
    },

    ai_format_bullets_text: ({ diff, id, topic, variant }) => {
        const v = bulletsVariant(variant);
        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Ask for bullets",
            prompt: `Write a good prompt to get **${v.bullets} bullets** explaining "${v.concept}" for ${v.audience}.`,
            placeholder: "Type your prompt…",
            ui: "long",
            hint: `Include: "${v.bullets} bullets" + audience level.`,
        };
        (ex as any).templateId = "ai_format_bullets_text";
        (ex as any).params = { variant, bullets: v.bullets, concept: v.concept };
        return { archetype: `ai_format_bullets_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected(["bullets", `${v.bullets} bullets`, "five bullets", "6 bullets", "7 bullets"]) };
    },

    ai_format_steps_text: ({ diff, id, topic, variant }) => {
        const subjects = ["making tea", "solving a quadratic equation", "writing a resume bullet", "using git rebase safely"];
        const s = pickByIndex(subjects, permIndex(variant, subjects.length, 1));

        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Ask for steps",
            prompt: `Write a prompt asking for step-by-step instructions for "${s}" (include number of steps).`,
            placeholder: "Type your prompt…",
            ui: "long",
            hint: `Include: "Give me N steps" + audience level.`,
        };

        (ex as any).templateId = "ai_format_steps_text";
        (ex as any).params = { variant };

        return { archetype: `ai_format_steps_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected(["steps", "step-by-step", "1", "2", "3"]) };
    },

    // dont paste
    ai_dontpaste_identify_multi: ({ diff, id, topic, variant }) => {
        const ex: MultiChoiceExercise = {
            id, topic, difficulty: diff, kind: "multi_choice",
            title: "Spot sensitive info",
            prompt: "Which items should NOT be pasted into ChatGPT? Pick all that apply.",
            options: [
                { id: "a", text: "A .env file with API keys" },
                { id: "b", text: "A redacted message using [CUSTOMER] and [ORDER_ID]" },
                { id: "c", text: "A screenshot showing a JWT token" },
                { id: "d", text: "A short generic question with no identifiers" },
            ],
            hint: "Secrets + identifiers = don’t paste. Redacted placeholders are safer.",
        };
        (ex as any).templateId = "ai_dontpaste_identify_multi";
        (ex as any).params = { variant };
        return { archetype: `ai_dontpaste_identify_multi@v${variant + 1}`, exercise: ex, expected: makeMultiExpected(["a", "c"]) };
    },

    ai_dontpaste_scenario_mcq: ({ diff, id, topic, variant }) => {
        const v = safetyVariant(variant);
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Safety decision",
            prompt: v.prompt,
            options: [
                { id: "a", text: v.options.a },
                { id: "b", text: v.options.b },
                { id: "c", text: v.options.c },
            ],
            hint: v.hint,
        };
        (ex as any).templateId = "ai_dontpaste_scenario_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_dontpaste_scenario_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: v.correct } };
    },

    ai_dontpaste_safe_alt_text: ({ diff, id, topic, variant }) => {
        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Safer alternative",
            prompt: `Rewrite this safely with placeholders: "Please refund order #A-19384 for Sarah Johnson at 44 Oak St"`,
            placeholder: "Type your safe version…",
            ui: "long",
            hint: "Use placeholders like [CUSTOMER], [ORDER_ID], [ADDRESS].",
        };
        (ex as any).templateId = "ai_dontpaste_safe_alt_text";
        (ex as any).params = { variant };
        return { archetype: `ai_dontpaste_safe_alt_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected(["[customer]", "[order_id]", "[address]"]) };
    },

    // redaction
    ai_redaction_replace_text: ({ diff, id, topic, variant }) => {
        const v = redactVariant(variant);
        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Redaction",
            prompt: v.raw,
            placeholder: "Type your redacted version…",
            ui: "long",
            hint: "Example placeholders: [CUSTOMER], [ADDRESS], [ORDER_ID]",
        };
        (ex as any).templateId = "ai_redaction_replace_text";
        (ex as any).params = { variant };
        return { archetype: `ai_redaction_replace_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected(["[customer]", "[address]", "[order_id]", "[email]", "[phone]"]) };
    },

    ai_redaction_best_practice_mcq: ({ diff, id, topic, variant }) => {
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Best redaction practice",
            prompt: "What is the best redaction approach before sharing text with an AI?",
            options: [
                { id: "a", text: "Keep names, but remove punctuation" },
                { id: "b", text: "Replace identifiers with placeholders like [CUSTOMER] and remove IDs" },
                { id: "c", text: "Include full address so the AI has context" },
            ],
            hint: "Replace identifiers, don’t just obscure them.",
        };
        (ex as any).templateId = "ai_redaction_best_practice_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_redaction_best_practice_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "b" } };
    },

    ai_redaction_remove_multi: ({ diff, id, topic, variant }) => {
        const ex: MultiChoiceExercise = {
            id, topic, difficulty: diff, kind: "multi_choice",
            title: "What to remove",
            prompt: "Which items are typically sensitive identifiers to remove/redact? Pick all that apply.",
            options: [
                { id: "a", text: "Full name" },
                { id: "b", text: "API keys / tokens" },
                { id: "c", text: "Order / ticket IDs" },
                { id: "d", text: "Generic role names like “Customer”" },
            ],
            hint: "Remove identifiers + secrets. Generic roles are fine.",
        };
        (ex as any).templateId = "ai_redaction_remove_multi";
        (ex as any).params = { variant };
        return { archetype: `ai_redaction_remove_multi@v${variant + 1}`, exercise: ex, expected: makeMultiExpected(["a", "b", "c"]) };
    },

    // data controls
    ai_datacontrols_where_mcq: ({ diff, id, topic, variant }) => {
        const v = dataControlsVariant(variant);
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Find Data Controls",
            prompt: v.prompt,
            options: [
                { id: "a", text: "Inside a chat message menu (⋯) only" },
                { id: "b", text: "In Settings (account/app settings area)" },
                { id: "c", text: "You can’t access them" },
            ],
            hint: "The lab is: open Settings → find Data Controls.",
        };
        (ex as any).templateId = "ai_datacontrols_where_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_datacontrols_where_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "b" } };
    },

    ai_datacontrols_why_mcq: ({ diff, id, topic, variant }) => {
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Why Data Controls matter",
            prompt: "Why do Data Controls matter?",
            options: [
                { id: "a", text: "They improve your Wi-Fi speed" },
                { id: "b", text: "They help manage privacy/data usage settings for your account" },
                { id: "c", text: "They automatically delete your entire chat history always" },
            ],
            hint: "Think privacy + data settings management.",
        };
        (ex as any).templateId = "ai_datacontrols_why_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_datacontrols_why_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "b" } };
    },

    ai_datacontrols_terms_multi: ({ diff, id, topic, variant }) => {
        const ex: MultiChoiceExercise = {
            id, topic, difficulty: diff, kind: "multi_choice",
            title: "Data Controls concepts",
            prompt: "Which are commonly related to Data Controls / privacy settings? Pick all that apply.",
            options: [
                { id: "a", text: "Data sharing / training settings" },
                { id: "b", text: "Chat history controls" },
                { id: "c", text: "Bank password vault" },
                { id: "d", text: "Account privacy settings" },
            ],
            hint: "It’s about privacy + how your data is used.",
        };
        (ex as any).templateId = "ai_datacontrols_terms_multi";
        (ex as any).params = { variant };
        return { archetype: `ai_datacontrols_terms_multi@v${variant + 1}`, exercise: ex, expected: makeMultiExpected(["a", "b", "d"]) };
    },

    // labs
    ai_lab_ui_check_mcq: ({ diff, id, topic, variant }) => {
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Lab check",
            prompt: "After completing the lab, what should you be able to do?",
            options: [
                { id: "a", text: "Locate Data Controls in Settings" },
                { id: "b", text: "Recover any password from your device" },
                { id: "c", text: "Force ChatGPT to browse the web in real time" },
            ],
        };
        (ex as any).templateId = "ai_lab_ui_check_mcq";
        (ex as any).params = { variant };
        return { archetype: `ai_lab_ui_check_mcq@v${variant + 1}`, exercise: ex, expected: { kind: "single_choice", optionId: "a" } };
    },

    ai_lab_prompt_text: ({ diff, id, topic, variant }) => {
        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Lab prompt",
            prompt: `Type the prompt you would paste into ChatGPT: "Explain what you can help me with in 5 bullets..."`,
            placeholder: "Paste/type your prompt…",
            ui: "long",
        };
        (ex as any).templateId = "ai_lab_prompt_text";
        (ex as any).params = { variant };
        return { archetype: `ai_lab_prompt_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected(["5 bullets", "bullets"]) };
    },

    ai_lab_submit_text: ({ diff, id, topic, variant }) => {
        const ex: TextInputExercise = {
            id, topic, difficulty: diff, kind: "text_input",
            title: "Lab submit",
            prompt: "Paste your 5 bullets + a 1-sentence reflection (what you learned).",
            placeholder: "Paste here…",
            ui: "long",
        };
        (ex as any).templateId = "ai_lab_submit_text";
        (ex as any).params = { variant };
        return { archetype: `ai_lab_submit_text@v${variant + 1}`, exercise: ex, expected: makeTextExpected(["bullet", "learned", "reflection"]) };
    },

    // fallback
    fallback: ({ diff, id, topic, variant }) => {
        const ex: SingleChoiceExercise = {
            id, topic, difficulty: diff, kind: "single_choice",
            title: "Kickstart (fallback)",
            prompt: "What’s the best habit with AI outputs?",
            options: [
                { id: "a", text: "Trust everything without checking" },
                { id: "b", text: "Use as a first draft and verify important claims" },
                { id: "c", text: "Share private keys for better answers" },
            ],
        };
        (ex as any).templateId = "fallback";
        (ex as any).params = { variant };
        return { archetype: "fallback", exercise: ex, expected: { kind: "single_choice", optionId: "b" } };
    },
};

const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
    .filter((k) => k !== "fallback")
    .map((k) => ({ key: k, w: 1 }));

export function makeGenAiMod0(ctx: TopicContext) {
    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const R: RNG = (ctx as any).rng ?? rng;
        const topic = String(ctx.topicSlug);

        const basePool = readPoolFromMeta((ctx as any).meta ?? ctx.meta).filter((p) => p.key in HANDLERS);
        const pool = basePool.length ? basePool : SAFE_MIXED_POOL;

        // ✅ quiz-slot mode: MIX UI by rotating KEYS, then vary content by variant
        const picked = pickKeyVariantForSlot({
            pool,
            topic,
            salt: (ctx as any).salt,
            variantsPerKey: VARIANTS_PER_HANDLER,
        });

        if (picked) {
            const handler = HANDLERS[picked.key] ?? HANDLERS.fallback;
            const out = handler({ rng: R, diff, id, topic, variant: picked.variant });
            (out.exercise as any).dedupeKey = dedupeKeyFor(topic, picked.key, picked.variant);
            return out;
        }

        // non-quiz calls: random key + random variant
        const pickedKey = R.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
        const key = String(pickedKey);
        const variant = R.int(0, VARIANTS_PER_HANDLER - 1);

        const handler = HANDLERS[key] ?? HANDLERS.fallback;
        const out = handler({ rng: R, diff, id, topic, variant });
        (out.exercise as any).dedupeKey = dedupeKeyFor(topic, key, variant);
        return out;
    };
}
