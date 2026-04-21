import Link from "next/link";

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
import { cn } from "@/lib/utils";

export default async function Home() {
  const [passageCount, attemptCount, averageAttempt] = await Promise.all([
    db.passage.count(),
    db.attempt.count({
      where: {
        overallScore: {
          not: null,
        },
      },
    }),
    db.attempt.aggregate({
      _avg: {
        overallScore: true,
      },
      where: {
        overallScore: {
          not: null,
        },
      },
    }),
  ]);

  const featureCards = [
    {
      title: "Start new practice",
      description:
        "Read an English source passage, translate into Chinese, then reconstruct the English without seeing the original.",
      href: "/practice/new",
      cta: "Begin session",
    },
    {
      title: "Review past attempts",
      description:
        "Filter previous attempts by topic, difficulty, score, or date and reopen full feedback instantly.",
      href: "/attempts",
      cta: "Open history",
    },
    {
      title: "Review mistakes",
      description:
        "Surface repeated grammar, collocation, and style problems so the tool acts like a coach instead of a one-off checker.",
      href: "/mistakes",
      cta: "Study patterns",
    },
    {
      title: "Manage passages",
      description:
        "Create, edit, and delete source passages for focused practice across topics and difficulty levels.",
      href: "/passages",
      cta: "Manage library",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-[32px] border border-stone-200/70 bg-[rgba(255,255,255,0.78)] p-6 shadow-[0_24px_80px_rgba(28,25,23,0.08)] lg:grid-cols-[1.45fr_0.9fr] lg:p-10">
        <div className="space-y-6">
          <Badge variant="outline">Focused writing practice, not generic translation</Badge>
          <PageHeader
            eyebrow="Back-translation trainer"
            title="Train English writing through reconstruction."
            description="EchoWrite uses an English-to-Chinese-to-English loop so learners practice semantic control, natural phrasing, and style. The feedback is structured like a writing coach, not a bilingual dictionary."
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/practice/new"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Start new practice
            </Link>
            <Link
              href="/attempts"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Review attempts
            </Link>
          </div>
        </div>
        <Card className="bg-stone-950 text-stone-50">
          <CardHeader>
            <CardTitle className="font-sans text-2xl text-white">Snapshot</CardTitle>
            <CardDescription className="text-stone-300">
              A compact local-first MVP with seeded passages and structured scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Passages</p>
              <p className="mt-2 text-4xl font-semibold">{passageCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Scored attempts</p>
              <p className="mt-2 text-4xl font-semibold">{attemptCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Average score</p>
              <p className="mt-2 text-4xl font-semibold">
                {Math.round(averageAttempt._avg.overallScore ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {featureCards.map((card) => (
          <Card key={card.href}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={card.href}
                className={cn(buttonVariants({ variant: "subtle" }))}
              >
                {card.cta}
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
