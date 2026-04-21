"use client";

import { useEffect, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const storagePrefix = "echowrite-step-a";

export function PracticeStepAForm({
  passageId,
  action,
}: {
  passageId: string;
  action: (formData: FormData) => void;
}) {
  const storageKey = `${storagePrefix}:${passageId}`;
  const [value, setValue] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(storageKey) ?? "",
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, value);
  }, [storageKey, value]);

  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={() => {
        window.localStorage.removeItem(storageKey);
      }}
    >
      <input type="hidden" name="passageId" value={passageId} />
      <div className="space-y-2">
        <Label htmlFor="userChinese">Your Chinese translation</Label>
        <Textarea
          id="userChinese"
          name="userChinese"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Translate the passage into Chinese. Focus on preserving idea units clearly."
          className="min-h-56"
          required
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Draft autosaves locally until you submit this step.
        </p>
        <SubmitButton pendingLabel="Saving Chinese step...">
          Continue to back-translation
        </SubmitButton>
      </div>
    </form>
  );
}
