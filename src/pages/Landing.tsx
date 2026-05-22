// Landing.tsx — traq habit tracker landing page
// Stack: React + React Router DOM + DaisyUI (silk theme) + Tailwind CSS
// Font: add to index.html → <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

import { useNavigate, Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "📅",
    title: "Streak Calendar",
    desc: "Watch your year fill up one day at a time. Every check-in colors a square in your tracker's theme.",
  },
  {
    icon: "🤖",
    title: "AI that actually reads your notes",
    desc: "Write what happened today. Traq responds like a real coach — not a generic notification.",
  },
  {
    icon: "⚡",
    title: "Check in under 10 seconds",
    desc: "One tap, a quick note, done. No forms, no friction between you and your streak.",
  },
  {
    icon: "🎨",
    title: "Fully yours",
    desc: "Name it, color it, emoji it. Every tracker feels personal because you built it.",
  },
  {
    icon: "✨",
    title: "AI builds it for you",
    desc: "Describe what you want to track. AI configures the whole thing in seconds.",
  },
  {
    icon: "📱",
    title: "Works everywhere",
    desc: "Installs like an app, works offline, syncs across all your devices automatically.",
  },
];

const PRICING = [
  {
    plan: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    features: [
      "Manual tracker setup",
      "Daily check-ins",
      "AI motivation on every check-in",
      "Heatmap calendar",
      "Basic customization (colors & emojis)",
    ],
    cta: "Start free",
    to: "/login",
    style: "btn-outline",
  },
  {
    plan: "Pro",
    price: "$4.99",
    period: "/ month",
    badge: "Most Popular",
    features: [
      "AI builds your tracker for you ✨",
      "AI that learns your patterns over time",
      "Advanced customization (themes, fonts...)",
    ],
    cta: "Go Pro",
    to: "/login",
    style: "btn-primary",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-base-100 text-base-content"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      data-theme="silk"
    >

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <header className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-6 lg:px-20">

        {/* Logo */}
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Traq
            </span>
          </Link>
        </div>

        {/* Center nav — desktop */}
        <nav className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-0">
            <li>
              <button
                onClick={() => scrollTo("features")}
                className="text-sm font-medium text-base-content/60 hover:text-base-content rounded-lg transition-colors"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollTo("pricing")}
                className="text-sm font-medium text-base-content/60 hover:text-base-content rounded-lg transition-colors"
              >
                Pricing
              </button>
            </li>
            <li>
              <Link
                to="/about"
                className="text-sm font-medium text-base-content/60 hover:text-base-content rounded-lg transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right CTA */}
        <div className="navbar-end gap-2 sm:gap-3">
          <Link to="/login" className="btn btn-ghost btn-sm text-sm font-medium lg:hidden">
            Log in
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm text-sm font-semibold">
            Start Free →
          </Link>

          {/* Mobile dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-square">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-44 border border-base-300">
              <li><button onClick={() => scrollTo("features")}>Features</button></li>
              <li><button onClick={() => scrollTo("pricing")}>Pricing</button></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </ul>
          </div>
        </div>
      </header>

      <main>

        {/* ── HERO ─────────────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
          {/* Soft background glow */}

          {/* H1 */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-normal leading-tight tracking-tight max-w-3xl mb-5"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Build habits that{" "}
            <em className="text-primary not-italic">actually</em> stick.
          </h1>

          {/* H4 */}
          <h4 className="text-lg sm:text-xl text-base-content/50 font-light max-w-xl mb-10 leading-relaxed">
            Traq turns your daily intentions into unbreakable streaks — simple logging, honest data, zero noise.
          </h4>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              className="btn btn-primary btn-lg px-8 font-semibold text-base"
              onClick={() => navigate("/login")}
            >
              Get started free
            </button>
            <button
              className="btn btn-ghost btn-lg text-base-content/50 text-base"
              onClick={() => scrollTo("features")}
            >
              See how it works ↓
            </button>
          </div>
        </section>

        {/* ── DIVIDER ──────────────────────────────────────────────────────────── */}
        <div className="divider mx-6 lg:mx-20" />

        {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
        <section id="features" className="py-20 px-6 lg:px-20 scroll-mt-20">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-3">Features</p>
            <h2
              className="text-4xl lg:text-5xl font-normal"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Everything you need. Nothing you don't.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card bg-base-200 border border-base-300 hover:border-primary/40 hover:shadow-sm transition-all duration-300"
              >
                <div className="card-body gap-3">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="card-title text-base font-semibold">{f.title}</h3>
                  <p className="text-sm text-base-content/55 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ──────────────────────────────────────────────────────────── */}
        <div className="divider mx-6 lg:mx-20" />

        {/* ── PRICING ──────────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-20 px-6 lg:px-20 scroll-mt-20">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-3">Pricing</p>
            <h2
              className="text-4xl lg:text-5xl font-normal"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Simple pricing. No surprises.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto">
            {PRICING.map((p) => (
              <div
                key={p.plan}
                className={`card flex-1 border ${
                  p.badge
                    ? "bg-primary/5 border-primary/40 shadow-sm"
                    : "bg-base-200 border-base-300"
                }`}
              >
                <div className="card-body gap-4">
                  {p.badge && (
                    <span className="badge badge-primary badge-sm font-medium self-start">{p.badge}</span>
                  )}
                  <div>
                    <p className="text-xs text-base-content/40 uppercase tracking-widest font-medium">{p.plan}</p>
                    <div className="flex items-end gap-1 mt-1">
                      <span
                        className="text-4xl font-normal"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                      >
                        {p.price}
                      </span>
                      <span className="text-base-content/40 text-sm mb-1">{p.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-base-content/65">
                        <span className="text-primary font-bold text-xs">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link to={p.to} className={`btn ${p.style} w-full mt-2`}>
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ──────────────────────────────────────────────────────────── */}
        <div className="divider mx-6 lg:mx-20" />

        {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 text-center">
          <h2
            className="text-5xl lg:text-6xl font-normal mb-5 leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Your streak starts{" "}
            <em className="text-primary not-italic">today.</em>
          </h2>
          <p className="text-base-content/45 mb-10 text-lg max-w-sm mx-auto">
            Free forever. No credit card. Just open it and start.
          </p>
          <button
            className="btn btn-primary btn-lg px-10 font-semibold text-base"
            onClick={() => navigate("/login")}
          >
            Create your account →
          </button>
        </section>

      </main>

      {/* ── FOOTER — one line ────────────────────────────────────────────────── */}
      <footer className="border-t border-base-300 px-6 lg:px-20 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-200 text-sm">
        <span
          className="font-semibold tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Traq
        </span>

        <div className="flex items-center gap-5 justify-center w-96">
          <button onClick={() => scrollTo("features")} className="text-base-content/45 hover:text-base-content transition-colors text-xs">
            Features
          </button>
          <button onClick={() => scrollTo("pricing")} className="text-base-content/45 hover:text-base-content transition-colors text-xs">
            Pricing
          </button>
          <Link to="/about" className="text-base-content/45 hover:text-base-content transition-colors text-xs">
            About
          </Link>
        </div>

        <p className="text-base-content/30 text-xs">© {new Date().getFullYear()} Traq. All rights reserved.</p>
      </footer>

    </div>
  );
}
