import { notFound } from "next/navigation";

import { submitBackTranslationAction } from "@/app/actions";
import { PracticeStepBForm } from "@/components/forms/practice-step-b-form";
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

type Props = {
  params: Promise<{
    attemptId: string;
  }>;
};

export default async function BackTranslationPage({ params }: Props) {
  const { attemptId } = await params;
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { passage: true },
  });

  if (!attempt) {
    notFound();
  }

  const action = submitBackTranslationAction.bind(null, attempt.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Step B"
        title="Rebuild the English from your Chinese."
        description="The source English stays hidden here on purpose. Use your Chinese version as evidence, then reconstruct a natural English passage."
      />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge>{attempt.passage.title}</Badge>
            <Badge variant="outline">Original hidden</Badge>
          </div>
          <CardTitle className="text-2xl">Your Chinese translation</CardTitle>
          <CardDescription>
            Treat this as the only text you can see while drafting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <article className="rounded-2xl bg-stone-50 p-5 text-base leading-8 text-stone-700">
            {attempt.userChinese}
          </article>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your English reconstruction</CardTitle>
          <CardDescription>
            Aim for preserved meaning and natural prose rather than word-for-word matching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PracticeStepBForm
            attemptId={attempt.id}
            initialValue={attempt.userBackTranslatedEnglish}
            action={action}
          />
        </CardContent>
      </Card>
    </div>
  );
}
