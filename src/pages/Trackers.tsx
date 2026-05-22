// Trackers.tsx — /trackers
// All habits list page with GitHub-style mini calendar per row
// Stack: React + React Router DOM + DaisyUI silk + Tailwind + Lucide React + Firebase

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Flame, ChevronRight, Loader2, ArrowLeft,
  LayoutGrid, Search, SlidersHorizontal,
} from "lucide-react";
import { useHabits } from "../hooks/useHabits";
import { getFrequencyLabel, todayISO } from "../lib";
import type { Tracker } from "../lib/index";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lastNDays = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });

const WEEKS = 16;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHOW_ROWS = [1, 3, 5]; // Mon, Wed, Fri

// ─── Mini GitHub calendar (inline, compact) ───────────────────────────────────

function MiniCalendar({
  completedDates,
  color,
}: {
  completedDates: Set<string>;
  color: string;
}) {
  const today = new Date();

  const grid = SHOW_ROWS.map((dayOfWeek) =>
    Array.from({ length: WEEKS }, (_, weekIdx) => {
      const d = new Date(today);
      const daysFromEnd =
        (WEEKS - 1 - weekIdx) * 7 + ((today.getDay() - dayOfWeek + 7) % 7);
      d.setDate(d.getDate() - daysFromEnd);
      const iso = d.toISOString().slice(0, 10);
      return { iso, done: completedDates.has(iso) };
    })
  );

  return (
    <div className="flex flex-col gap-[2px]">
      {grid.map((row, ri) => (
        <div key={ri} className="flex gap-[2px]">
          <div className="w-5 text-[8px] text-base-content/25 font-medium shrink-0 flex items-center justify-end pr-1">
            {WEEKDAYS[SHOW_ROWS[ri]].slice(0, 1)}
          </div>
          {row.map((cell, w) => (
            <div
              key={w}
              className="rounded-[2px] transition-colors"
              style={{
                width: 8,
                height: 8,
                backgroundColor: cell.done ? color : `${color}18`,
              }}
              title={cell.iso}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Tracker row ──────────────────────────────────────────────────────────────

function TrackerRow({
  tracker,
  checkIns,
  onToggle,
  index,
}: {
  tracker: Tracker;
  checkIns: Record<string, unknown>;
  onToggle: (id: string) => void;
  index: number;
}) {
  const navigate = useNavigate();
  const completedDates = useMemo(
    () => new Set(Object.keys(checkIns)),
    [checkIns]
  );

  const doneToday = completedDates.has(todayISO());
  const color = tracker.color ?? "#22c55e";

  // last 30 day completion %
  const pct = useMemo(() => {
    const days = lastNDays(30);
    return Math.round((days.filter((d) => completedDates.has(d)).length / 30) * 100);
  }, [completedDates]);

  return (
    <div
      className="fade-up bg-base-100 border border-base-200 hover:border-base-300 transition-all duration-200 group rounded-2xl cursor-pointer"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={() => navigate(`/tracker/${tracker.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/tracker/${tracker.id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 min-w-0">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Check toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              void onToggle(tracker.id);
            }}
            className={`
              w-7 h-7 shrink-0 flex items-center justify-center border-2 rounded-full
              transition-all duration-200
              ${doneToday
                ? "border-transparent"
                : "border-base-300 hover:border-current"
              }
            `}
            style={doneToday ? { backgroundColor: color, borderColor: color } : { color }}
            title={doneToday ? "Mark undone" : "Mark done"}
          >
            {doneToday && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <span className="text-xl shrink-0">{tracker.icon}</span>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate transition-colors ${doneToday ? "text-base-content/40 line-through" : "text-base-content"}`}>
              {tracker.name}
            </p>
            <p className="text-[10px] text-base-content/35 uppercase tracking-wide">
              {getFrequencyLabel(tracker.frequency)}
            </p>
          </div>
        </div>

        {/* Center: mini calendar */}
        <div className="hidden md:block shrink-0">
          <MiniCalendar completedDates={completedDates} color={color} />
        </div>

        {/* Right: stats + link */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Streak */}
          <div className="flex items-center gap-1 text-xs">
            <Flame
              size={12}
              className={tracker.currentStreak > 0 ? "text-orange-400" : "text-base-content/20"}
            />
            <span className={tracker.currentStreak > 0 ? "text-base-content/60 font-medium" : "text-base-content/25"}>
              {tracker.currentStreak}d
            </span>
          </div>

          {/* 30-day % */}
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-semibold text-base-content/70">{pct}%</p>
            <p className="text-[9px] text-base-content/30 uppercase tracking-wider">30d</p>
          </div>

          {/* Arrow */}
          <ChevronRight size={16} className="text-base-content/20 group-hover:text-primary transition-colors" />
          </div>
        </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 bg-base-200 border border-base-300 rounded-2xl flex items-center justify-center text-3xl">
        🌱
      </div>
      <div>
        <p className="text-sm font-semibold text-base-content/60">No trackers yet</p>
        <p className="text-xs text-base-content/35 mt-1">Create your first habit to get started.</p>
      </div>
      <button
        onClick={() => navigate("/create")}
        className="btn btn-primary btn-sm gap-1.5 text-xs rounded-lg"
      >
        <Plus size={13} /> Create habit
      </button>
    </div>
  );
}

// ─── Trackers page ────────────────────────────────────────────────────────────

export default function Trackers() {
  const navigate = useNavigate();
  const { habits, checkInsMap, loading, error, refresh, toggleHabit } = useHabits();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const doneCount  = habits.filter((h) => {
    const ci = checkInsMap?.[h.id] ?? {};
    return Object.keys(ci).includes(todayISO());
  }).length;

  const totalCount = habits.length;

  return (
    <div
      className="min-h-screen bg-base-200 text-base-content"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      data-theme="silk"
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-base-100 border-b border-base-200 h-12 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-base-content/45 hover:text-base-content transition-colors text-xs"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="w-px h-4 bg-base-300 hidden sm:block" />
          <LayoutGrid size={14} className="text-base-content/40 hidden sm:block" />
          <span className="text-xs font-semibold text-base-content">Tracker list</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search — cosmetic for now */}
          <div className="relative hidden sm:block">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/30" />
            <input
              className="h-7 pl-7 pr-3 text-xs bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary/30 w-36 text-base-content/60 placeholder:text-base-content/25"
              placeholder="Search…"
              readOnly
            />
          </div>
          <button className="w-7 h-7 flex items-center justify-center border border-base-300 rounded-lg bg-base-100 hover:border-base-content/20 transition-colors text-base-content/40 hover:text-base-content">
            <SlidersHorizontal size={12} />
          </button>
          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-1 h-7 px-3 bg-primary text-primary-content text-xs font-semibold hover:opacity-90 transition-opacity rounded-lg"
          >
            <Plus size={12} /> New
          </button>
        </div>
      </header>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        {!loading && habits.length > 0 && (
          <div className="fade-up flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-base-content/35 font-medium mb-1">{today}</p>
              <h1
                className="text-2xl font-normal text-base-content leading-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {doneCount === totalCount
                  ? "All done. 🔥"
                  : `${doneCount} of ${totalCount} done.`}
              </h1>
            </div>

            {/* Progress bar */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <p className="text-[10px] text-base-content/35 uppercase tracking-widest">
                {Math.round((doneCount / totalCount) * 100)}% today
              </p>
              <div className="w-32 h-1 bg-base-300 overflow-hidden rounded-full">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-base-content/30">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-xs">Loading trackers…</span>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="flex items-center justify-between px-4 py-3 bg-base-100 border border-error/20 text-sm rounded-xl">
            <span className="text-error/70 text-xs">{error}</span>
            <button onClick={refresh} className="text-xs text-base-content/40 hover:text-base-content transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* ── Empty ────────────────────────────────────────────────────────── */}
        {!loading && !error && habits.length === 0 && <EmptyState />}

        {/* ── Tracker list ─────────────────────────────────────────────────── */}
        {!loading && !error && habits.length > 0 && (
          <div className="flex flex-col gap-2">

            {/* Column headers — desktop */}
            <div className="hidden md:flex items-center px-4 py-1 gap-3">
              <div className="w-7 shrink-0" />
              <div className="w-7 shrink-0" />
              <div className="flex-1 text-[9px] uppercase tracking-widest text-base-content/25 font-medium pl-0">
                Tracker
              </div>
              <div className="text-[9px] uppercase tracking-widest text-base-content/25 font-medium w-[160px] text-center hidden md:block">
                Last {WEEKS} weeks
              </div>
              <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-base-content/25 font-medium shrink-0 pr-6">
                <span>Streak</span>
                <span className="hidden sm:block w-8 text-right">30d</span>
              </div>
            </div>

            {/* Rows */}
            {habits.map((habit, i) => (
              <TrackerRow
                key={habit.id}
                tracker={habit}
                checkIns={checkInsMap?.[habit.id] ?? {}}
                onToggle={toggleHabit}
                index={i}
              />
            ))}
          </div>
        )}

        {/* ── Footer count ─────────────────────────────────────────────────── */}
        {!loading && habits.length > 0 && (
          <p className="text-[10px] text-base-content/25 text-center uppercase tracking-widest fade-up">
            {habits.length} tracker{habits.length !== 1 ? "s" : ""}
          </p>
        )}

      </div>
    </div>
  );
}
