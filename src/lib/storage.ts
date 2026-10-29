import { StudySession, UserProfile, UserPreferences } from "@/types";

const SESSIONS_KEY = "study_break_timer_sessions_v1";
const PROFILE_KEY = "study_break_timer_profile_v2";
const ACTIVE_TIMER_KEY = "study_break_timer_active_v1";

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultFocusDurationMinutes: 25,
  defaultBreakDurationMinutes: 5,
  soundEnabled: true,
  notificationsEnabled: false,
  autoStartBreak: false,
};

export const DEFAULT_DEMO_USER: UserProfile = {
  id: "demo-user-1",
  email: "student@example.com",
  displayName: "Alex Rivera",
  preferences: DEFAULT_PREFERENCES,
  isDemoUser: true,
  createdAt: new Date().toISOString(),
};

// Safe LocalStorage helpers
export const storageService = {
  getSessions(): StudySession[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load sessions from localStorage", e);
      return [];
    }
  },

  saveSession(session: StudySession): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getSessions();
      // Guard against duplicate records
      const exists = existing.some((s) => s.id === session.id);
      if (exists) return;
      const updated = [session, ...existing];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save session to localStorage", e);
    }
  },

  clearSessions(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSIONS_KEY);
  },

  getUserProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_DEMO_USER,
        ...parsed,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(parsed.preferences || {}),
        },
      };
    } catch (e) {
      console.error("Failed to load profile", e);
      return null;
    }
  },

  clearUserProfile(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PROFILE_KEY);
  },

  saveUserProfile(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  },

  saveActiveTimerState(state: {
    mode: "focus" | "break";
    status: string;
    targetEndTime: number | null;
    remainingSeconds: number;
    totalDurationSeconds: number;
    taskTitle: string;
    startedAt: string;
  } | null): void {
    if (typeof window === "undefined") return;
    try {
      if (!state) {
        localStorage.removeItem(ACTIVE_TIMER_KEY);
      } else {
        localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.error("Failed to persist active timer state", e);
    }
  },

  getActiveTimerState(): {
    mode: "focus" | "break";
    status: string;
    targetEndTime: number | null;
    remainingSeconds: number;
    totalDurationSeconds: number;
    taskTitle: string;
    startedAt: string;
  } | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(ACTIVE_TIMER_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
};
