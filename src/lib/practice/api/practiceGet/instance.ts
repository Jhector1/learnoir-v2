// src/lib/practice/api/practiceGet/instance.ts
import type { PrismaClient } from "@prisma/client";
import {
  PracticeKind,
  PracticeDifficulty as DbPracticeDifficulty,
  PracticePurpose,
} from "@prisma/client";

import { toDbTopicSlug } from "@/lib/practice/topicSlugs";
import type { Difficulty, Exercise, TopicSlug } from "@/lib/practice/types";

import { toPracticeKindOrThrow, toDbDifficultyOrThrow } from "./enums";
import { normalizeExpectedForSave } from "./expected";

function buildExpectedAnswerPayload(kind: PracticeKind, expectedCanon: any) {
  // ✅ NEVER store safe expected for code_input
  if (kind === PracticeKind.code_input) return null;

  if (kind === PracticeKind.single_choice) {
    const optionId =
        expectedCanon?.optionId ??
        expectedCanon?.correctOptionId ??
        expectedCanon?.correct ??
        null;

    return optionId ? { kind: "single_choice", optionId: String(optionId) } : null;
  }
  if (
      kind === PracticeKind.text_input ||
      kind === PracticeKind.word_bank_arrange ||
      kind === PracticeKind.listen_build ||
      kind === PracticeKind.fill_blank_choice
  ) {
    const v =
        typeof expectedCanon?.value === "string"
            ? expectedCanon.value
            : Array.isArray(expectedCanon?.answers) && typeof expectedCanon.answers[0] === "string"
                ? expectedCanon.answers[0]
                : null;

    return v ? { kind: String(kind), value: String(v) } : null;
  }
  if (kind === PracticeKind.multi_choice) {
    const ids =
        expectedCanon?.optionIds ??
        expectedCanon?.correctOptionIds ??
        expectedCanon?.correct ??
        null;

    if (!Array.isArray(ids) || !ids.length) return null;
    return { kind: "multi_choice", optionIds: ids.map((x: any) => String(x)) };
  }

  if (kind === PracticeKind.drag_reorder) {
    const order = expectedCanon?.order ?? expectedCanon?.tokenIds ?? null;
    if (!Array.isArray(order) || !order.length) return null;
    return { kind: "drag_reorder", order: order.map((x: any) => String(x)) };
  }

  return null;
}

function toDbPurpose(purpose?: string | null): PracticePurpose {
  return purpose === "project" ? PracticePurpose.project : PracticePurpose.quiz;
}

export async function createInstance(args: {
  prisma: PrismaClient;
  sessionId: string | null;
  exercise: Exercise;
  expected: any;
  topicSlug: TopicSlug;
  difficulty: Difficulty;
  topicIdHint?: string | null;

  // ✅ NEW
  purpose?: "quiz" | "project" | PracticePurpose | null;
}) {
  const {
    prisma,
    sessionId,
    exercise,
    expected,
    topicSlug,
    difficulty,
    topicIdHint,
    purpose,
  } = args;

  const difficultyValue = ((exercise as any).difficulty ?? difficulty) as Difficulty;
  const dbDifficulty: DbPracticeDifficulty = toDbDifficultyOrThrow(difficultyValue);

  const dbTopicSlug = toDbTopicSlug(String(topicSlug)) as TopicSlug;

  const topicId =
      topicIdHint ??
      (await prisma.practiceTopic
          .findUnique({ where: { slug: dbTopicSlug }, select: { id: true } })
          .then((t) => {
            if (!t) throw new Error(`Topic slug "${dbTopicSlug}" not found in DB.`);
            return t.id;
          }));

  const kindEnum: PracticeKind = toPracticeKindOrThrow((exercise as any)?.kind);

  const expectedCanon = normalizeExpectedForSave(kindEnum, expected);

// ✅ validate AFTER normalization so compat coercions work
  if (expectedCanon?.kind && String(expectedCanon.kind) !== String(kindEnum)) {
    throw new Error(`Expected.kind "${expectedCanon.kind}" != instance kind "${kindEnum}".`);
  }
  const publicPayload = { ...(exercise as any), topic: dbTopicSlug } as any;

  if (kindEnum === PracticeKind.matrix_input) {
    const v = expectedCanon?.values as number[][];
    publicPayload.rows ??= v.length;
    publicPayload.cols ??= v[0]?.length ?? 0;
  }

  const expectedAnswerPayload = buildExpectedAnswerPayload(kindEnum, expectedCanon);

  const explanation =
      typeof expected?.explanation === "string"
          ? expected.explanation
          : typeof expected?.rationale === "string"
              ? expected.rationale
              : null;

  const dbPurpose = typeof purpose === "string" ? toDbPurpose(purpose) : (purpose ?? PracticePurpose.quiz);

  // helpful for client/debug if you want it
  publicPayload.purpose = String(dbPurpose);
  return prisma.practiceQuestionInstance.create({
    data: {
      sessionId,
      kind: kindEnum,
      topicId,
      difficulty: dbDifficulty,

      // ✅ NEW
      purpose: dbPurpose,

      title: String((exercise as any).title ?? "Practice"),
      prompt: String((exercise as any).prompt ?? ""),
      publicPayload,
      secretPayload: {
        expected: expectedCanon,
        expectedAnswerPayload,
        explanation,
      },
    },
    select: { id: true, sessionId: true },
  });
}