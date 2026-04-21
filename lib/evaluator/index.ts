import { buildMockEvaluation } from "@/lib/evaluator/mock";
import { evaluateWithOpenAI } from "@/lib/evaluator/openai";
import {
  evaluateBackTranslationInputSchema,
  type EvaluateBackTranslationInput,
} from "@/lib/validators/evaluation";

export async function evaluateBackTranslation(
  rawInput: EvaluateBackTranslationInput,
) {
  const input = evaluateBackTranslationInputSchema.parse(rawInput);
  const mode = process.env.EVALUATOR_MODE?.toLowerCase() || "mock";

  if (mode === "openai" && process.env.OPENAI_API_KEY) {
    return evaluateWithOpenAI(input);
  }

  return buildMockEvaluation(input);
}
