import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { buildMockEvaluation } from "@/lib/evaluator/mock";
import { EVALUATOR_SYSTEM_PROMPT } from "@/lib/evaluator/prompt";
import {
  evaluateBackTranslationInputSchema,
  evaluationResultSchema,
  type EvaluateBackTranslationInput,
  type EvaluationResult,
} from "@/lib/validators/evaluation";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({ apiKey });
}

export async function evaluateWithOpenAI(
  rawInput: EvaluateBackTranslationInput,
): Promise<EvaluationResult> {
  const input = evaluateBackTranslationInputSchema.parse(rawInput);
  const client = getClient();

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      instructions: EVALUATOR_SYSTEM_PROMPT,
      input: JSON.stringify(
        {
          sourceEnglish: input.sourceEnglish,
          userChinese: input.userChinese,
          userBackTranslatedEnglish: input.userBackTranslatedEnglish,
          metadata: input.metadata ?? {},
        },
        null,
        2,
      ),
      text: {
        format: zodTextFormat(evaluationResultSchema, "back_translation_evaluation"),
        verbosity: "low",
      },
    });

    return evaluationResultSchema.parse(JSON.parse(response.output_text));
  } catch (error) {
    console.error("OpenAI evaluation failed, falling back to mock mode.", error);
    return buildMockEvaluation(input);
  }
}
