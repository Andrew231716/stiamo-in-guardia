import { cn } from "@/lib/utils/date";

/** Emblema: alba vigilante — luce della preghiera che resta desta. */
export function LogoMark({ className, title = "Stiamo in guardia" }: { className?: string; title?: string }) {
  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sigSky" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7EB8A8" />
          <stop offset="0.55" stopColor="#2F6B58" />
          <stop offset="1" stopColor="#184538" />
        </linearGradient>
        <linearGradient id="sigFlame" x1="32" y1="18" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3E0B0" />
          <stop offset="1" stopColor="#C9983C" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#sigSky)" />
      <path
        d="M10 42c6-10 14-16 22-16s16 6 22 16"
        fill="none"
        stroke="#E8F4EF"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path
        d="M32 18c3.2 4.2 5 7.4 5 10.2 0 3-2.2 5.3-5 5.3s-5-2.3-5-5.3c0-2.8 1.8-6 5-10.2z"
        fill="url(#sigFlame)"
      />
      <path
        d="M24.5 36.5c2.2-1.4 4.8-2.2 7.5-2.2s5.3.8 7.5 2.2c1.4.9 1.2 2.8-.4 3.4-2.2.8-4.6 1.2-7.1 1.2s-4.9-.4-7.1-1.2c-1.6-.6-1.8-2.5-.4-3.4z"
        fill="#F7FBF9"
        fillOpacity="0.92"
      />
      <circle cx="32" cy="37.2" r="1.6" fill="#1F5C4A" />
    </svg>
  );
}

export function BrandLockup({
  size = "md",
  showTagline = false,
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const mark = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const title =
    size === "lg"
      ? "text-4xl sm:text-5xl"
      : size === "sm"
        ? "text-xl"
        : "text-2xl sm:text-3xl";

  return (
    <div className="flex items-center gap-3">
      <LogoMark className={cn(mark, "animate-logo-breathe")} />
      <div>
        <p
          className={cn(
            "font-[family-name:var(--font-fraunces)] leading-tight tracking-tight text-brand",
            title,
          )}
        >
          Stiamo in guardia
        </p>
        {showTagline ? (
          <p className="mt-1 text-sm text-fg-muted">Fermati. Prega. Scegli il passo successivo.</p>
        ) : null}
      </div>
    </div>
  );
}
