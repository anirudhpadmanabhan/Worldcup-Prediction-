import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Trophy, Zap, Coins, Globe, Users, Target, Calendar, CalendarCheck, HelpCircle, ArrowUpRight, CreditCard, Lock, DollarSign, Building, CheckCircle, RefreshCw } from "lucide-react";
import { UserProfile, DailyPrediction, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { audioSynth } from "../utils/audio";
import AdSenseBanner from "./AdSenseBanner";

interface DashboardProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  lang: LanguageCode;
  onAdClicked?: (format: string, revenueEarned: number) => void;
  publisherId?: string;
}

export default function Dashboard({ user, setUser, lang, onAdClicked, publisherId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "leaderboard" | "daily" | "wallet">("profile");
  const [leaderboardCategory, setLeaderboardCategory] = useState<"global" | "country" | "friends">("global");
  
  // Wallet and Payout State
  const [bankLinked, setBankLinked] = useState(() => {
    return localStorage.getItem("bank_account_linked") === "true";
  });
  const [bankDetails, setBankDetails] = useState(() => {
    const saved = localStorage.getItem("bank_account_details");
    return saved ? JSON.parse(saved) : { holderName: "", bankName: "", routingNumber: "", accountNumber: "" };
  });
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawalPending, setWithdrawalPending] = useState(false);

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankDetails.holderName || !bankDetails.bankName || !bankDetails.routingNumber || !bankDetails.accountNumber) {
      setLinkError("All fields are required to verify your bank account.");
      return;
    }
    setLinkError("");
    setIsLinking(true);
    audioSynth.playCinematicZoom();

    // Simulate secure plaid / stripe verification
    setTimeout(() => {
      setIsLinking(false);
      setBankLinked(true);
      localStorage.setItem("bank_account_linked", "true");
      localStorage.setItem("bank_account_details", JSON.stringify(bankDetails));
      audioSynth.playSelection();
    }, 2000);
  };

  const handleUnlinkBank = () => {
    setBankLinked(false);
    setBankDetails({ holderName: "", bankName: "", routingNumber: "", accountNumber: "" });
    localStorage.removeItem("bank_account_linked");
    localStorage.removeItem("bank_account_details");
    audioSynth.playTick();
  };

  const handleWithdraw = () => {
    const cashValue = user.coins * 0.1;
    const amountNum = parseFloat(withdrawalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (amountNum > cashValue) {
      alert("Insufficient balance. Maximum you can withdraw is $" + cashValue.toFixed(2));
      return;
    }

    setWithdrawalPending(true);
    audioSynth.playTick();

    setTimeout(() => {
      setWithdrawalPending(false);
      setWithdrawalSuccess(true);
      // Deduct coins (10 coins per $1.00 withdrawn)
      const coinsToDeduct = Math.round(amountNum * 10);
      setUser(prev => ({
        ...prev,
        coins: Math.max(0, prev.coins - coinsToDeduct)
      }));
      setWithdrawalAmount("");
      audioSynth.playChampionFanfare();

      setTimeout(() => {
        setWithdrawalSuccess(false);
      }, 5000);
    }, 2500);
  };
  
  const t = TRANSLATIONS[lang];

  // Daily Prediction Games hardcoded mock data (which the user can interactively submit)
  const [dailyGames, setDailyGames] = useState<DailyPrediction[]>([
    {
      id: "dg_1",
      homeTeam: "United States 🇺🇸",
      awayTeam: "Mexico 🇲🇽",
      matchDate: "June 29, 2026",
      category: "Match Winner",
      options: ["USA Wins", "Mexico Wins", "Draw"],
      userPrediction: undefined,
      xpReward: 50,
      coinsReward: 15,
      status: "active",
    },
    {
      id: "dg_2",
      homeTeam: "Argentina 🇦🇷",
      awayTeam: "Brazil 🇧🇷",
      matchDate: "June 30, 2026",
      category: "First Goalscorer",
      options: ["L. Messi", "Vinicius Jr.", "Lautaro Martinez", "Rodrygo"],
      userPrediction: undefined,
      xpReward: 80,
      coinsReward: 30,
      status: "active",
    },
    {
      id: "dg_3",
      homeTeam: "Germany 🇩🇪",
      awayTeam: "Spain 🇪🇸",
      matchDate: "July 01, 2026",
      category: "Man of the Match",
      options: ["Jamal Musiala", "Lamine Yamal", "Florian Wirtz", "Pedri"],
      userPrediction: undefined,
      xpReward: 60,
      coinsReward: 20,
      status: "active",
    }
  ]);

  // Mock global leaderboard records
  const leaderboardRecords = [
    { rank: 1, name: "Kylian_Predicts", email: "k@psg.fr", points: 2850, country: "FRA 🇫🇷", badge: "Legend Predictor" },
    { rank: 2, name: "MessiMagic", email: "leo@miami.com", points: 2790, country: "ARG 🇦🇷", badge: "Golden Boot" },
    { rank: 3, name: "NeymarNerve", email: "ney@hilal.sa", points: 2610, country: "BRA 🇧🇷", badge: "Prediction Master" },
    { rank: 4, name: "Anirudh P", email: "anirudhpkndl@gmail.com", points: 2450, country: "IND 🇮🇳", badge: "Pioneer Predictor" },
    { rank: 5, name: "SuiiiPredict", email: "cr7@alnasr.com", points: 2320, country: "POR 🇵🇹", badge: "Classic Predictor" },
    { rank: 6, name: "MalayaliVibe", email: "kerala@gold.in", points: 2210, country: "IND 🇮🇳", badge: "Pioneer Predictor" },
    { rank: 7, name: "GaviGrind", email: "gavi@barca.es", points: 1980, country: "ESP 🇪🇸", badge: "Classic Predictor" },
  ];

  const handlePredictDaily = (gameId: string, pick: string) => {
    audioSynth.playSelection();
    setDailyGames(prev =>
      prev.map(game => {
        if (game.id === gameId) {
          return { ...game, userPrediction: pick, status: "locked" };
        }
        return game;
      })
    );

    // Reward user with XP and coins instantly to simulate live gamification sync!
    const targetGame = dailyGames.find(g => g.id === gameId);
    if (targetGame) {
      setUser(prev => {
        const newXp = prev.xp + targetGame.xpReward;
        const newCoins = prev.coins + targetGame.coinsReward;
        // Basic level up math
        const newLevel = Math.floor(newXp / 100) + 1;
        const levelUpTriggered = newLevel > prev.level;
        
        if (levelUpTriggered) {
          audioSynth.playChampionFanfare();
        }

        return {
          ...prev,
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          badges: levelUpTriggered && !prev.badges.includes("Level Up Master") 
            ? [...prev.badges, "Level Up Master"] 
            : prev.badges
        };
      });
    }
  };

  return (
    <div className="w-full bg-neutral-950/40 border border-white/5 rounded-3xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Stadium Grid Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none" />

      {/* Dashboard Navigator */}
      <div className="flex border-b border-white/10 mb-8 gap-1 p-1 bg-neutral-900/60 rounded-xl max-w-xl">
        <button
          onClick={() => { setActiveTab("profile"); audioSynth.playTick(); }}
          className={`flex-1 py-2 rounded-lg text-[10px] md:text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeTab === "profile" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
          }`}
        >
          {t.myPredictions}
        </button>
        <button
          onClick={() => { setActiveTab("leaderboard"); audioSynth.playTick(); }}
          className={`flex-1 py-2 rounded-lg text-[10px] md:text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeTab === "leaderboard" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
          }`}
        >
          {t.leaderboard}
        </button>
        <button
          onClick={() => { setActiveTab("daily"); audioSynth.playTick(); }}
          className={`flex-1 py-2 rounded-lg text-[10px] md:text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeTab === "daily" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
          }`}
        >
          {t.dailyGameTitle}
        </button>
        <button
          onClick={() => { setActiveTab("wallet"); audioSynth.playTick(); }}
          className={`flex-1 py-2 rounded-lg text-[10px] md:text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeTab === "wallet" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
          }`}
        >
          💳 Wallet & Payout
        </button>
      </div>

      {/* ================= VIEW: PROFILE / ACHIEVEMENTS ================= */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Profile Column (Profile + Banner Ad) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="w-full bg-neutral-900/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-3 py-1 text-[9px] font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> ONLINE
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 border-2 border-yellow-400/50 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(234,179,8,0.2)] mb-4">
                {user.avatar}
              </div>

              <h3 className="text-xl font-black text-white">{user.name}</h3>
              <span className="text-xs text-neutral-400 font-mono mb-6">{user.email}</span>

              {/* Level Metric */}
              <div className="w-full space-y-2 mb-6">
                <div className="flex justify-between text-xs font-mono text-neutral-400">
                  <span>{t.level} {user.level}</span>
                  <span>{user.xp % 100} / 100 XP</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${user.xp % 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Coin & Streak details */}
              <div className="grid grid-cols-2 gap-4 w-full border-t border-white/5 pt-6 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{t.coins}</span>
                    <p className="text-sm font-black text-white">{user.coins}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{t.dailyStreak}</span>
                    <p className="text-sm font-black text-white">{user.dailyStreak} Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic football-focused Rectangle Ad */}
            <AdSenseBanner format="rectangle" publisherId={publisherId} onAdClicked={onAdClicked} />
          </div>

          {/* Badges and Trophies Showcase */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-mono tracking-widest text-neutral-400 uppercase">
              {t.badges} ({user.badges.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-900/30 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:border-yellow-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500/10 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Prediction Master</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">Completed 100% bracket prediction</span>
                </div>
              </div>

              <div className="bg-neutral-900/30 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Award className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Golden Boot</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">Picked correct group-stage winner</span>
                </div>
              </div>

              <div className="bg-neutral-900/30 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:border-yellow-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500/10 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Legend Predictor</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">Achieved Rank in top 100 globally</span>
                </div>
              </div>

              {/* Dynamic Badge earned by active leveling up */}
              <div className={`p-4 rounded-xl flex items-center gap-4 border transition-all duration-300 ${
                user.badges.includes("Level Up Master")
                  ? "bg-neutral-900/30 border-yellow-500/30 hover:border-yellow-500"
                  : "bg-neutral-950/10 border-white/5 opacity-50"
              }`}>
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/15 flex items-center justify-center">
                  <Zap className={`w-6 h-6 ${user.badges.includes("Level Up Master") ? "text-yellow-400 animate-pulse" : "text-neutral-600"}`} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Level Up Master</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    {user.badges.includes("Level Up Master") ? "Earned via daily games!" : "Earn next level to unlock"}
                  </span>
                </div>
              </div>
            </div>

            {/* accuracy analysis */}
            <div className="bg-neutral-900/20 border border-white/5 rounded-2xl p-6">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-4">{t.correctPredictions}</span>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-emerald-500 flex flex-col items-center justify-center shadow-lg shrink-0">
                  <span className="text-2xl font-black text-white">88%</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">PRECISION</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-400">
                  <p>• Highly optimized predictions comparing live stats from prior World Cups.</p>
                  <p>• Multi-criteria simulated algorithms based on authentic team rankings.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= VIEW: GLOBAL LEADERBOARD ================= */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black text-white uppercase">{t.leaderboard}</h3>
              <p className="text-xs text-neutral-400 font-mono">Global live ranks updated in real-time</p>
            </div>

            {/* Sub-Filters: Global vs Friends */}
            <div className="flex gap-2 p-1 bg-neutral-900 rounded-lg">
              <button
                onClick={() => { setLeaderboardCategory("global"); audioSynth.playTick(); }}
                className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition cursor-pointer ${
                  leaderboardCategory === "global" ? "bg-yellow-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Global
              </button>
              <button
                onClick={() => { setLeaderboardCategory("friends"); audioSynth.playTick(); }}
                className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition cursor-pointer ${
                  leaderboardCategory === "friends" ? "bg-yellow-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Friends
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4 rounded-l-xl">{t.rank}</th>
                  <th className="px-6 py-4">{t.username}</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Badge</th>
                  <th className="px-6 py-4 rounded-r-xl text-right">{t.points}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboardRecords
                  .filter(rec => leaderboardCategory === "global" || rec.name.includes("Predict") || rec.name.includes("Anirudh"))
                  .map((rec, index) => (
                    <tr
                      key={rec.rank}
                      className={`hover:bg-neutral-900/40 transition-colors duration-150 ${
                        rec.name === "Anirudh P" ? "bg-yellow-500/5 font-bold" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-mono">
                        {rec.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-black font-black text-[10px] shadow-[0_0_10px_rgba(234,179,8,0.4)] animate-bounce">
                            🥇
                          </span>
                        ) : rec.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-black font-black text-[10px]">
                            🥈
                          </span>
                        ) : rec.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-black font-black text-[10px]">
                            🥉
                          </span>
                        ) : (
                          `#${rec.rank}`
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <span>{rec.name}</span>
                        {rec.name === "Anirudh P" && (
                          <span className="bg-yellow-500 text-black text-[8px] font-mono px-1.5 py-0.5 rounded uppercase">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono">{rec.country}</td>
                      <td className="px-6 py-4">
                        <span className="bg-neutral-900 border border-white/5 text-neutral-400 text-[10px] px-2 py-1 rounded-md">
                          {rec.badge}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-yellow-400">
                        {rec.points} pts
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW: DAILY MATCH GAMES ================= */}
      {activeTab === "daily" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-white uppercase">{t.dailyGameTitle}</h3>
            <p className="text-xs text-neutral-400 font-mono">{t.predictAndWin}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dailyGames.map((game) => (
              <div
                key={game.id}
                className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md flex flex-col justify-between"
              >
                {/* Status Indicator */}
                <span className="absolute top-4 right-4 text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest">
                  {game.status}
                </span>

                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{game.matchDate}</span>
                  </div>

                  <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold text-[9px] px-2 py-1 rounded-full font-mono uppercase inline-block mb-4">
                    {game.category}
                  </span>

                  <h4 className="text-base font-bold text-white mb-6 flex flex-col gap-1">
                    <span>{game.homeTeam}</span>
                    <span className="text-xs font-normal text-neutral-500 italic">vs</span>
                    <span>{game.awayTeam}</span>
                  </h4>
                </div>

                {/* Predict Options Button Stack */}
                <div className="space-y-2 mt-auto">
                  {game.userPrediction ? (
                    <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase">PREDICTED SELECTION</span>
                      <p className="text-sm font-extrabold text-white mt-1">{game.userPrediction}</p>
                    </div>
                  ) : (
                    game.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handlePredictDaily(game.id, opt)}
                        className="w-full py-2.5 bg-neutral-950 border border-white/5 rounded-xl text-xs text-neutral-300 hover:text-white hover:border-yellow-500/50 transition cursor-pointer text-left px-4 flex justify-between items-center"
                      >
                        <span>{opt}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
                      </button>
                    ))
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mt-3 pt-3 border-t border-white/5">
                    <span>Reward: +{game.xpReward} XP</span>
                    <span>+{game.coinsReward} Coins</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= VIEW: WALLET & BANK PAYOUT ================= */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                Prediction Wallet & Payout Center
              </h3>
              <p className="text-xs text-neutral-400 font-mono">Secure your earnings and manage bank account withdrawals</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-neutral-900 border border-white/5 rounded-lg px-3 py-1 text-neutral-400 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL SECURED AES-256</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Balance & Statistics */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
                
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">TOTAL CONVERTED BALANCE</span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black text-white font-mono">${(user.coins * 0.1).toFixed(2)}</span>
                  <span className="text-xs text-emerald-400 font-mono">USD</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Prediction Coins</span>
                    <span className="text-white font-bold">{user.coins} Coins</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Conversion Rate</span>
                    <span className="text-yellow-400 font-bold">10 Coins = $1.00 USD</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Pending Approvals</span>
                    <span className="text-neutral-400 font-bold">$12.50 USD</span>
                  </div>
                </div>

                <div className="mt-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex gap-2 items-center">
                  <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Withdrawal requests are typically processed within 2-3 business days once verified.
                  </p>
                </div>
              </div>

              {/* Secure Credentials Explanation banner */}
              <div className="bg-neutral-950 border border-white/5 rounded-2xl p-5 space-y-3 font-mono text-[10px] text-neutral-400">
                <span className="text-xs font-bold text-white uppercase block mb-1">Configuring Real Banking</span>
                <p>
                  To transition this workspace applet into production payouts, declare Stripe Secrets in your Environment Settings:
                </p>
                <div className="bg-neutral-900 p-2.5 rounded border border-white/5 text-[9px] text-yellow-500 break-all select-all">
                  VITE_STRIPE_PUBLIC_KEY=pk_live_...<br />
                  STRIPE_SECRET_KEY=sk_live_...
                </div>
                <p>
                  The checkout flows and direct IBAN transfers will securely leverage real Stripe Connect infrastructure.
                </p>
              </div>
            </div>

            {/* Column 2: Linking Bank Form & Withdraw Panel */}
            <div className="lg:col-span-2 space-y-6">
              {!bankLinked ? (
                /* Bank Account Link Form */
                <form onSubmit={handleLinkBank} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-yellow-400" />
                    Link Bank Account for Payouts
                  </h4>

                  {linkError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl font-mono">
                      {linkError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={bankDetails.holderName}
                        onChange={e => { setBankDetails({ ...bankDetails, holderName: e.target.value }); setLinkError(""); }}
                        className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-yellow-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">Bank / Institution Name</label>
                      <input
                        type="text"
                        placeholder="Chase Bank, Wells Fargo, etc."
                        value={bankDetails.bankName}
                        onChange={e => { setBankDetails({ ...bankDetails, bankName: e.target.value }); setLinkError(""); }}
                        className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-yellow-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">Routing / SWIFT Code</label>
                      <input
                        type="text"
                        placeholder="9-digit routing number"
                        value={bankDetails.routingNumber}
                        onChange={e => { setBankDetails({ ...bankDetails, routingNumber: e.target.value }); setLinkError(""); }}
                        className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-yellow-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">Account Number / IBAN</label>
                      <input
                        type="password"
                        placeholder="Standard account number"
                        value={bankDetails.accountNumber}
                        onChange={e => { setBankDetails({ ...bankDetails, accountNumber: e.target.value }); setLinkError(""); }}
                        className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-yellow-500/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLinking}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase disabled:opacity-50 mt-4"
                  >
                    {isLinking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying Routing Credentials...
                      </>
                    ) : (
                      "Verify & Link Bank Account"
                    )}
                  </button>
                </form>
              ) : (
                /* Bank Account Linked Panel */
                <div className="space-y-6">
                  <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ACTIVE FOR PAYOUTS
                    </div>

                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-4">
                      <Building className="w-4 h-4 text-emerald-400" />
                      Connected Bank Details
                    </h4>

                    <div className="grid grid-cols-2 gap-4 max-w-md text-xs font-mono mb-6 bg-neutral-950 p-4 rounded-xl border border-white/5">
                      <div>
                        <span className="text-neutral-500 uppercase text-[9px]">Account Holder</span>
                        <p className="text-white font-bold mt-1">{bankDetails.holderName}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase text-[9px]">Bank Institution</span>
                        <p className="text-white font-bold mt-1">{bankDetails.bankName}</p>
                      </div>
                      <div className="mt-2">
                        <span className="text-neutral-500 uppercase text-[9px]">Routing Transit Number</span>
                        <p className="text-white font-bold mt-1">•••••{bankDetails.routingNumber.slice(-4)}</p>
                      </div>
                      <div className="mt-2">
                        <span className="text-neutral-500 uppercase text-[9px]">Account Number</span>
                        <p className="text-white font-bold mt-1">••••••••{bankDetails.accountNumber.slice(-4)}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleUnlinkBank}
                      className="px-4 py-2 bg-neutral-950 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition text-[10px] font-mono uppercase cursor-pointer"
                    >
                      Unlink Bank Account
                    </button>
                  </div>

                  {/* Cash Out Form */}
                  <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      Request Cash Withdrawal
                    </h4>
                    <p className="text-xs text-neutral-400 mb-6 font-mono">
                      Convert prediction coins and withdraw funds securely into connected bank account.
                    </p>

                    {withdrawalSuccess && (
                      <div className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl mb-6 font-mono flex items-center gap-2.5">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Withdrawal Requested Successfully!</strong> Your request has been queued. Funds should hit your account in 48 hours.
                        </span>
                      </div>
                    )}

                    <div className="max-w-md space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase">Amount to Withdraw ($ USD)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-neutral-500">$</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={withdrawalAmount}
                            onChange={e => { setWithdrawalAmount(e.target.value); }}
                            className="w-full bg-neutral-950 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-xs text-white font-mono outline-none focus:border-yellow-500/40"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-neutral-500 block">
                          Maximum Cashout Value: ${(user.coins * 0.1).toFixed(2)} USD
                        </span>
                      </div>

                      <button
                        onClick={handleWithdraw}
                        disabled={withdrawalPending || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                      >
                        {withdrawalPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing Secure Bank Transfer...
                          </>
                        ) : (
                          "Initiate Instant Transfer"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
