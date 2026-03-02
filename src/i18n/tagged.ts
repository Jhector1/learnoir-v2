// import { useTranslations } from "next-intl";

// export const I18N_TAG = "@:";
//
// // only treat as key if it looks like a key (avoid spaces/newlines)
// const KEY_RE = /^[a-zA-Z0-9_.:-]+$/;
//
// export function isTaggedKey(x: unknown): x is string {
//     if (typeof x !== "string") return false;
//     if (!x.startsWith(I18N_TAG)) return false;
//     const k = x.slice(I18N_TAG.length);
//     return k.length > 0 && KEY_RE.test(k);
// }
//
// export function stripTag(x: string) {
//     return x.slice(I18N_TAG.length);
// }

/**
 * Client-side safe translation:
 * - never throws
 * - supports "@:foo.bar" -> translated string
 * - supports literal strings unchanged
 * - missing key -> fallback or empty (prod) / key (dev) depending on your preference
 */
// export function useTaggedT(namespace?: string) {
//     const t0 = useTranslations(namespace as any);
//
//     const has =
//         ((t0 as any).has?.bind(t0) as ((k: string) => boolean) | undefined) ??
//         (() => true); // if .has not available, assume true and rely on try/catch
//
//     const tSafe = (key: string, values?: Record<string, any>, fallback?: string) => {
//         try {
//             if (!has(key)) return fallback ?? "";
//             const out = t0(key as any, values as any);
//             return out || fallback || "";
//         } catch {
//             return fallback ?? "";
//         }
//     };
//
//     /** resolves either literal or "@:key" */
//     const resolve = (textOrTagged?: string | null, values?: Record<string, any>, fallback?: string) => {
//         if (!textOrTagged) return fallback ?? "";
//         if (!isTaggedKey(textOrTagged)) return textOrTagged;
//         return tSafe(stripTag(textOrTagged), values, fallback);
//     };
//
//     return { t: tSafe, resolve };
// }





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

    const tSafe = (key: string, values?: Record<string, any>, fallback?: string) => {
        try {
            if (!has(key)) return miss(key, fallback);
            const out = t0(key as any, values as any);
            return out || miss(key, fallback);
        } catch {
            return miss(key, fallback);
        }
    };

    const resolve = (textOrTagged?: string | null, values?: Record<string, any>, fallback?: string) => {
        if (!textOrTagged) return fallback ?? "";
        if (!isTaggedKey(textOrTagged)) return textOrTagged;
        return tSafe(stripTag(textOrTagged), values, fallback);
    };

    return { t: tSafe, resolve };
}