import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./useAuth";

export type AiPersonality = "coach" | "friend" | "stoic" | "zen";

export interface UserProfile {
  name?: string;
  bio?: string;
  aiPersonality?: AiPersonality;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
        setLoading(false);
      },
      () => {
        setProfile(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { profile, loading };
}
