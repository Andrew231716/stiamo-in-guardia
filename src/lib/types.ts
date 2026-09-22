export type ActivityCategory =
  | "riconoscere_punti_deboli"
  | "evitare_situazioni_rischio"
  | "preparare_risposta"
  | "proteggere_occhi_pensieri"
  | "rafforzare_spiritualita"
  | "ricordare_strategie"
  | "coltivare_desideri_giusti";

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  riconoscere_punti_deboli: "Riconoscere i punti deboli",
  evitare_situazioni_rischio: "Evitare le situazioni a rischio",
  preparare_risposta: "Preparare una risposta immediata",
  proteggere_occhi_pensieri: "Proteggere occhi e pensieri",
  rafforzare_spiritualita: "Rafforzare la spiritualità",
  ricordare_strategie: "Ricordare strategie efficaci",
  coltivare_desideri_giusti: "Coltivare desideri giusti",
};

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "riconoscere_punti_deboli",
  "evitare_situazioni_rischio",
  "preparare_risposta",
  "proteggere_occhi_pensieri",
  "rafforzare_spiritualita",
  "ricordare_strategie",
  "coltivare_desideri_giusti",
];

export type EpisodeStatus = "none" | "episode" | "prefer_not_to_say";
export type ImpulseStatus = "yes" | "no" | "dont_remember" | "prefer_not_to_say";
export type ChainStage =
  | "trigger"
  | "impulse"
  | "phone"
  | "search"
  | "action"
  | "interrupted_early"
  | "not_applicable"
  | "prefer_not_to_say";

export type TriggerKind = "internal" | "external";

export interface TriggerItem {
  id: string;
  name: string;
  category: TriggerKind;
  description: string;
}

export interface StrategyItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ActivityTemplate {
  id: string;
  category: ActivityCategory;
  title: string;
  durationMinutes: number;
  objective: string;
  introduction: string;
  scriptureReferences: string[];
  instructions: string[];
  writingPrompt: string;
  reflectionQuestion: string;
  dailyAction: string;
  sourceReferences?: { title: string; organization: string; note?: string }[];
}

export interface DailyActivityRecord {
  id: string;
  date: string;
  templateId: string;
  category: ActivityCategory;
  title: string;
  durationMinutes: number;
  objective: string;
  introduction: string;
  scriptureReferences: string[];
  instructions: string[];
  writingPrompt: string;
  reflectionQuestion: string;
  dailyAction: string;
  sourceReferences?: { title: string; organization: string; note?: string }[];
  personalResponse?: string;
  reflectionAnswer?: string;
  completedAt?: string;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  date: string;
  pornographyStatus: EpisodeStatus;
  masturbationStatus: EpisodeStatus;
  involuntaryImpulseStatus: ImpulseStatus;
  triggers: string[];
  chainStage: ChainStage;
  strategiesUsed: string[];
  smallVictory?: string;
  improvementNote?: string;
  prayerCompleted: boolean | null;
  notes?: string;
  preventiveAdjustment?: string;
  interruptionPoint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerEntry {
  id: string;
  date: string;
  verseReference: string;
  writtenPrayer?: string;
  feelingNote?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface IfThenPlan {
  id: string;
  ifCondition: string;
  thenAction: string;
  createdAt: string;
  active: boolean;
}

export interface NotificationSettings {
  dailyActivity: { enabled: boolean; time: string };
  checkIn: { enabled: boolean; time: string };
  prayer: { enabled: boolean; time: string };
  weeklyReport: { enabled: boolean; dayOfWeek: number; time: string };
  monthlyReport: { enabled: boolean; dayOfMonth: number; time: string };
}

export interface UserPreferences {
  displayName: string;
  theme: "light" | "dark" | "system";
  tiredMode: boolean;
  aiConsent: boolean;
  aiEnabled: boolean;
  locale: string;
  vulnerableHours: string[];
  physicalLimitations: string;
  relapseDefinition: {
    countPornography: boolean;
    countMasturbation: boolean;
    countInvoluntaryImpulse: boolean;
  };
  notificationSettings: NotificationSettings;
  onboardingCompleted: boolean;
}

export interface SourceItem {
  id: string;
  title: string;
  organization: string;
  url: string;
  sourceType: "spiritual" | "clinical" | "general";
  description: string;
  lastVerifiedAt?: string;
  /** Argomenti per raggruppare le letture consigliate. */
  topics?: Array<
    | "tentazione"
    | "rinnovare_mente"
    | "amare_bene"
    | "purezza"
    | "padronanza"
    | "pornografia"
    | "pensieri_casti"
    | "matrimonio_pazienza"
  >;
}

export interface ReportData {
  periodType: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  checkInDays: number;
  pornographyEpisodes: number;
  masturbationEpisodes: number;
  daysWithoutEpisodes: number | null;
  insufficientData: boolean;
  topTriggers: { name: string; count: number }[];
  vulnerabilityNotes: string[];
  strategiesUsed: { name: string; count: number }[];
  strategiesWithInterruptions: { name: string; count: number }[];
  activitiesCompleted: number;
  prayerCheckIns: number;
  smallVictories: string[];
  recurringDifficulties: string[];
  nextObjective: string;
  weeklyEpisodeSeries?: { weekLabel: string; pornography: number; masturbation: number }[];
  checkInCalendar?: { date: string; hasCheckIn: boolean; hasEpisode: boolean }[];
}

export interface StoredReport {
  id: string;
  periodType: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  reportData: ReportData;
  generatedAt: string;
}

export interface AppData {
  version: number;
  preferences: UserPreferences;
  activities: DailyActivityRecord[];
  checkins: DailyCheckin[];
  prayers: PrayerEntry[];
  ifThenPlans: IfThenPlan[];
  customStrategies: StrategyItem[];
  reports: StoredReport[];
  activityHistoryIds: string[];
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyActivity: { enabled: true, time: "08:00" },
  checkIn: { enabled: true, time: "09:00" },
  prayer: { enabled: true, time: "21:00" },
  weeklyReport: { enabled: true, dayOfWeek: 0, time: "18:00" },
  monthlyReport: { enabled: true, dayOfMonth: 1, time: "18:00" },
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: "",
  theme: "system",
  tiredMode: false,
  aiConsent: false,
  aiEnabled: false,
  locale: "it-IT",
  vulnerableHours: [],
  physicalLimitations: "",
  relapseDefinition: {
    countPornography: true,
    countMasturbation: true,
    countInvoluntaryImpulse: false,
  },
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  onboardingCompleted: false,
};
