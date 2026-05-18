import type { FormEvent } from "react";
import { AuthCard } from "../components/auth/AuthCard";

export function SignupPage({
  email,
  isGooglePending,
  isEmailPending,
  isCompletingLink,
  needsEmailForLink,
  onEmailChange,
  onGoogleSignIn,
  onSendMagicLink,
}: {
  email: string;
  isGooglePending: boolean;
  isEmailPending: boolean;
  isCompletingLink: boolean;
  needsEmailForLink: boolean;
  onEmailChange: (value: string) => void;
  onGoogleSignIn: () => Promise<void>;
  onSendMagicLink: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="rounded-[2rem] bg-stone-950 px-8 py-10 text-white shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
        <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-200">
          Routed product shell
        </div>
        <h2 className="mt-6 font-serif text-5xl leading-[1.02] md:text-6xl">
          Build pages first, then wire the habit loop on top.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
          The app now has dedicated routes for signup, home, settings, create,
          tracker detail, privacy, terms, pricing, and profile. Auth is no longer a
          dead-end screen.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-5">
            <div className="text-sm text-stone-300">Pages</div>
            <div className="mt-2 text-3xl font-medium">9</div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <div className="text-sm text-stone-300">Router</div>
            <div className="mt-2 text-3xl font-medium">Live</div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <div className="text-sm text-stone-300">Tracker IDs</div>
            <div className="mt-2 text-3xl font-medium">UUID v4</div>
          </div>
        </div>
      </div>

      <AuthCard
        email={email}
        isGooglePending={isGooglePending}
        isEmailPending={isEmailPending}
        isCompletingLink={isCompletingLink}
        needsEmailForLink={needsEmailForLink}
        onEmailChange={onEmailChange}
        onGoogleSignIn={onGoogleSignIn}
        onSendMagicLink={onSendMagicLink}
      />
    </section>
  );
}
