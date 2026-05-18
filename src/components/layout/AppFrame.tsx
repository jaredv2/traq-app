import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { appLinks, publicLinks } from "../../lib/app-content";
import type { TraqUser } from "../../types/tracker";
import { StatusBanner } from "../ui/StatusBanner";

export function AppFrame({
  user,
  isBusy,
  isSigningOut,
  infoMessage,
  errorMessage,
  onSignOut,
}: {
  user: TraqUser | null;
  isBusy: boolean;
  isSigningOut: boolean;
  infoMessage: string | null;
  errorMessage: string | null;
  onSignOut: () => Promise<void>;
}) {
  const location = useLocation();
  const navItems = user ? appLinks : publicLinks;

  return (
    <main className="min-h-screen bg-[#f5efe6] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 md:px-8">
        <header className="sticky top-0 z-20 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link className="font-serif text-2xl text-stone-900 no-underline" to={user ? "/home" : "/signup"}>
                Traq
              </Link>
              <div className="hidden h-8 w-px bg-stone-200 lg:block" />
              <div className="hidden text-sm text-stone-500 lg:block">
                Track what matters, one route at a time.
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;

                  return (
                    <NavLink
                      key={item.to}
                      className={`rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
                        isActive
                          ? "bg-stone-950 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                      to={item.to}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600 md:block">
                    {user.displayName || user.email}
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400"
                    disabled={isSigningOut}
                    onClick={() => void onSignOut()}
                  >
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              ) : (
                <Link
                  className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-stone-800"
                  to="/signup"
                >
                  Open app
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="mt-4 space-y-3">
          {isBusy ? (
            <StatusBanner tone="info">
              Checking your Firebase session and any pending email sign-in link...
            </StatusBanner>
          ) : null}
          {infoMessage ? <StatusBanner tone="info">{infoMessage}</StatusBanner> : null}
          {errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : null}
        </section>

        <div className="flex-1 py-6">
          <Outlet />
        </div>

        <footer className="mt-auto flex flex-col gap-3 border-t border-stone-200 px-2 py-6 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
          <div>Traq router shell with auth, page scaffolding, and tracker UUID routes.</div>
          <div className="flex gap-4">
            <Link className="text-stone-500 no-underline hover:text-stone-900" to="/privacy">
              Privacy
            </Link>
            <Link className="text-stone-500 no-underline hover:text-stone-900" to="/tos">
              TOS
            </Link>
            <Link className="text-stone-500 no-underline hover:text-stone-900" to="/pricing">
              Pricing
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
