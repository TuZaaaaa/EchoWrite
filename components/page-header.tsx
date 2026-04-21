import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-4xl leading-tight text-stone-950 sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">{description}</p>
      </div>
      {badge ? <Badge variant="outline">{badge}</Badge> : null}
    </div>
  );
}
