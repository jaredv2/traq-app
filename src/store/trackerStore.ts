import { create } from "zustand";
import { collection, doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "../lib/firebase";
import { type Entry, type Tracker } from "../lib";

const isValidTracker = (data: unknown): data is Tracker => {
  const tracker = data as Partial<Tracker> | null;
  return (
    !!tracker &&
    typeof tracker.id === "string" &&
    typeof tracker.accId === "string" &&
    typeof tracker.name === "string" &&
    typeof tracker.frequency === "string" &&
    typeof tracker.calendar === "object" &&
    tracker.calendar !== null &&
    typeof tracker.themeSetup === "object" &&
    tracker.themeSetup !== null
  );
};

interface TrackerState {
  tracker: Tracker | null;
  entries: Record<string, Entry>;
  loading: boolean;
  error: Error | null;
  currentUid?: string;
  currentTrackerId?: string;
  unsubscribeTracker: Unsubscribe | null;
  unsubscribeEntries: Unsubscribe | null;
  reset: (trackerId?: string, uid?: string) => void;
  subscribe: (uid: string, trackerId: string) => void;
  cleanup: () => void;
}

const initialState = {
  tracker: null as Tracker | null,
  entries: {} as Record<string, Entry>,
  loading: false,
  error: null as Error | null,
};

export const useTrackerStore = create<TrackerState>((set, get) => ({
  ...initialState,
  currentUid: undefined,
  currentTrackerId: undefined,
  unsubscribeTracker: null,
  unsubscribeEntries: null,
  reset: (trackerId, uid) => {
    get().cleanup();
    set({
      ...initialState,
      loading: Boolean(uid && trackerId),
      currentUid: uid,
      currentTrackerId: trackerId,
      unsubscribeTracker: null,
      unsubscribeEntries: null,
    });
  },
  subscribe: (uid, trackerId) => {
    const state = get();
    if (
      state.currentUid === uid &&
      state.currentTrackerId === trackerId &&
      (state.unsubscribeTracker || state.unsubscribeEntries)
    ) {
      return;
    }

    state.cleanup();
    set({
      ...initialState,
      loading: true,
      currentUid: uid,
      currentTrackerId: trackerId,
    });

    const trackerDocRef = doc(db, "users", uid, "trackers", trackerId);
    const entriesColRef = collection(db, "users", uid, "trackers", trackerId, "entries");

    const unsubscribeTracker = onSnapshot(
      trackerDocRef,
      (snapshot) => {
        const docData = snapshot.data();
        if (snapshot.exists() && docData) {
          const tracker = { ...docData, id: snapshot.id };
          if (isValidTracker(tracker)) {
            set({ tracker, error: null });
          } else {
            set({
              error: new Error("Received tracker data with an invalid schema."),
              loading: false,
            });
          }
        } else {
          set({ error: new Error("Tracker not found."), loading: false });
        }
      },
      (error) => set({ error, loading: false }),
    );

    const unsubscribeEntries = onSnapshot(
      entriesColRef,
      (snapshot) => {
        const entries: Record<string, Entry> = {};
        snapshot.forEach((entryDoc) => {
          entries[entryDoc.id] = entryDoc.data() as Entry;
        });
        set({ entries, loading: false, error: null });
      },
      (error) => set({ error, loading: false }),
    );

    set({ unsubscribeTracker, unsubscribeEntries });
  },
  cleanup: () => {
    const { unsubscribeTracker, unsubscribeEntries } = get();
    unsubscribeTracker?.();
    unsubscribeEntries?.();
    set({ unsubscribeTracker: null, unsubscribeEntries: null });
  },
}));
