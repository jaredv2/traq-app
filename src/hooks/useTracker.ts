import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useTrackerStore } from "../store/trackerStore";

export function useTracker(trackerId: string | undefined) {
  const { user } = useAuth();
  const tracker = useTrackerStore((state) => state.tracker);
  const checkIns = useTrackerStore((state) => state.checkIns);
  const loading = useTrackerStore((state) => state.loading);
  const error = useTrackerStore((state) => state.error);
  const reset = useTrackerStore((state) => state.reset);
  const subscribe = useTrackerStore((state) => state.subscribe);
  const cleanup = useTrackerStore((state) => state.cleanup);

  useEffect(() => {
    if (!user?.uid || !trackerId) {
      reset(trackerId, user?.uid);
      return;
    }

    subscribe(user.uid, trackerId);

    return () => {
      cleanup();
    };
  }, [cleanup, reset, subscribe, trackerId, user?.uid]);

  return {
    tracker,
    checkIns,
    loading,
    error,
  };
}
