import { Link, useParams } from "react-router-dom";
import type { DemoTracker } from "../lib/demo-trackers";

export function TrackerPage({ trackers }: { trackers: DemoTracker[] }) {
  const { trackerId } = useParams();
  const tracker = trackers.find((item) => item.id === trackerId);

  if (!tracker) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center">
        <h1 className="font-serif text-4xl text-stone-900">Tracker not found.</h1>
        <p className="mt-4 text-stone-600">
          The route exists, but there is no tracker in local state for this ID yet.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white no-underline"
          to="/create"
        >
          Create one
        </Link>
      </section>
    );
  }

  const heatmapCells = Array.from({ length: 84 }, (_, index) => {
    const active = index > 84 - tracker.checkIns % 84 - 1 || index % 7 === tracker.streak % 7;
    const opacity = active ? 0.35 + ((index + tracker.streak) % 4) * 0.15 : 1;
    return { active, opacity };
  });

  return (
    <section className="space-y-6">
      <div
        className="rounded-[2rem] px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]"
        style={{ backgroundColor: tracker.theme.backgroundColor, color: tracker.theme.textColor }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div
              className="inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
              style={{ backgroundColor: tracker.theme.accentColor, color: "white" }}
            >
              Tracker
            </div>
            <div className="mt-5 text-5xl">{tracker.emoji}</div>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02]">{tracker.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8">{tracker.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[22rem]">
            <div className="rounded-3xl bg-white/75 p-4">
              <div className="text-sm opacity-70">Target</div>
              <div className="mt-1 text-lg font-medium">{tracker.target}</div>
            </div>
            <div className="rounded-3xl bg-white/75 p-4">
              <div className="text-sm opacity-70">Frequency</div>
              <div className="mt-1 text-lg font-medium capitalize">{tracker.frequency}</div>
            </div>
            <div className="rounded-3xl bg-white/75 p-4">
              <div className="text-sm opacity-70">Streak</div>
              <div className="mt-1 text-lg font-medium">{tracker.streak} days</div>
            </div>
            <div className="rounded-3xl bg-white/75 p-4">
              <div className="text-sm opacity-70">Completion</div>
              <div className="mt-1 text-lg font-medium">{tracker.completionRate}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-stone-400">
                Calendar
              </div>
              <h2 className="mt-2 text-2xl font-medium text-stone-900">
                Tracker page heatmap
              </h2>
            </div>
            <div className="text-sm text-stone-500">{tracker.lastCheckIn}</div>
          </div>

          <div className="grid grid-cols-12 gap-1">
            {heatmapCells.map((cell, index) => (
              <div
                key={`${tracker.id}-${index}`}
                className="aspect-square rounded-[4px]"
                style={{
                  backgroundColor: cell.active ? tracker.theme.accentColor : "#ece7e1",
                  opacity: cell.active ? cell.opacity : 1,
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
            <div className="text-sm uppercase tracking-[0.2em] text-stone-400">Coach note</div>
            <p className="mt-4 text-lg leading-8 text-stone-700">{tracker.coachNote}</p>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
            <div className="text-sm uppercase tracking-[0.2em] text-stone-400">Theme system</div>
            <div className="mt-5 flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-2xl border border-stone-200"
                style={{ backgroundColor: tracker.theme.accentColor }}
              />
              <div
                className="h-12 w-12 rounded-2xl border border-stone-200"
                style={{ backgroundColor: tracker.theme.backgroundColor }}
              />
            </div>
            <div className="mt-5 text-sm leading-7 text-stone-600">
              Font: {tracker.theme.fontFamily}
              <br />
              Accent: {tracker.theme.accentColor}
              <br />
              Background: {tracker.theme.backgroundColor}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
