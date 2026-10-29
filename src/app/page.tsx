"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserProfile, StudySession } from "@/types";
import { storageService, DEFAULT_DEMO_USER } from "@/lib/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { TimerScreen } from "@/components/TimerScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { AuthScreen } from "@/components/AuthScreen";
import { ToastContainer, ToastMessage } from "@/components/Toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"timer" | "profile">("timer");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to add toast messages
  const addToast = useCallback((type: "success" | "warning" | "error" | "info", title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    try {
      const storedSessions = storageService.getSessions();
      setSessions(storedSessions);

      const storedUser = storageService.getUserProfile();
      // Only restore genuine authenticated users, never auto-log into demo user
      if (storedUser && !storedUser.isDemoUser) {
        setCurrentUser(storedUser);
      } else if (storedUser?.isDemoUser) {
        storageService.clearUserProfile();
      }
    } catch (e) {
      console.error("Initialization error", e);
    } finally {
      setIsLoading(false);
    }

    // Listen for Supabase auth state if configured
    if (isSupabaseConfigured && supabase) {
      // Check existing active Supabase session (e.g. after Google OAuth redirect)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "",
            displayName:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.user_metadata?.display_name ||
              session.user.email?.split("@")[0] ||
              "Student",
            avatarUrl: session.user.user_metadata?.avatar_url,
            preferences: DEFAULT_DEMO_USER.preferences,
            isDemoUser: false,
            createdAt: session.user.created_at,
          };
          setCurrentUser(profile);
          storageService.saveUserProfile(profile);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || "",
              displayName:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.user_metadata?.display_name ||
                session.user.email?.split("@")[0] ||
                "Student",
              avatarUrl: session.user.user_metadata?.avatar_url,
              preferences: DEFAULT_DEMO_USER.preferences,
              isDemoUser: false,
              createdAt: session.user.created_at,
            };
            setCurrentUser(profile);
            storageService.saveUserProfile(profile);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Handle study session completed
  const handleSessionComplete = (session: StudySession) => {
    storageService.saveSession(session);
    setSessions((prev) => [session, ...prev]);
    addToast(
      "success",
      "Focus Session Completed! 🌟",
      session.taskTitle
        ? `Great job finishing "${session.taskTitle}"!`
        : "Awesome work staying dedicated to your studies!"
    );
  };

  // Handle profile / preferences updates
  const handleUpdateProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    storageService.saveUserProfile(updated);
    addToast("info", "Settings Saved", "Your profile and study preferences have been updated.");
  };

  // Handle clearing history
  const handleClearHistory = () => {
    storageService.clearSessions();
    setSessions([]);
    addToast("warning", "History Cleared", "All saved study sessions have been removed.");
  };

  // Handle user signing out
  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    storageService.clearUserProfile();
    setCurrentUser(null);
    setActiveTab("timer");
    addToast("info", "Signed Out", "You have signed out. You can sign in anytime or continue as a guest.");
  };

  // Continue as guest
  const handleExploreGuest = () => {
    const guestUser: UserProfile = {
      ...DEFAULT_DEMO_USER,
      id: `guest_${Date.now()}`,
      displayName: "Guest Scholar",
      email: "guest@studytimer.local",
    };
    setCurrentUser(guestUser);
    storageService.saveUserProfile(guestUser);
    addToast("info", "Welcome!", "Exploring Study Break Timer in Guest Mode.");
  };

  // Sound preference toggle shortcut
  const handleToggleSound = (enabled: boolean) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      preferences: {
        ...currentUser.preferences,
        soundEnabled: enabled,
      },
    };
    handleUpdateProfile(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user is logged in and not guest, show Auth Screen (Reference 1)
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onAuthenticated={(user) => {
            setCurrentUser(user);
            addToast("success", `Welcome, ${user.displayName}!`, "Ready for productive studying.");
          }}
          onExploreGuest={handleExploreGuest}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Filter today's sessions
  const todayDateStr = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.completedAt).toDateString() === todayDateStr && s.status === "completed"
  );

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          completedTodayCount={todaySessions.length}
        />

        {/* Active Screen */}
        <main className="w-full">
          {activeTab === "timer" ? (
            <TimerScreen
              userProfile={currentUser}
              todaySessions={todaySessions}
              onSessionComplete={handleSessionComplete}
              onOpenProfile={() => setActiveTab("profile")}
              onUpdateSoundPreference={handleToggleSound}
            />
          ) : (
            <ProfileScreen
              userProfile={currentUser}
              sessions={sessions}
              onUpdateProfile={handleUpdateProfile}
              onClearHistory={handleClearHistory}
              onSignOut={handleSignOut}
              onNavigateToTimer={() => setActiveTab("timer")}
            />
          )}
        </main>
      </div>

      {/* Non-intrusive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
