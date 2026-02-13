// export function cn(...cls: Array<string | false | null | undefined>) {
//     return cls.filter(Boolean).join(" ");
// }

/* Core surfaces */
export const CARD = "ui-sketch-panel";
export const PANEL = "ui-soft";

/* Text */
export const TITLE = "text-lg font-extrabold text-neutral-900 dark:text-white";
export const SUB = "text-sm text-neutral-600 dark:text-white/70";
// export const LABEL = "ui-sketch-label";
// export const MUTED = "ui-sketch-muted";

/* Buttons */
export const BTN = "ui-btn ui-btn-secondary";
export const BTN_SOLID = "ui-btn ui-btn-primary";
export const BTN_GHOST = "ui-btn ui-btn-ghost";
//
// /* Pills */
// export const PILL = "ui-pill ui-pill--neutral";
// export const PILL_GOOD = "ui-pill ui-pill--good";
// export const PILL_WARN = "ui-pill ui-pill--warn";

// /* Quiz/choice styles (nice for toggles) */
// export const CHOICE_IDLE = "ui-quiz-choice ui-quiz-choice--idle";
// export const CHOICE_SELECTED = "ui-quiz-choice ui-quiz-choice--selected";
export const EXPLAIN = "ui-quiz-explain";

/* Form fields */
// export const INPUT = "ui-sketch-input";

/* Code blocks / previews */
// export const CODEBLOCK = "ui-sketch-codeblock";
// export const CODE = "ui-sketch-code";

/* Progress */
export const TRACK = "ui-progress-track";
export const FILL = "ui-progress-fill";

/* Helpers */
export async function copyText(s: string) {
    try {
        await navigator.clipboard.writeText(s);
        return true;
    } catch {
        return false;
    }
}




export function cn(...cls: Array<string | false | null | undefined>) {
    return cls.filter(Boolean).join(" ");
}

export const SHELL = "ui-sketch-panel";
export const SOFT = "ui-soft p-3";
export const LABEL = "ui-sketch-label";
export const MUTED = "ui-sketch-muted";

export const PILL = "ui-pill ui-pill--neutral";
export const PILL_GOOD = "ui-pill ui-pill--good";
export const PILL_WARN = "ui-pill ui-pill--warn";

export const BTN_PRIMARY = "ui-btn ui-btn-primary";
export const BTN_SECONDARY = "ui-btn ui-btn-secondary";

export const CHOICE_IDLE = "ui-quiz-choice ui-quiz-choice--idle";
export const CHOICE_SELECTED = "ui-quiz-choice ui-quiz-choice--selected";

export const INPUT = "ui-sketch-input";
export const CODEBLOCK = "ui-sketch-codeblock";
export const CODE = "ui-sketch-code";
