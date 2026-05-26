import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db as firestoreDb } from "../lib/firebase";

export type AccessType = "normal" | "tester" | "early_access" | "special";
export type UserRole   = "user" | "tester" | "admin";

export interface UserProfile {
  role:                UserRole;
  plan:                "free" | "pro" | "connect";
  accessType:          AccessType;
  isUnlimitedUser:     boolean;
  dailyRunLimit:       number | null;
  monthlyRunLimit:     number | null;
  continuationLimit:   number | null;
  inviteCodeAppliedAt: string | null;
  fullAccessExpiresAt: string | null;
}

const DEFAULT_PROFILE: UserProfile = {
  role:                "user",
  plan:                "free",
  accessType:          "normal",
  isUnlimitedUser:     false,
  dailyRunLimit:       5,
  monthlyRunLimit:     100,
  continuationLimit:   1,
  inviteCodeAppliedAt: null,
  fullAccessExpiresAt: null,
};

const ADMIN_PROFILE_OVERRIDE: Partial<UserProfile> = {
  role:              "admin",
  accessType:        "special",
  isUnlimitedUser:   true,
  dailyRunLimit:     null,
  monthlyRunLimit:   null,
  continuationLimit: null,
};

const TESTER_PROFILE_OVERRIDE: Partial<UserProfile> = {
  role:              "tester",
  accessType:        "tester",
  isUnlimitedUser:   true,
  dailyRunLimit:     null,
  monthlyRunLimit:   null,
  continuationLimit: null,
};

/** Returns true if the user has an active full-access period from a coupon. */
export function isFullAccessActive(profile: Pick<UserProfile, "fullAccessExpiresAt">): boolean {
  if (!profile.fullAccessExpiresAt) return false;
  return new Date(profile.fullAccessExpiresAt) > new Date();
}

interface UserProfileContextValue {
  profile:   UserProfile;
  applyCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

const UserProfileContext = createContext<UserProfileContextValue>({
  profile:   DEFAULT_PROFILE,
  applyCode: async () => ({ success: false, message: "" }),
});

const STORAGE_KEY = "qrooma_user_profile_v1";

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [storedProfile, setStoredProfile] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PROFILE;
      return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<UserProfile>) };
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    if (!user) {
      setStoredProfile(DEFAULT_PROFILE);
    }
  }, [user?.id]);

  function saveProfile(p: UserProfile) {
    setStoredProfile(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  const isAdmin  = user?.role === "admin";
  const isTester = user?.role === "tester";

  const profile: UserProfile = isAdmin
    ? { ...storedProfile, ...ADMIN_PROFILE_OVERRIDE }
    : isTester
      ? { ...storedProfile, ...TESTER_PROFILE_OVERRIDE }
      : storedProfile;

  // Sync fullAccessExpiresAt from DB on login (regular users only)
  useEffect(() => {
    if (!user || isAdmin || isTester) return;
    void (async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { "x-user-id": user.id },
        });
        if (!res.ok) return;
        const data = await res.json() as { fullAccessExpiresAt?: string | null };
        if (data.fullAccessExpiresAt !== undefined) {
          setStoredProfile((prev) => {
            const updated = { ...prev, fullAccessExpiresAt: data.fullAccessExpiresAt ?? null };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      } catch {
        // silent — localStorage value stays
      }
    })();
  }, [user?.id, isAdmin, isTester]);

  // Write / refresh Firestore user document for ALL logged-in users on login
  useEffect(() => {
    if (!user || !firestoreDb) return;
    const ref = doc(firestoreDb, "users", user.id);
    const roleForFirestore: UserRole = isAdmin ? "admin" : isTester ? "tester" : "user";
    const accessStatus = isAdmin || isTester ? "unlimited" : "active";

    void (async () => {
      try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid:             user.id,
            email:           user.email,
            role:            roleForFirestore,
            accessStatus,
            accessExpiresAt: null,
            createdAt:       serverTimestamp(),
            updatedAt:       serverTimestamp(),
            lastLoginAt:     serverTimestamp(),
          });
        } else {
          await updateDoc(ref, {
            email:       user.email,
            role:        roleForFirestore,
            accessStatus,
            updatedAt:   serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn("[Adjudo] Firestore user doc write failed:", e);
      }
    })();
  }, [user?.id, isAdmin, isTester]);

  async function applyCode(code: string): Promise<{ success: boolean; message: string }> {
    if (!user) return { success: false, message: "not_logged_in" };

    try {
      const res = await fetch("/api/invite-code/apply", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body:    JSON.stringify({ code }),
      });

      if (!res.ok) return { success: false, message: "network_error" };

      const data = await res.json() as {
        valid?:               boolean;
        reason?:              string;
        type?:                "full_access" | "invite" | "discount";
        fullAccessExpiresAt?: string;
        daysAdded?:           number;
        accessType?:          string;
        isUnlimitedUser?:     boolean;
        dailyRunLimit?:       number | null;
        monthlyRunLimit?:     number | null;
      };

      if (!data.valid) {
        if (data.reason === "already_used") return { success: false, message: "already_used" };
        return { success: false, message: "invalid" };
      }

      if (data.type === "full_access" && data.fullAccessExpiresAt) {
        const updated: UserProfile = {
          ...storedProfile,
          fullAccessExpiresAt: data.fullAccessExpiresAt,
          inviteCodeAppliedAt: new Date().toISOString(),
        };
        saveProfile(updated);
        return { success: true, message: "full_access" };
      }

      if (data.type === "invite") {
        const updated: UserProfile = {
          ...storedProfile,
          accessType:          (data.accessType as AccessType) ?? "normal",
          isUnlimitedUser:     data.isUnlimitedUser ?? false,
          dailyRunLimit:       data.isUnlimitedUser ? null : (data.dailyRunLimit ?? 5),
          monthlyRunLimit:     data.isUnlimitedUser ? null : (data.monthlyRunLimit ?? 100),
          continuationLimit:   data.isUnlimitedUser ? null : 1,
          inviteCodeAppliedAt: new Date().toISOString(),
        };
        saveProfile(updated);
        return { success: true, message: "ok" };
      }

      return { success: true, message: "ok" };
    } catch {
      return { success: false, message: "network_error" };
    }
  }

  return (
    <UserProfileContext.Provider value={{ profile, applyCode }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
