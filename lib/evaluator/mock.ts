import type {
  EvaluateBackTranslationInput,
  EvaluationError,
  EvaluationResult,
} from "@/lib/validators/evaluation";
import {
  clampScore,
  dedupe,
  normalizeEnglish,
  sentenceCount,
  tokenizeEnglish,
} from "@/lib/utils";

function overlapRatio(source: string, user: string) {
  const sourceTokens = tokenizeEnglish(source);
  const userTokens = tokenizeEnglish(user);
  if (!sourceTokens.length || !userTokens.length) {
    return 0;
  }

  const sourceSet = new Set(sourceTokens);
  const shared = userTokens.filter((token) => sourceSet.has(token)).length;

  return shared / Math.max(sourceTokens.length, userTokens.length);
}

function pickExpressions(sourceEnglish: string) {
  const phrases = sourceEnglish
    .split(/[,;:.!?]/)
    .map((item) => item.trim())
    .filter((item) => item.split(/\s+/).length >= 3)
    .slice(0, 3);

  const fallback = [
    "keep a clear line of cause and effect",
    "turn a direct translation into natural English",
    "vary sentence openings to improve rhythm",
  ];

  return (phrases.length ? phrases : fallback).map((expression, index) => ({
    expression,
    explanation:
      index === 0
        ? "Useful for keeping the sentence meaning precise when you rewrite."
        : index === 1
          ? "A reminder that good English often requires reshaping, not copying."
          : "A practical upgrade for more mature writing.",
    example:
      index === 0
        ? `Example: ${expression.charAt(0).toUpperCase()}${expression.slice(1)} in a single sentence.`
        : `Example: Try using "${expression}" in your next rewrite.`,
  }));
}

export function buildMockEvaluation(
  input: EvaluateBackTranslationInput,
): EvaluationResult {
  const sourceNorm = normalizeEnglish(input.sourceEnglish);
  const userNorm = normalizeEnglish(input.userBackTranslatedEnglish);
  const overlap = overlapRatio(sourceNorm, userNorm);
  const sourceWords = tokenizeEnglish(input.sourceEnglish);
  const userWords = tokenizeEnglish(input.userBackTranslatedEnglish);
  const lengthDelta = Math.abs(sourceWords.length - userWords.length);
  const sentenceGap = Math.abs(
    sentenceCount(input.sourceEnglish) -
      sentenceCount(input.userBackTranslatedEnglish),
  );

  const errors: EvaluationError[] = [];

  if (overlap < 0.42 || lengthDelta > 10) {
    errors.push({
      category: "omitted_information",
      severity: overlap < 0.3 ? "high" : "medium",
      originalFragment: input.sourceEnglish.split(/[,.]/)[0] ?? "",
      userFragment: input.userBackTranslatedEnglish.split(/[,.]/)[0] ?? "",
      explanation:
        "Some core content from the original passage does not fully reappear in the back-translation.",
      suggestion:
        "Track each idea unit in the original passage and make sure it survives your Chinese step before you rewrite in English.",
    });
  }

  if (userWords.length > sourceWords.length + 12) {
    errors.push({
      category: "added_information",
      severity: "medium",
      originalFragment: "",
      userFragment: input.userBackTranslatedEnglish,
      explanation:
        "Your version introduces extra interpretation beyond what the original passage states.",
      suggestion:
        "Keep the rewrite faithful first, then improve style without adding new claims.",
    });
  }

  if (
    /\b(very very|more better|people can|in nowadays|according to me)\b/i.test(
      input.userBackTranslatedEnglish,
    )
  ) {
    errors.push({
      category: "chinese_influenced_expression",
      severity: "medium",
      originalFragment: "",
      userFragment: input.userBackTranslatedEnglish,
      explanation:
        "Some phrasing sounds translated rather than written directly in English.",
      suggestion:
        "After drafting, ask whether a native writer would naturally choose the same wording or sentence frame.",
    });
  }

  if (sentenceGap >= 2 || sentenceCount(input.userBackTranslatedEnglish) <= 1) {
    errors.push({
      category: "weak_sentence_variety",
      severity: "low",
      originalFragment: "",
      userFragment: input.userBackTranslatedEnglish,
      explanation:
        "The rewrite uses a flatter sentence pattern than the source passage.",
      suggestion:
        "Vary sentence openings and combine short clauses so the rhythm feels more deliberate.",
    });
  }

  if (
    /\b(is|are|was|were)\b\s+\b(very|too|more)\b/i.test(
      input.userBackTranslatedEnglish,
    ) ||
    /\bthe people\b/i.test(input.userBackTranslatedEnglish)
  ) {
    errors.push({
      category: "unnatural_phrasing",
      severity: "medium",
      originalFragment: "",
      userFragment: input.userBackTranslatedEnglish,
      explanation:
        "The sentence mostly communicates the idea, but the phrasing still feels literal and stiff.",
      suggestion:
        "Prefer tighter verb choices and remove filler intensifiers that do not add precision.",
    });
  }

  if (!errors.length) {
    errors.push({
      category: "collocation",
      severity: "low",
      originalFragment: "",
      userFragment: input.userBackTranslatedEnglish,
      explanation:
        "This rewrite is broadly successful, but a few word pairings could sound more idiomatic.",
      suggestion:
        "Collect one or two phrase-level upgrades from the suggested rewrite and reuse them in later practice.",
    });
  }

  const meaning = clampScore(45 + overlap * 45 - lengthDelta * 0.8);
  const naturalness = clampScore(
    48 + overlap * 35 - errors.length * 6 - sentenceGap * 4,
  );
  const grammar = clampScore(
    62 +
      overlap * 22 -
      errors.filter((item) => item.category === "grammar").length * 12 -
      errors.length * 3,
  );
  const style = clampScore(50 + overlap * 28 - sentenceGap * 6 - errors.length * 4);
  const learnability = clampScore(
    72 - Math.max(0, errors.length - 3) * 4 + (overlap > 0.65 ? 6 : 0),
  );
  const overallScore = clampScore(
    meaning * 0.32 +
      naturalness * 0.22 +
      grammar * 0.18 +
      style * 0.14 +
      learnability * 0.14,
  );

  const strongPoints = dedupe([
    overlap > 0.6
      ? "The main message of the source passage is still recognizable."
      : "You preserved at least the backbone of the original idea.",
    userWords.length >= sourceWords.length * 0.7
      ? "You attempted a full passage rewrite instead of reducing it to fragments."
      : "You kept the task manageable by simplifying the English into shorter units.",
    "The Chinese step can become a useful checkpoint if you keep idea units aligned.",
  ]).slice(0, 3);

  const majorIssues = dedupe(
    errors.map((error) => {
      switch (error.category) {
        case "omitted_information":
          return "Some meaning drops out between the source passage and your final English.";
        case "added_information":
          return "Your rewrite adds interpretation that the source did not state.";
        case "weak_sentence_variety":
          return "Sentence rhythm is flatter than the source, which weakens style.";
        case "chinese_influenced_expression":
          return "Several phrases still sound shaped by Chinese syntax rather than natural English.";
        default:
          return "The English needs tighter phrasing so the result sounds written, not translated.";
      }
    }),
  ).slice(0, 4);

  return {
    overallScore,
    scores: {
      meaning,
      naturalness,
      grammar,
      style,
      learnability,
    },
    shortSummary:
      overallScore >= 80
        ? "This is a strong rewrite. The meaning is mostly intact, and the main gains now come from polishing style and idiomatic phrasing."
        : overallScore >= 65
          ? "The rewrite is understandable and partly faithful, but several phrases still feel translated rather than authored in English."
          : "The draft shows effort, but the meaning and English phrasing drift enough that the final result reads more like a partial reconstruction than a polished rewrite.",
    strongPoints,
    majorIssues,
    suggestedRewrite: input.sourceEnglish,
    learnableExpressions: pickExpressions(input.sourceEnglish),
    errorTags: dedupe(errors.map((item) => item.category)),
    errors,
  };
}
