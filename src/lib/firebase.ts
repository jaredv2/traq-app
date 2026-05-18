import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  CheckInPayload,
  Tracker,
  TrackerEntry,
  TraqUser,
} from "../types/tracker";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const MAGIC_LINK_STORAGE_KEY = "traq.emailForSignIn";

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

const getEmailLinkRedirectUrl = (): string => {
  return import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin;
};

const getStoredMagicLinkEmail = (): string | null => {
  return window.localStorage.getItem(MAGIC_LINK_STORAGE_KEY);
};

const storeMagicLinkEmail = (email: string): void => {
  window.localStorage.setItem(MAGIC_LINK_STORAGE_KEY, email);
};

const clearMagicLinkEmail = (): void => {
  window.localStorage.removeItem(MAGIC_LINK_STORAGE_KEY);
};

export class MagicLinkEmailRequiredError extends Error {
  constructor() {
    super("Email is required to complete sign-in.");
    this.name = "MagicLinkEmailRequiredError";
  }
}

export const signInWithGoogle = async (): Promise<TraqUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  return getOrCreateUser(result.user);
};

export const sendMagicLink = async (email: string): Promise<void> => {
  await sendSignInLinkToEmail(auth, email, {
    url: getEmailLinkRedirectUrl(),
    handleCodeInApp: true,
  });

  storeMagicLinkEmail(email);
};

export const isMagicLinkSignIn = (url: string): boolean => {
  return isSignInWithEmailLink(auth, url);
};

export const completeMagicLinkSignIn = async (
  url: string,
  email?: string
): Promise<TraqUser> => {
  const resolvedEmail = email ?? getStoredMagicLinkEmail();

  if (!resolvedEmail) {
    throw new MagicLinkEmailRequiredError();
  }

  const result = await signInWithEmailLink(auth, resolvedEmail, url);
  clearMagicLinkEmail();
  return getOrCreateUser(result.user);
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: TraqUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const traqUser = await getOrCreateUser(firebaseUser);
    callback(traqUser);
  });
};

const getOrCreateUser = async (firebaseUser: User): Promise<TraqUser> => {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as TraqUser;
  }

  const newUser: TraqUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName ?? undefined,
    photoURL: firebaseUser.photoURL ?? undefined,
    plan: "free",
    trackerCount: 0,
    createdAt: new Date(),
  };

  await setDoc(ref, { ...newUser, createdAt: serverTimestamp() });
  return newUser;
};

export const updateUserPlan = async (
  uid: string,
  plan: "free" | "pro"
): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { plan });
};

export const getUserTrackers = async (uid: string): Promise<Tracker[]> => {
  const q = query(
    collection(db, "trackers"),
    where("userId", "==", uid),
    where("isArchived", "==", false),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((trackerDoc) => ({
    ...trackerDoc.data(),
    id: trackerDoc.id,
    createdAt: (trackerDoc.data().createdAt as Timestamp).toDate(),
    updatedAt: (trackerDoc.data().updatedAt as Timestamp).toDate(),
  })) as Tracker[];
};

export const createTracker = async (
  uid: string,
  tracker: Omit<Tracker, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Tracker> => {
  const ref = await addDoc(collection(db, "trackers"), {
    ...tracker,
    userId: uid,
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const trackerCount = userSnap.data()?.trackerCount ?? 0;

  await updateDoc(userRef, {
    trackerCount: trackerCount + 1,
  });

  return {
    ...tracker,
    id: ref.id,
    userId: uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const updateTracker = async (
  trackerId: string,
  updates: Partial<Tracker>
): Promise<void> => {
  await updateDoc(doc(db, "trackers", trackerId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const archiveTracker = async (trackerId: string): Promise<void> => {
  await updateDoc(doc(db, "trackers", trackerId), {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTracker = async (trackerId: string): Promise<void> => {
  await deleteDoc(doc(db, "trackers", trackerId));
};

export const getTrackerEntries = async (
  trackerId: string,
  limitDays = 90
): Promise<TrackerEntry[]> => {
  const since = new Date();
  since.setDate(since.getDate() - limitDays);

  const q = query(
    collection(db, "entries"),
    where("trackerId", "==", trackerId),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((entryDoc) => ({
    ...entryDoc.data(),
    id: entryDoc.id,
    createdAt: (entryDoc.data().createdAt as Timestamp).toDate(),
  })) as TrackerEntry[];
};

export const saveCheckIn = async (
  uid: string,
  payload: CheckInPayload,
  aiResponse?: string
): Promise<TrackerEntry> => {
  const q = query(
    collection(db, "entries"),
    where("trackerId", "==", payload.trackerId),
    where("date", "==", payload.date)
  );
  const existing = await getDocs(q);

  const entryData = {
    trackerId: payload.trackerId,
    userId: uid,
    date: payload.date,
    checked: payload.checked,
    note: payload.note ?? null,
    mood: payload.mood ?? null,
    aiResponse: aiResponse ?? null,
    createdAt: serverTimestamp(),
  };

  if (!existing.empty) {
    const docRef = existing.docs[0].ref;
    await updateDoc(docRef, entryData);
    return { ...entryData, id: docRef.id, createdAt: new Date() } as TrackerEntry;
  }

  const ref = await addDoc(collection(db, "entries"), entryData);
  return { ...entryData, id: ref.id, createdAt: new Date() } as TrackerEntry;
};

export const calculateStreak = (entries: TrackerEntry[]): number => {
  const checkedDates = entries
    .filter((entry) => entry.checked)
    .map((entry) => entry.date)
    .sort()
    .reverse();

  if (checkedDates.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let cursor = today;

  for (const date of checkedDates) {
    if (date !== cursor) {
      break;
    }

    streak += 1;
    const previousDay = new Date(cursor);
    previousDay.setDate(previousDay.getDate() - 1);
    cursor = previousDay.toISOString().split("T")[0];
  }

  return streak;
};
