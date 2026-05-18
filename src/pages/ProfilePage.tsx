import type { DemoTracker } from "../lib/demo-trackers";
import type { TraqUser } from "../types/tracker";

export function ProfilePage({
  user,
  trackers,
}: {
  user: TraqUser;
  trackers: DemoTracker[];
}) {
  const initials = (user.displayName || user.email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] bg-stone-950 p-8 text-white shadow-[0_30px_90px_rgba(0,0,0,0.16)]">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/10 text-3xl font-medium">
          {initials}
        </div>
        <h1 className="mt-6 font-serif text-5xl leading-[1.02]">
          {user.displayName || user.email}
        </h1>
        <p className="mt-3 text-base leading-8 text-stone-300">
          Profile route for account identity, plan, and app footprint.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <div className="text-sm uppercase tracking-[0.2em] text-stone-400">Account</div>
          <div className="mt-4 text-lg text-stone-700">
            <strong className="text-stone-900">Email:</strong> {user.email}
          </div>
          <div className="mt-2 text-lg text-stone-700">
            <strong className="text-stone-900">Plan:</strong> {user.plan}
          </div>
          <div className="mt-2 text-lg text-stone-700">
            <strong className="text-stone-900">Auth:</strong> Firebase session
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <div className="text-sm uppercase tracking-[0.2em] text-stone-400">Usage</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <div className="text-sm text-stone-500">Trackers</div>
              <div className="mt-1 text-2xl font-medium text-stone-900">{trackers.length}</div>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <div className="text-sm text-stone-500">Stored count</div>
              <div className="mt-1 text-2xl font-medium text-stone-900">{user.trackerCount}</div>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <div className="text-sm text-stone-500">Created</div>
              <div className="mt-1 text-2xl font-medium text-stone-900">Live</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
