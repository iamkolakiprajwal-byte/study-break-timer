import React from "react";
import { Timer, User, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "timer" | "profile";
  onTabChange: (tab: "timer" | "profile") => void;
  completedTodayCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  completedTodayCount,
}) => {
  return (
    <>
      {/* Top Header for Desktop & Mobile Branding */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border-subtle transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => onTabChange("timer")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-subtle">
              <Timer className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <div>
              <span className="font-bold text-navy text-lg tracking-tight block leading-tight">
                Study Break Timer
              </span>
              <span className="text-[11px] text-text-secondary font-medium hidden sm:block">
                Focus with ease &bull; Rest with purpose
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Today's Focus Counter Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft border border-border-subtle text-xs font-semibold text-navy">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>
                Today: <strong className="text-primary">{completedTodayCount}</strong> {completedTodayCount === 1 ? "session" : "sessions"}
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-surface-soft p-1 rounded-xl border border-border-subtle">
              <button
                type="button"
                onClick={() => onTabChange("timer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "timer"
                    ? "bg-white text-primary shadow-subtle"
                    : "text-text-secondary hover:text-navy"
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>Timer</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange("profile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-white text-primary shadow-subtle"
                    : "text-text-secondary hover:text-navy"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (matches Reference 2 & 3) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-subtle py-2 px-6 flex items-center justify-around shadow-float"
      >
        <button
          type="button"
          onClick={() => onTabChange("timer")}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            activeTab === "timer"
              ? "text-primary font-bold scale-105"
              : "text-text-secondary hover:text-navy font-medium"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl ${
              activeTab === "timer" ? "bg-primary-light" : "bg-transparent"
            }`}
          >
            <Timer className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Timer</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            activeTab === "profile"
              ? "text-primary font-bold scale-105"
              : "text-text-secondary hover:text-navy font-medium"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl ${
              activeTab === "profile" ? "bg-primary-light" : "bg-transparent"
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Profile</span>
        </button>
      </nav>
    </>
  );
};
