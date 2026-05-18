import type { TrackerCategory, TrackingFrequency } from "./tracker";

export type CreateFormState = {
  name: string;
  description: string;
  emoji: string;
  target: string;
  category: TrackerCategory;
  frequency: TrackingFrequency;
  accentColor: string;
  backgroundColor: string;
};

export type LegalSection = {
  title: string;
  body: string;
};
