import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { difficultyLabels, scoreTone } from "@/lib/content";
import { formatDate } from "@/lib/utils";

type SearchParams = {
  topic?: string;
  difficulty?: string;
  minScore?: string;
  from?: string;
  to?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function AttemptsPage({ searchParams }: Props) {
  const filters = await searchParams;
  const attempts = await db.attempt.findMany({
    where: {
      ...(filters.topic ? { passage: { topic: filters.topic } } : {}),
      ...(filters.difficulty
        ? { passage: { difficulty: filters.difficulty as never } }
        : {}),
      ...(filters.minScore ? { overallScore: { gte: Number(filters.minScore) } } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: {
      passage: true,
      _count: {
        select: { mistakes: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const passages = await db.passage.findMany({
    distinct: ["topic"],
    select: { topic: true },
    orderBy: { topic: "asc" },
  });

  if (!attempts.length) {
    return (
      <EmptyState
        title="No attempts yet"
        description="Complete a practice session to populate attempt history and feedback."
        href="/practice/new"
        cta="Start practicing"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attempt history"
        title="Review previous writing attempts."
        description="Filter by passage metadata, score, and date so you can revisit specific feedback patterns."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Filters</CardTitle>
          <CardDescription>
            Narrow the attempt list without leaving the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-5">
            <select
              name="topic"
              defaultValue={filters.topic ?? ""}
              className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm"
            >
              <option value="">All topics</option>
              {passages
                .map((item) => item.topic)
                .filter(Boolean)
                .map((topic) => (
                  <option key={topic} value={topic ?? ""}>
                    {topic}
                  </option>
                ))}
            </select>
            <select
              name="difficulty"
              defaultValue={filters.difficulty ?? ""}
              className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm"
            >
              <option value="">All difficulty</option>
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="minScore"
              defaultValue={filters.minScore ?? ""}
              placeholder="Min score"
              className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm"
            />
            <input
              type="date"
              name="from"
              defaultValue={filters.from ?? ""}
              className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="to"
                defaultValue={filters.to ?? ""}
                className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm"
              />
              <button className="rounded-xl bg-stone-900 px-4 text-sm font-medium text-white active:scale-95">
                Apply
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {attempts.map((attempt) => (
          <Link key={attempt.id} href={`/attempts/${attempt.id}`}>
            <Card className="transition hover:-translate-y-0.5 hover:border-stone-300">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{attempt.passage.title}</CardTitle>
                    <CardDescription>
                      {attempt.passage.topic || "General"} ·{" "}
                      {attempt.passage.difficulty
                        ? difficultyLabels[attempt.passage.difficulty]
                        : "Unrated"}{" "}
                      · {formatDate(attempt.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      Overall score
                    </p>
                    <p className={`text-4xl font-semibold ${scoreTone(attempt.overallScore ?? 0)}`}>
                      {attempt.overallScore ?? "—"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {attempt._count.mistakes} feedback item
                  {attempt._count.mistakes === 1 ? "" : "s"}
                </Badge>
                {attempt.overallScore ? (
                  <Badge>{attempt.overallScore >= 80 ? "Strong" : "Needs revision"}</Badge>
                ) : (
                  <Badge variant="secondary">Step A only</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
