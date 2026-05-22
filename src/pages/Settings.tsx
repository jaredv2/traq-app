// Settings.tsx — /settings
// Sections: Profile, AI Personality, Default Frequency, Subscription, Data Export, Logout
// Stack: React + DaisyUI silk + Tailwind + Lucide React + Firebase

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Sparkles, CreditCard, Download,
  LogOut, Calendar, ChevronRight, Check,
  Loader2, Plus, Minus, AlertTriangle,
  FileJson, FileText, ArrowLeft,
} from "lucide-react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useHabits } from "../hooks/useHabits";
import { useUserProfile, type AiPersonality } from "../hooks/useUserProfile";
import type { TrackerFrequency, FrequencyPeriod, FrequencyMode } from "../lib/index";
import { getFrequencyLabel } from "../lib/index";

// ─── Types ────────────────────────────────────────────────────────────────────

const AI_PERSONALITIES = [
  {
    id: "coach" as const,
    icon: "💪",
    label: "The Coach",
    desc: "Pushes hard. Direct, no excuses. Built for people who want to be held accountable.",
  },
  {
    id: "friend" as const,
    icon: "🤝",
    label: "The Friend",
    desc: "Warm, encouraging, always in your corner. Celebrates small wins without judgment.",
  },
  {
    id: "stoic" as const,
    icon: "🪨",
    label: "The Stoic",
    desc: "Minimal. Logical. Cuts through noise. Focuses on what matters, nothing else.",
  },
  {
    id: "zen" as const,
    icon: "🧘",
    label: "The Zen",
    desc: "Calm, grounding, patient. Treats habit-building as a practice, not a race.",
  },
];

const PLANS = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 5 habits", "Basic analytics", "7-day history"],
    current: true,
  },
  {
    id: "pro",
    label: "Pro",
    price: "$5",
    period: "/ month",
    features: ["Unlimited habits", "Full analytics", "AI motivation", "Data export", "Priority support"],
    current: false,
  },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS: FrequencyPeriod[] = ["day", "week", "month", "year"];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
  index = 0,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <div
      className="fade-up bg-base-100 border border-base-200 rounded-2xl overflow-hidden"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-base-200">
        <Icon size={13} className="text-base-content/40 shrink-0" strokeWidth={1.8} />
        <h2 className="text-xs font-semibold text-base-content uppercase tracking-widest">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-3 border-b border-base-200 last:border-b-0">
      <label className="text-xs text-base-content/40 uppercase tracking-widest font-medium w-28 shrink-0 pt-0.5">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({
  user,
  profile,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useUserProfile>["profile"];
}) {
  const [name, setName] = useState(profile?.name ?? user?.displayName ?? "");
  const [bio, setBio]   = useState(profile?.bio ?? "");
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? user?.displayName ?? "");
    setBio(profile?.bio ?? "");
  }, [profile?.bio, profile?.name, user?.displayName]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        bio: bio.trim(),
        updatedAt: Timestamp.now(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Avatar row */}
      <div className="flex items-center gap-4 pb-4 mb-2 border-b border-base-200">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <span className="text-lg font-bold text-primary">{user?.displayName?.[0] ?? "?"}</span>
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-base-content">{user?.displayName ?? "—"}</p>
          <p className="text-xs text-base-content/40">{user?.email}</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] uppercase tracking-widest text-base-content/30 border border-base-300 px-2 py-1 rounded-full">
            Google
          </span>
        </div>
      </div>

      <FieldRow label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-8 px-3 text-sm bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary/40 text-base-content"
          placeholder="Your name"
          maxLength={40}
        />
      </FieldRow>

      <FieldRow label="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:border-primary/40 text-base-content resize-none h-16"
          placeholder="A short bio… (optional)"
          maxLength={120}
        />
        <p className="text-[10px] text-base-content/25 mt-1">{bio.length}/120</p>
      </FieldRow>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-content text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 rounded-lg"
        >
          {saving
            ? <Loader2 size={11} className="animate-spin" />
            : saved
              ? <Check size={11} />
              : null
          }
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── AI Personality section ───────────────────────────────────────────────────

function AiPersonalitySection({
  user,
  initialPersonality,
}: {
  user: ReturnType<typeof useAuth>["user"];
  initialPersonality: AiPersonality;
}) {
  const [selected, setSelected] = useState<typeof AI_PERSONALITIES[0]["id"]>(initialPersonality);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(initialPersonality);
  }, [initialPersonality]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        aiPersonality: selected,
        updatedAt: Timestamp.now(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-base-content/45 leading-relaxed">
        Choose how your AI motivation feels. This affects the tone of check-in encouragements and habit tips.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {AI_PERSONALITIES.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`
                text-left flex items-start gap-3 px-4 py-3.5 border rounded-xl transition-all duration-150
                ${active
                  ? "border-primary/40 bg-primary/5"
                  : "border-base-200 hover:border-base-300 bg-base-100"
                }
              `}
            >
              <span className="text-xl shrink-0 mt-0.5">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-base-content">{p.label}</p>
                  {active && <Check size={11} className="text-primary shrink-0" />}
                </div>
                <p className="text-[10px] text-base-content/45 leading-relaxed mt-0.5">{p.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-content text-xs font-semibold hover:opacity-90 transition-opacity rounded-lg disabled:opacity-50"
        >
          {saving ? <Check size={11} className="animate-pulse" /> : saved ? <Check size={11} /> : <Sparkles size={11} />}
          {saving ? "Saving..." : saved ? "Saved" : "Apply personality"}
        </button>
      </div>
    </div>
  );
}

// ─── Default frequency section ────────────────────────────────────────────────

function DefaultFrequencySection() {
  const [freq, setFreq] = useState<TrackerFrequency>({
    period: "day",
    times: 1,
    specificDays: [],
    mode: "specific",
  });
  const [saved, setSaved] = useState(false);

  const upd = (p: Partial<TrackerFrequency>) => setFreq((f) => ({ ...f, ...p }));

  const toggleDay = (d: number) => {
    const days = freq.specificDays.includes(d)
      ? freq.specificDays.filter((x) => x !== d)
      : [...freq.specificDays, d].sort();
    upd({ specificDays: days });
  };

  const handleSave = () => {
    // TODO: persist to user prefs in Firestore
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-0">
      <FieldRow label="Period">
        <div className="flex border border-base-300 overflow-hidden w-fit rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => upd({ period: p })}
              className={`px-3 py-1.5 text-xs font-medium border-r last:border-r-0 border-base-300 transition-all ${
                freq.period === p ? "bg-primary text-white" : "text-base-content/50 hover:bg-base-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="Times">
        <div className="flex items-center gap-2">
          <button
            onClick={() => upd({ times: Math.max(1, freq.times - 1) })}
            className="w-7 h-7 border border-base-300 rounded-lg flex items-center justify-center text-base-content/50 hover:text-base-content hover:border-base-content/30 transition-all"
          >
            <Minus size={11} />
          </button>
          <span className="text-sm font-semibold text-base-content w-5 text-center">{freq.times}</span>
          <button
            onClick={() => upd({ times: freq.times + 1 })}
            className="w-7 h-7 border border-base-300 rounded-lg flex items-center justify-center text-base-content/50 hover:text-base-content hover:border-base-content/30 transition-all"
          >
            <Plus size={11} />
          </button>
          <span className="text-xs text-base-content/40 ml-1">per {freq.period}</span>
        </div>
      </FieldRow>

      <FieldRow label="Mode">
        <div className="flex border border-base-300 overflow-hidden w-fit rounded-xl">
          {(["specific", "random"] as FrequencyMode[]).map((m) => (
            <button
              key={m}
              onClick={() => upd({ mode: m })}
              className={`px-3 py-1.5 text-xs font-medium border-r last:border-r-0 border-base-300 transition-all ${
                freq.mode === m ? "bg-primary text-white" : "text-base-content/50 hover:bg-base-200"
              }`}
            >
              {m === "specific" ? "Specific days" : "Flexible"}
            </button>
          ))}
        </div>
      </FieldRow>

      {freq.mode === "specific" && (
        <FieldRow label="Days">
          <div className="flex gap-1">
            {WEEKDAYS.map((day, i) => {
              const sel = freq.specificDays.includes(i);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className={`w-8 h-8 text-xs font-medium border rounded-lg transition-all ${
                    sel
                      ? "bg-primary text-white border-primary"
                      : "border-base-300 text-base-content/50 hover:border-base-content/30"
                  }`}
                >
                  {day[0]}
                </button>
              );
            })}
          </div>
        </FieldRow>
      )}

      <div className="pt-4 flex items-center justify-between">
        <p className="text-xs text-base-content/35">
          Default: <span className="text-base-content/60 font-medium">{getFrequencyLabel(freq)}</span>
        </p>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-content text-xs font-semibold hover:opacity-90 transition-opacity rounded-lg"
        >
          {saved ? <Check size={11} /> : <Calendar size={11} />}
          {saved ? "Saved" : "Save default"}
        </button>
      </div>
    </div>
  );
}

// ─── Subscription section ─────────────────────────────────────────────────────

function SubscriptionSection() {
  const currentPlan = "free";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-2">
        {PLANS.map((plan) => {
          const active = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`border p-4 flex flex-col gap-3 rounded-2xl ${
                active ? "border-primary/30 bg-primary/4" : "border-base-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-base-content uppercase tracking-widest">{plan.label}</p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-2xl font-semibold text-base-content" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      {plan.price}
                    </span>
                    <span className="text-xs text-base-content/35 mb-0.5">{plan.period}</span>
                  </div>
                </div>
                {active && (
                  <span className="text-[9px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 font-medium rounded-full">
                    Current
                  </span>
                )}
              </div>

              <ul className="flex flex-col gap-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-base-content/55">
                    <Check size={10} className="text-primary shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              {!active && (
                <button className="w-full h-8 bg-primary text-primary-content text-xs font-semibold hover:opacity-90 transition-opacity mt-auto rounded-lg">
                  Upgrade to Pro
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-base-content/25 text-center">
        Billing managed securely via Stripe. Cancel anytime.
      </p>
    </div>
  );
}

// ─── Data export section ──────────────────────────────────────────────────────

function DataExportSection() {
  const { habits, checkInsMap } = useHabits();
  const [exporting, setExporting] = useState<"csv" | "json" | null>(null);

  const buildData = () =>
    habits.map((h) => {
      const ci = checkInsMap?.[h.id] ?? {};
      return {
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        frequency: h.frequency,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        checkIns: Object.keys(ci).sort(),
        totalCheckIns: Object.keys(ci).length,
      };
    });

  const exportJSON = async () => {
    setExporting("json");
    await new Promise((r) => setTimeout(r, 400));
    const data = buildData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traq-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
  };

  const exportCSV = async () => {
    setExporting("csv");
    await new Promise((r) => setTimeout(r, 400));
    const data = buildData();
    const headers = ["id", "name", "icon", "color", "currentStreak", "longestStreak", "totalCheckIns", "checkInDates"];
    const rows = data.map((h) => [
      h.id,
      `"${h.name.replace(/"/g, '""')}"`,
      h.icon,
      h.color,
      h.currentStreak,
      h.longestStreak,
      h.totalCheckIns,
      `"${h.checkIns.join(", ")}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traq-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-base-content/45 leading-relaxed">
        Download all your habit data. Includes check-in history, streaks, and settings.
      </p>

      <div className="grid sm:grid-cols-2 gap-2">
        <button
          onClick={exportJSON}
          disabled={!!exporting}
          className="flex items-center gap-3 px-4 py-3.5 border border-base-200 hover:border-base-300 bg-base-100 transition-all group text-left disabled:opacity-50 rounded-xl"
        >
          <div className="w-8 h-8 bg-base-200 group-hover:bg-primary/10 flex items-center justify-center transition-colors shrink-0 rounded-lg">
            <FileJson size={15} className="text-base-content/40 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-xs font-semibold text-base-content">Export JSON</p>
            <p className="text-[10px] text-base-content/35">Full data, developer-friendly</p>
          </div>
          <div className="ml-auto">
            {exporting === "json"
              ? <Loader2 size={13} className="animate-spin text-base-content/30" />
              : <Download size={13} className="text-base-content/25 group-hover:text-primary transition-colors" />
            }
          </div>
        </button>

        <button
          onClick={exportCSV}
          disabled={!!exporting}
          className="flex items-center gap-3 px-4 py-3.5 border border-base-200 hover:border-base-300 bg-base-100 transition-all group text-left disabled:opacity-50 rounded-xl"
        >
          <div className="w-8 h-8 bg-base-200 group-hover:bg-primary/10 flex items-center justify-center transition-colors shrink-0 rounded-lg">
            <FileText size={15} className="text-base-content/40 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-xs font-semibold text-base-content">Export CSV</p>
            <p className="text-[10px] text-base-content/35">Spreadsheet-ready</p>
          </div>
          <div className="ml-auto">
            {exporting === "csv"
              ? <Loader2 size={13} className="animate-spin text-base-content/30" />
              : <Download size={13} className="text-base-content/25 group-hover:text-primary transition-colors" />
            }
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 bg-base-200 border border-base-200 rounded-xl">
        <AlertTriangle size={11} className="text-base-content/30 shrink-0" />
        <p className="text-[10px] text-base-content/35">
          {habits.length} tracker{habits.length !== 1 ? "s" : ""} will be included in the export.
        </p>
      </div>
    </div>
  );
}

// ─── Settings page ────────────────────────────────────────────────────────────

export default function Settings() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

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
          <span className="text-xs font-semibold text-base-content uppercase tracking-widest">Settings</span>
        </div>
        <p className="text-[10px] text-base-content/30 hidden sm:block">{today}</p>
      </header>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3">

        <Section icon={User}       title="Profile"           index={0}>
          <ProfileSection user={user} profile={profile} />
        </Section>

        <Section icon={Sparkles}   title="AI Personality"    index={1}>
          <AiPersonalitySection user={user} initialPersonality={profile?.aiPersonality ?? "coach"} />
        </Section>

        <Section icon={Calendar}   title="Default Frequency" index={2}>
          <DefaultFrequencySection />
        </Section>

        <Section icon={CreditCard} title="Subscription"      index={3}>
          <SubscriptionSection />
        </Section>

        <Section icon={Download}   title="Data Export"       index={4}>
          <DataExportSection />
        </Section>

        {/* ── Logout ───────────────────────────────────────────────────────── */}
        <div className="fade-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 bg-base-100 border border-base-200 hover:border-error/20 hover:bg-error/5 transition-all group rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <LogOut size={13} className="text-base-content/30 group-hover:text-error transition-colors" strokeWidth={1.8} />
              <div className="text-left">
                <p className="text-xs font-semibold text-base-content/60 group-hover:text-error transition-colors">
                  Log out
                </p>
                <p className="text-[10px] text-base-content/30">{user?.email}</p>
              </div>
            </div>
            <ChevronRight size={13} className="text-base-content/20 group-hover:text-error/40 transition-colors" />
          </button>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <p className="text-center text-[9px] text-base-content/20 uppercase tracking-widest pb-4 fade-up" style={{ animationDelay: "0.34s" }}>
          traq · v1.0.0 · Built with ♥
        </p>

      </div>
    </div>
  );
}
