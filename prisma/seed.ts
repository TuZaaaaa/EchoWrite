import { Difficulty, PrismaClient } from "@prisma/client";

import { buildMockEvaluation } from "../lib/evaluator/mock";

const prisma = new PrismaClient();

const passages = [
  {
    title: "Walking Before Sunrise",
    topic: "Habits",
    difficulty: Difficulty.BEGINNER,
    tags: ["daily-routine", "clarity", "descriptive-writing"],
    sourceEnglish:
      "Before the city wakes up, Maya walks along the river for twenty minutes. The quiet air helps her sort out the tasks waiting for her, and by the time the first buses arrive, she already feels less rushed and more focused.",
    referenceChinese:
      "在城市醒来之前，玛雅会沿着河边散步二十分钟。安静的空气帮助她理清等待处理的任务，等第一班公交车到来时，她已经没有那么匆忙，注意力也更集中了。",
  },
  {
    title: "A Team Meeting That Worked",
    topic: "Work",
    difficulty: Difficulty.INTERMEDIATE,
    tags: ["workplace", "meetings", "cause-and-effect"],
    sourceEnglish:
      "The project meeting ended earlier than usual because everyone had reviewed the material in advance. Instead of repeating old points, the team spent most of the time making decisions, which left people with a clearer sense of what to do next.",
    referenceChinese:
      "项目会议比平时结束得更早，因为每个人都提前看过资料。团队没有重复旧观点，而是把大部分时间花在做决定上，这让大家更清楚下一步该做什么。",
  },
  {
    title: "Rain on the Museum Steps",
    topic: "Observation",
    difficulty: Difficulty.INTERMEDIATE,
    tags: ["scene", "narrative", "imagery"],
    sourceEnglish:
      "Rain began just as we reached the museum, so we stayed on the stone steps and watched the street change shape. Umbrellas opened like dark flowers, and the traffic slowed until even the impatient drivers seemed willing to give the afternoon a softer pace.",
    referenceChinese:
      "就在我们到达博物馆时开始下雨了，所以我们停在石阶上，看着街道像是变了样。雨伞像深色的花一样撑开，车辆慢了下来，连那些急躁的司机似乎也愿意让这个下午变得更柔和一些。",
  },
  {
    title: "Learning From a Failed Draft",
    topic: "Writing",
    difficulty: Difficulty.ADVANCED,
    tags: ["revision", "reflection", "style"],
    sourceEnglish:
      "Her first draft was full of energy but weak in structure, which made the essay harder to trust. Once she cut the decorative sentences and rebuilt the argument around three clear claims, the same ideas sounded more thoughtful instead of merely dramatic.",
    referenceChinese:
      "她的第一稿充满了冲劲，但结构薄弱，这让文章显得不太可靠。等她删掉那些装饰性的句子，并围绕三个清晰的观点重新搭建论证之后，同样的想法听起来就不再只是戏剧化，而是更有思考。",
  },
  {
    title: "The Small Cost of Delay",
    topic: "Decision-making",
    difficulty: Difficulty.ADVANCED,
    tags: ["analysis", "argument", "precision"],
    sourceEnglish:
      "People often postpone small decisions because each one seems unimportant on its own. The hidden cost is not the choice itself but the attention it continues to occupy, quietly reducing the energy available for work that actually matters.",
    referenceChinese:
      "人们常常推迟一些小决定，因为每一个单独看都似乎不重要。真正隐藏的成本不在于这个选择本身，而在于它持续占据注意力，悄悄减少了那些真正重要工作所能获得的精力。",
  },
];

async function main() {
  await prisma.mistakeItem.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.passage.deleteMany();

  for (const passage of passages) {
    const createdPassage = await prisma.passage.create({
      data: {
        ...passage,
        tags: JSON.stringify(passage.tags),
      },
    });

    if (
      passage.title === "Walking Before Sunrise" ||
      passage.title === "Learning From a Failed Draft"
    ) {
      const userChinese =
        passage.title === "Walking Before Sunrise"
          ? "在城市还没有醒来之前，Maya会沿着河散步二十分钟。安静的空气让她整理等着她的任务，所以当第一辆公交车来到时，她已经不那么着急，也更专心。"
          : "她的第一版很有力量，但是结构不够强，所以这篇文章让人难以信任。后来她删掉那些装饰句子，并且用三个清楚的观点重建论证，同样的想法听起来更深思，而不只是戏剧化。";
      const userBackTranslatedEnglish =
        passage.title === "Walking Before Sunrise"
          ? "Before the city wakes, Maya walks by the river for twenty minutes. The quiet air lets her organize the tasks waiting for her, so when the first bus comes, she is already less anxious and more concentrated."
          : "Her first version had energy, but the structure was not strong, so the essay was hard to trust. After she deleted the decorative sentences and rebuilt the argument with three clear points, the same ideas sounded more thoughtful instead of only dramatic.";

      const evaluation = buildMockEvaluation({
        sourceEnglish: createdPassage.sourceEnglish,
        userChinese,
        userBackTranslatedEnglish,
        metadata: {
          topic: createdPassage.topic ?? undefined,
          difficulty: createdPassage.difficulty ?? undefined,
        },
      });

      const attempt = await prisma.attempt.create({
        data: {
          passageId: createdPassage.id,
          userChinese,
          userBackTranslatedEnglish,
          evaluationJson: JSON.stringify(evaluation),
          overallScore: evaluation.overallScore,
          meaningScore: evaluation.scores.meaning,
          naturalnessScore: evaluation.scores.naturalness,
          grammarScore: evaluation.scores.grammar,
          styleScore: evaluation.scores.style,
          learnabilityScore: evaluation.scores.learnability,
        },
      });

      if (evaluation.errors.length) {
        await prisma.mistakeItem.createMany({
          data: evaluation.errors.map((error) => ({
            attemptId: attempt.id,
            category: error.category,
            severity: error.severity,
            originalFragment: error.originalFragment || null,
            userFragment: error.userFragment || null,
            explanation: error.explanation,
            suggestion: error.suggestion,
          })),
        });
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
