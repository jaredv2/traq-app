import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// ─── Layouts ──────────────────────────────────────────────────────────────────
import Layout from "./components/Layout";

// ─── Public pages ─────────────────────────────────────────────────────────────
import Landing from "./pages/Landing";

function App() {
  return (
    // AuthProvider must wrap BrowserRouter so hooks work inside route components
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes (shared layout) ─────────────────────────────── */}
            <Route path="/"       element={<Landing />} />

          {/* ── Protected routes ──────────────────────────────────────────── */}
          {/* ProtectedRoute checks auth; redirects to /login if not signed in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
            </Route>
          </Route>

          {/* ── Redirects ─────────────────────────────────────────────────── */}
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />

          {/* ── 404 ───────────────────────────────────────────────────────── */}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;