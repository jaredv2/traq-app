import { Timestamp } from "firebase/firestore";

export type FrequencyPeriod = "day" | "week" | "month" | "year";
export type FrequencyMode = "specific" | "random";

export interface TrackerFrequency {
  period: FrequencyPeriod;
  times: number;
  specificDays: number[];
  mode: FrequencyMode;
}

export interface TrackerCheckIn {
  date: string;
  note: string;
  value?: number;
  timestamp: Timestamp;
}

export interface Tracker {
  id: string;
  ownerId: string;
  name: string;
  icon: string;
  color: string;
  unit: string;
  frequency: TrackerFrequency;
  goal?: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Timestamp;
  lastCheckIn?: string | null;
}

interface TrackerInput {
  id: string;
  ownerId: string;
  name: string;
  icon?: string;
  color?: string;
  unit?: string;
  frequency?: Partial<TrackerFrequency>;
  goal?: number;
  currentStreak?: number;
  longestStreak?: number;
  createdAt?: Timestamp;
  lastCheckIn?: string | null;
}

const DEFAULT_TRACKER_FREQUENCY: TrackerFrequency = {
  period: "day",
  times: 1,
  specificDays: [],
  mode: "random",
};

const normalizeFrequency = (frequency?: Partial<TrackerFrequency>): TrackerFrequency => {
  const specificDays = Array.from(
    new Set(
      (frequency?.specificDays ?? [])
        .filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6),
    ),
  ).sort((left, right) => left - right);

  const period = frequency?.period ?? DEFAULT_TRACKER_FREQUENCY.period;
  const mode = period === "week" && specificDays.length > 0
    ? "specific"
    : (frequency?.mode ?? DEFAULT_TRACKER_FREQUENCY.mode);

  return {
    period,
    times: Math.max(1, Number(frequency?.times) || DEFAULT_TRACKER_FREQUENCY.times),
    specificDays: period === "week" ? specificDays : [],
    mode,
  };
};

export class TrackerModel implements Tracker {
  id: string;
  ownerId: string;
  name: string;
  icon: string;
  color: string;
  unit: string;
  frequency: TrackerFrequency;
  goal?: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Timestamp;
  lastCheckIn?: string | null;

  constructor({
    id,
    ownerId,
    name,
    icon = "✨",
    color = "#3b82f6",
    unit = "times",
    frequency,
    goal,
    currentStreak = 0,
    longestStreak = 0,
    createdAt = Timestamp.now(),
    lastCheckIn = null,
  }: TrackerInput) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name.trim();
    this.icon = icon;
    this.color = color;
    this.unit = unit.trim() || "times";
    this.frequency = normalizeFrequency(frequency);
    this.goal = typeof goal === "number" && Number.isFinite(goal) ? goal : undefined;
    this.currentStreak = currentStreak;
    this.longestStreak = longestStreak;
    this.createdAt = createdAt;
    this.lastCheckIn = lastCheckIn;
  }

  static create(input: TrackerInput): TrackerModel {
    return new TrackerModel(input);
  }

  static fromFirestore(id: string, data: unknown): TrackerModel | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    const tracker = data as Partial<Tracker>;
    if (typeof tracker.ownerId !== "string" || typeof tracker.name !== "string") {
      return null;
    }

    return new TrackerModel({
      id,
      ownerId: tracker.ownerId,
      name: tracker.name,
      icon: typeof tracker.icon === "string" ? tracker.icon : undefined,
      color: typeof tracker.color === "string" ? tracker.color : undefined,
      unit: typeof tracker.unit === "string" ? tracker.unit : undefined,
      frequency: tracker.frequency,
      goal: typeof tracker.goal === "number" ? tracker.goal : undefined,
      currentStreak: typeof tracker.currentStreak === "number" ? tracker.currentStreak : undefined,
      longestStreak: typeof tracker.longestStreak === "number" ? tracker.longestStreak : undefined,
      createdAt: tracker.createdAt instanceof Timestamp ? tracker.createdAt : undefined,
      lastCheckIn: typeof tracker.lastCheckIn === "string" || tracker.lastCheckIn === null
        ? tracker.lastCheckIn
        : undefined,
    });
  }

  toFirestore(): Omit<Tracker, "id"> {
    return {
      ownerId: this.ownerId,
      name: this.name,
      icon: this.icon,
      color: this.color,
      unit: this.unit,
      frequency: this.frequency,
      goal: this.goal,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
      createdAt: this.createdAt,
      lastCheckIn: this.lastCheckIn,
    };
  }
}

export interface User {
  uid: string;
  name: string;
  email: string;
  isPremium: boolean;
  trackerCount: number;
  createdAt: Timestamp;
}

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const isScheduledForDate = (
  frequency: TrackerFrequency,
  date: Date = new Date(),
): boolean => {
  if (frequency.period === "day") {
    return true;
  }

  if (frequency.mode === "specific" && frequency.specificDays.length > 0) {
    return frequency.specificDays.includes(date.getDay());
  }

  return true;
};

export const getFrequencyLabel = (frequency: TrackerFrequency): string => {
  if (frequency.mode === "specific" && frequency.specificDays.length > 0) {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return labels
      .filter((_, index) => frequency.specificDays.includes(index))
      .join(" ");
  }

  const periodLabels: Record<FrequencyPeriod, string> = {
    day: "day",
    week: "week",
    month: "month",
    year: "year",
  };

  if (frequency.times === 1 && frequency.period === "day") {
    return "Every day";
  }

  return `${frequency.times}x per ${periodLabels[frequency.period]}`;
};

export const hasCheckInOnDate = (
  checkIns: Record<string, TrackerCheckIn>,
  date: string,
): boolean => Object.values(checkIns).some((checkIn) => checkIn.date === date);

export const getCheckInMap = (
  checkIns: Record<string, TrackerCheckIn>,
): Record<string, TrackerCheckIn> =>
  Object.values(checkIns).reduce<Record<string, TrackerCheckIn>>((acc, checkIn) => {
    acc[checkIn.date] = checkIn;
    return acc;
  }, {});

export const calculateStreaks = (
  checkIns: Record<string, TrackerCheckIn>,
  currentDate: string = todayISO(),
): { currentStreak: number; longestStreak: number; lastCheckIn: string | null } => {
  const dates = Object.values(checkIns)
    .map((checkIn) => checkIn.date)
    .filter(Boolean)
    .sort();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00`);
    const current = new Date(`${dates[index]}T00:00:00`);
    const dayDiff = Math.round((current.getTime() - previous.getTime()) / 86400000);

    if (dayDiff === 1) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else if (dayDiff > 1) {
      runningStreak = 1;
    }
  }

  const lastCheckIn = dates[dates.length - 1];
  let currentStreak = 0;
  let cursor = new Date(`${currentDate}T00:00:00`);

  while (dates.includes(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, longestStreak, lastCheckIn };
};
