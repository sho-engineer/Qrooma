import { createContext, useContext, useState, type ReactNode } from "react";

export type AccessType = "normal" | "tester" | "early_access" | "special";
export type UserRole   = "user" | "admin";

export interface UserProfile {
  role:                UserRole;
  plan:                "free" | "pro" | "connect";
  accessType:          AccessType;
  isUnlimitedUser:     boolean;
  dailyRunLimit:       number | null;
  monthlyRunLimit:     number | null;
  continuationLimit:   number | null;
  inviteCodeAppliedAt: string | null;
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
};

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
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PROFILE;
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  function saveProfile(p: UserProfile) {
    setProfile(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  async function applyCode(code: string): Promise<{ success: boolean; message: string }> {
    if (profile.inviteCodeAppliedAt) {
      return { success: false, message: "already_applied" };
    }

    try {
      const res = await fetch("/api/invite-code/apply", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });

      if (!res.ok) {
        return { success: false, message: "network_error" };
      }

      const data = await res.json() as {
        valid?:          boolean;
        reason?:         string;
        accessType?:     string;
        isUnlimitedUser?: boolean;
        dailyRunLimit?:  number | null;
        monthlyRunLimit?: number | null;
      };

      if (!data.valid) {
        return { success: false, message: "invalid" };
      }

      const updated: UserProfile = {
        ...profile,
        accessType:          (data.accessType as AccessType) ?? "normal",
        isUnlimitedUser:     data.isUnlimitedUser ?? false,
        dailyRunLimit:       data.isUnlimitedUser ? null : (data.dailyRunLimit ?? 5),
        monthlyRunLimit:     data.isUnlimitedUser ? null : (data.monthlyRunLimit ?? 100),
        continuationLimit:   data.isUnlimitedUser ? null : 1,
        inviteCodeAppliedAt: new Date().toISOString(),
      };
      saveProfile(updated);
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
