// CreateTracker.tsx — /create
// Flat design + GitHub-style calendar preview
// Stack: React + DaisyUI silk + Tailwind + Lucide React + Anthropic API

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, X, ArrowLeft, Eye, Pencil, Check,
  BarChart2, Target, Calendar, Loader2, Zap,
  Plus, Minus, ChevronRight,
} from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile, type AiPersonality } from "../hooks/useUserProfile";
import { TrackerModel, type TrackerFrequency, type FrequencyPeriod, type FrequencyMode } from "../lib/index";
import { getFrequencyLabel } from "../lib/index";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = ["🏃","📚","🧘","💧","🥗","💪","🎨","✍️","🎸","🌿","🛌","🧹","💊","🧠","🏊","🚴","📝","🎯","⚡","🌅"];

const COLOR_OPTIONS = [
  { name: "Coral",   value: "#ef4444" },
  { name: "Amber",   value: "#f59e0b" },
  { name: "Emerald", value: "#22c55e" },
  { name: "Sky",     value: "#0ea5e9" },
  { name: "Violet",  value: "#8b5cf6" },
  { name: "Rose",    value: "#f43f5e" },
  { name: "Teal",    value: "#14b8a6" },
  { name: "Slate",   value: "#64748b" },
];

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const PERIODS: FrequencyPeriod[] = ["day","week","month","year"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  icon: string;
  color: string;
  unit: string;
  goal: string;
  frequency: TrackerFrequency;
}

const DEFAULT_FORM: FormState = {
  name: "",
  icon: "🎯",
  color: "#22c55e",
  unit: "times",
  goal: "",
  frequency: { period: "day", times: 1, specificDays: [], mode: "specific" },
};

type Tab = "basics" | "frequency" | "goal";

const TABS: { id: Tab; label: string; Icon: typeof Zap }[] = [
  { id: "basics",    label: "Basics",   Icon: Zap },
  { id: "frequency", label: "Schedule", Icon: Calendar },
  { id: "goal",      label: "Goal",     Icon: Target },
];

// ─── GitHub-style calendar ────────────────────────────────────────────────────
// 52 weeks × 7 days, rows = Mon/Wed/Fri (matching screenshot style)
// We seed fake data around the specificDays selection to demo the pattern

function GithubCalendar({ color, frequency }: { color: string; frequency: TrackerFrequency }) {
  // Build 52-week grid: each column is a week, each row is a day (0=Sun…6=Sat)
  const WEEKS = 9;
  const today = new Date();

  // Which days of week to show as rows (use specificDays or all 7)
  const activeDays = frequency.mode === "specific" && frequency.specificDays.length > 0
    ? frequency.specificDays
    : [1, 3, 5];

  // Build cells: week columns × active day rows
  // Seed mock completion pattern: ~60% chance on active days
  const seed = (week: number, day: number) => ((week * 7 + day) * 2654435761) >>> 0;

  const cells: { week: number; day: number; level: number; iso: string }[][] = [];
  for (let day = 0; day < 7; day++) {
    const row: { week: number; day: number; level: number; iso: string }[] = [];
    for (let w = 0; w < WEEKS; w++) {
      const d = new Date(today);
      const diff = (WEEKS - 1 - w) * 7 + ((today.getDay() - day + 7) % 7);
      d.setDate(d.getDate() - diff);
      const iso = d.toISOString().slice(0, 10);
      const r = seed(w, day) % 100;
      const weight = (w / WEEKS);
      const isActiveDay = activeDays.includes(day);
      const level = !isActiveDay
        ? 0
        : r < 20 * weight ? 0 : r < 50 * weight ? 1 : r < 75 ? 2 : r < 90 ? 3 : 4;
      row.push({ week: w, day, level, iso });
    }
    cells.push(row);
  }

  // Month labels: find first week of each month
  const monthLabels: { label: string; col: number }[] = [];
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (WEEKS - 1 - w) * 7);
    if (d.getDate() <= 7) {
      monthLabels.push({ label: MONTHS[d.getMonth()], col: w });
    }
  }

  // Opacity levels for the color
  const levelAlpha = ["0.08", "0.25", "0.5", "0.75", "1"];

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: "380px" }}>
        {/* Month labels */}
        <div className="flex mb-1.5 pl-8">
          {Array.from({ length: WEEKS }, (_, w) => {
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
          {cells.map((row, ri) => {
            const dayLabel = WEEKDAYS[ri];
            return (
              <div key={ri} className="flex items-center gap-[3px]">
                {/* Day label */}
                <div className="w-7 text-[9px] text-base-content/35 font-medium shrink-0 text-right pr-1.5">
                  {[1, 3, 5].includes(ri) ? dayLabel : ""}
                </div>
                {/* Cells */}
                {row.map((cell) => (
                  <div
                    key={cell.week}
                    className="flex-1 rounded-[2px] transition-all"
                    style={{
                      aspectRatio: "1",
                      backgroundColor: cell.level === 0
                        ? "oklch(var(--b3, #e5e7eb))"
                        : `${color}${Math.round(Number(levelAlpha[cell.level]) * 255).toString(16).padStart(2,"0")}`,
                    }}
                    title={cell.iso}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-2">
          <span className="text-[9px] text-base-content/30">Less</span>
          {[0,1,2,3,4].map((l) => (
            <div
              key={l}
              className="w-2.5 h-2.5 rounded-[2px]"
              style={{
                backgroundColor: l === 0
                  ? "oklch(var(--b3, #e5e7eb))"
                  : `${color}${Math.round(Number(levelAlpha[l]) * 255).toString(16).padStart(2,"0")}`,
              }}
            />
          ))}
          <span className="text-[9px] text-base-content/30">More</span>
        </div>
      </div>
    </div>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────────

function PreviewCard({ form }: { form: FormState }) {
  const freqLabel = getFrequencyLabel(form.frequency);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] uppercase tracking-widest text-base-content/35 font-medium">Preview</p>

      {/* Main card */}
      <div className="bg-base-100 border border-base-200 divide-y divide-base-200 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div
            className="w-8 h-8 flex items-center justify-center text-lg shrink-0"
            style={{ color: form.color }}
          >
            {form.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-base-content truncate">
              {form.name || <span className="text-base-content/25 font-normal italic text-xs">Habit name…</span>}
            </p>
            <p className="text-xs text-base-content/40">{freqLabel}</p>
          </div>
          <div
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ color: form.color, backgroundColor: `${form.color}18` }}
          >
            0 streak
          </div>
        </div>

        {/* GitHub calendar */}
        <div className="px-4 py-4">
          <p className="text-[10px] uppercase tracking-widest text-base-content/30 font-medium mb-3">
            Activity · last 2 months
          </p>
          <GithubCalendar color={form.color} frequency={form.frequency} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-base-200">
          {[
            { label: "Current",  value: "0d" },
            { label: "Longest",  value: "0d" },
            { label: form.unit || "unit", value: form.goal || "–" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-3 gap-0.5">
              <p className="text-sm font-semibold text-base-content">{s.value}</p>
              <p className="text-[10px] text-base-content/35 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA mock */}
        <div className="px-4 py-3">
          <button
            className="w-full py-2 text-xs font-semibold rounded text-white transition-opacity"
            style={{ backgroundColor: form.color }}
          >
            Log today ✓
          </button>
        </div>
      </div>

      {/* Schedule summary */}
      <div className="bg-base-100 border border-base-200 px-4 py-3 flex items-center gap-2 rounded-xl">
        <Calendar size={12} className="text-base-content/30 shrink-0" />
        <p className="text-xs text-base-content/55">
          {freqLabel}
          {form.frequency.specificDays.length > 0 && (
            <span className="text-base-content/35">
              {" · "}{form.frequency.specificDays.map((d) => WEEKDAYS[d]).join(", ")}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── AI modal ─────────────────────────────────────────────────────────────────

function AiModal({
  onClose,
  onApply,
  personality,
}: {
  onClose: () => void;
  onApply: (p: Partial<FormState>) => void;
  personality: AiPersonality;
}) {
  const [prompt, setPrompt]  = useState("");
  const [loading, setLoading]= useState(false);
  const [error, setError]    = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    const sys = `You are a habit tracker setup assistant. Personality: ${PERSONALITY_PROMPTS[personality]} Given a user description, return ONLY a JSON object:
{"name":string,"icon":string,"color":string,"unit":string,"goal":string,"frequency":{"period":"day"|"week"|"month"|"year","times":number,"specificDays":number[],"mode":"specific"|"random"}}
Colors: #ef4444 #f59e0b #22c55e #0ea5e9 #8b5cf6 #f43f5e #14b8a6 #64748b. Return ONLY valid JSON.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system: sys,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      onApply(JSON.parse(text.replace(/```json|```/g, "").trim()));
      onClose();
    } catch {
      setError("Couldn't parse response. Try rephrasing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-base-100 border border-base-200 rounded-2xl w-full max-w-md p-5 flex flex-col gap-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-semibold">AI habit setup</span>
          </div>
          <button onClick={onClose} className="text-base-content/30 hover:text-base-content">
            <X size={15} />
          </button>
        </div>

        <textarea
          autoFocus
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
          placeholder="e.g. Run 3x a week on Mon, Wed, Fri for 30 minutes"
          className="textarea textarea-bordered w-full text-sm resize-none h-24 focus:textarea-primary rounded-xl"
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-1.5">
          {["Meditate 10 min every morning","Read 20 pages daily","Gym 4x per week"].map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-[10px] px-2 py-1 border border-base-300 bg-base-200 hover:border-primary/40 text-base-content/50 hover:text-base-content transition-colors rounded-lg"
            >
              {ex}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-base-content/30">⌘ + Enter to generate</p>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="btn btn-primary btn-sm gap-1.5 rounded-lg text-xs"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Basics ──────────────────────────────────────────────────────────────

function TabBasics({ form, set }: { form: FormState; set: (p: Partial<FormState>) => void }) {
  return (
    <div className="flex flex-col divide-y divide-base-200">

      {/* Name */}
      <div className="flex flex-col gap-1.5 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Name</label>
        <input
          type="text"
          maxLength={50}
          placeholder="e.g. Morning run"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          className="input input-bordered rounded-lg focus:input-primary text-sm h-9"
        />
      </div>

      {/* Icon */}
      <div className="flex flex-col gap-2 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Icon</label>
        <div className="flex flex-wrap gap-1">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => set({ icon: e })}
              className={`w-8 h-8 flex items-center justify-center text-base border rounded-lg transition-all ${
                form.icon === e
                  ? "border-primary bg-primary/8"
                  : "border-transparent hover:border-base-300"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => set({ color: c.value })}
              title={c.name}
              className="w-6 h-6 transition-all flex items-center justify-center rounded-full"
              style={{
                backgroundColor: c.value,
                outline: form.color === c.value ? `2px solid ${c.value}` : "none",
                outlineOffset: "2px",
              }}
            >
              {form.color === c.value && <Check size={10} className="text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      {/* Unit */}
      <div className="flex flex-col gap-2 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Unit</label>
        <div className="flex gap-1.5 flex-wrap items-center">
          {["times","minutes","pages","ml","km","reps"].map((u) => (
            <button
              key={u}
              onClick={() => set({ unit: u })}
              className={`text-xs px-2.5 py-1 border rounded-lg transition-all ${
                form.unit === u
                  ? "border-primary text-primary bg-primary/8"
                  : "border-base-300 text-base-content/50 hover:border-base-content/30"
              }`}
            >
              {u}
            </button>
          ))}
          <input
            type="text"
            placeholder="Custom…"
            value={["times","minutes","pages","ml","km","reps"].includes(form.unit) ? "" : form.unit}
            onChange={(e) => set({ unit: e.target.value })}
            className="input input-bordered rounded-lg h-7 text-xs w-20 focus:input-primary"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Frequency ───────────────────────────────────────────────────────────

function TabFrequency({ form, set }: { form: FormState; set: (p: Partial<FormState>) => void }) {
  const freq = form.frequency;
  const upd  = (p: Partial<TrackerFrequency>) => set({ frequency: { ...freq, ...p } });

  const toggleDay = (d: number) => {
    const days = freq.specificDays.includes(d)
      ? freq.specificDays.filter((x) => x !== d)
      : [...freq.specificDays, d].sort();
    upd({ specificDays: days });
  };

  return (
    <div className="flex flex-col divide-y divide-base-200">

      {/* Period */}
      <div className="flex flex-col gap-2 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Period</label>
        <div className="grid grid-cols-4 gap-0 border border-base-300 rounded-xl overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => upd({ period: p })}
              className={`py-1.5 text-xs font-medium transition-all border-r last:border-r-0 border-base-300 ${
                freq.period === p
                  ? "bg-primary text-white"
                  : "text-base-content/50 hover:bg-base-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Times */}
      <div className="flex items-center justify-between py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Times per {freq.period}</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => upd({ times: Math.max(1, freq.times - 1) })}
            className="w-7 h-7 border border-base-300 rounded-lg flex items-center justify-center text-base-content/50 hover:text-base-content hover:border-base-content/30 transition-all"
          >
            <Minus size={12} />
          </button>
          <span className="text-base font-semibold text-base-content w-5 text-center">{freq.times}</span>
          <button
            onClick={() => upd({ times: freq.times + 1 })}
            className="w-7 h-7 border border-base-300 rounded-lg flex items-center justify-center text-base-content/50 hover:text-base-content hover:border-base-content/30 transition-all"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Mode */}
      <div className="flex flex-col gap-2 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Mode</label>
        <div className="grid grid-cols-2 gap-0 border border-base-300 rounded-xl overflow-hidden">
          {(["specific","random"] as FrequencyMode[]).map((m) => (
            <button
              key={m}
              onClick={() => upd({ mode: m })}
              className={`py-1.5 text-xs font-medium transition-all border-r last:border-r-0 border-base-300 ${
                freq.mode === m
                  ? "bg-primary text-white"
                  : "text-base-content/50 hover:bg-base-200"
              }`}
            >
              {m === "specific" ? "Specific days" : "Flexible"}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday picker */}
      {freq.mode === "specific" && (
        <div className="flex flex-col gap-2 py-4">
          <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">Days</label>
          <div className="grid grid-cols-7 gap-0 border border-base-300 rounded-xl overflow-hidden">
            {WEEKDAYS.map((day, i) => {
              const sel = freq.specificDays.includes(i);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className={`py-2 text-xs font-medium transition-all border-r last:border-r-0 border-base-300 ${
                    sel ? "text-white" : "text-base-content/50 hover:bg-base-200"
                  }`}
                  style={sel ? { backgroundColor: form.color } : {}}
                >
                  {day[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="py-4">
        <p className="text-xs text-base-content/40">
          <span className="text-base-content/60 font-medium">Schedule: </span>
          {getFrequencyLabel(freq)}
          {freq.specificDays.length > 0 && ` · ${freq.specificDays.map((d) => WEEKDAYS[d]).join(", ")}`}
        </p>
      </div>
    </div>
  );
}

// ─── Tab: Goal ────────────────────────────────────────────────────────────────

function TabGoal({ form, set }: { form: FormState; set: (p: Partial<FormState>) => void }) {
  return (
    <div className="flex flex-col divide-y divide-base-200">

      <div className="flex flex-col gap-2 py-4">
        <label className="text-[10px] uppercase tracking-widest text-base-content/40 font-medium">
          Daily target <span className="text-base-content/25 normal-case tracking-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="e.g. 30"
            value={form.goal}
            onChange={(e) => set({ goal: e.target.value })}
            className="input input-bordered rounded-lg h-9 text-sm w-28 focus:input-primary"
          />
          <span className="text-xs text-base-content/45">{form.unit || "units"}</span>
        </div>
      </div>

      <div className="py-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 mb-1">
          <BarChart2 size={11} className="text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Tips</span>
        </div>
        {[
          "Start small — a goal you always hit beats one you often miss.",
          "Use goals to track progress over time, not as pass/fail.",
          "You can always raise the bar once consistency is solid.",
        ].map((tip) => (
          <p key={tip} className="text-xs text-base-content/50 flex gap-2">
            <span className="text-primary shrink-0">·</span>{tip}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CreateTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [form, setFormRaw] = useState<FormState>(DEFAULT_FORM);
  const [tab, setTab]           = useState<Tab>("basics");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [aiOpen, setAiOpen]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = useCallback((p: Partial<FormState>) => setFormRaw((f) => ({ ...f, ...p })), []);

  const canSave = form.name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !user) return;
    setSaving(true);
    setSaveError(null);
    try {
      const tracker = TrackerModel.create({
        id: crypto.randomUUID(),
        ownerId: user.uid,
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
        unit: form.unit,
        frequency: form.frequency,
        goal: form.goal ? Number(form.goal) : undefined,
        lastCheckIn: null,
      });
      await addDoc(collection(db, "trackers"), tracker.toFirestore());
      navigate("/home");
    } catch {
      setSaveError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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

      {/* ── TOP BAR ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-base-100 border-b border-base-200 px-4 sm:px-8 h-12 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-base-content/45 hover:text-base-content transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <span className="text-xs font-semibold text-base-content tracking-wide">New habit</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 transition-colors font-medium"
          >
            <Sparkles size={12} />
            <span className="hidden sm:inline">AI fill</span>
          </button>
          <div className="w-px h-4 bg-base-300" />
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 disabled:text-base-content/25 transition-colors"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {/* ── MOBILE VIEW TOGGLE ─────────────────────────────────────────── */}
      <div className="lg:hidden bg-base-100 border-b border-base-200 px-4 h-9 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-base-content/35">
          {mobileView === "edit" ? "Editing" : "Preview"}
        </span>
        <button
          onClick={() => setMobileView((v) => v === "edit" ? "preview" : "edit")}
          className="flex items-center gap-1 text-[10px] font-medium text-base-content/45 hover:text-base-content transition-colors"
        >
          {mobileView === "edit" ? <><Eye size={11} /> Preview</> : <><Pencil size={11} /> Edit</>}
        </button>
      </div>

      {/* ── LAYOUT ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">

          {/* LEFT: setup */}
          <div className={`fade-up ${mobileView === "preview" ? "hidden lg:block" : "block"}`}>
            <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">

              {/* Tab bar */}
              <div className="flex border-b border-base-200">
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-medium transition-all border-b-2 ${
                      tab === id
                        ? "border-primary text-primary"
                        : "border-transparent text-base-content/40 hover:text-base-content hover:bg-base-200"
                    }`}
                  >
                    <Icon size={12} strokeWidth={tab === id ? 2.2 : 1.8} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-5 pb-2" key={tab}>
                {tab === "basics"    && <TabBasics    form={form} set={set} />}
                {tab === "frequency" && <TabFrequency form={form} set={set} />}
                {tab === "goal"      && <TabGoal      form={form} set={set} />}
              </div>

              {/* Footer nav */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-base-200">
                <button
                  onClick={() => {
                    const i = TABS.findIndex((t) => t.id === tab);
                    if (i > 0) setTab(TABS[i - 1].id);
                  }}
                  disabled={tab === TABS[0].id}
                  className="text-xs text-base-content/35 hover:text-base-content disabled:opacity-0 transition-colors flex items-center gap-1"
                >
                  ← Back
                </button>
                {tab !== TABS[TABS.length - 1].id ? (
                  <button
                    onClick={() => {
                      const i = TABS.findIndex((t) => t.id === tab);
                      setTab(TABS[i + 1].id);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-base-content/60 hover:text-base-content transition-colors"
                  >
                    Next <ChevronRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary disabled:text-base-content/25 transition-colors"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {saving ? "Saving…" : "Create habit"}
                  </button>
                )}
              </div>
            </div>
            {saveError && <p className="text-xs text-error mt-2 px-1">{saveError}</p>}
          </div>

          {/* RIGHT: preview */}
          <div className={`fade-up ${mobileView === "edit" ? "hidden lg:block" : "block"}`} style={{ animationDelay: "0.06s" }}>
            <div className="lg:sticky lg:top-[80px]">
              <PreviewCard form={form} />
            </div>
          </div>

        </div>
      </div>

      {aiOpen && (
        <AiModal
          onClose={() => setAiOpen(false)}
          onApply={(p) => { set(p); }}
          personality={profile?.aiPersonality ?? "coach"}
        />
      )}
    </div>
  );
}
const PERSONALITY_PROMPTS: Record<AiPersonality, string> = {
  coach: "Direct, demanding, accountability-first. Push hard and avoid soft framing.",
  friend: "Warm, supportive, encouraging. Keep it positive and approachable.",
  stoic: "Minimal, rational, disciplined. Focus on clarity and consistency.",
  zen: "Calm, patient, grounding. Frame habits as steady practice.",
};
