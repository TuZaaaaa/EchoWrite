import Link from "next/link";

import { createAttemptStepOneAction } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PracticeStepAForm } from "@/components/forms/practice-step-a-form";
import { PageHeader } from "@/components/page-header";
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
import { difficultyLabels } from "@/lib/content";
import { cn, parseStoredStringArray } from "@/lib/utils";

type Props = {
  searchParams: Promise<{
    passageId?: string;
  }>;
};

export default async function NewPracticePage({ searchParams }: Props) {
  const { passageId } = await searchParams;
  const passages = await db.passage.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  if (!passages.length) {
    return (
      <EmptyState
        title="No passages yet"
        description="Create at least one practice passage before starting a session."
        href="/passages/new"
        cta="Create first passage"
      />
    );
  }

  const selectedPassage =
    passages.find((passage) => passage.id === passageId) ?? passages[0];
  const tags = parseStoredStringArray(selectedPassage.tags);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <PageHeader
          eyebrow="Step A"
          title="Translate the source into Chinese."
          description="Read carefully, then preserve meaning and structure in your own Chinese. The original English will be hidden in the next step."
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Passage library</CardTitle>
            <CardDescription>
              Pick a prompt and start a fresh attempt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {passages.map((passage) => (
              <Link
                key={passage.id}
                href={`/practice/new?passageId=${passage.id}`}
                className={cn(
                  "block rounded-2xl border px-4 py-3 transition",
                  passage.id === selectedPassage.id
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50",
                )}
              >
                <p className="font-medium">{passage.title}</p>
                <p className="mt-1 text-sm opacity-80">{passage.topic || "General"}</p>
              </Link>
            ))}
            <Link
              href="/passages"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Manage passages
            </Link>
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              {selectedPassage.topic ? <Badge>{selectedPassage.topic}</Badge> : null}
              {selectedPassage.difficulty ? (
                <Badge variant="outline">
                  {difficultyLabels[selectedPassage.difficulty]}
                </Badge>
              ) : null}
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle>{selectedPassage.title}</CardTitle>
            <CardDescription>
              Focus on meaning first. Keep details like cause, contrast, and emphasis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <article className="rounded-2xl bg-stone-50 p-5 text-base leading-8 text-stone-700">
              {selectedPassage.sourceEnglish}
            </article>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Chinese draft</CardTitle>
            <CardDescription>
              Write naturally in Chinese, but do not drop idea units you will need to rebuild later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PracticeStepAForm
              passageId={selectedPassage.id}
              action={createAttemptStepOneAction}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
