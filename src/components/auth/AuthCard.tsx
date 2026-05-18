import type { FormEvent } from "react";

export function AuthCard({
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
  const submitLabel = needsEmailForLink ? "Complete sign-in" : "Send magic link";

  return (
    <section className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Signup
        </div>
        <h1 className="font-serif text-4xl leading-tight text-stone-900">
          Create your account without passwords.
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Sign in with Google or send a magic link. This is the entry point for the
          tracker app pages behind Firebase auth.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-2xl border border-stone-300 bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          disabled={isGooglePending || isEmailPending || isCompletingLink}
          onClick={() => void onGoogleSignIn()}
        >
          {isGooglePending ? "Signing in with Google..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-400">
          <div className="h-px flex-1 bg-stone-200" />
          Or
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <form className="space-y-3" onSubmit={(event) => void onSendMagicLink(event)}>
          <label className="block text-sm font-medium text-stone-700" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white"
            disabled={isGooglePending || isEmailPending || isCompletingLink}
            required
          />
          <button
            type="submit"
            className="w-full rounded-2xl border border-emerald-200 bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            disabled={isGooglePending || isEmailPending || isCompletingLink}
          >
            {isEmailPending
              ? needsEmailForLink
                ? "Completing sign-in..."
                : "Sending link..."
              : submitLabel}
          </button>
        </form>
      </div>

      <p className="mt-4 text-xs leading-5 text-stone-500">
        {needsEmailForLink
          ? "Confirm the address used to request the link, then finish sign-in."
          : "The email is stored locally on this device so the incoming link can complete automatically."}
      </p>
    </section>
  );
}
