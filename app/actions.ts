"use server";

import { Difficulty } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { evaluateBackTranslation } from "@/lib/evaluator";
import { parseTags } from "@/lib/utils";
import {
  attemptStepOneSchema,
  attemptStepTwoSchema,
  passageFormSchema,
} from "@/lib/validators/passage";

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export async function createAttemptStepOneAction(formData: FormData) {
  const parsed = attemptStepOneSchema.parse({
    passageId: formData.get("passageId"),
    userChinese: formData.get("userChinese"),
  });

  const attempt = await db.attempt.create({
    data: {
      passageId: parsed.passageId,
      userChinese: parsed.userChinese,
    },
  });

  redirect(`/practice/${attempt.id}/back-translation`);
}

export async function submitBackTranslationAction(
  attemptId: string,
  formData: FormData,
) {
  const parsed = attemptStepTwoSchema.parse({
    userBackTranslatedEnglish: formData.get("userBackTranslatedEnglish"),
  });

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { passage: true },
  });

  if (!attempt) {
    redirect("/attempts");
  }

  const evaluation = await evaluateBackTranslation({
    sourceEnglish: attempt.passage.sourceEnglish,
    userChinese: attempt.userChinese,
    userBackTranslatedEnglish: parsed.userBackTranslatedEnglish,
    metadata: {
      topic: attempt.passage.topic ?? undefined,
      difficulty: attempt.passage.difficulty ?? undefined,
      targetStyle: "clear, natural English prose",
    },
  });

  await db.$transaction([
    db.attempt.update({
      where: { id: attemptId },
      data: {
        userBackTranslatedEnglish: parsed.userBackTranslatedEnglish,
        evaluationJson: JSON.stringify(evaluation),
        overallScore: evaluation.overallScore,
        meaningScore: evaluation.scores.meaning,
        naturalnessScore: evaluation.scores.naturalness,
        grammarScore: evaluation.scores.grammar,
        styleScore: evaluation.scores.style,
        learnabilityScore: evaluation.scores.learnability,
      },
    }),
    db.mistakeItem.deleteMany({
      where: { attemptId },
    }),
    ...(evaluation.errors.length
      ? [
          db.mistakeItem.createMany({
            data: evaluation.errors.map((error) => ({
              attemptId,
              category: error.category,
              severity: error.severity,
              originalFragment: error.originalFragment || null,
              userFragment: error.userFragment || null,
              explanation: error.explanation,
              suggestion: error.suggestion,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/");
  revalidatePath("/attempts");
  revalidatePath("/mistakes");
  redirect(`/attempts/${attemptId}`);
}

function getPassagePayload(formData: FormData) {
  const parsed = passageFormSchema.parse({
    title: formData.get("title"),
    sourceEnglish: formData.get("sourceEnglish"),
    referenceChinese: toOptionalString(formData.get("referenceChinese")),
    topic: toOptionalString(formData.get("topic")),
    difficulty: toOptionalString(formData.get("difficulty")),
    tags: toOptionalString(formData.get("tags")),
  });

  return {
    title: parsed.title,
    sourceEnglish: parsed.sourceEnglish,
    referenceChinese: parsed.referenceChinese || null,
    topic: parsed.topic || null,
    difficulty: parsed.difficulty ? (parsed.difficulty as Difficulty) : null,
    tags: JSON.stringify(parseTags(parsed.tags)),
  };
}

export async function createPassageAction(formData: FormData) {
  await db.passage.create({
    data: getPassagePayload(formData),
  });

  revalidatePath("/passages");
  revalidatePath("/practice/new");
  redirect("/passages");
}

export async function updatePassageAction(passageId: string, formData: FormData) {
  await db.passage.update({
    where: { id: passageId },
    data: getPassagePayload(formData),
  });

  revalidatePath("/passages");
  revalidatePath(`/passages/${passageId}/edit`);
  revalidatePath("/practice/new");
  redirect("/passages");
}

export async function deletePassageAction(passageId: string) {
  await db.passage.delete({
    where: { id: passageId },
  });

  revalidatePath("/passages");
  revalidatePath("/practice/new");
}
