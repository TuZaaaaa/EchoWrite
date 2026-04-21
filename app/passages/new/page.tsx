import { createPassageAction } from "@/app/actions";
import { PassageForm } from "@/components/forms/passage-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPassagePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="New passage"
        title="Add a fresh source passage."
        description="Keep passages compact enough for deliberate practice but rich enough to expose style, meaning, and structure."
      />
      <Card>
        <CardHeader>
          <CardTitle>Create passage</CardTitle>
        </CardHeader>
        <CardContent>
          <PassageForm action={createPassageAction} submitLabel="Create passage" />
        </CardContent>
      </Card>
    </div>
  );
}
