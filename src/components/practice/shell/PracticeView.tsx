"use client";

import React from "react";
import ConfirmResetModal from "../ConfirmResetModal";
import type { PracticeShellProps } from "../PracticeShell";
import PracticeSidebar from "./PracticeSidebar";
import QuestionPanel from "./QuestionPanel";
import type { UseConceptExplainResult } from "../hooks/useConceptExplain";

export default function PracticeView(
  props: PracticeShellProps & {
    canSubmitNow: boolean;
    finalized: boolean;
    attempts: number;
    outOfAttempts: boolean;
    resultBoxClass: string;
    concept: UseConceptExplainResult;
  },
) {
  const {
    t,
    confirmOpen,
    applyPendingChange,
    cancelPendingChange,
    answeredCount,
    sessionSize,

    // derived
    canSubmitNow,
    finalized,
    attempts,
    outOfAttempts,
    resultBoxClass,
    concept,
  } = props;

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      {confirmOpen ? (
        <ConfirmResetModal
          open={confirmOpen}
          title={t("reset.title")}
          description={t("reset.description", { answered: answeredCount, sessionSize })}
          confirmText={t("reset.confirm")}
          cancelText={t("reset.cancel")}
          danger={true}
          onConfirm={applyPendingChange}
          onClose={cancelPendingChange}
        />
      ) : null}

      <div className="mx-auto max-w-5xl grid gap-4 lg:grid-cols-[minmax(320px,440px)_minmax(0,1fr)]">
        <PracticeSidebar
          {...props}
          canSubmitNow={canSubmitNow}
          finalized={finalized}
          attempts={attempts}
          outOfAttempts={outOfAttempts}
          resultBoxClass={resultBoxClass}
          concept={concept}
        />

        <QuestionPanel {...props} />
      </div>
    </div>
  );
}
