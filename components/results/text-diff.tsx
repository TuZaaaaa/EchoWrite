import { diffWords } from "diff";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DiffLine({
  source,
  user,
  mode,
}: {
  source: string;
  user: string;
  mode: "source" | "user";
}) {
  const parts = diffWords(source, user);

  return (
    <p className="leading-8 text-stone-700">
      {parts.map((part, index) => {
        if (mode === "source" && part.added) {
          return null;
        }

        if (mode === "user" && part.removed) {
          return null;
        }

        const color = part.removed
          ? "bg-rose-100 text-rose-800"
          : part.added
            ? "bg-emerald-100 text-emerald-800"
            : "";

        return (
          <span key={`${part.value}-${index}`} className={color}>
            {part.value}
          </span>
        );
      })}
    </p>
  );
}

export function TextDiff({
  source,
  user,
}: {
  source: string;
  user: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Original emphasis</CardTitle>
        </CardHeader>
        <CardContent>
          <DiffLine source={source} user={user} mode="source" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your rewrite emphasis</CardTitle>
        </CardHeader>
        <CardContent>
          <DiffLine source={source} user={user} mode="user" />
        </CardContent>
      </Card>
    </div>
  );
}
