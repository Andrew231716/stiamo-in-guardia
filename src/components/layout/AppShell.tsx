"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  CircleHelp,
  Home,
  Moon,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/date";
import { useApp } from "@/components/providers/AppProvider";
import { BrandLockup } from "@/components/brand/Logo";
import { Atmosphere } from "@/components/brand/Atmosphere";

const links = [
  { href: "/", label: "Oggi", icon: Home },
  { href: "/attivita", label: "Attività", icon: Sparkles },
  { href: "/check-in", label: "Check-in", icon: CalendarCheck },
  { href: "/preghiera", label: "Preghiera", icon: BookOpen },
  { href: "/report", label: "Report", icon: CircleHelp },
  { href: "/impostazioni", label: "Altro", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useApp();
  const tired = data.preferences.tiredMode;
  const isHome = pathname === "/";

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-28 pt-5 sm:px-6">
      <Atmosphere />
      <header className="mb-5 flex items-start justify-between gap-3 animate-fade-up">
        {isHome ? (
          <div className="sr-only">
            <h1>Stiamo in guardia</h1>
          </div>
        ) : (
          <Link href="/" aria-label="Torna alla home">
            <BrandLockup size="sm" />
          </Link>
        )}
        {tired ? (
          <Link
            href="/stanchezza"
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-accent-soft px-3 py-2 text-sm text-[color:var(--brand-deep)] animate-soft-pulse"
          >
            <Moon className="h-4 w-4" />
            Modalità semplice
          </Link>
        ) : null}
      </header>
      <main className="flex-1">{children}</main>
      <nav
        aria-label="Navigazione principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-bg-elevated/92 backdrop-blur-md"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-6 gap-1 px-2 py-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] transition sm:text-xs",
                    active ? "bg-brand-soft text-brand" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
