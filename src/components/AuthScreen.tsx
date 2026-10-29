import React, { useState } from "react";
import { Timer, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { UserProfile } from "@/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { storageService, DEFAULT_DEMO_USER } from "@/lib/storage";

interface AuthScreenProps {
  onAuthenticated: (profile: UserProfile) => void;
  onExploreGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  onExploreGuest,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic validation
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (authMode === "signin") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              displayName: data.user.user_metadata?.display_name || email.split("@")[0],
              preferences: DEFAULT_DEMO_USER.preferences,
              isDemoUser: false,
              createdAt: data.user.created_at,
            };
            storageService.saveUserProfile(profile);
            onAuthenticated(profile);
          }
        } else {
          // Sign up
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName.trim() || email.split("@")[0],
              },
            },
          });
          if (error) throw error;
          if (data.user) {
            setSuccessMsg("Account created! Check your email for confirmation, or sign in now.");
            setAuthMode("signin");
          }
        }
      } else {
        // Honest Local Demo Mode
        setTimeout(() => {
          const profile: UserProfile = {
            id: `local_${Date.now()}`,
            email: email.trim(),
            displayName: (displayName.trim() || email.split("@")[0] || "Student"),
            preferences: DEFAULT_DEMO_USER.preferences,
            isDemoUser: true,
            createdAt: new Date().toISOString(),
          };
          storageService.saveUserProfile(profile);
          onAuthenticated(profile);
          setLoading(false);
        }, 500);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "An authentication error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        "Google OAuth requires Supabase backend credentials. You can sign in using local demo mode below or continue as Guest!"
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "Google sign in failed.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotStatus("Please enter a valid email address.");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.resetPasswordForEmail(forgotEmail).then(({ error }) => {
        if (error) {
          setForgotStatus(`Error: ${error.message}`);
        } else {
          setForgotStatus("Password reset link sent to your email!");
        }
      });
    } else {
      setForgotStatus(
        `Demo mode: In production, a reset link would be sent to ${forgotEmail}. You can sign in with any password in demo mode.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Stopwatch Brand Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-card transform hover:scale-105 transition-all">
            <Timer className="w-9 h-9" />
          </div>
        </div>

        <h1 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
          Welcome
        </h1>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Sign in or create an account to focus better.
        </p>

        {/* Demo Mode Notice Banner */}
        {!isSupabaseConfigured && (
          <div className="mt-4 p-3 rounded-xl bg-primary-light/60 border border-primary/20 flex items-start gap-2.5 text-xs text-navy">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Local Demo Mode Active:</strong> No cloud setup required. Test account creation, study timer, and session tracking locally with instant access!
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-border sm:px-10">
          {/* Segmented Sign In / Sign Up Switch */}
          <div className="flex bg-surface-soft p-1 rounded-xl border border-border-subtle mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                authMode === "signin"
                  ? "bg-white text-navy shadow-subtle"
                  : "text-text-secondary hover:text-navy"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                authMode === "signup"
                  ? "bg-white text-navy shadow-subtle"
                  : "text-text-secondary hover:text-navy"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-status-error-light border border-status-error/20 text-xs text-status-error font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-status-success-light border border-status-success/20 text-xs text-status-success font-medium">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-navy text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-navy text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                  Password
                </label>
                {authMode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(email);
                      setForgotStatus(null);
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-white text-navy text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-navy focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authMode === "signup" && (
                <p className="mt-1.5 text-[11px] text-text-secondary">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-sm font-semibold shadow-subtle flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="w-full border-t border-border-subtle" />
            <span className="px-3 text-xs uppercase font-bold text-text-muted">OR</span>
            <span className="w-full border-t border-border-subtle" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl border border-border bg-white hover:bg-surface-soft active:scale-[0.99] text-navy text-sm font-semibold flex items-center justify-center gap-3 shadow-subtle transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 6.5 10.4 6.5z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Guest / Exploration Option */}
          <div className="mt-4 pt-4 border-t border-border-subtle text-center">
            <button
              type="button"
              onClick={onExploreGuest}
              className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Or explore as guest without signing in</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-float border border-border">
            <h3 className="text-lg font-bold text-navy">Reset Password</h3>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {forgotStatus && (
                <p className="text-xs text-text-primary p-2.5 rounded-lg bg-surface-soft border border-border-subtle">
                  {forgotStatus}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-navy rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
