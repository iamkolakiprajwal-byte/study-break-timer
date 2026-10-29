import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Plus,
  BookOpen,
  Droplets,
  Heart,
  Eye,
  Wind,
  Footprints,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useTimer } from "@/hooks/useTimer";
import { StudySession, UserProfile } from "@/types";
import { ConfirmModal } from "./ConfirmModal";

interface TimerScreenProps {
  userProfile: UserProfile;
  todaySessions: StudySession[];
  onSessionComplete: (session: StudySession) => void;
  onOpenProfile: () => void;
  onUpdateSoundPreference: (enabled: boolean) => void;
}

const PRESETS = [15, 25, 30, 45, 60];

const BREAK_SUGGESTIONS = [
  {
    icon: Droplets,
    title: "Hydrate",
    text: "Drink a tall glass of cool water.",
  },
  {
    icon: Eye,
    title: "Rest Your Eyes",
    text: "Look at something 20 feet away for 20 seconds.",
  },
  {
    icon: Heart,
    title: "Stretch",
    text: "Roll your shoulders and gently stretch your neck.",
  },
  {
    icon: Footprints,
    title: "Move Around",
    text: "Stand up, stretch your legs, or walk around the room.",
  },
  {
    icon: Wind,
    title: "Deep Breaths",
    text: "Take 3 to 5 slow, restorative belly breaths.",
  },
];

export const TimerScreen: React.FC<TimerScreenProps> = ({
  userProfile,
  todaySessions,
  onSessionComplete,
  onOpenProfile,
  onUpdateSoundPreference,
}) => {
  const soundEnabled = userProfile.preferences.soundEnabled;
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState("20");
  const [activeBreakSuggestionIndex] = useState(() =>
    Math.floor(Math.random() * BREAK_SUGGESTIONS.length)
  );

  // Hook handles precise timestamp math & state
  const {
    mode,
    status,
    totalDurationSeconds,
    remainingSeconds,
    formattedTime,
    progressPercent,
    taskTitle,
    setTaskTitle,
    showResetConfirm,
    setShowResetConfirm,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setPresetDuration,
    setCustomDuration,
    startBreak,
    returnToStudy,
  } = useTimer({
    onSessionComplete: (session) => {
      onSessionComplete(session);
      // Trigger confetti celebration on completed focus session
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#2878E8", "#8ABEFF", "#24865B", "#14233D"],
        });
      } catch {
        // Safe fallback
      }
    },
    soundEnabled,
    defaultFocusMinutes: userProfile.preferences.defaultFocusDurationMinutes,
    defaultBreakMinutes: userProfile.preferences.defaultBreakDurationMinutes,
    userId: userProfile.id,
  });

  // Calculate today's focused time
  const todayFocusedMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.actualDurationSeconds, 0) / 60
  );

  const isRunning = status === "focus_running" || status === "break_running";
  const isPaused = status === "focus_paused" || status === "break_paused";
  const isFocusCompleted = status === "focus_completed";
  const isBreakCompleted = status === "break_completed";
  const isFocusMode = mode === "focus";

  // SVG Circular progress values
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  // Progress ring decreases as time counts down
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentSuggestion = BREAK_SUGGESTIONS[activeBreakSuggestionIndex];
  const SuggestionIcon = currentSuggestion.icon;

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 180) {
      setCustomDuration(mins);
      setShowCustomModal(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
      {/* Top Greeting & Today Stats Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-base hover:ring-2 hover:ring-primary/40 transition-all flex-shrink-0"
            title="Open profile"
          >
            {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : "U"}
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-navy leading-tight">
              Hello, {userProfile.displayName || "Student"} 👋
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Ready to accomplish your study goals today?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block">
              Today&apos;s Focus
            </span>
            <span className="text-sm font-extrabold text-navy">
              {todayFocusedMinutes} mins <span className="text-text-muted text-xs">({todaySessions.length} done)</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSoundPreference(!soundEnabled)}
            className="p-2.5 rounded-xl border border-border-subtle bg-surface-soft text-text-secondary hover:text-navy hover:bg-white transition-colors"
            title={soundEnabled ? "Mute chimes" : "Enable chimes"}
            aria-label={soundEnabled ? "Mute chimes" : "Enable chimes"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-text-muted" />}
          </button>
        </div>
      </div>

      {/* Task Input (Optional, clearable) */}
      <div className="bg-white rounded-2xl p-4 border border-border shadow-subtle transition-all">
        <div className="flex items-center gap-2.5 mb-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <label htmlFor="task-input" className="text-xs font-bold text-navy uppercase tracking-wider">
            Current Study Task <span className="text-text-muted font-normal normal-case">(optional)</span>
          </label>
        </div>
        <div className="relative">
          <input
            id="task-input"
            type="text"
            value={taskTitle}
            disabled={isRunning}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Review Biology Chapter 2, Math problem set..."
            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border text-sm text-navy placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-soft disabled:text-text-secondary transition-all"
          />
          {taskTitle && !isRunning && (
            <button
              type="button"
              onClick={() => setTaskTitle("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-navy"
              aria-label="Clear task"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Duration Presets (Only editable when not running) */}
      {isFocusMode && !isFocusCompleted && (
        <div className="bg-white rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">
              Focus Duration
            </span>
            <span className="text-xs text-text-secondary">
              Selected: <strong className="text-primary">{Math.round(totalDurationSeconds / 60)} min</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESETS.map((minutes) => {
              const isSelected = totalDurationSeconds === minutes * 60;
              return (
                <button
                  key={minutes}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setPresetDuration(minutes)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-subtle ring-2 ring-primary/30"
                      : "bg-surface-soft text-navy hover:bg-border-subtle disabled:opacity-50"
                  }`}
                >
                  {minutes}m
                </button>
              );
            })}
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setShowCustomModal(true)}
              className="py-2 px-2 rounded-xl text-xs font-bold border border-dashed border-border text-text-secondary hover:text-primary hover:border-primary disabled:opacity-50 flex items-center justify-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Timer Display Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-card flex flex-col items-center justify-center relative overflow-hidden">
        {/* State Badge */}
        <div className="mb-4">
          {status === "ready" && (
            <span className="px-3.5 py-1.5 rounded-full bg-surface-soft border border-border-subtle text-xs font-bold text-navy">
              Ready to Focus
            </span>
          )}
          {status === "focus_running" && (
            <span className="px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Focusing Session Active
            </span>
          )}
          {status === "focus_paused" && (
            <span className="px-3.5 py-1.5 rounded-full bg-status-warning-light text-status-warning text-xs font-bold">
              Session Paused
            </span>
          )}
          {status === "focus_completed" && (
            <span className="px-3.5 py-1.5 rounded-full bg-status-success-light text-status-success text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Focus Completed!
            </span>
          )}
          {status === "break_running" && (
            <span className="px-3.5 py-1.5 rounded-full bg-status-success-light text-status-success text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Coffee className="w-3.5 h-3.5" />
              Break in Progress
            </span>
          )}
          {status === "break_paused" && (
            <span className="px-3.5 py-1.5 rounded-full bg-status-warning-light text-status-warning text-xs font-bold">
              Break Paused
            </span>
          )}
          {status === "break_completed" && (
            <span className="px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-xs font-bold">
              Break Completed
            </span>
          )}
        </div>

        {/* Circular Progress & Digital Countdown */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-surface-soft"
            />
            {/* Progress ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={mode === "break" ? "#24865B" : "#2878E8"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-500 ease-linear"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-5xl sm:text-6xl font-extrabold text-navy tracking-tight font-mono select-none">
              {formattedTime}
            </span>

            {taskTitle ? (
              <span className="mt-2 text-xs font-medium text-text-secondary max-w-[200px] truncate" title={taskTitle}>
                {taskTitle}
              </span>
            ) : (
              <span className="mt-2 text-xs font-medium text-text-muted">
                {mode === "focus" ? "Study Session" : "Restorative Break"}
              </span>
            )}
          </div>
        </div>

        {/* Focus Completed Banner & Break Offer */}
        {isFocusCompleted && (
          <div className="w-full my-4 p-4 rounded-2xl bg-status-success-light border border-status-success/30 text-center animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-status-success text-white flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy">Great focus session!</h3>
            <p className="text-xs text-text-secondary mt-1">
              Your session was recorded. Take a 5-minute break to rest your mind.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => startBreak(5)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-status-success hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-subtle transition-all"
              >
                <Coffee className="w-4 h-4" />
                <span>Start 5-min Break</span>
              </button>
              <button
                type="button"
                onClick={returnToStudy}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border text-navy hover:bg-white text-xs font-semibold transition-all"
              >
                Skip Break & Continue
              </button>
            </div>
          </div>
        )}

        {/* Break Completed Banner */}
        {isBreakCompleted && (
          <div className="w-full my-4 p-4 rounded-2xl bg-primary-light border border-primary/30 text-center animate-fadeIn">
            <h3 className="text-base font-bold text-navy">Break time is over!</h3>
            <p className="text-xs text-text-secondary mt-1">
              Ready to dive back into your next study session?
            </p>
            <button
              type="button"
              onClick={returnToStudy}
              className="mt-3 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-all"
            >
              Start Next Focus Session
            </button>
          </div>
        )}

        {/* Break Mode Suggestions Card */}
        {mode === "break" && !isBreakCompleted && (
          <div className="w-full my-3 p-3.5 rounded-2xl bg-surface-soft border border-border-subtle flex items-center gap-3 animate-fadeIn">
            <div className="w-9 h-9 rounded-xl bg-status-success-light text-status-success flex items-center justify-center flex-shrink-0">
              <SuggestionIcon className="w-4 h-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-xs font-bold text-navy block leading-tight">
                Quick Suggestion: {currentSuggestion.title}
              </span>
              <span className="text-[11px] text-text-secondary leading-normal block">
                {currentSuggestion.text}
              </span>
            </div>
          </div>
        )}

        {/* Timer Control Buttons */}
        <div className="mt-6 flex items-center justify-center gap-4 w-full max-w-xs">
          {/* Reset Button */}
          <button
            type="button"
            onClick={() => resetTimer(false)}
            className="p-3.5 rounded-2xl border border-border bg-surface-soft hover:bg-white text-text-secondary hover:text-navy shadow-subtle transition-all active:scale-95"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Primary Action Button */}
          {status === "ready" && (
            <button
              type="button"
              onClick={startTimer}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-timer flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start</span>
            </button>
          )}

          {isRunning && (
            <button
              type="button"
              onClick={pauseTimer}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-navy hover:bg-navy-light text-white font-bold text-base shadow-subtle flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={resumeTimer}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-timer flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Resume</span>
            </button>
          )}

          {/* Break Early Exit */}
          {mode === "break" && !isBreakCompleted && (
            <button
              type="button"
              onClick={returnToStudy}
              className="px-3.5 py-3.5 rounded-2xl border border-border bg-white text-xs font-semibold text-text-secondary hover:text-navy transition-all"
              title="End break and return to study"
            >
              End Break
            </button>
          )}
        </div>
      </div>

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-float border border-border">
            <h3 className="text-base font-bold text-navy">Custom Focus Duration</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Enter target duration in minutes (1 - 180):
            </p>
            <form onSubmit={handleApplyCustomMinutes} className="mt-4 space-y-4">
              <div>
                <input
                  type="number"
                  min="1"
                  max="180"
                  required
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-center font-bold text-lg text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-subtle"
                >
                  Set Duration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Study Session?"
        message="You have an active session in progress. Resetting will discard this session's progress."
        confirmLabel="Reset Session"
        cancelLabel="Keep Going"
        onConfirm={() => resetTimer(true)}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
