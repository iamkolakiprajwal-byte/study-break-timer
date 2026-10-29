export type TimerMode = "focus" | "break";

export type TimerStatus =
  | "ready"
  | "focus_running"
  | "focus_paused"
  | "focus_completed"
  | "break_running"
  | "break_paused"
  | "break_completed";

export interface StudySession {
  id: string;
  userId?: string;
  taskTitle?: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  startedAt: string; // ISO string
  completedAt: string; // ISO string
  status: "completed" | "abandoned";
  createdAt: string;
}

export interface UserPreferences {
  defaultFocusDurationMinutes: number;
  defaultBreakDurationMinutes: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStartBreak: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  isDemoUser: boolean;
  createdAt: string;
}

export interface BreakSuggestion {
  id: string;
  iconName: string;
  title: string;
  description: string;
}
