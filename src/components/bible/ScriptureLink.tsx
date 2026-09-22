"use client";

import { ExternalLink } from "lucide-react";
import { buildJwLibraryUrl, buildJwOrgUrl, parseScriptureReference } from "@/lib/bible/jwLibraryLink";
import { cn } from "@/lib/utils/date";

export function ScriptureLink({
  reference,
  className,
  size = "md",
}: {
  reference: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const libraryUrl = buildJwLibraryUrl(reference);
  const webUrl = buildJwOrgUrl(reference);
  const parsed = parseScriptureReference(reference);

  if (!libraryUrl || !webUrl || !parsed) {
    return <span className={className}>{reference}</span>;
  }

  const sizeClass =
    size === "lg"
      ? "text-2xl font-[family-name:var(--font-fraunces)]"
      : size === "sm"
        ? "text-sm"
        : "text-base";

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <a
        href={libraryUrl}
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold text-brand underline decoration-brand/35 underline-offset-4 transition hover:decoration-brand",
          sizeClass,
        )}
        title="Apri in JW Library"
      >
        {reference}
        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        <span className="sr-only">(apre JW Library)</span>
      </a>
      <a
        href={webUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-fg-muted underline underline-offset-2 hover:text-brand"
        title="Apri su JW.org se JW Library non è disponibile"
      >
        jw.org
      </a>
    </span>
  );
}

export function ScriptureList({ references }: { references: string[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {references.map((ref) => (
        <li key={ref}>
          <ScriptureLink reference={ref} />
        </li>
      ))}
    </ul>
  );
}
