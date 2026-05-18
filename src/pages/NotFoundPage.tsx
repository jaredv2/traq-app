import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white px-8 py-12 text-center shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
      <h1 className="font-serif text-5xl text-stone-900">Page not found.</h1>
      <p className="mt-4 text-base leading-8 text-stone-600">
        The route does not exist yet. Head back to the app shell and keep moving.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white no-underline"
        to="/"
      >
        Go home
      </Link>
    </section>
  );
}
