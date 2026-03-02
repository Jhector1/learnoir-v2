// src/lib/i18n/resolveDeepTagged.ts
import { isTaggedKey, stripTag } from "@/i18n/tagged";

export function resolveDeepTagged(input: unknown, tKey: (key: string) => string): unknown {
    if (typeof input === "string") {
        if (isTaggedKey(input)) return tKey(stripTag(input));
        return input;
    }
    if (Array.isArray(input)) return input.map((x) => resolveDeepTagged(x, tKey));
    if (input && typeof input === "object") {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(input as any)) {
            out[k] = resolveDeepTagged(v, tKey);
        }
        return out;
    }
    return input;
}