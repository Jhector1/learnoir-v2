import type { PrismaClient } from "@prisma/client";
import {
  PracticeKind,
  PracticeDifficulty as DbPracticeDifficulty,
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

  // default: don't ship expected via history
  return null;
}

export async function createInstance(args: {
  prisma: PrismaClient;
  sessionId: string | null;
  exercise: Exercise;
  expected: any;
  topicSlug: TopicSlug;
  difficulty: Difficulty;
  topicIdHint?: string | null;
}) {
  const { prisma, sessionId, exercise, expected, topicSlug, difficulty, topicIdHint } = args;

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

  if (expected?.kind && String(expected.kind) !== String(kindEnum)) {
    throw new Error(`Expected.kind "${expected.kind}" != instance kind "${kindEnum}".`);
  }

  // ✅ canonicalize (code_input becomes tests[])
  const expectedCanon = normalizeExpectedForSave(kindEnum, expected);

  // stamp into public payload for UI
  const publicPayload = { ...(exercise as any), topic: dbTopicSlug } as any;
  if (kindEnum === PracticeKind.matrix_input) {
    const v = expectedCanon?.values as number[][];
    publicPayload.rows ??= v.length;
    publicPayload.cols ??= v[0]?.length ?? 0;
  }

  // ✅ safe expected for status/history (never code_input)
  const expectedAnswerPayload = buildExpectedAnswerPayload(kindEnum, expectedCanon);

  // optional safe explanation (never required)
  const explanation =
      typeof expected?.explanation === "string"
          ? expected.explanation
          : typeof expected?.rationale === "string"
              ? expected.rationale
              : null;

  return prisma.practiceQuestionInstance.create({
    data: {
      sessionId,
      kind: kindEnum,
      topicId,
      difficulty: dbDifficulty,
      title: String((exercise as any).title ?? "Practice"),
      prompt: String((exercise as any).prompt ?? ""),
      publicPayload,
      secretPayload: {
        expected: expectedCanon,           // 🔒 private (includes code tests)
        expectedAnswerPayload,             // ✅ safe for history UI
        explanation,                       // ✅ safe (optional)
      },
    },
    select: { id: true, sessionId: true },
  });
}