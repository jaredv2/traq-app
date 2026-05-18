import { startTransition, useEffect, useState, type FormEvent } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  MagicLinkEmailRequiredError,
  completeMagicLinkSignIn,
  isMagicLinkSignIn,
  onAuthChange,
  sendMagicLink,
  signInWithGoogle,
  signOut,
} from "./lib/firebase";
import { privacySections, termsSections } from "./lib/app-content";
import { createSeedTrackers, type DemoTracker } from "./lib/demo-trackers";
import { uuidv4 } from "./lib/uuidv4";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AppFrame } from "./components/layout/AppFrame";
import { RootRedirect } from "./components/layout/RootRedirect";
import { CreatePage } from "./pages/CreatePage";
import { HomePage } from "./pages/HomePage";
import { LegalPage } from "./pages/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PricingPage } from "./pages/PricingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignupPage } from "./pages/SignupPage";
import { TrackerPage } from "./pages/TrackerPage";
import type { CreateFormState } from "./types/app";
import type { TraqUser } from "./types/tracker";

function getFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}

function clearMagicLinkParams(): void {
  const url = new URL(window.location.href);

  for (const param of ["apiKey", "lang", "mode", "oobCode"]) {
    url.searchParams.delete(param);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", nextUrl || "/");
}

export default function App() {
  const hasMagicLinkInUrl = isMagicLinkSignIn(window.location.href);
  const [user, setUser] = useState<TraqUser | null>(null);
  const [email, setEmail] = useState("");
  const [trackers, setTrackers] = useState<DemoTracker[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isCompletingLink, setIsCompletingLink] = useState(hasMagicLinkInUrl);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [needsEmailForLink, setNeedsEmailForLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(
    hasMagicLinkInUrl ? "Finishing your email sign-in..." : null
  );

  useEffect(() => {
    const unsubscribe = onAuthChange((nextUser) => {
      startTransition(() => {
        setUser(nextUser);
        setTrackers(nextUser ? createSeedTrackers(nextUser.uid) : []);
        setIsAuthReady(true);
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const currentUrl = window.location.href;

    if (!hasMagicLinkInUrl) {
      return;
    }

    let cancelled = false;

    completeMagicLinkSignIn(currentUrl)
      .then((signedInUser) => {
        if (cancelled) {
          return;
        }

        setEmail(signedInUser.email);
        setNeedsEmailForLink(false);
        setInfoMessage(`Signed in as ${signedInUser.email}.`);
        clearMagicLinkParams();
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof MagicLinkEmailRequiredError) {
          setNeedsEmailForLink(true);
          setInfoMessage("Confirm the email address you used to request the link.");
          return;
        }

        setInfoMessage(null);
        setErrorMessage(getFriendlyError(error));
      })
      .finally(() => {
        if (!cancelled) {
          setIsCompletingLink(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasMagicLinkInUrl]);

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsGooglePending(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const signedInUser = await signInWithGoogle();
      setEmail(signedInUser.email);
      setInfoMessage(`Signed in as ${signedInUser.email}.`);
    } catch (error) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsGooglePending(false);
    }
  };

  const handleSendMagicLink = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Enter an email address first.");
      return;
    }

    setIsEmailPending(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (needsEmailForLink) {
        const signedInUser = await completeMagicLinkSignIn(window.location.href, trimmedEmail);
        setInfoMessage(`Signed in as ${signedInUser.email}.`);
        setNeedsEmailForLink(false);
        clearMagicLinkParams();
      } else {
        await sendMagicLink(trimmedEmail);
        setInfoMessage(`Magic link sent to ${trimmedEmail}.`);
      }
    } catch (error) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsEmailPending(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      await signOut();
      setEmail("");
      setInfoMessage("Signed out.");
    } catch (error) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleCreateTracker = (form: CreateFormState): string => {
    if (!user) {
      return "";
    }

    const createdAt = new Date();
    const id = uuidv4();

    const tracker: DemoTracker = {
      id,
      userId: user.uid,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      emoji: form.emoji.trim() || "🔥",
      theme: {
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        textColor: "#1c1917",
        fontFamily: "DM Sans",
      },
      frequency: form.frequency,
      createdAt,
      updatedAt: createdAt,
      isArchived: false,
      isPro: false,
      target: form.target.trim(),
      streak: 0,
      completionRate: 0,
      checkIns: 0,
      coachNote: "Your first check-in will start the pattern. Keep the loop brutally easy.",
      lastCheckIn: "No check-ins yet",
    };

    setTrackers((current) => [tracker, ...current]);
    return id;
  };

  const isBusy = !isAuthReady || isCompletingLink;

  return (
    <Routes>
      <Route
        element={
          <AppFrame
            errorMessage={errorMessage}
            infoMessage={infoMessage}
            isBusy={isBusy}
            isSigningOut={isSigningOut}
            onSignOut={handleSignOut}
            user={user}
          />
        }
      >
        <Route element={<RootRedirect hasMagicLinkInUrl={hasMagicLinkInUrl} user={user} />} path="/" />
        <Route
          element={
            user ? (
              <Navigate replace to="/home" />
            ) : (
              <SignupPage
                email={email}
                isCompletingLink={isCompletingLink}
                isEmailPending={isEmailPending}
                isGooglePending={isGooglePending}
                needsEmailForLink={needsEmailForLink}
                onEmailChange={setEmail}
                onGoogleSignIn={handleGoogleSignIn}
                onSendMagicLink={handleSendMagicLink}
              />
            )
          }
          path="/signup"
        />
        <Route
          element={<PricingPage user={user} />}
          path="/pricing"
        />
        <Route
          element={
            <LegalPage
              description="This page is routed separately so policy copy can evolve without touching the rest of the app shell."
              eyebrow="Privacy"
              sections={privacySections}
              title="Privacy policy"
            />
          }
          path="/privacy"
        />
        <Route
          element={
            <LegalPage
              description="These terms are intentionally plain and scoped to the current product surface."
              eyebrow="Terms"
              sections={termsSections}
              title="Terms of service"
            />
          }
          path="/tos"
        />
        <Route
          element={
            <RequireAuth user={user}>
              <HomePage trackers={trackers} user={user as TraqUser} />
            </RequireAuth>
          }
          path="/home"
        />
        <Route
          element={
            <RequireAuth user={user}>
              <CreatePage onCreate={handleCreateTracker} user={user as TraqUser} />
            </RequireAuth>
          }
          path="/create"
        />
        <Route
          element={
            <RequireAuth user={user}>
              <TrackerPage trackers={trackers} />
            </RequireAuth>
          }
          path="/tracker/:trackerId"
        />
        <Route
          element={
            <RequireAuth user={user}>
              <SettingsPage />
            </RequireAuth>
          }
          path="/settings"
        />
        <Route
          element={
            <RequireAuth user={user}>
              <ProfilePage trackers={trackers} user={user as TraqUser} />
            </RequireAuth>
          }
          path="/profile"
        />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
