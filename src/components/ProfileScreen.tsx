import React, { useState } from "react";
import {
  User,
  Clock,
  CheckCircle,
  Calendar,
  Settings,
  LogOut,
  Trash2,
  Sliders,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { UserProfile, StudySession, UserPreferences } from "@/types";
import { ConfirmModal } from "./ConfirmModal";

interface ProfileScreenProps {
  userProfile: UserProfile;
  sessions: StudySession[];
  onUpdateProfile: (updated: UserProfile) => void;
  onClearHistory: () => void;
  onSignOut: () => void;
  onNavigateToTimer: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  sessions,
  onUpdateProfile,
  onClearHistory,
  onSignOut,
  onNavigateToTimer,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "today" | "week">("all");

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState(userProfile.displayName);
  const [editFocusDuration, setEditFocusDuration] = useState(
    userProfile.preferences.defaultFocusDurationMinutes
  );
  const [editBreakDuration, setEditBreakDuration] = useState(
    userProfile.preferences.defaultBreakDurationMinutes
  );
  const [editSoundEnabled, setEditSoundEnabled] = useState(
    userProfile.preferences.soundEnabled
  );

  // Calculate actual statistics from session history
  const totalCompletedSessions = sessions.filter((s) => s.status === "completed");
  const totalSeconds = totalCompletedSessions.reduce((acc, s) => acc + s.actualDurationSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // Today calculation
  const todayDateStr = new Date().toDateString();
  const todaySessions = totalCompletedSessions.filter(
    (s) => new Date(s.completedAt).toDateString() === todayDateStr
  );
  const todayMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.actualDurationSeconds, 0) / 60
  );

  // Week calculation (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = totalCompletedSessions.filter(
    (s) => new Date(s.completedAt).getTime() >= sevenDaysAgo
  );
  const weekHours = (
    weekSessions.reduce((acc, s) => acc + s.actualDurationSeconds, 0) / 3600
  ).toFixed(1);

  // Filtered session list
  const filteredSessions = sessions.filter((s) => {
    if (historyFilter === "today") {
      return new Date(s.completedAt).toDateString() === todayDateStr;
    }
    if (historyFilter === "week") {
      return new Date(s.completedAt).getTime() >= sevenDaysAgo;
    }
    return true;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPreferences: UserPreferences = {
      ...userProfile.preferences,
      defaultFocusDurationMinutes: Number(editFocusDuration),
      defaultBreakDurationMinutes: Number(editBreakDuration),
      soundEnabled: Boolean(editSoundEnabled),
    };

    const updatedProfile: UserProfile = {
      ...userProfile,
      displayName: editDisplayName.trim() || userProfile.displayName,
      preferences: updatedPreferences,
    };

    onUpdateProfile(updatedProfile);
    setShowEditModal(false);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const isToday = d.toDateString() === todayDateStr;
      if (isToday) {
        return `Today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }
      return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "Completed";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-extrabold text-2xl shadow-subtle flex-shrink-0">
            {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy">
                {userProfile.displayName || "Alex Rivera"}
              </h1>
              {userProfile.isDemoUser && (
                <span className="px-2 py-0.5 rounded-full bg-surface-soft border border-border text-[10px] font-bold text-text-secondary">
                  Local Mode
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">{userProfile.email}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Focus defaults: {userProfile.preferences.defaultFocusDurationMinutes}m study / {userProfile.preferences.defaultBreakDurationMinutes}m break
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2.5 rounded-xl border border-border bg-surface-soft hover:bg-white text-navy text-xs font-bold shadow-subtle flex items-center gap-2 transition-all"
        >
          <Sliders className="w-4 h-4 text-primary" />
          <span>Edit Profile & Defaults</span>
        </button>
      </div>

      {/* Progress Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Total Time
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy">
            {totalHours} <span className="text-xs font-semibold text-text-muted">hrs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center gap-2 text-status-success mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Sessions
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy">
            {totalCompletedSessions.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Today
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy">
            {todayMinutes} <span className="text-xs font-semibold text-text-muted">mins</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center gap-2 text-navy mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              This Week
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy">
            {weekHours} <span className="text-xs font-semibold text-text-muted">hrs</span>
          </div>
        </div>
      </div>

      {/* Session History Section */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-navy">Completed Study Sessions</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Every focused block of work you finished.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-soft p-1 rounded-xl border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setHistoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                historyFilter === "all" ? "bg-white text-primary shadow-subtle" : "text-text-secondary"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter("today")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                historyFilter === "today" ? "bg-white text-primary shadow-subtle" : "text-text-secondary"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter("week")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                historyFilter === "week" ? "bg-white text-primary shadow-subtle" : "text-text-secondary"
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Sessions List or Empty State */}
        {filteredSessions.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border bg-surface-soft/60">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-navy">No study sessions recorded yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
              Start your first study session to build momentum and see your progress grow here!
            </p>
            <button
              type="button"
              onClick={onNavigateToTimer}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-all"
            >
              Start Focusing Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-surface-soft/40 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy truncate">
                      {session.taskTitle || "Untitled Focus Session"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-status-success-light text-status-success text-[10px] font-bold flex-shrink-0">
                      Completed
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {formatDate(session.completedAt)}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-extrabold text-primary">
                    {Math.round(session.actualDurationSeconds / 60)} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear History Button */}
        {sessions.length > 0 && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs font-semibold text-text-muted hover:text-status-error flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Session History</span>
            </button>
          </div>
        )}
      </div>

      {/* Account Settings & Sign Out */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy">Account & Session</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Signed in as <strong className="text-navy">{userProfile.email}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSignOutConfirm(true)}
          className="px-4 py-2.5 rounded-xl border border-status-error/30 text-status-error hover:bg-status-error-light text-xs font-bold flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-float border border-border">
            <h2 className="text-lg font-bold text-navy">Edit Profile & Preferences</h2>
            <p className="text-xs text-text-secondary mt-1">
              Customize your study cycle defaults and profile name.
            </p>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Default Focus Duration (Minutes)
                </label>
                <select
                  value={editFocusDuration}
                  onChange={(e) => setEditFocusDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={15}>15 minutes</option>
                  <option value={25}>25 minutes (Standard Pomodoro)</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Default Break Duration (Minutes)
                </label>
                <select
                  value={editBreakDuration}
                  onChange={(e) => setEditBreakDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={3}>3 minutes (Micro break)</option>
                  <option value={5}>5 minutes (Standard break)</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes (Long break)</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border-subtle">
                <span className="text-xs font-bold text-navy">Chime Sound Effects</span>
                <input
                  type="checkbox"
                  checked={editSoundEnabled}
                  onChange={(e) => setEditSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Session History?"
        message="This action will permanently delete all completed study sessions from your device. Your total focused hours will be reset."
        confirmLabel="Clear History"
        cancelLabel="Keep History"
        onConfirm={() => {
          onClearHistory();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showSignOutConfirm}
        title="Sign Out of Study Break Timer?"
        message="Are you sure you want to sign out? Your saved sessions on this device will remain intact."
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        isDestructive={false}
        onConfirm={() => {
          onSignOut();
          setShowSignOutConfirm(false);
        }}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </div>
  );
};
