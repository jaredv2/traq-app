// ─── Tracker Types ───────────────────────────────────────────────────────────

export type TrackingFrequency = "daily" | "weekly" | "custom";

export type EntryMood = "easy" | "neutral" | "hard";

export type TrackerCategory =
  | "habit"
  | "health"
  | "fitness"
  | "nutrition"
  | "mental"
  | "productivity"
  | "custom";

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface TrackerTheme {
  accentColor: string;       // hex — used for calendar cells, CTA button
  backgroundColor: string;  // hex — tracker card background
  textColor: string;         // hex — primary text
  fontFamily: string;        // e.g. "Inter", "Geist", "Satoshi"
}

// ─── Tracker ─────────────────────────────────────────────────────────────────

export interface Tracker {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: TrackerCategory;
  emoji?: string;             // optional icon e.g. "💧" "🏋️"
  theme: TrackerTheme;
  frequency: TrackingFrequency;
  customDays?: number[];      // 0=Sun … 6=Sat, used when frequency = "custom"
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isPro: boolean;             // true if created with AI customization (paid)
}

// ─── Entry ───────────────────────────────────────────────────────────────────

export interface TrackerEntry {
  id: string;
  trackerId: string;
  userId: string;
  date: string;               // ISO date string "YYYY-MM-DD"
  checked: boolean;
  note?: string;              // what happened today
  mood?: EntryMood;           // was it easy, neutral or hard
  aiResponse?: string;        // groq motivational advice
  createdAt: Date;
}

// ─── Calendar ────────────────────────────────────────────────────────────────

// One cell in the GitHub-style calendar grid
export interface CalendarDay {
  date: string;               // "YYYY-MM-DD"
  checked: boolean;
  level: 0 | 1 | 2 | 3 | 4;  // intensity for color shading (0 = empty)
}

// ─── Check-in ────────────────────────────────────────────────────────────────

// Payload sent when user submits the bottom sheet
export interface CheckInPayload {
  trackerId: string;
  date: string;
  checked: boolean;
  note?: string;
  mood?: EntryMood;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface AIAdviceRequest {
  trackerName: string;
  trackerCategory: TrackerCategory;
  note?: string;
  mood?: EntryMood;
  currentStreak: number;
  recentEntries: Pick<TrackerEntry, "date" | "checked" | "mood">[];
}

export interface AIAdviceResponse {
  message: string;           // motivational advice from groq
  tone: "encouraging" | "celebratory" | "empathetic" | "challenging";
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserPlan = "free" | "pro";

export interface TraqUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: UserPlan;
  trackerCount: number;      // used to enforce free tier limit
  createdAt: Date;
}

// ─── Store ───────────────────────────────────────────────────────────────────

// Shape of the global app state (zustand or context)
export interface AppState {
  user: TraqUser | null;
  trackers: Tracker[];
  activeTracker: Tracker | null;
  isCheckInOpen: boolean;
  isLoading: boolean;
  error: string | null;
}