import type { AIAdviceRequest, AIAdviceResponse } from "../types/tracker";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

type GroqMessage = {
  role: "system" | "user";
  content: string;
};

type CheckInAdviceRequest = AIAdviceRequest & { checked: boolean };

const groqFetch = async (messages: GroqMessage[]): Promise<string> => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.85,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
};

const buildSystemPrompt = (): string =>
  `
You are Traq's AI coach. You give short, honest, motivating advice to users who are tracking their habits and goals.

Rules:
- Keep responses under 3 sentences. Be punchy, not preachy.
- Match the tone to the mood: hard day = empathetic but firm, easy day = celebratory but not over the top.
- Reference their streak if it's notable (3+, 7+, 30+ days).
- Never use generic filler like "Great job!" or "Keep it up!" alone; say something specific.
- Sound like a real coach, not a chatbot.
- No emojis unless the user's note has them.
`.trim();

const buildUserPrompt = (req: CheckInAdviceRequest): string => {
  const recentChecked = req.recentEntries.filter((entry) => entry.checked).length;
  const recentTotal = req.recentEntries.length;

  return `
Tracker: "${req.trackerName}" (${req.trackerCategory})
Current streak: ${req.currentStreak} days
Recent performance: ${recentChecked}/${recentTotal} days checked
Today: ${req.checked ? "checked" : "skipped"}
Mood: ${req.mood ?? "not specified"}
Note from user: "${req.note ?? "no note"}"

Give me a short motivational message for today's check-in.
`.trim();
};

const detectTone = (req: CheckInAdviceRequest): AIAdviceResponse["tone"] => {
  if (!req.checked) {
    return "empathetic";
  }

  if (req.mood === "hard") {
    return "encouraging";
  }

  if (req.currentStreak >= 7) {
    return "celebratory";
  }

  return "challenging";
};

export const getCheckInAdvice = async (
  req: CheckInAdviceRequest
): Promise<AIAdviceResponse> => {
  const message = await groqFetch([
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(req) },
  ]);

  return {
    message,
    tone: detectTone(req),
  };
};

export interface AITrackerConfig {
  name: string;
  description: string;
  emoji: string;
  category: string;
  frequency: "daily" | "weekly" | "custom";
  theme: {
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  suggestedFields: string[];
}

export const generateTrackerConfig = async (
  userPrompt: string
): Promise<AITrackerConfig> => {
  const system = `
You are Traq's AI setup assistant. When a user describes what they want to track, you return a JSON config for their tracker.

Return ONLY valid JSON, no explanation, no markdown. Schema:
{
  "name": string,
  "description": string,
  "emoji": string (single emoji),
  "category": "habit" | "health" | "fitness" | "nutrition" | "mental" | "productivity" | "custom",
  "frequency": "daily" | "weekly" | "custom",
  "theme": {
    "accentColor": string (hex),
    "backgroundColor": string (hex, dark),
    "textColor": string (hex),
    "fontFamily": "Inter" | "Geist" | "Satoshi" | "Manrope"
  },
  "suggestedFields": string[] (2-4 things to note at check-in)
}
`.trim();

  const raw = await groqFetch([
    { role: "system", content: system },
    { role: "user", content: `I want to track: ${userPrompt}` },
  ]);

  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as AITrackerConfig;
};
