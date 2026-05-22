// TrackerDetail.tsx — /tracker/:id
// Shows full habit detail: streak, calendar heatmap, completion history
// Stack: React + React Router DOM + DaisyUI silk + Tailwind + Lucide React + Firebase

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Flame, CheckCircle2, Circle, CalendarDays,
  TrendingUp, MoreHorizontal, Pencil, Trash2, Loader2,
} from "lucide-react";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { type Tracker } from "../lib/index";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().slice(0, 10);

const isDoneToday = (h: Tracker) => (h.calendar?.[todayISO()] ?? 0) > 0;

const getFrequencyLabel = (cron: string) => {
  if (cron === "0 0 * * *")   return "Every day";
  if (cron === "0 0 * * 1-5") return "Weekdays only";
  if (cron === "0 0 * * 0,6") return "Weekends only";
  return "Custom schedule";
};

// Build last N days ISO strings
const lastNDays = (n: number): string[] => {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
};

// ─── Mini calendar heatmap (last 35 days, 5 rows × 7 cols) ───────────────────

function HeatmapGrid({ calendar }: { calendar: Record<string, number> }) {
  const days = lastNDays(35);
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((d, i) => (
          <div key={i} className="text-center text-xs text-base-content/30 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((iso) => {
          const done = (calendar?.[iso] ?? 0) > 0;
          const isToday = iso === todayISO();
          return (
            <div
              key={iso}
              title={iso}
              className={`
                aspect-square rounded-md transition-colors
                ${done
                  ? "bg-primary"
                  : "bg-base-300/60"
                }
                ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100" : ""}
              `}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-base-100 border border-base-300 rounded-xl px-4 py-3.5 flex-1 min-w-0">
      <p className="text-xs text-base-content/35 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-semibold text-base-content" style={{ fontFamily: "'DM Serif Display', serif" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-base-content/35 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── TrackerDetail ────────────────────────────────────────────────────────────

export default function TrackerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [habit, setHabit]       = useState<Tracker | null>(null);
  const [error, setError]       = useState<{ id: string; message: string } | null>(null);
  const [toggling, setToggling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadHabit = async () => {
      try {
        const snap = await getDoc(doc(db, "habits", id));
        if (cancelled) return;

        if (!snap.exists()) {
          setError({ id, message: "Habit not found." });
          return;
        }

        const data = snap.data();
        if (data.accId !== user?.uid) {
          setError({ id, message: "Access denied." });
          return;
        }

        setHabit({ id: snap.id, ...data } as Tracker);
        setError(null);
      } catch {
        if (!cancelled) {
          setError({ id, message: "Couldn't load habit." });
        }
      }
    };

    void loadHabit();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // ── Toggle today ─────────────────────────────────────────────────────────────
  const toggleToday = async () => {
    if (!habit || toggling) return;
    setToggling(true);
    const today   = todayISO();
    const done = (habit.calendar?.[today] ?? 0) > 0;
    const newCal: Record<string, number> = { ...(habit.calendar ?? {}) };
    if (!done) newCal[today] = 1;
    if (done) delete newCal[today];

    const newStreak = !done ? habit.streak + 1 : Math.max(0, habit.streak - 1);

    setHabit((h) => h ? { ...h, calendar: newCal, streak: newStreak } : h);
    try {
      await updateDoc(doc(db, "habits", habit.id), {
        calendar: newCal,
        streak: newStreak,
        updatedAt: Timestamp.now(),
      });
    } catch {
      // revert
      setHabit((h) => h ? { ...h, calendar: habit.calendar, streak: habit.streak } : h);
    } finally {
      setToggling(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!habit) return;
    if (!confirm(`Delete "${habit.name}"? This can't be undone.`)) return;
    await deleteDoc(doc(db, "habits", habit.id));
    navigate("/home", { replace: true });
  };

  // ── Derived stats ────────────────────────────────────────────────────────────
  const currentHabit = habit?.id === id ? habit : null;
  const currentError = error?.id === id ? error?.message ?? null : null;
  const loading = Boolean(id) && !currentHabit && !currentError;

  const totalDone    = Object.values(currentHabit?.calendar ?? {}).filter(Boolean).length;
  const completionPct = (() => {
    if (!currentHabit) return 0;
    const days = lastNDays(30);
    const done = days.filter((d) => !!currentHabit.calendar?.[d]).length;
    return Math.round((done / 30) * 100);
  })();

  const done = currentHabit ? isDoneToday(currentHabit) : false;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-base-200 text-base-content"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      data-theme="silk"
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-sm border-b border-base-300 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-base-content/50 hover:text-base-content transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>

        {currentHabit && (
          <div className="flex items-center gap-2">
            {/* Options menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="btn btn-ghost btn-sm btn-square"
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-base-100 border border-base-300 rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/create?edit=${currentHabit.id}`); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-200 transition-colors"
                  >
                    <Pencil size={14} /> Edit habit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); handleDelete(); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── CONTENT ────────────────────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-base-content/30">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading habit…</span>
          </div>
        )}

        {/* Error */}
        {currentError && !loading && (
          <div className="alert alert-error alert-soft text-sm">{currentError}</div>
        )}

        {/* Habit detail */}
        {currentHabit && !loading && (
          <>
            {/* Header card */}
            <div className="fade-up bg-base-100 border border-base-300 rounded-2xl px-6 py-5 flex items-start gap-4">
              <span className="text-4xl mt-0.5">{currentHabit.emoji}</span>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-2xl sm:text-3xl font-normal text-base-content leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {currentHabit.name}
                </h1>
                <p className="text-sm text-base-content/40 mt-1">{getFrequencyLabel(currentHabit.frequency)}</p>
              </div>
            </div>

            {/* Today toggle */}
            <div
              className={`
                fade-up flex items-center justify-between px-5 py-4 rounded-2xl border
                cursor-pointer transition-all duration-200 select-none
                ${done
                  ? "bg-primary/10 border-primary/30"
                  : "bg-base-100 border-base-300 hover:border-primary/30 hover:shadow-sm"
                }
              `}
              style={{ animationDelay: "0.06s" }}
              onClick={toggleToday}
            >
              <div className="flex items-center gap-3">
                {toggling
                  ? <Loader2 size={20} className="animate-spin text-primary" />
                  : done
                    ? <CheckCircle2 size={20} className="text-primary" strokeWidth={2} />
                    : <Circle size={20} className="text-base-content/30" strokeWidth={1.8} />
                }
                <div>
                  <p className="text-sm font-medium text-base-content/80">
                    {done ? "Done today ✓" : "Mark as done today"}
                  </p>
                  <p className="text-xs text-base-content/35">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-400">
                <Flame size={15} />
                <span>{currentHabit.streak}d</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="fade-up flex gap-3" style={{ animationDelay: "0.1s" }}>
              <StatCard label="Current streak" value={`${currentHabit.streak}d`} sub="consecutive days" />
              <StatCard label="Total done"     value={totalDone}           sub="all time"        />
              <StatCard label="Last 30 days"   value={`${completionPct}%`} sub="completion rate" />
            </div>

            {/* Heatmap */}
            <div className="fade-up bg-base-100 border border-base-300 rounded-2xl px-5 py-5" style={{ animationDelay: "0.14s" }}>
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={15} className="text-base-content/40" />
                <p className="text-xs uppercase tracking-widest text-base-content/40 font-medium">Last 35 days</p>
              </div>
              <HeatmapGrid calendar={currentHabit.calendar ?? {}} />
              <div className="flex items-center gap-1.5 mt-3 justify-end">
                <span className="text-xs text-base-content/30">Less</span>
                <div className="w-3 h-3 rounded-sm bg-base-300/60" />
                <div className="w-3 h-3 rounded-sm bg-primary/40" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-xs text-base-content/30">More</span>
              </div>
            </div>

            {/* Insight */}
            <div className="fade-up bg-base-100 border border-base-300 rounded-2xl px-5 py-4 flex items-center gap-3" style={{ animationDelay: "0.18s" }}>
              <TrendingUp size={16} className="text-primary shrink-0" />
              <p className="text-sm text-base-content/60">
                {completionPct >= 80
                  ? `You're crushing it — ${completionPct}% this month. Keep going.`
                  : completionPct >= 50
                    ? `Solid ${completionPct}% completion this month. Push for 80%.`
                    : `${completionPct}% this month. Every day counts — log today.`
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
