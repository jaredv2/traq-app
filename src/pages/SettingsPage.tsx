import { useState } from "react";

export function SettingsPage() {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [aiDepth, setAiDepth] = useState("balanced");

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] bg-[#fff7ef] p-8">
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          Settings
        </div>
        <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-stone-900">
          Tune the experience, not just the data.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-stone-600">
          This page gives the routed shell a home for reminders, delivery preferences,
          and AI behavior. The controls are local UI state for now.
        </p>
      </div>

      <div className="space-y-5">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-stone-900">Daily reminder</h2>
              <p className="mt-1 text-sm text-stone-600">
                Keep the one-tap check-in top of mind each evening.
              </p>
            </div>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                dailyReminder ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-600"
              }`}
              onClick={() => setDailyReminder((current) => !current)}
            >
              {dailyReminder ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-stone-900">Weekly digest</h2>
              <p className="mt-1 text-sm text-stone-600">
                Group streaks, misses, and AI summaries into a single weekly review.
              </p>
            </div>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                weeklyDigest ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-600"
              }`}
              onClick={() => setWeeklyDigest((current) => !current)}
            >
              {weeklyDigest ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-medium text-stone-900">AI coaching depth</h2>
          <p className="mt-1 text-sm text-stone-600">
            Decide whether the assistant should stay short, balanced, or more reflective.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["brief", "balanced", "deep"].map((option) => (
              <button
                key={option}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                  aiDepth === option
                    ? "bg-stone-950 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
                onClick={() => setAiDepth(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
