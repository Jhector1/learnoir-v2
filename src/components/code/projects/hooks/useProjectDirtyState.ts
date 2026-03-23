"use client";

import { useCallback, useMemo, useState } from "react";
import type { WorkspaceStateV2 } from "@/components/ide/fullide/types";

function snapshotOfWorkspace(ws: WorkspaceStateV2 | null | undefined) {
    return JSON.stringify(ws ?? null);
}

export function useProjectDirtyState(currentWorkspace: WorkspaceStateV2 | null) {
    const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

    const currentSnapshot = useMemo(
        () => snapshotOfWorkspace(currentWorkspace),
        [currentWorkspace],
    );

    const isDirty = useMemo(() => {
        if (!currentWorkspace) return false;
        if (savedSnapshot == null) return true;
        return currentSnapshot !== savedSnapshot;
    }, [currentWorkspace, currentSnapshot, savedSnapshot]);

    const markSaved = useCallback((ws?: WorkspaceStateV2 | null) => {
        setSavedSnapshot(snapshotOfWorkspace(ws ?? currentWorkspace));
    }, [currentWorkspace]);

    const markLoaded = useCallback((ws: WorkspaceStateV2 | null) => {
        setSavedSnapshot(snapshotOfWorkspace(ws));
    }, []);

    const clearSavedBaseline = useCallback(() => {
        setSavedSnapshot(null);
    }, []);

    return {
        isDirty,
        markSaved,
        markLoaded,
        clearSavedBaseline,
    };
}