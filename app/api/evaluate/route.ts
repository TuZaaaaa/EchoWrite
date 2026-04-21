import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { evaluateBackTranslation } from "@/lib/evaluator";
import { evaluateBackTranslationInputSchema } from "@/lib/validators/evaluation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = evaluateBackTranslationInputSchema.parse(json);
    const result = await evaluateBackTranslation(input);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid evaluation payload.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to evaluate back translation." },
      { status: 500 },
    );
  }
}
