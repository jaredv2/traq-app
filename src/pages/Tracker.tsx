// TrackerDetail.tsx — /tracker/:id
// GitHub-style calendar + check-in bottom sheet/modal with note + Groq AI motivation
// Stack: React + DaisyUI silk + Tailwind + Lucide React + Firebase + Groq API

import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Flame, Loader2, TrendingUp, Zap,
  X, Sparkles, CheckCircle2,
} from "lucide-react";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useTracker } from "../hooks/useTracker";
import { useHabits } from "../hooks/useHabits";
import { useUserProfile, type AiPersonality } from "../hooks/useUserProfile";
import { getCheckInMap, getFrequencyLabel, todayISO } from "../lib";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lastNDays = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── GitHub-style calendar (52 weeks) ────────────────────────────────────────

function GithubCalendar({ completedDates, color = "#22c55e" }: { completedDates: Set<string>; color?: string }) {
  const WEEKS = 9;
  const today = new Date();

  // Build 7-row × WEEKS-col grid
  const grid: { iso: string; level: number }[][] = Array.from({ length: 7 }, (_, dayOfWeek) => {
    return Array.from({ length: WEEKS }, (_, weekIdx) => {
      const d = new Date(today);
      // offset: end of grid = today's column, align by day of week
      const daysFromEnd = (WEEKS - 1 - weekIdx) * 7 + ((today.getDay() - dayOfWeek + 7) % 7);
      d.setDate(d.getDate() - daysFromEnd);
      const iso = d.toISOString().slice(0, 10);
      const done = completedDates.has(iso);
      return { iso, level: done ? 4 : 0 };
    });
  });

  // Month labels: scan top row for month boundaries
  const monthLabels: { label: string; col: number }[] = [];
  grid[0].forEach((cell, w) => {
    const d = new Date(cell.iso);
    if (d.getDate() <= 7) {
      monthLabels.push({ label: MONTHS[d.getMonth()], col: w });
    }
  });

  const alpha = ["0.08","0.3","0.55","0.75","1"];

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: 340 }}>
        {/* Month labels */}
        <div className="flex pl-8 mb-1">
          {grid[0].map((_, w) => {
            const lbl = monthLabels.find((m) => m.col === w);
            return (
              <div key={w} className="flex-1 text-[9px] text-base-content/35 font-medium">
                {lbl ? lbl.label : ""}
              </div>
            );
          })}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-[3px]">
          {grid.map((row, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-[3px]">
              <div className="w-7 text-[9px] text-base-content/35 font-medium shrink-0 text-right pr-1.5">
                {[1, 3, 5].includes(dayIdx) ? WEEKDAYS_SHORT[dayIdx].slice(0, 3) : ""}
              </div>
              {row.map((cell, w) => {
                  return (
                    <div
                      key={w}
                      title={cell.iso}
                    className="flex-1 rounded-[2px] transition-colors"
                    style={{
                      aspectRatio: "1",
                      backgroundColor: cell.level === 0
                        ? `${color}18`
                        : `${color}${Math.round(Number(alpha[cell.level]) * 255).toString(16).padStart(2, "0")}`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-[9px] text-base-content/30">Activity over the last 2 months</p>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-base-content/30">Less</span>
            {[0,1,2,3,4].map((l) => (
              <div
                key={l}
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{
                  backgroundColor: l === 0
                    ? `${color}18`
                    : `${color}${Math.round(Number(alpha[l]) * 255).toString(16).padStart(2,"0")}`,
                }}
              />
            ))}
            <span className="text-[9px] text-base-content/30">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Groq motivation ─────────────────────────────────────────────────────────

const PERSONALITY_PROMPTS: Record<AiPersonality, string> = {
  coach: "Direct, demanding, accountability-first. Push hard and don't soften the message.",
  friend: "Warm, encouraging, supportive. Celebrate progress without sounding fake.",
  stoic: "Minimal, rational, calm. Focus on discipline, clarity, and action.",
  zen: "Grounded, patient, calm. Treat consistency as a practice, not a race.",
};

async function fetchMotivation(
  habitName: string,
  streak: number,
  note: string,
  personality: AiPersonality = "coach",
): Promise<string> {
  // Groq uses OpenAI-compatible API
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 80,
      messages: [
        {
          role: "system",
          content: `You are a concise habit coach. Personality: ${PERSONALITY_PROMPTS[personality]} Give ONE short motivating sentence (max 20 words). No emojis, no fluff. Direct and real.`,
        },
        {
          role: "user",
          content: `Habit: "${habitName}". Current streak: ${streak} days.${note ? ` Note: "${note}".` : ""} Give one motivating sentence.`,
        },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "Keep going — consistency compounds.";
}

// ─── Check-in bottom sheet / modal ────────────────────────────────────────────

function CheckInSheet({
  open,
  onClose,
  onSubmit,
  habitName,
  streak,
  doneToday,
  trackerColor,
  personality,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  habitName: string;
  streak: number;
  doneToday: boolean;
  trackerColor: string;
  personality: AiPersonality;
}) {
  const [note, setNote]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const textRef  = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textRef.current?.focus(), 120);
      setNote("");
      setMotivation(null);
    }
  }, [open]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const getMotivation = async () => {
    setLoadingQuote(true);
    try {
      const msg = await fetchMotivation(habitName, streak, note, personality);
      setMotivation(msg);
    } catch {
      setMotivation("Keep going — consistency compounds.");
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(note);
      if (!motivation) await getMotivation();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      {/* Sheet — bottom sheet on mobile, centered modal on sm+ */}
      <div
        ref={sheetRef}
        className={`
          fixed z-50 bg-base-100 transition-all duration-300 ease-out checkin-sheet
          bottom-0 left-0 right-0 rounded-t-2xl border-t border-base-200
          sm:left-1/2 sm:rounded-2xl sm:border sm:w-full sm:max-w-md sm:shadow-2xl
          sm:bottom-auto sm:top-1/2
        `}
        style={{
          transform: open ? "translateY(0)" : "translateY(110%)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* On sm+, override transform to center */}
        <style>{`
          @media (min-width: 640px) {
            .checkin-sheet {
              transform: ${open ? "translate(-50%, -50%) !important" : "translate(-50%, -45%) !important"};
            }
          }
        `}</style>
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-base-300" />
        </div>

        <div className="px-5 py-4 sm:py-5 flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-base-content/35 font-medium mb-0.5">
                {doneToday ? "Undo check-in" : "Check in"}
              </p>
              <h3 className="text-base font-semibold text-base-content" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {habitName}
              </h3>
              <p className="text-xs text-base-content/40 mt-0.5">{today}</p>
            </div>
            <button onClick={handleClose} className="text-base-content/30 hover:text-base-content transition-colors mt-0.5">
              <X size={16} />
            </button>
          </div>

          {/* Streak badge */}
          {!doneToday && (
            <div
              className="flex items-center gap-2 px-3 py-2 border rounded-xl"
              style={{ borderColor: `${trackerColor}40`, backgroundColor: `${trackerColor}0a` }}
            >
              <Flame size={13} style={{ color: trackerColor }} />
              <p className="text-xs font-medium" style={{ color: trackerColor }}>
                {streak > 0 ? `${streak}-day streak — don't break it` : "Start your streak today"}
              </p>
            </div>
          )}

          {/* Note input */}
          {!doneToday && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-base-content/35 font-medium">
                Note <span className="text-base-content/25 normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                ref={textRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How did it go? Any thoughts…"
                className="textarea textarea-bordered rounded-xl resize-none h-20 text-sm focus:textarea-primary w-full"
                maxLength={280}
              />
            </div>
          )}

          {/* AI motivation */}
          {motivation && (
            <div className="flex items-start gap-2 px-3 py-2.5 border border-base-200 bg-base-200/50 rounded-xl">
              <Sparkles size={12} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-base-content/65 italic leading-relaxed">{motivation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {!doneToday ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 rounded-xl"
                  style={{ backgroundColor: trackerColor }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {saving ? "Logging…" : "Log today ✓"}
                </button>
                {!motivation && !saving && (
                  <button
                    onClick={getMotivation}
                    disabled={loadingQuote}
                    className="w-full py-2 text-xs font-medium text-base-content/45 hover:text-base-content border border-base-200 transition-colors flex items-center justify-center gap-1.5 rounded-xl"
                  >
                    {loadingQuote ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                    {loadingQuote ? "Getting motivation…" : "Get AI motivation"}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-3 text-sm font-semibold text-error border border-error/30 hover:bg-error/5 transition-colors flex items-center justify-center gap-2 rounded-xl"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                {saving ? "Removing…" : "Undo today's check-in"}
              </button>
            )}
          </div>

          {/* Safe area spacer for mobile */}
          <div className="h-safe-area-inset-bottom sm:hidden" style={{ height: "env(safe-area-inset-bottom)" }} />
        </div>
      </div>
    </>
  );
}

// ─── Stat item (flat, no card) ────────────────────────────────────────────────

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center py-3.5 border-r last:border-r-0 border-base-200">
      <p className="text-[10px] uppercase tracking-widest text-base-content/35 font-medium mb-0.5">{label}</p>
      <p className="text-xl font-semibold text-base-content">{value}</p>
      {sub && <p className="text-[10px] text-base-content/30 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TrackerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const { tracker, checkIns, loading, error } = useTracker(id);
  const { toggleHabit } = useHabits();
  const { profile } = useUserProfile();

  const checkInMap     = useMemo(() => getCheckInMap(checkIns), [checkIns]);
  const completedDates = useMemo(() => new Set(Object.keys(checkInMap)), [checkInMap]);
  const doneToday      = completedDates.has(todayISO());
  const totalDone      = completedDates.size;

  const completionPct = useMemo(() => {
    const days = lastNDays(30);
    return Math.round((days.filter((d) => completedDates.has(d)).length / 30) * 100);
  }, [completedDates]);

  const handleDelete = async () => {
    if (!tracker || deleting) return;
    if (!confirm(`Delete "${tracker.name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      const snap = await getDocs(collection(db, "trackers", tracker.id, "checkIns"));
      snap.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, "trackers", tracker.id));
      await batch.commit();
      navigate("/home", { replace: true });
    } finally {
      setDeleting(false);
    }
  };

  const handleCheckIn = async (note: string) => {
    if (!id) return;
    await toggleHabit(id, note);
    setSheetOpen(false);
  };

  const trackerColor = tracker?.color ?? "#22c55e";

  return (
    <div
      className="min-h-screen bg-base-200 text-base-content"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      data-theme="silk"
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-base-100 border-b border-base-200 h-12 px-4 sm:px-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-base-content/45 hover:text-base-content transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        {tracker && (
          <button
            onClick={() => { if (!confirm(`Delete "${tracker.name}"? This can't be undone.`)) return; handleDelete(); }}
            disabled={deleting}
            className="text-[10px] text-error/50 hover:text-error transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </header>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-lg flex flex-col gap-4">

        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-base-content/30">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-error">{error.message}</p>
        )}

        {tracker && !loading && (
          <>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="fade-up bg-base-100 border border-base-200 rounded-2xl px-5 py-4 flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center text-2xl shrink-0"
                style={{ color: trackerColor }}
              >
                {tracker.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-base-content truncate" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {tracker.name}
                </h1>
                <p className="text-xs text-base-content/40">{getFrequencyLabel(tracker.frequency)}</p>
              </div>
              <div
                className="text-xs font-semibold px-2 py-1 flex items-center gap-1"
                style={{ color: trackerColor, backgroundColor: `${trackerColor}12` }}
              >
                <Flame size={11} />
                {tracker.currentStreak}d
              </div>
            </div>

            {/* ── BIG CTA ────────────────────────────────────────────────────── */}
            <div className="fade-up" style={{ animationDelay: "0.05s" }}>
              <button
                onClick={() => setSheetOpen(true)}
                className={`
                  w-full py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 rounded-2xl
                  ${doneToday
                    ? "border-2 text-base-content/50 border-base-200 bg-base-100 hover:border-base-300"
                    : "text-white"
                  }
                `}
                style={!doneToday ? { backgroundColor: trackerColor } : {}}
              >
                {doneToday
                  ? <><CheckCircle2 size={16} className="text-primary" /> Done today · tap to undo</>
                  : <><CheckCircle2 size={16} /> Log today</>
                }
              </button>
            </div>

            {/* ── Stats row ──────────────────────────────────────────────────── */}
            <div className="fade-up bg-base-100 border border-base-200 rounded-2xl overflow-hidden flex divide-x divide-base-200" style={{ animationDelay: "0.08s" }}>
              <StatRow label="Streak"     value={`${tracker.currentStreak}d`} sub="current" />
              <StatRow label="Best"       value={`${tracker.longestStreak}d`} sub="all time" />
              <StatRow label="Total"      value={totalDone}                   sub="check-ins" />
              <StatRow label="This month" value={`${completionPct}%`}         sub="completion" />
            </div>

            {/* ── GitHub calendar ────────────────────────────────────────────── */}
            <div className="fade-up bg-base-100 border border-base-200 rounded-2xl px-4 pt-4 pb-3" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trackerColor }} />
                <p className="text-[10px] uppercase tracking-widest text-base-content/35 font-medium">
                  Activity · {completedDates.size} total check-ins
                </p>
              </div>
              <GithubCalendar completedDates={completedDates} color={trackerColor} />
            </div>

            {/* ── Insight ────────────────────────────────────────────────────── */}
            <div className="fade-up flex items-start gap-2.5 px-4 py-3 bg-base-100 border border-base-200 rounded-2xl" style={{ animationDelay: "0.12s" }}>
              <TrendingUp size={13} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-base-content/55 leading-relaxed">
                {completionPct >= 80
                  ? `${completionPct}% this month — you're in the top tier of consistency.`
                  : completionPct >= 50
                    ? `${completionPct}% this month. Tighten the gaps and push for 80%.`
                    : `${completionPct}% this month. Every check-in counts — log today.`
                }
              </p>
            </div>
          </>
        )}
        </div>
      </div>

      {/* ── Check-in sheet — always mounted so open state is never lost ── */}
      <CheckInSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleCheckIn}
        habitName={tracker?.name ?? ""}
        streak={tracker?.currentStreak ?? 0}
        doneToday={doneToday}
        trackerColor={trackerColor}
        personality={profile?.aiPersonality ?? "coach"}
      />
    </div>
  );
}
