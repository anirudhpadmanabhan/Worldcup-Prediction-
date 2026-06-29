import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Mail, Lock, ShieldCheck, Chrome, ArrowRight, UserCheck } from "lucide-react";
import { UserProfile, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { audioSynth } from "../utils/audio";

interface LoginModalProps {
  onSuccess: (user: UserProfile) => void;
  onClose: () => void;
  lang: LanguageCode;
}

export default function LoginModal({ onSuccess, onClose, lang }: LoginModalProps) {
  const [email, setEmail] = useState(""); // This holds email or mobile number
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = TRANSLATIONS[lang];

  const handleInitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username) {
      setError("Please fill in all credentials");
      return;
    }
    setError("");
    setLoading(true);
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the 4-digit code");
      return;
    }
    setError("");
    setLoading(true);
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        uid: "user_" + Math.random().toString(36).substr(2, 9),
        name: username,
        email: email, // This has either email or mobile number
        avatar: "⚽",
        isLoggedIn: true,
        xp: 120,
        coins: 45,
        level: 1,
        badges: ["Pioneer Predictor"],
        dailyStreak: 1,
      };
      onSuccess(user);
    }, 1500);
  };

  const handleThirdPartyLogin = (provider: "Google" | "Apple") => {
    setLoading(true);
    setError("");
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        uid: "user_social",
        name: provider === "Google" ? "Anirudh P (Admin)" : "Apple Fan",
        email: provider === "Google" ? "anirudhpkndl@gmail.com" : "appleuser@icloud.com",
        avatar: provider === "Google" ? "👑" : "🍏",
        isLoggedIn: true,
        xp: 350,
        coins: 120,
        level: 3,
        badges: ["Platform Creator", "Legend Predictor"],
        dailyStreak: 3,
      };
      onSuccess(user);
    }, 1500);
  };

  const handleGuestMode = () => {
    audioSynth.playSelection();
    const guestUser: UserProfile = {
      uid: "guest_" + Math.random().toString(36).substr(2, 9),
      name: "Guest Predictor",
      email: "guest@example.com",
      avatar: "👤",
      isLoggedIn: false, // Guest is un-authenticated
      xp: 0,
      coins: 0,
      level: 1,
      badges: [],
      dailyStreak: 0,
    };
    onSuccess(guestUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="max-w-md w-full bg-neutral-900/90 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-2xl text-left"
      >
        {/* Spotlight Accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Head */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              Prediction Cloud Sync
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Secures your bracket & unlocks leaderboards
            </p>
          </div>
        </div>

        {/* Educational Policy Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4 text-xs space-y-2 text-neutral-300">
          <div className="flex items-center gap-1.5 text-yellow-400 font-extrabold uppercase tracking-wide font-mono">
            <span>ℹ️ Important Prediction Rule</span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed">
            To store your tournament prediction permanently, please sign in with an <strong className="text-white">Email Address</strong> or <strong className="text-white">Mobile Number</strong>.
          </p>
          <p className="font-mono text-[10px] text-yellow-400/90 leading-normal border-t border-white/5 pt-1.5 mt-1.5">
            🔒 <strong>Limit:</strong> 1 tournament prediction per authenticated account is enforced to preserve competitive leaderboard integrity.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mb-4 font-mono">
            {error}
          </div>
        )}

        {/* Content Form Steps */}
        {step === "credentials" ? (
          <form onSubmit={handleInitLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                {t.username}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Captain_Kane"
                  className="w-full bg-neutral-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                Email or Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com or +91 9876543210"
                  className="w-full bg-neutral-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-500 text-black font-extrabold text-xs tracking-wider rounded-xl hover:bg-yellow-400 transition cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Get OTP Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center py-2">
              <span className="text-xs text-neutral-400">
                We sent a 4-digit verification code to <span className="text-yellow-400 font-bold">{email}</span>
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 text-center">
                {t.otp}
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="w-28 mx-auto block text-center bg-neutral-950/80 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-yellow-400 tracking-widest outline-none focus:border-yellow-500/50 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Verify & Sync Bracket <UserCheck className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="text-center block mx-auto text-xs text-neutral-400 hover:text-white underline"
            >
              Back to credentials
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-neutral-900 px-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleThirdPartyLogin("Google")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 bg-neutral-950 border border-white/5 rounded-xl text-xs text-white hover:border-yellow-500/30 transition cursor-pointer"
          >
            <Chrome className="w-4 h-4 text-red-400" />
            Google
          </button>
          <button
            onClick={() => handleThirdPartyLogin("Apple")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 bg-neutral-950 border border-white/5 rounded-xl text-xs text-white hover:border-yellow-500/30 transition cursor-pointer"
          >
            <span className="text-sm">🍏</span>
            Apple Login
          </button>
        </div>

        {/* Guest Mode option */}
        <button
          onClick={handleGuestMode}
          className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-xs text-neutral-400 hover:text-white hover:border-white/20 transition cursor-pointer text-center block"
        >
          {t.guestMode}
        </button>
      </motion.div>
    </div>
  );
}
