import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  DEFAULT_FREQUENCY,
  TOTAL_STEPS,
  useOnboardingStore,
  type OnboardingData,
} from "../store/onboardingStore";
import { getFrequencyLabel, type FrequencyPeriod, type TrackerFrequency } from "../lib";

const FOCUS_AREAS = [
  { id: "health", icon: "💪", label: "Health & Fitness" },
  { id: "mind", icon: "🧘", label: "Mindfulness" },
  { id: "learning", icon: "📚", label: "Learning" },
  { id: "productivity", icon: "⚡", label: "Productivity" },
  { id: "sleep", icon: "🌙", label: "Sleep" },
  { id: "nutrition", icon: "🥗", label: "Nutrition" },
  { id: "social", icon: "🤝", label: "Relationships" },
  { id: "creativity", icon: "🎨", label: "Creativity" },
];

const HABIT_SUGGESTIONS: Record<string, string[]> = {
  health: ["Morning run", "10k steps", "Drink 2L water"],
  mind: ["5 min meditation", "Gratitude journal", "Deep breathing"],
  learning: ["Read 20 pages", "Watch a lecture", "Practice a language"],
  productivity: ["Review priorities", "No phone first hour", "Weekly review"],
  sleep: ["In bed by 10pm", "No screens after 9", "Sleep 8 hours"],
  nutrition: ["Eat veggies", "No sugar", "Cook at home"],
  social: ["Text a friend", "Family dinner", "Random act of kindness"],
  creativity: ["Sketch daily", "Write 200 words", "Play an instrument"],
};

const PERIOD_OPTIONS: { id: FrequencyPeriod; label: string }[] = [
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
  { id: "year", label: "Yearly" },
];

const TIMES_OPTIONS = [1, 2, 3];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function FrequencySelector({
  frequency,
  onChange,
}: {
  frequency: TrackerFrequency;
  onChange: (frequency: TrackerFrequency) => void;
}) {
  const setPeriod = (period: FrequencyPeriod) => {
    onChange({
      ...frequency,
      period,
      times: period === "day" ? 1 : frequency.times,
      specificDays: period === "week" ? frequency.specificDays : [],
      mode: period === "week" && frequency.mode === "specific" ? "specific" : "random",
    });
  };

  const setTimes = (times: number) => onChange({ ...frequency, times });

  const setMode = (mode: "specific" | "random") => {
    onChange({
      ...frequency,
      mode,
      specificDays: mode === "specific" ? frequency.specificDays : [],
    });
  };

  const toggleDay = (dayIndex: number) => {
    const nextDays = frequency.specificDays.includes(dayIndex)
      ? frequency.specificDays.filter((day) => day !== dayIndex)
      : [...frequency.specificDays, dayIndex].sort((a, b) => a - b);

    onChange({
      ...frequency,
      mode: "specific",
      specificDays: nextDays,
    });
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-base-300 bg-base-200 p-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-base-content/40 mb-2">Step 1: How often?</p>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPeriod(option.id)}
              className={`btn btn-sm ${frequency.period === option.id ? "btn-primary" : "btn-outline border-base-300"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-base-content/40 mb-2">Step 2: How many times?</p>
        <div className="flex flex-wrap gap-2">
          {TIMES_OPTIONS.map((times) => (
            <button
              key={times}
              type="button"
              onClick={() => setTimes(times)}
              className={`btn btn-sm ${frequency.times === times ? "btn-primary" : "btn-outline border-base-300"}`}
            >
              {times}
            </button>
          ))}
          <label className="input input-sm input-bordered flex items-center gap-2 w-24">
            <span className="text-xs text-base-content/45">custom</span>
            <input
              type="number"
              min={1}
              value={frequency.times}
              onChange={(event) => setTimes(Math.max(1, Number(event.target.value) || 1))}
              className="w-full"
            />
          </label>
        </div>
      </div>

      {frequency.period === "week" && (
        <div>
          <p className="text-xs uppercase tracking-widest text-base-content/40 mb-2">Step 3: Specific days or any day?</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode("random")}
              className={`btn btn-sm ${frequency.mode === "random" ? "btn-primary" : "btn-outline border-base-300"}`}
            >
              Any day
            </button>
            <button
              type="button"
              onClick={() => setMode("specific")}
              className={`btn btn-sm ${frequency.mode === "specific" ? "btn-primary" : "btn-outline border-base-300"}`}
            >
              Choose days
            </button>
          </div>

          {frequency.mode === "specific" && (
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`btn btn-sm ${frequency.specificDays.includes(index) ? "btn-primary" : "btn-outline border-base-300"}`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepName({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">Step 1 of 4</p>
        <h2 className="text-3xl sm:text-4xl font-normal leading-snug" style={{ fontFamily: "'DM Serif Display', serif" }}>
          What should we call you?
        </h2>
        <p className="text-base-content/50 text-sm mt-2">We'll personalise your experience.</p>
      </div>

      <div className="form-control gap-2">
        <input
          type="text"
          placeholder="Your first name"
          className="input input-bordered input-lg w-full focus:input-primary text-base"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          autoFocus
          maxLength={32}
        />
      </div>
    </div>
  );
}

function StepFocus({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  const toggle = (id: string) => {
    const has = data.focusAreas.includes(id);
    setData({
      ...data,
      focusAreas: has
        ? data.focusAreas.filter((focusArea) => focusArea !== id)
        : data.focusAreas.length < 3
          ? [...data.focusAreas, id]
          : data.focusAreas,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">Step 2 of 4</p>
        <h2 className="text-3xl sm:text-4xl font-normal leading-snug" style={{ fontFamily: "'DM Serif Display', serif" }}>
          What do you want to focus on?
        </h2>
        <p className="text-base-content/50 text-sm mt-2">Pick up to 3 areas. You can always add more later.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FOCUS_AREAS.map((area) => {
          const selected = data.focusAreas.includes(area.id);
          const maxed = data.focusAreas.length >= 3 && !selected;
          return (
            <button
              key={area.id}
              onClick={() => toggle(area.id)}
              disabled={maxed}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                selected
                  ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
                  : maxed
                    ? "border-base-300 bg-base-200 text-base-content/30 cursor-not-allowed"
                    : "border-base-300 bg-base-200 hover:border-primary/40 hover:bg-base-100 text-base-content/70"
              }`}
            >
              <span className="text-2xl">{area.icon}</span>
              <span className="text-xs text-center leading-tight">{area.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepHabit({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  const suggestions = data.focusAreas.length > 0
    ? [...new Set(data.focusAreas.flatMap((focusArea) => HABIT_SUGGESTIONS[focusArea] ?? []))].slice(0, 6)
    : Object.values(HABIT_SUGGESTIONS).flat().slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">Step 3 of 4</p>
        <h2 className="text-3xl sm:text-4xl font-normal leading-snug" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Name your first tracker.
        </h2>
        <p className="text-base-content/50 text-sm mt-2">Start with one. Small wins build momentum.</p>
      </div>

      <div className="form-control gap-2">
        <input
          type="text"
          placeholder="e.g. Morning run, Read 20 pages..."
          className="input input-bordered input-lg w-full focus:input-primary text-base"
          value={data.firstHabit}
          onChange={(e) => setData({ ...data, firstHabit: e.target.value })}
          autoFocus
          maxLength={60}
        />
      </div>

      <div>
        <p className="text-xs text-base-content/40 mb-2 uppercase tracking-widest">Quick pick</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setData({ ...data, firstHabit: suggestion })}
              className={`badge badge-lg cursor-pointer border transition-all duration-150 ${
                data.firstHabit === suggestion
                  ? "badge-primary border-primary"
                  : "badge-ghost border-base-300 hover:border-primary/40"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-base-content/40 mb-2 uppercase tracking-widest">Frequency</p>
        <FrequencySelector
          frequency={data.frequency}
          onChange={(frequency) => setData({ ...data, frequency })}
        />
      </div>
    </div>
  );
}

function StepReminder({ data, setData }: { data: OnboardingData; setData: (d: OnboardingData) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">Step 4 of 4</p>
        <h2 className="text-3xl sm:text-4xl font-normal leading-snug" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Set a reminder.
        </h2>
        <p className="text-base-content/50 text-sm mt-2">Reminder timing stays client-side and follows the frequency object.</p>
      </div>

      <label className="flex items-center justify-between p-4 rounded-xl border border-base-300 bg-base-200 cursor-pointer hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-sm font-medium">Enable reminder</p>
            <p className="text-xs text-base-content/45">We'll schedule it locally on this device</p>
          </div>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={data.reminderEnabled}
          onChange={(e) => setData({ ...data, reminderEnabled: e.target.checked })}
        />
      </label>

      {data.reminderEnabled && (
        <div className="form-control gap-2">
          <label className="label py-0">
            <span className="label-text text-xs uppercase tracking-widest text-base-content/40">Reminder time</span>
          </label>
          <input
            type="time"
            className="input input-bordered input-lg w-full focus:input-primary text-base font-medium"
            value={data.reminderTime}
            onChange={(e) => setData({ ...data, reminderTime: e.target.value })}
          />
        </div>
      )}

      <div className="rounded-xl border border-base-300 bg-base-200 p-4 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-base-content/40 mb-1">Your setup</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base-content/40">Name</span>
          <span className="font-medium">{data.name || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base-content/40">First tracker</span>
          <span className="font-medium">{data.firstHabit || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base-content/40">Frequency</span>
          <span className="font-medium">{getFrequencyLabel(data.frequency)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const step = useOnboardingStore((state) => state.step);
  const loading = useOnboardingStore((state) => state.loading);
  const data = useOnboardingStore((state) => state.data);
  const next = useOnboardingStore((state) => state.next);
  const back = useOnboardingStore((state) => state.back);
  const canNext = useOnboardingStore((state) => state.canNext);
  const updateData = useOnboardingStore((state) => state.updateData);
  const complete = useOnboardingStore((state) => state.complete);
  const reset = useOnboardingStore((state) => state.reset);

  useEffect(() => {
    reset();
    updateData({ frequency: DEFAULT_FREQUENCY });
  }, [reset, updateData]);

  const setData = (nextData: OnboardingData) => {
    updateData(nextData);
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      next();
      return;
    }

    if (!user?.uid || !user.email) return;

    try {
      const selectedFocusAreas = FOCUS_AREAS.filter((area) => data.focusAreas.includes(area.id));
      await complete({ uid: user.uid, email: user.email, focusAreas: selectedFocusAreas });
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-base-100 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }} data-theme="silk">
      <header className="px-6 lg:px-20 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold text-sm"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            tq
          </span>
          <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            traq
          </span>
        </div>
      </header>

      <div className="px-6 lg:px-20 mt-5">
        <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-6 lg:px-20 py-10">
        <div className="w-full max-w-xl">
          {step === 1 && <StepName data={data} setData={setData} />}
          {step === 2 && <StepFocus data={data} setData={setData} />}
          {step === 3 && <StepHabit data={data} setData={setData} />}
          {step === 4 && <StepReminder data={data} setData={setData} />}
        </div>
      </main>

      <footer className="px-6 lg:px-20 pb-8 pt-4 flex items-center justify-between max-w-xl mx-auto w-full">
        {step > 1 ? (
          <button onClick={back} className="btn btn-ghost btn-md text-base-content/50">
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={!canNext() || loading}
          className="btn btn-primary btn-md px-8 font-semibold min-w-[140px]"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : step === TOTAL_STEPS ? "Start tracking" : "Continue"}
        </button>
      </footer>
    </div>
  );
}
