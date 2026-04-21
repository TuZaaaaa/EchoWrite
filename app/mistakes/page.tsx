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
import { mistakeCategoryLabels } from "@/lib/content";

export default async function MistakesPage() {
  const mistakes = await db.mistakeItem.findMany({
    include: {
      attempt: {
        include: {
          passage: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  if (!mistakes.length) {
    return (
      <EmptyState
        title="No mistake patterns yet"
        description="Finish at least one evaluated attempt to populate recurring issues."
        href="/practice/new"
        cta="Start a practice run"
      />
    );
  }

  const grouped = Object.entries(
    mistakes.reduce<Record<string, typeof mistakes>>((accumulator, item) => {
      accumulator[item.category] ||= [];
      accumulator[item.category].push(item);
      return accumulator;
    }, {}),
  ).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mistake review"
        title="Study recurring error patterns."
        description="This view aggregates mistakes across attempts so learners can target repeated issues instead of treating feedback as isolated events."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {grouped.map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-2xl">
                  {mistakeCategoryLabels[category as keyof typeof mistakeCategoryLabels]}
                </CardTitle>
                <Badge>{items.length} cases</Badge>
              </div>
              <CardDescription>
                Recent coaching notes and example passages for this category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl bg-stone-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.severity}</Badge>
                    <Link
                      href={`/attempts/${item.attemptId}`}
                      className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
                    >
                      {item.attempt.passage.title}
                    </Link>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{item.explanation}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Suggestion: {item.suggestion}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
