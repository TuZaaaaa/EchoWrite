import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreTone } from "@/lib/content";

export function ScoreGrid({
  overallScore,
  scores,
}: {
  overallScore: number;
  scores: {
    meaning: number;
    naturalness: number;
    grammar: number;
    style: number;
    learnability: number;
  };
}) {
  const items = [
    { label: "Meaning", value: scores.meaning },
    { label: "Naturalness", value: scores.naturalness },
    { label: "Grammar", value: scores.grammar },
    { label: "Style", value: scores.style },
    { label: "Learnability", value: scores.learnability },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_repeat(5,1fr)]">
      <Card className="bg-stone-950 text-stone-50">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Overall</p>
          <CardTitle className="font-sans text-5xl text-white">{overallScore}</CardTitle>
        </CardHeader>
      </Card>
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              {item.label}
            </p>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-semibold ${scoreTone(item.value)}`}>
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
