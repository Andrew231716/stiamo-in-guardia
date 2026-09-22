import { cn } from "@/lib/utils/date";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius)] border border-line bg-bg-elevated/90 p-5 shadow-[var(--shadow)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-4 space-y-1">
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight text-fg">{title}</h2>
      {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
    </header>
  );
}
