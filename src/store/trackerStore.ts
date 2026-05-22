import { create } from "zustand";
import { collection, doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "../lib/firebase";
import { calculateStreaks, TrackerModel, type Tracker, type TrackerCheckIn } from "../lib";

interface TrackerState {
  tracker: Tracker | null;
  checkIns: Record<string, TrackerCheckIn>;
  loading: boolean;
  error: Error | null;
  currentUid?: string;
  currentTrackerId?: string;
  unsubscribeTracker: Unsubscribe | null;
  unsubscribeCheckIns: Unsubscribe | null;
  reset: (trackerId?: string, uid?: string) => void;
  subscribe: (uid: string, trackerId: string) => void;
  cleanup: () => void;
}

const initialState = {
  tracker: null as Tracker | null,
  checkIns: {} as Record<string, TrackerCheckIn>,
  loading: false,
  error: null as Error | null,
};

export const useTrackerStore = create<TrackerState>((set, get) => ({
  ...initialState,
  currentUid: undefined,
  currentTrackerId: undefined,
  unsubscribeTracker: null,
  unsubscribeCheckIns: null,
  reset: (trackerId, uid) => {
    get().cleanup();
    set({
      ...initialState,
      loading: Boolean(uid && trackerId),
      currentUid: uid,
      currentTrackerId: trackerId,
      unsubscribeTracker: null,
      unsubscribeCheckIns: null,
    });
  },
  subscribe: (uid, trackerId) => {
    const state = get();
    if (
      state.currentUid === uid &&
      state.currentTrackerId === trackerId &&
      (state.unsubscribeTracker || state.unsubscribeCheckIns)
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

    const trackerDocRef = doc(db, "trackers", trackerId);
    const checkInsColRef = collection(db, "trackers", trackerId, "checkIns");

    const unsubscribeTracker = onSnapshot(
      trackerDocRef,
      (snapshot) => {
        const docData = snapshot.data();
        if (snapshot.exists() && docData) {
          const tracker = TrackerModel.fromFirestore(snapshot.id, docData);
          if (tracker) {
            if (tracker.ownerId !== uid) {
              set({ error: new Error("Access denied."), loading: false });
              return;
            }

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

    const unsubscribeCheckIns = onSnapshot(
      checkInsColRef,
      (snapshot) => {
        const checkIns: Record<string, TrackerCheckIn> = {};
        snapshot.forEach((checkInDoc) => {
          checkIns[checkInDoc.id] = checkInDoc.data() as TrackerCheckIn;
        });

        set((state) => ({
          checkIns,
          tracker: state.tracker
            ? {
                ...state.tracker,
                ...calculateStreaks(checkIns),
              }
            : state.tracker,
          loading: false,
          error: null,
        }));
      },
      (error) => set({ error, loading: false }),
    );

    set({ unsubscribeTracker, unsubscribeCheckIns });
  },
  cleanup: () => {
    const { unsubscribeTracker, unsubscribeCheckIns } = get();
    unsubscribeTracker?.();
    unsubscribeCheckIns?.();
    set({ unsubscribeTracker: null, unsubscribeCheckIns: null });
  },
}));
