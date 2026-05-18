import { Link } from "react-router-dom";
import type { DemoTracker } from "../lib/demo-trackers";
import type { TraqUser } from "../types/tracker";

export function HomePage({
  user,
  trackers,
}: {
  user: TraqUser;
  trackers: DemoTracker[];
}) {
  const bestStreak = trackers.reduce(
    (highest, tracker) => Math.max(highest, tracker.streak),
    0
  );
  const averageCompletion =
    trackers.length === 0
      ? 0
      : Math.round(
          trackers.reduce((sum, tracker) => sum + tracker.completionRate, 0) / trackers.length
        );

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-white px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
            Home
          </div>
          <h1 className="mt-5 font-serif text-5xl leading-[1.04] text-stone-900">
            Welcome back, {user.displayName || user.email.split("@")[0]}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">
            This is the routed dashboard shell for the app. Use it to move between
            tracker creation, profile, settings, pricing, and individual tracker pages.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-stone-800"
              to="/create"
            >
              Create tracker
            </Link>
            <Link
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 no-underline transition hover:border-stone-400 hover:bg-stone-50"
              to="/profile"
            >
              View profile
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[2rem] bg-[#fce9dd] p-6">
            <div className="text-sm text-stone-500">Active trackers</div>
            <div className="mt-3 text-4xl font-medium text-stone-900">{trackers.length}</div>
          </div>
          <div className="rounded-[2rem] bg-[#e7f6ff] p-6">
            <div className="text-sm text-stone-500">Average completion</div>
            <div className="mt-3 text-4xl font-medium text-stone-900">{averageCompletion}%</div>
          </div>
          <div className="rounded-[2rem] bg-[#eeebff] p-6">
            <div className="text-sm text-stone-500">Best streak</div>
            <div className="mt-3 text-4xl font-medium text-stone-900">{bestStreak} days</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {trackers.map((tracker) => (
          <Link
            key={tracker.id}
            className="rounded-[2rem] border border-stone-200 bg-white p-6 text-inherit no-underline shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(0,0,0,0.08)]"
            to={`/tracker/${tracker.id}`}
          >
            <div
              className="inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
              style={{
                backgroundColor: tracker.theme.backgroundColor,
                color: tracker.theme.textColor,
              }}
            >
              {tracker.category}
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl">{tracker.emoji}</div>
                <h2 className="mt-3 text-2xl font-medium text-stone-900">{tracker.name}</h2>
              </div>
              <div
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{ backgroundColor: tracker.theme.backgroundColor, color: tracker.theme.textColor }}
              >
                {tracker.streak}d
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{tracker.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-stone-50 p-3">
                <div className="text-stone-500">Target</div>
                <div className="mt-1 font-medium text-stone-900">{tracker.target}</div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-3">
                <div className="text-stone-500">Check-ins</div>
                <div className="mt-1 font-medium text-stone-900">{tracker.checkIns}</div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-3">
                <div className="text-stone-500">Complete</div>
                <div className="mt-1 font-medium text-stone-900">{tracker.completionRate}%</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
