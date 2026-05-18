import { Link } from "react-router-dom";
import type { TraqUser } from "../types/tracker";

export function PricingPage({ user }: { user: TraqUser | null }) {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          Pricing
        </div>
        <h1 className="mt-5 font-serif text-5xl leading-[1.04] text-stone-900">
          Simple plans for a focused habit app.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">
          This page exists as its own route now, so it can support a future checkout
          flow without leaking into the rest of the application shell.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <div className="text-sm uppercase tracking-[0.2em] text-stone-400">Free</div>
          <div className="mt-4 font-serif text-6xl text-stone-900">$0</div>
          <div className="mt-1 text-stone-500">forever</div>
          <ul className="mt-8 space-y-3 text-sm leading-7 text-stone-600">
            <li>Up to 3 trackers</li>
            <li>Google and magic-link auth</li>
            <li>Tracker detail pages with theme styling</li>
            <li>Basic settings and profile management</li>
          </ul>
          <Link
            className="mt-8 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white no-underline"
            to={user ? "/home" : "/signup"}
          >
            {user ? "Back to app" : "Start free"}
          </Link>
        </div>

        <div className="rounded-[2rem] border border-stone-950 bg-stone-950 p-8 text-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
          <div className="text-sm uppercase tracking-[0.2em] text-stone-400">Pro</div>
          <div className="mt-4 font-serif text-6xl">$6.99</div>
          <div className="mt-1 text-stone-300">per month</div>
          <ul className="mt-8 space-y-3 text-sm leading-7 text-stone-200">
            <li>Unlimited trackers</li>
            <li>Advanced AI coaching memory</li>
            <li>Custom tracker themes and visuals</li>
            <li>Future streak protection and richer insights</li>
          </ul>
          <button
            className="mt-8 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
            type="button"
          >
            Payment wiring stays untouched
          </button>
        </div>
      </div>
    </section>
  );
}
