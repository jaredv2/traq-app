import { Navigate, useLocation } from "react-router-dom";
import type { TraqUser } from "../../types/tracker";

export function RootRedirect({
  user,
  hasMagicLinkInUrl,
}: {
  user: TraqUser | null;
  hasMagicLinkInUrl: boolean;
}) {
  const location = useLocation();

  if (hasMagicLinkInUrl) {
    return <Navigate replace to={`/signup${location.search}${location.hash}`} />;
  }

  return <Navigate replace to={user ? "/home" : "/signup"} />;
}
