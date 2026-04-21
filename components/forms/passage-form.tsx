import { Difficulty } from "@prisma/client";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { difficultyLabels } from "@/lib/content";

type PassageFormValues = {
  title?: string;
  sourceEnglish?: string;
  referenceChinese?: string | null;
  topic?: string | null;
  difficulty?: Difficulty | null;
  tags?: string[];
};

export function PassageForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initialValues?: PassageFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialValues?.title ?? ""}
          required
        />
      </div>
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="sourceEnglish">Source English</Label>
        <Textarea
          id="sourceEnglish"
          name="sourceEnglish"
          defaultValue={initialValues?.sourceEnglish ?? ""}
          className="min-h-48"
          required
        />
      </div>
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="referenceChinese">Reference Chinese</Label>
        <Textarea
          id="referenceChinese"
          name="referenceChinese"
          defaultValue={initialValues?.referenceChinese ?? ""}
          className="min-h-32"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          name="topic"
          defaultValue={initialValues?.topic ?? ""}
          placeholder="Writing, Work, Habits..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <select
          id="difficulty"
          name="difficulty"
          defaultValue={initialValues?.difficulty ?? ""}
          className="flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
        >
          <option value="">Select difficulty</option>
          {Object.entries(difficultyLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={initialValues?.tags?.join(", ") ?? ""}
          placeholder="clarity, style, workplace"
        />
      </div>
      <div className="flex justify-end lg:col-span-2">
        <SubmitButton pendingLabel="Saving passage...">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
