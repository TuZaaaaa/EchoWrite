import { z } from "zod";

export const errorCategorySchema = z.enum([
  "grammar",
  "collocation",
  "unnatural_phrasing",
  "omitted_information",
  "added_information",
  "chinese_influenced_expression",
  "weak_sentence_variety",
]);

export const severitySchema = z.enum(["low", "medium", "high"]);

export const learnableExpressionSchema = z.object({
  expression: z.string().min(1),
  explanation: z.string().min(1),
  example: z.string().min(1),
});

export const evaluationErrorSchema = z.object({
  category: errorCategorySchema,
  severity: severitySchema,
  originalFragment: z.string(),
  userFragment: z.string(),
  explanation: z.string().min(1),
  suggestion: z.string().min(1),
});

export const evaluationResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  scores: z.object({
    meaning: z.number().int().min(0).max(100),
    naturalness: z.number().int().min(0).max(100),
    grammar: z.number().int().min(0).max(100),
    style: z.number().int().min(0).max(100),
    learnability: z.number().int().min(0).max(100),
  }),
  shortSummary: z.string().min(1),
  strongPoints: z.array(z.string().min(1)).min(1),
  majorIssues: z.array(z.string().min(1)).min(1),
  suggestedRewrite: z.string().min(1),
  learnableExpressions: z.array(learnableExpressionSchema).min(1),
  errorTags: z.array(z.string().min(1)),
  errors: z.array(evaluationErrorSchema),
});

export const evaluateBackTranslationInputSchema = z.object({
  sourceEnglish: z.string().min(1),
  userChinese: z.string().min(1),
  userBackTranslatedEnglish: z.string().min(1),
  metadata: z
    .object({
      topic: z.string().optional(),
      difficulty: z.string().optional(),
      targetStyle: z.string().optional(),
    })
    .optional(),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
export type EvaluationError = z.infer<typeof evaluationErrorSchema>;
export type EvaluateBackTranslationInput = z.infer<
  typeof evaluateBackTranslationInputSchema
>;
