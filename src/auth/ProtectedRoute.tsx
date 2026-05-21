import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still waiting for Firebase to resolve auth state — render nothing (or a spinner)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="animate-spin h-8 w-8 rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  // Not signed in → redirect to /login, preserve the intended route
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in → render the child route
  return <Outlet />;
}