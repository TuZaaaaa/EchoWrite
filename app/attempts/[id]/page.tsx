import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ScoreGrid } from "@/components/results/score-grid";
import { TextDiff } from "@/components/results/text-diff";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { difficultyLabels, mistakeCategoryLabels } from "@/lib/content";
import { cn, formatDate, parseStoredJson } from "@/lib/utils";
import { evaluationResultSchema } from "@/lib/validators/evaluation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AttemptDetailPage({ params }: Props) {
  const { id } = await params;
  const attempt = await db.attempt.findUnique({
    where: { id },
    include: {
      passage: true,
      mistakes: {
        orderBy: [{ createdAt: "asc" }],
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  if (!attempt.evaluationJson || !attempt.userBackTranslatedEnglish) {
    return (
      <EmptyState
        title="This attempt has not been evaluated yet"
        description="Continue to the back-translation step to generate structured writing feedback."
        href={`/practice/${attempt.id}/back-translation`}
        cta="Continue practice"
      />
    );
  }

  const evaluation = evaluationResultSchema.parse(
    parseStoredJson(attempt.evaluationJson, {}),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attempt result"
        title={attempt.passage.title}
        description="Compare the original text with your Chinese bridge and reconstructed English, then review coach-style feedback."
        badge={formatDate(attempt.createdAt)}
      />
      <div className="flex flex-wrap gap-2">
        {attempt.passage.topic ? <Badge>{attempt.passage.topic}</Badge> : null}
        {attempt.passage.difficulty ? (
          <Badge variant="outline">
            {difficultyLabels[attempt.passage.difficulty]}
          </Badge>
        ) : null}
        <Link
          href={`/practice/new?passageId=${attempt.passageId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Practice this passage again
        </Link>
      </div>

      <ScoreGrid overallScore={evaluation.overallScore} scores={evaluation.scores} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Original English</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-8 text-stone-700">{attempt.passage.sourceEnglish}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Chinese</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-8 text-stone-700">{attempt.userChinese}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your back-translation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-8 text-stone-700">
              {attempt.userBackTranslatedEnglish}
            </p>
          </CardContent>
        </Card>
      </div>

      <TextDiff
        source={attempt.passage.sourceEnglish}
        user={attempt.userBackTranslatedEnglish}
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Coach summary</CardTitle>
            <CardDescription>{evaluation.shortSummary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                Strong points
              </h3>
              <ul className="space-y-2 text-sm leading-7 text-stone-700">
                {evaluation.strongPoints.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                Major issues
              </h3>
              <ul className="space-y-2 text-sm leading-7 text-stone-700">
                {evaluation.majorIssues.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                Suggested rewrite
              </h3>
              <p className="rounded-2xl bg-stone-50 p-4 leading-8 text-stone-700">
                {evaluation.suggestedRewrite}
              </p>
            </section>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learnable expressions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluation.learnableExpressions.map((item) => (
                <div key={item.expression} className="rounded-2xl bg-stone-50 p-4">
                  <p className="font-medium text-stone-950">{item.expression}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {item.explanation}
                  </p>
                  <p className="mt-2 text-sm italic leading-6 text-stone-500">
                    {item.example}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Error tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {evaluation.errorTags.map((item) => (
                <Badge key={item} variant="outline">
                  {mistakeCategoryLabels[item as keyof typeof mistakeCategoryLabels] ?? item}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed feedback items</CardTitle>
          <CardDescription>
            These are stored separately for later mistake aggregation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attempt.mistakes.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{mistakeCategoryLabels[item.category]}</Badge>
                <Badge variant="outline">{item.severity}</Badge>
              </div>
              {item.originalFragment ? (
                <p className="mt-3 text-sm text-stone-600">
                  <span className="font-medium text-stone-800">Original:</span>{" "}
                  {item.originalFragment}
                </p>
              ) : null}
              {item.userFragment ? (
                <p className="mt-1 text-sm text-stone-600">
                  <span className="font-medium text-stone-800">Your fragment:</span>{" "}
                  {item.userFragment}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-stone-700">{item.explanation}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Suggestion: {item.suggestion}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
