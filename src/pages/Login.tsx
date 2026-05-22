// Login.tsx — traq login page
// Stack: React + React Router DOM + DaisyUI (silk) + Tailwind
// Requires: AuthContext with signInWithGoogle(), useNavigate from react-router-dom
// Font: DM Serif Display + DM Sans (same as Landing)

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLoginStore } from "../store/loginStore";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const loading = useLoginStore((state) => state.loading);
  const error = useLoginStore((state) => state.error);
  const start = useLoginStore((state) => state.start);
  const fail = useLoginStore((state) => state.fail);
  const finish = useLoginStore((state) => state.finish);
  const reset = useLoginStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  const handleGoogleLogin = async () => {
    start();
    try {
      const credential = await signInWithGoogle();
      const { user } = credential;
      const isNew = user.metadata.creationTime === user.metadata.lastSignInTime;
      finish();
      navigate(isNew ? "/onboarding" : "/home", { replace: true });
    } catch (err: unknown) {
      fail("Couldn't sign in. Please try again.");
      console.error(err);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-base-100 flex items-center justify-center overflow-hidden px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      data-theme="silk"
    >

      {/* ── BACKGROUND ANIMATIONS ──────────────────────────────────────────── */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -40px) scale(1.08); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-25px, 35px) scale(1.05); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(20px, 20px) scale(1.1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .blob-a { animation: floatA 8s ease-in-out infinite; }
        .blob-b { animation: floatB 11s ease-in-out infinite; }
        .blob-c { animation: floatC 9s ease-in-out infinite 1s; }
        .card-in { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .ring-spin { animation: spinSlow 12s linear infinite; }
      `}</style>

      {/* Blobs */}
      <div className="blob-a absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="blob-b absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
      <div className="blob-c absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/8 blur-2xl pointer-events-none" />

      {/* Spinning ring decoration */}
      <div className="ring-spin absolute top-12 right-12 w-24 h-24 rounded-full border border-dashed border-primary/20 pointer-events-none hidden sm:block" />
      <div className="ring-spin absolute bottom-16 left-10 w-14 h-14 rounded-full border border-dashed border-secondary/25 pointer-events-none hidden sm:block" style={{ animationDirection: "reverse", animationDuration: "18s" }} />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── LOGIN CARD ────────────────────────────────────────────────────── */}
      <div className="card-in card w-full max-w-sm bg-base-100 border border-base-300 shadow-xl relative z-10">
        <div className="card-body gap-6 p-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-1">
            <Link to="/" className="flex items-center gap-2 group">
              <span
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-content font-bold text-base"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                tq
              </span>
              <span
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                traq
              </span>
            </Link>
            <p className="text-sm text-base-content/45 text-center mt-1">
              Sign in to keep your streak alive.
            </p>
          </div>

          {/* Divider */}
          <div className="divider my-0 text-xs text-base-content/30">continue with</div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-outline w-full gap-3 font-medium text-sm border-base-300 hover:border-base-content/30 hover:bg-base-200 transition-all"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              /* Google G SVG */
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2 14-5.4l-6.5-5.5C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.5l6.5 5.5C41 35.7 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          {/* Error */}
          {error && (
            <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          {/* Terms */}
          <p className="text-center text-xs text-base-content/35 leading-relaxed">
            By signing in you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-base-content transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-base-content transition-colors">
              Privacy Policy
            </Link>.
          </p>

        </div>
      </div>

      {/* Back to landing */}
      <Link
        to="/"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-base-content/35 hover:text-base-content transition-colors z-10"
      >
        ← Back to traq.app
      </Link>

    </div>
  );
}
