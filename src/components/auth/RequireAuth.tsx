import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { TraqUser } from "../../types/tracker";

export function RequireAuth({
  user,
  children,
}: {
  user: TraqUser | null;
  children: ReactNode;
}) {
  const location = useLocation();

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/signup" />;
  }

  return <>{children}</>;
}
