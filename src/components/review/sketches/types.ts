export type SavedSketchState = {
    version?: number;
    updatedAt?: string;
    data: unknown; // archetype-owned
};

export type SketchTone = "neutral" | "good" | "info" | "warn" | "danger";
