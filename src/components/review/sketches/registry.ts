import type { SketchEntry } from "./registryTypes";
import { AI_MOD0_SKETCHES } from "./ai/mod0/configs";
import {ARCHETYPE_GALLERY_SKETCHES} from "@/components/review/sketches/archetypes/gallery/registry";

const ALL: Record<string, SketchEntry> = {
    ...AI_MOD0_SKETCHES,
    // ...LA_SKETCHES,
    // ...PY_SKETCHES,
 ...ARCHETYPE_GALLERY_SKETCHES,
};

export function getSketchEntry(sketchId: string): SketchEntry | null {
    return ALL[sketchId] ?? null;
}
