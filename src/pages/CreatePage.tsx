import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { defaultCreateForm } from "../lib/app-content";
import type { CreateFormState } from "../types/app";
import type { TrackerCategory, TraqUser, TrackingFrequency } from "../types/tracker";

export function CreatePage({
  user,
  onCreate,
}: {
  user: TraqUser;
  onCreate: (form: CreateFormState) => string;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateFormState>(defaultCreateForm);

  const updateField = <K extends keyof CreateFormState>(field: K, value: CreateFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trackerId = onCreate(form);
    setForm(defaultCreateForm);
    navigate(`/tracker/${trackerId}`);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] bg-stone-950 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.16)]">
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-200">
          Create
        </div>
        <h1 className="mt-6 font-serif text-5xl leading-[1.02]">Create a new tracker route.</h1>
        <p className="mt-4 text-base leading-8 text-stone-300">
          This page generates a brand-new tracker using `uuidv4()` and drops you
          directly into its detail page. The Firebase persistence layer can plug into
          the same submission flow later.
        </p>

        <div className="mt-8 rounded-[2rem] p-6" style={{ backgroundColor: form.backgroundColor, color: "#1c1917" }}>
          <div
            className="inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
            style={{ backgroundColor: form.accentColor, color: "white" }}
          >
            Preview
          </div>
          <div className="mt-5 text-4xl">{form.emoji}</div>
          <h2 className="mt-4 text-3xl font-medium">{form.name || "Your tracker name"}</h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            {form.description || "Describe the behavior, ritual, or outcome you want to make consistent."}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/70 p-4">
              <div className="text-stone-500">Target</div>
              <div className="mt-1 font-medium text-stone-900">
                {form.target || "Define a daily outcome"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <div className="text-stone-500">Owner</div>
              <div className="mt-1 font-medium text-stone-900">{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      <form className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700">
            Name
            <input
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nightly reading"
              required
              value={form.name}
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Emoji
            <input
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
              maxLength={2}
              onChange={(event) => updateField("emoji", event.target.value)}
              required
              value={form.emoji}
            />
          </label>

          <label className="block text-sm font-medium text-stone-700 md:col-span-2">
            Description
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Write the behavior you want to reinforce."
              value={form.description}
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Target
            <input
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
              onChange={(event) => updateField("target", event.target.value)}
              placeholder="20 pages before bed"
              required
              value={form.target}
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Category
            <select
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
              onChange={(event) => updateField("category", event.target.value as TrackerCategory)}
              value={form.category}
            >
              <option value="habit">Habit</option>
              <option value="health">Health</option>
              <option value="fitness">Fitness</option>
              <option value="nutrition">Nutrition</option>
              <option value="mental">Mental</option>
              <option value="productivity">Productivity</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Frequency
            <select
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-500 focus:bg-white"
              onChange={(event) => updateField("frequency", event.target.value as TrackingFrequency)}
              value={form.frequency}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Accent color
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-2 py-2"
              onChange={(event) => updateField("accentColor", event.target.value)}
              type="color"
              value={form.accentColor}
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Background color
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-2 py-2"
              onChange={(event) => updateField("backgroundColor", event.target.value)}
              type="color"
              value={form.backgroundColor}
            />
          </label>
        </div>

        <button
          className="mt-8 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          type="submit"
        >
          Generate tracker route
        </button>
      </form>
    </section>
  );
}
