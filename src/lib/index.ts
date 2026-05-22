import { Timestamp } from "firebase/firestore";

export type PlanType = 'free' | 'pro';
export type EntryMood = 'easy' | 'hard' | 'neutral';

/**
 * Path: /users/{uid}/trackers/{trackerId}/entries/{dateISO}
 * e.g., /users/abc/trackers/xyz/entries/2023-10-27
 */
export interface Entry {
  checked: boolean;
  note: string;
  aiResponse: string;
  mood: EntryMood;
}

export interface ThemeSetup {
  accentColor: string;
  primaryColor: string;
  font: string;
  backgroundImage: string | null;
}

/**
 * Path: /users/{uid}/trackers/{trackerId}
 */
export interface Tracker {
  id: string;
  accId: string; // The UID of the user who owns this tracker
  name: string;
  emoji: string;
  description: string;
  frequency: string; // Cron syntax: "min hour dayOfMonth month dayOfWeek" (e.g., "0 0 * * *")
  remindTime: string; // Time string e.g., "08:00"
  acceptNote: boolean;
  note: string; // Global note or instruction for this tracker
  streak: number;
  trackField: string; // The metric being tracked (e.g., "Pages", "Liters")
  calendar: Record<string, number>; // Mapping of date strings (YYYY-MM-DD) to completion values
  themeSetup: ThemeSetup;
}

/**
 * Path: /users/{uid}
 */
export interface User {
  uid: string;
  name: string;
  hobbies: string[];
  habits: string[]; // Array of quick-access tracker IDs or names
  defaultFrequencySetup: string; // Standard cron for new trackers
  createdAt: Timestamp;
  plan: PlanType;
  streak: number; // Overall account usage streak
}