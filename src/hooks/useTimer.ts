import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode, TimerStatus, StudySession } from "@/types";
import { storageService } from "@/lib/storage";
import { audioManager } from "@/lib/audio";

interface UseTimerProps {
  onSessionComplete: (session: StudySession) => void;
  soundEnabled: boolean;
  defaultFocusMinutes: number;
  defaultBreakMinutes: number;
  userId?: string;
}

export function useTimer({
  onSessionComplete,
  soundEnabled,
  defaultFocusMinutes,
  defaultBreakMinutes,
  userId,
}: UseTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [status, setStatus] = useState<TimerStatus>("ready");
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(defaultFocusMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultFocusMinutes * 60);
  const [taskTitle, setTaskTitle] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // References for robust timestamp tracking
  const targetEndTimeRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  // Clear running tick interval
  const clearTick = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Handle completion
  const handleCompletion = useCallback(
    (currentMode: TimerMode) => {
      clearTick();
      targetEndTimeRef.current = null;
      storageService.saveActiveTimerState(null);

      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;

      if (currentMode === "focus") {
        setStatus("focus_completed");
        if (soundEnabled) {
          audioManager.playFocusCompleteChime();
        }

        const completedAt = new Date().toISOString();
        const startedAt = sessionStartTimeRef.current || new Date(Date.now() - totalDurationSeconds * 1000).toISOString();

        const completedSession: StudySession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          taskTitle: taskTitle.trim() || undefined,
          plannedDurationSeconds: totalDurationSeconds,
          actualDurationSeconds: totalDurationSeconds,
          startedAt,
          completedAt,
          status: "completed",
          createdAt: completedAt,
        };

        onSessionComplete(completedSession);
      } else {
        setStatus("break_completed");
        if (soundEnabled) {
          audioManager.playBreakCompleteChime();
        }
      }
    },
    [clearTick, onSessionComplete, soundEnabled, totalDurationSeconds, taskTitle, userId]
  );

  // Tick step using Date.now() comparison
  const checkTick = useCallback(() => {
    if (!targetEndTimeRef.current) return;

    const now = Date.now();
    const diffMs = targetEndTimeRef.current - now;
    const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

    setRemainingSeconds(diffSecs);

    if (diffSecs <= 0) {
      handleCompletion(mode);
    }
  }, [handleCompletion, mode]);

  // Start countdown interval
  const startInterval = useCallback(() => {
    clearTick();
    timerIntervalRef.current = setInterval(checkTick, 250);
  }, [checkTick, clearTick]);

  // Start or resume timer
  const startTimer = useCallback(() => {
    if (status === "focus_running" || status === "break_running") return; // Prevent double start

    hasCompletedRef.current = false;
    const now = Date.now();
    const targetEnd = now + remainingSeconds * 1000;
    targetEndTimeRef.current = targetEnd;

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date(now).toISOString();
    }

    const nextStatus = mode === "focus" ? "focus_running" : "break_running";
    setStatus(nextStatus);

    storageService.saveActiveTimerState({
      mode,
      status: nextStatus,
      targetEndTime: targetEnd,
      remainingSeconds,
      totalDurationSeconds,
      taskTitle,
      startedAt: sessionStartTimeRef.current,
    });

    startInterval();
  }, [mode, remainingSeconds, startInterval, status, taskTitle, totalDurationSeconds]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!targetEndTimeRef.current) return;

    clearTick();
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
    targetEndTimeRef.current = null;
    setRemainingSeconds(diff);

    const nextStatus = mode === "focus" ? "focus_paused" : "break_paused";
    setStatus(nextStatus);

    storageService.saveActiveTimerState({
      mode,
      status: nextStatus,
      targetEndTime: null,
      remainingSeconds: diff,
      totalDurationSeconds,
      taskTitle,
      startedAt: sessionStartTimeRef.current || new Date().toISOString(),
    });
  }, [clearTick, mode, taskTitle, totalDurationSeconds]);

  // Resume paused timer
  const resumeTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  // Reset timer
  const resetTimer = useCallback(
    (force = false) => {
      // If active progress would be lost, require confirmation unless forced
      const isRunningOrPaused =
        status === "focus_running" ||
        status === "focus_paused" ||
        status === "break_running" ||
        status === "break_paused";

      if (isRunningOrPaused && !force && remainingSeconds < totalDurationSeconds - 5) {
        setShowResetConfirm(true);
        return;
      }

      clearTick();
      targetEndTimeRef.current = null;
      sessionStartTimeRef.current = null;
      hasCompletedRef.current = false;
      setShowResetConfirm(false);

      const defaultSecs = mode === "focus" ? defaultFocusMinutes * 60 : defaultBreakMinutes * 60;
      setTotalDurationSeconds(defaultSecs);
      setRemainingSeconds(defaultSecs);
      setStatus("ready");
      storageService.saveActiveTimerState(null);
    },
    [clearTick, defaultBreakMinutes, defaultFocusMinutes, mode, remainingSeconds, status, totalDurationSeconds]
  );

  // Set preset duration
  const setPresetDuration = useCallback(
    (minutes: number) => {
      if (status === "focus_running" || status === "break_running") return;
      const secs = Math.max(60, minutes * 60);
      setTotalDurationSeconds(secs);
      setRemainingSeconds(secs);
      setStatus("ready");
      sessionStartTimeRef.current = null;
      storageService.saveActiveTimerState(null);
    },
    [status]
  );

  // Set custom duration (minutes and seconds)
  const setCustomDuration = useCallback(
    (minutes: number, seconds = 0) => {
      if (status === "focus_running" || status === "break_running") return;
      const totalSecs = Math.max(30, minutes * 60 + seconds);
      setTotalDurationSeconds(totalSecs);
      setRemainingSeconds(totalSecs);
      setStatus("ready");
      sessionStartTimeRef.current = null;
      storageService.saveActiveTimerState(null);
    },
    [status]
  );

  // Switch to Break Mode
  const startBreak = useCallback(
    (breakMinutes = defaultBreakMinutes) => {
      clearTick();
      targetEndTimeRef.current = null;
      hasCompletedRef.current = false;
      const breakSecs = breakMinutes * 60;
      setMode("break");
      setTotalDurationSeconds(breakSecs);
      setRemainingSeconds(breakSecs);
      setStatus("break_running");

      const now = Date.now();
      const targetEnd = now + breakSecs * 1000;
      targetEndTimeRef.current = targetEnd;
      sessionStartTimeRef.current = new Date(now).toISOString();

      storageService.saveActiveTimerState({
        mode: "break",
        status: "break_running",
        targetEndTime: targetEnd,
        remainingSeconds: breakSecs,
        totalDurationSeconds: breakSecs,
        taskTitle: "Restorative Break",
        startedAt: sessionStartTimeRef.current,
      });

      startInterval();
    },
    [clearTick, defaultBreakMinutes, startInterval]
  );

  // Skip or end break early -> return to Study
  const returnToStudy = useCallback(() => {
    clearTick();
    targetEndTimeRef.current = null;
    sessionStartTimeRef.current = null;
    hasCompletedRef.current = false;
    setMode("focus");
    const focusSecs = defaultFocusMinutes * 60;
    setTotalDurationSeconds(focusSecs);
    setRemainingSeconds(focusSecs);
    setStatus("ready");
    storageService.saveActiveTimerState(null);
  }, [clearTick, defaultFocusMinutes]);

  // Handle visibility change (tab switches, device sleep/wake)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;

      // User returned to tab
      if (targetEndTimeRef.current) {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          handleCompletion(mode);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [handleCompletion, mode]);

  // Restore interrupted session from storage on initial mount
  useEffect(() => {
    const saved = storageService.getActiveTimerState();
    if (saved) {
      setMode(saved.mode);
      setTaskTitle(saved.taskTitle || "");
      setTotalDurationSeconds(saved.totalDurationSeconds);

      if (saved.targetEndTime) {
        // Was running when page closed/refreshed
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((saved.targetEndTime - now) / 1000));

        if (diff > 0) {
          targetEndTimeRef.current = saved.targetEndTime;
          sessionStartTimeRef.current = saved.startedAt;
          setRemainingSeconds(diff);
          setStatus(saved.status as TimerStatus);
          startInterval();
        } else {
          // Completed while page was away
          setRemainingSeconds(0);
          handleCompletion(saved.mode);
        }
      } else {
        // Was paused
        setRemainingSeconds(saved.remainingSeconds);
        setStatus(saved.status as TimerStatus);
      }
    }
  }, [handleCompletion, startInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTick();
    };
  }, [clearTick]);

  // Progress percentage (0 to 100)
  const progressPercent =
    totalDurationSeconds > 0
      ? Math.min(100, Math.max(0, ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
      : 0;

  return {
    mode,
    status,
    totalDurationSeconds,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
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
  };
}
