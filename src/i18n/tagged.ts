import { useTranslations } from "next-intl";

export const I18N_TAG = "@:";
const KEY_RE = /^[a-zA-Z0-9_.:-]+$/;

export function isTaggedKey(x: unknown): x is string {
    if (typeof x !== "string") return false;
    if (!x.startsWith(I18N_TAG)) return false;
    const k = x.slice(I18N_TAG.length);
    return k.length > 0 && KEY_RE.test(k);
}

export function stripTag(x: string) {
    return x.slice(I18N_TAG.length);
}

export function useTaggedT(namespace?: string) {
    const t0 = useTranslations(namespace as any);

    const DEV = process.env.NODE_ENV === "development";

    const has =
        ((t0 as any).has?.bind(t0) as ((k: string) => boolean) | undefined) ??
        (() => true);

    const miss = (key: string, fallback?: string) => {
        if (fallback != null) return fallback;
        if (DEV) return namespace ? `${namespace}.${key}` : key;
        return "";
    };

    // ✅ ICU-safe (keeps interpolation for normal UI strings)
    const tSafe = (key: string, values?: Record<string, any>, fallback?: string) => {
        try {
            if (!has(key)) return miss(key, fallback);
            const out = t0(key as any, values as any);
            return out || miss(key, fallback);
        } catch {
            return miss(key, fallback);
        }
    };

    // ✅ RAW-safe (does NOT parse ICU, so `{name}` in code blocks is fine)
    const rawSafe = (key: string, fallback?: string) => {
        try {
            if (!has(key)) return miss(key, fallback);
            const raw = (t0 as any).raw ? (t0 as any).raw(key as any) : t0(key as any);
            return raw || miss(key, fallback);
        } catch {
            return miss(key, fallback);
        }
    };

    /**
     * ✅ Resolves either:
     * - literal string unchanged
     * - "@:some.key" => raw translation (safe for markdown/code)
     */
    // inside useTaggedT(...)

    type Values = Record<string, any>;

// overloads (TS)
    function resolve(textOrTagged?: string | null, fallback?: string): string;
    function resolve(textOrTagged?: string | null, values?: Values, fallback?: string): string;

// implementation (runtime)
    function resolve(
        textOrTagged?: string | null,
        valuesOrFallback?: Values | string,
        maybeFallback?: string
    ) {
        const values = typeof valuesOrFallback === "object" && valuesOrFallback != null ? valuesOrFallback : undefined;
        const fallback = typeof valuesOrFallback === "string" ? valuesOrFallback : maybeFallback;

        if (!textOrTagged) return fallback ?? "";
        if (!isTaggedKey(textOrTagged)) return textOrTagged;

        const key = stripTag(textOrTagged);

        // ✅ IMPORTANT: tagged content uses RAW (no ICU parsing), so values are ignored here
        // (values is only kept for compatibility with older call sites)
        return rawSafe(key, fallback);
    }

    return { t: tSafe, raw: rawSafe, resolve };
}