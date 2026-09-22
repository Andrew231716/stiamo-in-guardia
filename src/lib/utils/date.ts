import { format, parseISO, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isValid } from "date-fns";
import { it } from "date-fns/locale";

export function todayIso(date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function yesterdayIso(date = new Date()): string {
  return todayIso(subDays(date, 1));
}

export function formatDisplayDate(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return iso;
  return format(d, "EEEE d MMMM yyyy", { locale: it });
}

export function formatShortDate(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return iso;
  return format(d, "d MMM", { locale: it });
}

export function lastNDates(n: number, from = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => todayIso(subDays(from, n - 1 - i)));
}

export function weekBounds(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { startDate: todayIso(start), endDate: todayIso(end) };
}

export function monthBounds(date = new Date()) {
  return {
    startDate: todayIso(startOfMonth(date)),
    endDate: todayIso(endOfMonth(date)),
  };
}

export function datesInRange(startDate: string, endDate: string): string[] {
  return eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((d) => todayIso(d));
}

export function greetingForHour(hour: number, name?: string): string {
  const who = name?.trim() ? `, ${name.trim()}` : "";
  if (hour < 12) return `Buongiorno${who}`;
  if (hour < 18) return `Buon pomeriggio${who}`;
  return `Buonasera${who}`;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
