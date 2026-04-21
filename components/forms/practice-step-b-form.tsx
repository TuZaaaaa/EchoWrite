"use client";

import { useEffect, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const storagePrefix = "echowrite-step-b";

export function PracticeStepBForm({
  attemptId,
  initialValue,
  action,
}: {
  attemptId: string;
  initialValue?: string | null;
  action: (formData: FormData) => void;
}) {
  const storageKey = `${storagePrefix}:${attemptId}`;
  const [value, setValue] = useState(() =>
    typeof window === "undefined"
      ? (initialValue ?? "")
      : window.localStorage.getItem(storageKey) ?? (initialValue ?? ""),
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
      <div className="space-y-2">
        <Label htmlFor="userBackTranslatedEnglish">
          Back-translate into English
        </Label>
        <Textarea
          id="userBackTranslatedEnglish"
          name="userBackTranslatedEnglish"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Now rewrite only from your Chinese version. Do not peek at the source English."
          className="min-h-56"
          required
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Draft autosaves locally while you reconstruct the English.
        </p>
        <SubmitButton pendingLabel="Evaluating rewrite...">
          Submit for analysis
        </SubmitButton>
      </div>
    </form>
  );
}
