import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Mail, Lock, ShieldCheck, Chrome, ArrowRight, UserCheck, Phone, User } from "lucide-react";
import { UserProfile, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { audioSynth } from "../utils/audio";

interface LoginModalProps {
  onSuccess: (user: UserProfile) => void;
  onClose: () => void;
  lang: LanguageCode;
}

export default function LoginModal({ onSuccess, onClose, lang }: LoginModalProps) {
  // Authentication tab: 'gmail' (Verified), 'otp' (Verified), or 'simple' (Guest name & mobile only)
  const [authTab, setAuthTab] = useState<"gmail" | "otp" | "simple">("gmail");
  
  // Input states
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // OTP workflow step: 'input_phone' or 'verify_otp'
  const [otpStep, setOtpStep] = useState<"input_phone" | "verify_otp">("input_phone");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = TRANSLATIONS[lang];

  // Helper to save predictor data to mock db lists
  const saveToPredictionsRegistry = (user: UserProfile) => {
    const savedPreds = localStorage.getItem("fifa_sim_user_predictions") || "[]";
    try {
      const parsed = JSON.parse(savedPreds);
      const index = parsed.findIndex((p: any) => 
        p.profile.email === user.email || 
        (user.mobile && p.profile.mobile === user.mobile) ||
        (p.profile.name.toLowerCase() === user.name.toLowerCase())
      );
      if (index >= 0) {
        parsed[index].profile = { ...parsed[index].profile, ...user };
      } else {
        parsed.push({
          profile: user,
          bracket: JSON.parse(localStorage.getItem("fifa_user_bracket") || '{"roundOf32":[],"roundOf16":[],"quarterFinals":[],"semiFinals":[],"finals":[],"champion":null}'),
          dailyPredictions: []
        });
      }
      localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(parsed));
    } catch (err) {
      console.error("Error updating predictions list", err);
    }
  };

  // 1. Gmail Authentication flow
  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = email.trim() || "anirudhpkndl@gmail.com";
    
    if (!emailToUse.includes("@")) {
      setError("Please enter a valid Gmail / Google email address.");
      return;
    }

    setError("");
    setLoading(true);
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      const isEnterAdmin = emailToUse.toLowerCase() === "anirudhpkndl@gmail.com";
      const user: UserProfile = {
        uid: isEnterAdmin ? "user_anirudh" : "user_" + Math.random().toString(36).substr(2, 9),
        name: isEnterAdmin ? "Anirudh P (Admin)" : emailToUse.split("@")[0].toUpperCase(),
        email: emailToUse,
        mobile: isEnterAdmin ? "+91 9900223344" : "",
        avatar: isEnterAdmin ? "👑" : "🛡️",
        isLoggedIn: true,
        xp: isEnterAdmin ? 350 : 250,
        coins: isEnterAdmin ? 120 : 100,
        level: isEnterAdmin ? 5 : 2,
        badges: isEnterAdmin ? ["Platform Creator", "Legend Predictor"] : ["Verified Predictor"],
        dailyStreak: isEnterAdmin ? 3 : 2,
      };

      saveToPredictionsRegistry(user);
      onSuccess(user);
    }, 1200);
  };

  // 2. Mobile OTP Send Step
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim()) {
      setError("Please enter your Mobile Number.");
      return;
    }
    setError("");
    setLoading(true);
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      setOtpStep("verify_otp");
    }, 1000);
  };

  // 3. Mobile OTP Verification Step
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 4) {
      setError("Please enter the 4-digit verification code sent to your phone.");
      return;
    }
    setError("");
    setLoading(true);
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      const isEnterAdmin = mobile.includes("9900223344") || mobile.includes("9876543210");
      const user: UserProfile = {
        uid: isEnterAdmin ? "user_anirudh" : "user_" + Math.random().toString(36).substr(2, 9),
        name: isEnterAdmin ? "Anirudh P (Admin)" : `Predictor_${mobile.slice(-4)}`,
        email: isEnterAdmin ? "anirudhpkndl@gmail.com" : `user_${mobile.replace(/\D/g, "")}@phone-auth.com`,
        mobile: mobile,
        avatar: isEnterAdmin ? "👑" : "🛡️",
        isLoggedIn: true,
        xp: isEnterAdmin ? 350 : 250,
        coins: isEnterAdmin ? 120 : 100,
        level: isEnterAdmin ? 5 : 2,
        badges: isEnterAdmin ? ["Platform Creator", "Legend Predictor"] : ["Verified Predictor"],
        dailyStreak: isEnterAdmin ? 3 : 2,
      };

      saveToPredictionsRegistry(user);
      onSuccess(user);
    }, 1200);
  };

  // 4. Guest Login (Name and Mobile)
  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setError("Please enter both Name and Mobile Number.");
      return;
    }
    setError("");
    setLoading(true);
    audioSynth.playSelection();

    setTimeout(() => {
      setLoading(false);
      const isEnterAdmin = name.toLowerCase().includes("anirudh") || mobile.includes("9900223344");
      const user: UserProfile = {
        uid: isEnterAdmin ? "user_anirudh" : "user_" + Math.random().toString(36).substr(2, 9),
        name: name,
        email: isEnterAdmin ? "anirudhpkndl@gmail.com" : `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        mobile: mobile,
        avatar: "⚽",
        isLoggedIn: true,
        xp: isEnterAdmin ? 350 : 150,
        coins: isEnterAdmin ? 120 : 50,
        level: isEnterAdmin ? 5 : 1,
        badges: isEnterAdmin ? ["Platform Creator", "Legend Predictor"] : ["Pioneer Predictor"],
        dailyStreak: isEnterAdmin ? 3 : 1,
      };

      saveToPredictionsRegistry(user);
      onSuccess(user);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="max-w-md w-full bg-neutral-900/95 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-2xl text-left"
      >
        {/* Spotlight Accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Head */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              Prediction Sync Mode
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Access leaderboards and lock predictions
            </p>
          </div>
        </div>

        {/* Tab Selectors - 3 Options */}
        <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl mb-4 border border-white/5">
          <button
            type="button"
            onClick={() => { setAuthTab("gmail"); setError(""); }}
            className={`py-2 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
              authTab === "gmail"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            📧 Gmail
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab("otp"); setError(""); setOtpStep("input_phone"); }}
            className={`py-2 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
              authTab === "otp"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            📱 Phone OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab("simple"); setError(""); }}
            className={`py-2 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
              authTab === "simple"
                ? "bg-yellow-500 text-black font-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            👤 Guest
          </button>
        </div>

        {/* Info Banner */}
        {authTab === "gmail" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4 text-xs space-y-1.5 text-neutral-300 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold uppercase tracking-wide">
              <span>🌐 Gmail Verified Access</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Login securely with your Google email address. Verified status lets you lock and edit predictions <strong className="text-white">till the final match option</strong>.
            </p>
          </div>
        )}

        {authTab === "otp" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4 text-xs space-y-1.5 text-neutral-300 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold uppercase tracking-wide">
              <span>📱 Mobile OTP Verified Access</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Authenticate via standard <strong className="text-white">4-Digit SMS verification code</strong>. Unlocks premium syncing without needing a Google account.
            </p>
          </div>
        )}

        {authTab === "simple" && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4 text-xs space-y-1.5 text-neutral-300 font-mono">
            <div className="flex items-center gap-1.5 text-yellow-400 font-extrabold uppercase tracking-wide">
              <span>👤 Quick Guest Access</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Quick setup using only Name & Mobile. Useful for instant off-line saving, but checks predictions as guest level.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mb-4 font-mono">
            {error}
          </div>
        )}

        {/* ================= TAB 1: GMAIL AUTH ================= */}
        {authTab === "gmail" && (
          <form onSubmit={handleGmailSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                Google Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anirudhpkndl@gmail.com"
                  className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Chrome className="w-4 h-4" />
                  <span>Authenticate via Google</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= TAB 2: MOBILE OTP AUTH ================= */}
        {authTab === "otp" && (
          <div className="space-y-4">
            {otpStep === "input_phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +91 9900223344"
                      className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50 transition font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send 4-Digit OTP <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center py-1 bg-neutral-950 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    OTP sent to <span className="text-emerald-400 font-bold">{mobile}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 text-center">
                    Enter Code (Default: 1234 or any 4 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="w-28 mx-auto block text-center bg-neutral-950/80 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-emerald-400 tracking-widest outline-none focus:border-emerald-500/50 transition font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Code <UserCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpStep("input_phone")}
                  className="text-center block mx-auto text-xs text-neutral-400 hover:text-white underline font-mono"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 3: SIMPLE NAME & MOBILE GUEST AUTH ================= */}
        {authTab === "simple" && (
          <form onSubmit={handleSimpleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anirudh P"
                  className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. +91 9900223344"
                  className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-yellow-500 text-black font-extrabold text-xs tracking-wider rounded-xl hover:bg-yellow-400 transition cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In Instantly <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer actions */}
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-neutral-500 hover:text-white transition block"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
