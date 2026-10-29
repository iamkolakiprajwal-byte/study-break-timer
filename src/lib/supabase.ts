import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StudySession, UserProfile } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async getSessionHistory(userId: string): Promise<StudySession[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        taskTitle: row.task_title,
        plannedDurationSeconds: row.planned_duration_seconds,
        actualDurationSeconds: row.actual_duration_seconds,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        status: row.status,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn("Supabase fetch failed, falling back", err);
      return [];
    }
  },

  async saveSession(session: StudySession): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("study_sessions").insert([
        {
          id: session.id,
          user_id: session.userId,
          task_title: session.taskTitle,
          planned_duration_seconds: session.plannedDurationSeconds,
          actual_duration_seconds: session.actualDurationSeconds,
          started_at: session.startedAt,
          completed_at: session.completedAt,
          status: session.status,
          created_at: session.createdAt,
        },
      ]);
      return !error;
    } catch {
      return false;
    }
  },

  async saveProfile(profile: UserProfile): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: profile.id,
        display_name: profile.displayName,
        preferences: profile.preferences,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  },
};
