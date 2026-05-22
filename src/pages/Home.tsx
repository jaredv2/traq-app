// Home.tsx — traq dashboard home
// Fixes: collapsed sidebar (icon-only, no logo block), mobile drawer, /tracker/:id nav
// Stack: React + React Router DOM + DaisyUI silk + Tailwind + Lucide React

import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home as HomeIcon, LayoutGrid, PlusCircle, Settings, LogOut,
  Flame, CheckCircle2, Circle, ChevronRight, Menu, X,
  Search, ExternalLink, Loader2, Sun, Moon, Sunset, PanelLeftClose,
} from "lucide-react";
import { useAuth }    from "../hooks/useAuth";
import { useHabits }  from "../hooks/useHabits";
import { type Tracker } from "../lib/index";
import { useUiStore } from "../store/uiStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().slice(0, 10);
const isDoneToday = (h: Tracker) => !!h.calendar?.[todayISO()];

const getFrequencyLabel = (cron: string) => {
  if (cron === "0 0 * * *")   return "Daily";
  if (cron === "0 0 * * 1-5") return "Weekdays";
  if (cron === "0 0 * * 0,6") return "Weekends";
  return "Custom";
};

const greeting = (): { label: string; Icon: typeof Sun } => {
  const h = new Date().getHours();
  if (h < 12) return { label: "morning",   Icon: Sun };
  if (h < 17) return { label: "afternoon", Icon: Sunset };
  return           { label: "evening",    Icon: Moon };
};

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { to: "/home",     Icon: HomeIcon,   label: "Home" },
  { to: "/tracker",  Icon: LayoutGrid, label: "Tracker" },
  { to: "/create",   Icon: PlusCircle, label: "New habit" },
  { to: "/settings", Icon: Settings,   label: "Settings" },
] as const;

// ─── Sidebar content (shared between desktop + mobile drawer) ─────────────────

function SidebarContent({
  collapsed,
  onToggle,
  onNavClick,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void;
}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo / collapse row ───────────────────────────────────────────── */}
      <div className={`
        flex items-center border-b border-base-300 shrink-0 h-[53px]
        ${collapsed ? "justify-center px-0" : "gap-2.5 px-4"}
      `}>
        {collapsed ? (
          /* Collapsed: single toggle button fills the row */
          <button
            onClick={onToggle}
            className="w-full h-full flex items-center justify-center text-base-content/40
                       hover:text-base-content hover:bg-base-200 transition-colors"
            title="Expand sidebar"
          >
            <Menu size={16} />
          </button>
        ) : (
          /* Expanded: logo + name + collapse arrow */
          <>
            <span
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center
                         text-primary-content font-bold text-xs shrink-0"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              tq
            </span>
            <span
              className="text-base-content text-base font-semibold tracking-tight flex-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              traq
            </span>
            <button
              onClick={onToggle}
              className="text-base-content/30 hover:text-base-content/70 transition-colors p-1 rounded"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav links ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ to, Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavClick}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 rounded-lg text-sm transition-all duration-150
                ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                ${active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-base-content/50 hover:text-base-content hover:bg-base-200"
                }
              `}
            >
              <Icon size={16} className="shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── User + logout ─────────────────────────────────────────────────── */}
      <div className="border-t border-base-300 px-2 py-3 flex flex-col gap-1 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-primary/15 overflow-hidden shrink-0 flex items-center justify-center">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <span className="text-xs font-bold text-primary">{user.displayName?.[0] ?? "?"}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-base-content/80 text-xs font-medium truncate">{user.displayName ?? "User"}</p>
              <p className="text-base-content/35 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Log out" : undefined}
          className={`
            flex items-center gap-3 rounded-lg text-sm text-base-content/40
            hover:text-base-content hover:bg-base-200 transition-all w-full
            ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
          `}
        >
          <LogOut size={15} className="shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

    </div>
  );
}

// ─── Desktop sidebar (fixed) ──────────────────────────────────────────────────

function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={`
        hidden lg:flex flex-col h-screen bg-base-100 border-r border-base-300
        fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out
        ${collapsed ? "w-[3.5rem]" : "w-56"}
      `}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (overlayRef.current === e.target) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={`
          lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />
      {/* Drawer panel */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 h-screen w-64 bg-base-100 border-r border-base-300
          z-50 transition-transform duration-300 ease-in-out flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-base-content/30 hover:text-base-content transition-colors"
        >
          <X size={16} />
        </button>
        <SidebarContent collapsed={false} onToggle={onClose} onNavClick={onClose} />
      </aside>
    </>
  );
}

// ─── Habit row ────────────────────────────────────────────────────────────────

function HabitRow({ habit, onToggle, index }: { habit: Tracker; onToggle: (id: string) => void; index: number }) {
  const navigate = useNavigate();
  const done = isDoneToday(habit);

  return (
    <div
      className={`
        group flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer fade-up
        ${done
          ? "bg-base-200/60 border-base-200"
          : "bg-base-100 border-base-300 hover:border-primary/30 hover:shadow-sm"
        }
      `}
      style={{ animationDelay: `${0.18 + index * 0.06}s` }}
      onClick={() => onToggle(habit.id)}
    >
      <div className="shrink-0">
        {done
          ? <CheckCircle2 size={20} className="text-primary" strokeWidth={2} />
          : <Circle size={20} className="text-base-300 group-hover:text-primary/40 transition-colors" strokeWidth={1.8} />
        }
      </div>

      <span className="text-lg shrink-0 select-none">{habit.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-colors ${done ? "text-base-content/30 line-through" : "text-base-content/80"}`}>
          {habit.name}
        </p>
        <p className="text-xs text-base-content/35">{getFrequencyLabel(habit.frequency)}</p>
      </div>

      <div className="flex items-center gap-1 text-xs text-base-content/40 shrink-0">
        <Flame size={12} className={habit.streak > 0 ? "text-orange-400" : "text-base-content/20"} />
        <span>{habit.streak}d</span>
      </div>

      {/* Navigate to /tracker/:id — stops row toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/tracker/${habit.id}`); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-base-content/30 hover:text-primary ml-1"
        title="View detail"
      >
        <ExternalLink size={13} />
      </button>
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const collapsed     = useUiStore((s) => s.homeSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleHomeSidebar);
  const mobileOpen    = useUiStore((s) => s.mobileDrawerOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileDrawerOpen);

  const { todayHabits, habits, loading, error, refresh, toggleHabit } = useHabits();

  const desktopMargin  = collapsed ? "3.5rem" : "14rem";
  const firstName      = user?.displayName?.split(" ")[0] ?? "there";
  const today          = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const { label: greetLabel, Icon: GreetIcon } = greeting();

  const doneTodayCount = todayHabits.filter(isDoneToday).length;
  const totalToday     = todayHabits.length;
  const pct            = totalToday > 0 ? Math.round((doneTodayCount / totalToday) * 100) : 0;
  const bestStreak     = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div
      className="min-h-screen bg-base-200 text-base-content"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      data-theme="silk"
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        .pop-in  { animation: popIn 0.35s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Desktop sidebar */}
      <DesktopSidebar collapsed={collapsed} onToggle={toggleSidebar} />

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main */}
      <main
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: `clamp(0px, 100vw - 100vw, ${desktopMargin})` }}
      >
        {/* We use a CSS class approach for the desktop offset instead of inline for lg */}
        <div
          className="min-h-screen flex flex-col"
          // Tailwind can't interpolate dynamic values so we use inline only on lg via style tag trick
        >

          {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between px-4 lg:px-8 py-3.5 border-b border-base-300 bg-base-100/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-base-content/50 hover:text-base-content transition-colors"
              >
                <Menu size={18} />
              </button>
              <p className="text-base-content/40 text-xs font-medium hidden sm:block">{today}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/30" />
                <input
                  className="input input-sm bg-base-200 border-base-300 text-base-content/60
                             placeholder:text-base-content/25 focus:outline-none focus:border-primary/30
                             rounded-lg w-44 text-xs pl-8"
                  placeholder="Search habits…"
                  readOnly
                />
              </div>
              <button
                onClick={() => navigate("/create")}
                className="btn btn-primary btn-sm gap-1.5 text-xs font-semibold"
              >
                <PlusCircle size={14} />
                <span className="hidden sm:inline">New habit</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </header>

          {/* ── CONTENT ────────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-10 sm:pt-14 pb-12 max-w-2xl mx-auto w-full">

            {/* Greeting */}
            <div className="text-center mb-8 sm:mb-10 fade-up w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GreetIcon size={16} className="text-primary/70" strokeWidth={1.8} />
                <p className="text-xs uppercase tracking-widest text-base-content/35 font-medium">
                  Good {greetLabel}
                </p>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-normal text-base-content leading-snug mb-2"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {firstName}<span className="text-primary">.</span>
              </h1>
              <p className="text-base-content/45 text-sm">
                {loading
                  ? "Loading your habits…"
                  : doneTodayCount === totalToday && totalToday > 0
                    ? "All done today 🔥 Incredible."
                    : totalToday === 0
                      ? "No habits yet — create your first one."
                      : `${doneTodayCount} of ${totalToday} habits checked off today.`
                }
              </p>
            </div>

            {/* Stats card */}
            <div className="pop-in flex items-center gap-6 sm:gap-8 mb-8 sm:mb-10 bg-base-100 border border-base-300 rounded-2xl px-5 sm:px-8 py-5 w-full" style={{ animationDelay: "0.08s" }}>
              {/* Ring */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="oklch(var(--b3,#e5e7eb))" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="oklch(var(--p))"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - (totalToday > 0 ? doneTodayCount / totalToday : 0))}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base-content font-semibold text-xs">{pct}%</span>
                </div>
              </div>

              <div className="flex gap-6 sm:gap-8 flex-1">
                <div>
                  <p className="text-xs text-base-content/35 uppercase tracking-widest mb-0.5">Today</p>
                  <p className="text-xl sm:text-2xl font-semibold text-base-content" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    {doneTodayCount}<span className="text-base-content/25 text-sm font-normal"> / {totalToday}</span>
                  </p>
                  <p className="text-xs text-base-content/35">habits done</p>
                </div>
                <div className="border-l border-base-300 pl-6 sm:pl-8">
                  <p className="text-xs text-base-content/35 uppercase tracking-widest mb-0.5">Best streak</p>
                  <div className="flex items-center gap-1.5">
                    <Flame size={15} className="text-orange-400" />
                    <p className="text-xl sm:text-2xl font-semibold text-base-content" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      {bestStreak}<span className="text-base-content/25 text-sm font-normal"> d</span>
                    </p>
                  </div>
                  <p className="text-xs text-base-content/35">keep it going</p>
                </div>
              </div>
            </div>

            <div className="divider my-0 mb-5 w-full" />

            {/* Habits list */}
            <div className="w-full flex flex-col gap-2 fade-up" style={{ animationDelay: "0.14s" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-widest text-base-content/35 font-medium">Today's habits</p>
                <Link to="/tracker" className="flex items-center gap-1 text-xs text-base-content/35 hover:text-primary transition-colors">
                  See all <ChevronRight size={12} />
                </Link>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12 gap-2 text-base-content/30">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Loading habits…</span>
                </div>
              )}

              {error && !loading && (
                <div className="alert alert-error alert-soft text-sm flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={refresh} className="btn btn-xs btn-ghost border-current">Retry</button>
                </div>
              )}

              {!loading && !error && habits.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                  <span className="text-4xl">🌱</span>
                  <p className="text-base-content/40 text-sm">No habits yet.</p>
                  <button onClick={() => navigate("/create")} className="btn btn-primary btn-sm gap-1.5">
                    <PlusCircle size={14} /> Create your first habit
                  </button>
                </div>
              )}

              {!loading && !error && todayHabits.map((habit, i) => (
                <HabitRow key={habit.id} habit={habit} onToggle={toggleHabit} index={i} />
              ))}
            </div>

            {/* Quick actions */}
            {!loading && (
              <div className="w-full mt-8 fade-up" style={{ animationDelay: "0.32s" }}>
                <p className="text-xs uppercase tracking-widest text-base-content/30 mb-3 font-medium">Quick actions</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "New habit", Icon: PlusCircle, to: "/create" },
                    { label: "Tracker",   Icon: LayoutGrid, to: "/tracker" },
                    { label: "Settings",  Icon: Settings,   to: "/settings" },
                  ].map(({ label, Icon, to }) => (
                    <Link
                      key={label}
                      to={to}
                      className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-3 rounded-xl border border-base-300
                                 bg-base-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200
                                 text-base-content/45 hover:text-primary text-xs sm:text-sm group"
                    >
                      <Icon size={14} strokeWidth={1.8} className="shrink-0 group-hover:text-primary transition-colors" />
                      <span className="truncate">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Desktop margin bridge — applied via a style tag so Tailwind purge doesn't strip it */}
      <style>{`
        @media (min-width: 1024px) {
          main { margin-left: ${desktopMargin} !important; }
        }
      `}</style>

    </div>
  );
}