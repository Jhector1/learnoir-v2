// src/lib/practice/api/practiceGet/instance.ts
import type { PrismaClient } from "@prisma/client";
import { PracticeKind, PracticeDifficulty as DbPracticeDifficulty } from "@prisma/client";

import { toDbTopicSlug } from "@/lib/practice/topicSlugs";
import type { Difficulty, Exercise, TopicSlug } from "@/lib/practice/types";

import { toPracticeKindOrThrow, toDbDifficultyOrThrow } from "./enums";
import { normalizeExpectedForSave } from "./expected";

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

  const expectedCanon = normalizeExpectedForSave(kindEnum, expected);

  // stamp into public payload for UI
  const publicPayload = { ...(exercise as any), topic: dbTopicSlug } as any;
  if (kindEnum === PracticeKind.matrix_input) {
    const v = expectedCanon?.values as number[][];
    publicPayload.rows ??= v.length;
    publicPayload.cols ??= v[0]?.length ?? 0;
  }

  return prisma.practiceQuestionInstance.create({
    data: {
      sessionId,
      kind: kindEnum,
      topicId,
      difficulty: dbDifficulty,
      title: String((exercise as any).title ?? "Practice"),
      prompt: String((exercise as any).prompt ?? ""),
      publicPayload,
      secretPayload: { expected: expectedCanon },
    },
    select: { id: true, sessionId: true },
  });
}
