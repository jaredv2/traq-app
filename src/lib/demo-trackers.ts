import type {
  Tracker,
  TrackerCategory,
  TrackerTheme,
  TrackingFrequency,
} from "../types/tracker";
import { uuidv4 } from "./uuidv4";

export type DemoTracker = Tracker & {
  target: string;
  streak: number;
  completionRate: number;
  checkIns: number;
  coachNote: string;
  lastCheckIn: string;
};

type TrackerSeed = {
  name: string;
  description: string;
  category: TrackerCategory;
  frequency: TrackingFrequency;
  emoji: string;
  theme: TrackerTheme;
  target: string;
  streak: number;
  completionRate: number;
  checkIns: number;
  coachNote: string;
  lastCheckIn: string;
};

const trackerSeeds: TrackerSeed[] = [
  {
    name: "Morning Run",
    description: "Start the day with a consistent five-kilometer run before work.",
    category: "fitness",
    frequency: "daily",
    emoji: "🏃",
    theme: {
      accentColor: "#d24b39",
      backgroundColor: "#fff5f1",
      textColor: "#2a1f1b",
      fontFamily: "DM Sans",
    },
    target: "5 km before 7:00 AM",
    streak: 14,
    completionRate: 82,
    checkIns: 48,
    coachNote: "Your consistency is strongest on weekdays. Protect the weekend setup.",
    lastCheckIn: "Today, 6:12 AM",
  },
  {
    name: "Water Ritual",
    description: "Hit hydration early so the rest of the day does not fall behind.",
    category: "health",
    frequency: "daily",
    emoji: "💧",
    theme: {
      accentColor: "#1d8ec8",
      backgroundColor: "#f2fbff",
      textColor: "#10212d",
      fontFamily: "DM Sans",
    },
    target: "8 glasses by 8:00 PM",
    streak: 31,
    completionRate: 91,
    checkIns: 104,
    coachNote: "You already made this automatic. The next gain is timing, not effort.",
    lastCheckIn: "Today, 1:40 PM",
  },
  {
    name: "Deep Work",
    description: "Block focused time for one meaningful session without context switching.",
    category: "productivity",
    frequency: "daily",
    emoji: "🧠",
    theme: {
      accentColor: "#5f52d6",
      backgroundColor: "#f6f4ff",
      textColor: "#1e1a38",
      fontFamily: "DM Sans",
    },
    target: "4 focused hours",
    streak: 7,
    completionRate: 74,
    checkIns: 29,
    coachNote: "Your best notes come after you define the one task that matters first.",
    lastCheckIn: "Yesterday, 9:15 PM",
  },
];

export const createSeedTrackers = (userId: string): DemoTracker[] => {
  const createdAt = new Date();

  return trackerSeeds.map((seed, index) => ({
    id: uuidv4(),
    userId,
    name: seed.name,
    description: seed.description,
    category: seed.category,
    emoji: seed.emoji,
    theme: seed.theme,
    frequency: seed.frequency,
    createdAt: new Date(createdAt.getTime() - index * 86_400_000),
    updatedAt: createdAt,
    isArchived: false,
    isPro: false,
    target: seed.target,
    streak: seed.streak,
    completionRate: seed.completionRate,
    checkIns: seed.checkIns,
    coachNote: seed.coachNote,
    lastCheckIn: seed.lastCheckIn,
  }));
};
