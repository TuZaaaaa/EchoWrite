export const difficultyLabels = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
} as const;

export const mistakeCategoryLabels = {
  grammar: "Grammar",
  collocation: "Collocation",
  unnatural_phrasing: "Unnatural phrasing",
  omitted_information: "Omitted information",
  added_information: "Added information",
  chinese_influenced_expression: "Chinese-influenced expression",
  weak_sentence_variety: "Weak sentence variety",
} as const;

export function scoreTone(score: number) {
  if (score >= 85) {
    return "text-emerald-700";
  }

  if (score >= 70) {
    return "text-amber-700";
  }

  return "text-rose-700";
}
