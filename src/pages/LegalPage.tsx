import type { LegalSection } from "../types/app";

export function LegalPage({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] bg-white px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          {eyebrow}
        </div>
        <h1 className="mt-5 font-serif text-5xl leading-[1.04] text-stone-900">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">{description}</p>
      </div>

      {sections.map((section) => (
        <article
          key={section.title}
          className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.05)]"
        >
          <h2 className="text-2xl font-medium text-stone-900">{section.title}</h2>
          <p className="mt-4 text-base leading-8 text-stone-600">{section.body}</p>
        </article>
      ))}
    </section>
  );
}
