export type AiCoachKind = "checkin" | "activity";

export type AiCoachMode = "local" | "groq" | "gemini" | "openai";

export interface AiCoachSourceRef {
  title: string;
  url: string;
  organization: string;
  sourceType: "spiritual" | "clinical" | "general";
}

export interface AiCoachResult {
  mode: AiCoachMode;
  summary: string;
  whatCouldHaveDone: string[];
  whatToChange: string[];
  nextSteps: string[];
  sources: AiCoachSourceRef[];
  disclaimer: string;
  providerLabel: string;
}

export interface CheckinCoachInput {
  kind: "checkin";
  date: string;
  pornographyStatus: string;
  masturbationStatus: string;
  involuntaryImpulseStatus: string;
  triggers: string[];
  chainStage: string;
  strategiesUsed: string[];
  smallVictory?: string;
  improvementNote?: string;
  prayerCompleted: boolean | null;
  interruptionPoint?: string;
  preventiveAdjustment?: string;
  /** Note truncate client-side; mai dettagli espliciti. */
  notesSnippet?: string;
}

export interface ActivityCoachInput {
  kind: "activity";
  date: string;
  title: string;
  category: string;
  objective: string;
  writingPrompt: string;
  reflectionQuestion: string;
  dailyAction: string;
  scriptureReferences: string[];
  personalResponse?: string;
  reflectionAnswer?: string;
  completed: boolean;
}

export type AiCoachInput = CheckinCoachInput | ActivityCoachInput;
