import { v4 as uuid } from "uuid";
import type {
  ActivityCategory,
  ActivityTemplate,
  DailyActivityRecord,
  DailyCheckin,
} from "@/lib/types";
import { ACTIVITY_CATEGORIES } from "@/lib/types";
import { ACTIVITY_LIBRARY, getActivitiesByCategory } from "@/data/activities";

const RECENT_CATEGORY_WINDOW = 3;
const RECENT_TEMPLATE_WINDOW = 14;

export function pickNextCategory(
  recentCategories: ActivityCategory[],
  preferred?: ActivityCategory[],
): ActivityCategory {
  const recent = recentCategories.slice(-RECENT_CATEGORY_WINDOW);
  const pool = (preferred?.length ? preferred : ACTIVITY_CATEGORIES).filter(
    (c) => !recent.includes(c),
  );
  const choices = pool.length ? pool : ACTIVITY_CATEGORIES;
  // Rotate deterministically by day index-ish: prefer least recently used
  const counts = new Map<ActivityCategory, number>();
  for (const c of ACTIVITY_CATEGORIES) counts.set(c, 0);
  for (const c of recentCategories) counts.set(c, (counts.get(c) ?? 0) + 1);
  return [...choices].sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0))[0];
}

export function pickTemplate(
  category: ActivityCategory,
  recentTemplateIds: string[],
  checkins: DailyCheckin[],
): ActivityTemplate {
  const recent = new Set(recentTemplateIds.slice(-RECENT_TEMPLATE_WINDOW));
  let pool = getActivitiesByCategory(category).filter((t) => !recent.has(t.id));
  if (!pool.length) pool = getActivitiesByCategory(category);
  if (!pool.length) pool = [...ACTIVITY_LIBRARY];

  const triggerCounts = new Map<string, number>();
  for (const c of checkins.slice(-14)) {
    for (const t of c.triggers) triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1);
  }
  const topTriggers = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

  // Soft preference: templates mentioning vulnerability / phone / prayer when those triggers dominate
  const scored = pool.map((t) => {
    let score = Math.random();
    const text = `${t.title} ${t.objective} ${t.dailyAction}`.toLowerCase();
    if (topTriggers.includes("drowsiness") && text.includes("assonn")) score += 0.4;
    if (topTriggers.includes("fatigue") && text.includes("stanch")) score += 0.3;
    if (topTriggers.includes("phone_nearby") && text.includes("telefon")) score += 0.35;
    if (topTriggers.includes("bed_with_phone") && text.includes("letto")) score += 0.35;
    if (topTriggers.includes("boredom") && text.includes("noi")) score += 0.25;
    return { t, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].t;
}

export function createDailyActivity(
  date: string,
  recentActivities: DailyActivityRecord[],
  checkins: DailyCheckin[],
): DailyActivityRecord {
  const recentCategories = recentActivities.map((a) => a.category);
  const recentIds = recentActivities.map((a) => a.templateId);
  const category = pickNextCategory(recentCategories);
  const template = pickTemplate(category, recentIds, checkins);
  const now = new Date().toISOString();

  return {
    id: uuid(),
    date,
    templateId: template.id,
    category: template.category,
    title: template.title,
    durationMinutes: template.durationMinutes,
    objective: template.objective,
    introduction: template.introduction,
    scriptureReferences: template.scriptureReferences,
    instructions: template.instructions,
    writingPrompt: template.writingPrompt,
    reflectionQuestion: template.reflectionQuestion,
    dailyAction: template.dailyAction,
    sourceReferences: template.sourceReferences,
    createdAt: now,
  };
}

export function ensureActivityForDate(
  date: string,
  activities: DailyActivityRecord[],
  checkins: DailyCheckin[],
): { activity: DailyActivityRecord; activities: DailyActivityRecord[]; created: boolean } {
  const existing = activities.find((a) => a.date === date);
  if (existing) return { activity: existing, activities, created: false };
  const recent = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  const activity = createDailyActivity(date, recent, checkins);
  return { activity, activities: [...activities, activity], created: true };
}
