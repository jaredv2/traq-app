import type { CreateFormState, LegalSection } from "../types/app";

export const publicLinks = [
  { to: "/signup", label: "Signup" },
  { to: "/pricing", label: "Pricing" },
  { to: "/privacy", label: "Privacy" },
  { to: "/tos", label: "TOS" },
];

export const appLinks = [
  { to: "/home", label: "Home" },
  { to: "/create", label: "Create" },
  { to: "/settings", label: "Settings" },
  { to: "/profile", label: "Profile" },
  { to: "/pricing", label: "Pricing" },
];

export const defaultCreateForm: CreateFormState = {
  name: "",
  description: "",
  emoji: "🔥",
  target: "",
  category: "habit",
  frequency: "daily",
  accentColor: "#d24b39",
  backgroundColor: "#fff5f1",
};

export const privacySections: LegalSection[] = [
  {
    title: "What we collect",
    body:
      "Traq stores the account details you use to sign in, tracker configuration, and check-in content you submit inside the app. That includes notes, moods, and AI responses tied to your trackers.",
  },
  {
    title: "Why we collect it",
    body:
      "We use the data to authenticate your account, show your trackers across sessions, and generate product features like streaks, summaries, and contextual coaching.",
  },
  {
    title: "What we do not do",
    body:
      "We do not sell user data. We also do not expose private tracker notes publicly. Any future analytics or payment integrations should stay opt-in and narrowly scoped.",
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "Use of service",
    body:
      "Traq is a productivity and habit-tracking product. You are responsible for the content you create and for using the app lawfully and without abusing shared infrastructure.",
  },
  {
    title: "AI responses",
    body:
      "Coach messages are motivational guidance, not medical, financial, or legal advice. Product decisions that rely on AI output still need human judgment.",
  },
  {
    title: "Availability",
    body:
      "The service may evolve, change, or be interrupted while the product is under active development. Paid features, limits, and policies can change with notice.",
  },
];
