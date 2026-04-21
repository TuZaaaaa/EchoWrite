import Link from "next/link";

import { deletePassageAction } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
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

export default async function PassagesPage() {
  const passages = await db.passage.findMany({
    include: {
      _count: {
        select: { attempts: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  if (!passages.length) {
    return (
      <EmptyState
        title="Passage library is empty"
        description="Add passages to start training with your own source material."
        href="/passages/new"
        cta="Add a passage"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Passage management"
        title="Create and maintain the practice library."
        description="Passages stay intentionally lightweight in the MVP: title, source, optional reference Chinese, metadata, and tags."
      />
      <div className="flex justify-end">
        <Link href="/passages/new" className={cn(buttonVariants())}>
          New passage
        </Link>
      </div>
      <div className="grid gap-4">
        {passages.map((passage) => {
          const tags = parseStoredStringArray(passage.tags);
          const deleteAction = deletePassageAction.bind(null, passage.id);

          return (
            <Card key={passage.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {passage.topic ? <Badge>{passage.topic}</Badge> : null}
                      {passage.difficulty ? (
                        <Badge variant="outline">
                          {difficultyLabels[passage.difficulty]}
                        </Badge>
                      ) : null}
                      <Badge variant="secondary">
                        {passage._count.attempts} attempt
                        {passage._count.attempts === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <CardTitle>{passage.title}</CardTitle>
                    <CardDescription className="max-w-4xl">
                      {passage.sourceEnglish}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/practice/new?passageId=${passage.id}`}
                      className={cn(buttonVariants({ variant: "subtle", size: "sm" }))}
                    >
                      Practice
                    </Link>
                    <Link
                      href={`/passages/${passage.id}/edit`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Edit
                    </Link>
                    <form action={deleteAction}>
                      <button
                        className={cn(
                          buttonVariants({ variant: "destructive", size: "sm" }),
                        )}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              {tags.length ? (
                <CardContent className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
