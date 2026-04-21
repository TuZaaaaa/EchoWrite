import { notFound } from "next/navigation";

import { updatePassageAction } from "@/app/actions";
import { PassageForm } from "@/components/forms/passage-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { parseStoredStringArray } from "@/lib/utils";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPassagePage({ params }: Props) {
  const { id } = await params;
  const passage = await db.passage.findUnique({
    where: { id },
  });

  if (!passage) {
    notFound();
  }

  const action = updatePassageAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Edit passage"
        title={passage.title}
        description="Update the source text or metadata without touching historical attempts."
      />
      <Card>
        <CardHeader>
          <CardTitle>Passage details</CardTitle>
        </CardHeader>
        <CardContent>
          <PassageForm
            action={action}
            submitLabel="Save changes"
            initialValues={{
              ...passage,
              tags: parseStoredStringArray(passage.tags),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
