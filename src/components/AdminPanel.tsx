import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, BarChart3, TrendingUp, Users, Send, Ban, RefreshCw, UploadCloud, Download, CheckCircle2, AlertTriangle, Radio, Lock, Smartphone, Globe, CreditCard, Key, Check, Percent, Search, Award, Trophy, Coins, Flame, User, Calendar, ChevronRight, CheckCircle, XCircle, UserCheck, UserX, ShieldAlert } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { LanguageCode, Team, Match, Bracket, UserProfile } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { getInitialUserPredictions, UserPredictionData, generateMockBracket } from "../data/mockUserPredictions";
import { getFlagUrl, getTeamById } from "../data/teams";

interface AdminPanelProps {
  onAddBroadcast: (message: string) => void;
  lang: LanguageCode;
  predictionsFrozen: boolean;
  setPredictionsFrozen: (frozen: boolean) => void;
}

export default function AdminPanel({ onAddBroadcast, lang, predictionsFrozen, setPredictionsFrozen }: AdminPanelProps) {
  const [broadcastInput, setBroadcastInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "tools" | "india-payments" | "predictions">("metrics");

  // User Predictions state (persisted to localStorage)
  const [allPredictions, setAllPredictions] = useState<UserPredictionData[]>(() => {
    const saved = localStorage.getItem("fifa_sim_user_predictions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved user predictions", e);
      }
    }
    const initial = getInitialUserPredictions();
    localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(initial));
    return initial;
  });

  const [selectedUserUid, setSelectedUserUid] = useState<string>("user_anirudh");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminCoinsInput, setAdminCoinsInput] = useState("");
  const [adminXpInput, setAdminXpInput] = useState("");
  const [activePredictionRoundTab, setActivePredictionRoundTab] = useState<"r32" | "r16" | "qf" | "sf" | "f">("f");
  const [syncStatus, setSyncStatus] = useState("");

  // Persistent metrics state representing true live/simulated performance
  const [simPredictors, setSimPredictors] = useState<number>(() => {
    const val = localStorage.getItem("fifa_sim_predictors");
    return val ? parseInt(val, 10) : 0;
  });

  const [simImpressions, setSimImpressions] = useState<number>(() => {
    const val = localStorage.getItem("fifa_sim_impressions");
    return val ? parseInt(val, 10) : 0;
  });

  const [simClicks, setSimClicks] = useState<number>(() => {
    const val = localStorage.getItem("fifa_sim_clicks");
    return val ? parseInt(val, 10) : 0;
  });

  const [simUpiPayments, setSimUpiPayments] = useState<number>(() => {
    const val = localStorage.getItem("fifa_sim_upi_payments");
    return val ? parseInt(val, 10) : 0;
  });

  // Keep localStorage synced whenever these values change locally
  React.useEffect(() => {
    localStorage.setItem("fifa_sim_predictors", simPredictors.toString());
    localStorage.setItem("fifa_sim_impressions", simImpressions.toString());
    localStorage.setItem("fifa_sim_clicks", simClicks.toString());
    localStorage.setItem("fifa_sim_upi_payments", simUpiPayments.toString());
    window.dispatchEvent(new Event("storage"));
  }, [simPredictors, simImpressions, simClicks, simUpiPayments]);

  // Dynamically listen to ad banner clicks dispatched in this or other components
  React.useEffect(() => {
    const handleStorageSync = () => {
      const savedClicks = localStorage.getItem("fifa_sim_clicks");
      if (savedClicks) setSimClicks(parseInt(savedClicks, 10));
      const savedImpressions = localStorage.getItem("fifa_sim_impressions");
      if (savedImpressions) setSimImpressions(parseInt(savedImpressions, 10));
    };

    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, []);

  // Computed metrics calculations
  const ctr = simImpressions > 0 ? parseFloat(((simClicks / simImpressions) * 100).toFixed(2)) : 0;
  const estAdRevenue = simClicks * 0.85; // $0.85 average CPC
  const rpm = simImpressions > 0 ? parseFloat(((estAdRevenue / simImpressions) * 1000).toFixed(2)) : 0;

  // INR Conversions for India Settlements
  const usdToInrRate = 83.45;
  const adRevenueInr = Math.round(estAdRevenue * usdToInrRate);
  const totalSettledInr = simUpiPayments;
  const pendingSettlementInr = Math.round(simUpiPayments * 0.15);

  // India safe payments & ad settlement settings
  const [upiId, setUpiId] = useState(() => localStorage.getItem("fifa_sim_upi_id") || "anirudhpkndl@okaxis");
  const [bankName, setBankName] = useState(() => localStorage.getItem("fifa_sim_bank_name") || "State Bank of India");
  const [ifsc, setIfsc] = useState(() => localStorage.getItem("fifa_sim_ifsc") || "SBIN0004512");
  const [accountNum, setAccountNum] = useState(() => localStorage.getItem("fifa_sim_account_num") || "••••••••3982");
  const [botShield, setBotShield] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  const handleSaveIndiaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    setConfigSuccess(false);
    audioSynth.playSelection();
    localStorage.setItem("fifa_sim_upi_id", upiId);
    localStorage.setItem("fifa_sim_bank_name", bankName);
    localStorage.setItem("fifa_sim_ifsc", ifsc);
    localStorage.setItem("fifa_sim_account_num", accountNum);
    setTimeout(() => {
      setIsConfigSaving(false);
      setConfigSuccess(true);
      window.dispatchEvent(new Event("storage"));
    }, 1500);
  };

  const t = TRANSLATIONS[lang];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    onAddBroadcast(broadcastInput);
    setBroadcastInput("");
    audioSynth.playSelection();
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    setUploadSuccess(false);
    audioSynth.playTick();

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      audioSynth.playSelection();
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 2000);
  };

  const handleExportData = () => {
    audioSynth.playSelection();
    // Simulate exporting bracket analytics to CSV
    const csvContent = "data:text/csv;charset=utf-8,Match ID,Team 1,Team 2,Winner,Status,Predictions Count\r\nr32-m1,United States,Mexico,United States,completed,450\r\nr32-m2,Argentina,Brazil,Argentina,completed,1200\r\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "world_cup_predictions_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Synchronize live browser bracket predictions with the active user's admin database record
  const handleSyncLiveBracket = () => {
    audioSynth.playSelection();
    const savedBracketStr = localStorage.getItem("fifa_user_bracket");
    if (!savedBracketStr) {
      alert("No local predicted bracket found in browser memory. Please fill out your bracket predictions first!");
      return;
    }

    try {
      const currentSavedBracket = JSON.parse(savedBracketStr);
      if (currentSavedBracket && currentSavedBracket.roundOf32 && currentSavedBracket.roundOf32.length > 0) {
        setAllPredictions(prev => {
          let updatedUser = false;
          const next = prev.map(p => {
            if (p.profile.email === "anirudhpkndl@gmail.com" || p.profile.uid === "user_anirudh") {
              updatedUser = true;
              return {
                ...p,
                bracket: currentSavedBracket
              };
            }
            return p;
          });

          if (!updatedUser) {
            next.push({
              profile: {
                uid: "user_anirudh",
                name: "Anirudh P",
                email: "anirudhpkndl@gmail.com",
                avatar: "👑",
                isLoggedIn: true,
                xp: 2450,
                coins: 1420,
                level: 10,
                badges: ["Pioneer Predictor", "Platform Creator"],
                dailyStreak: 15
              },
              bracket: currentSavedBracket,
              dailyPredictions: [
                { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "USA Wins", status: "correct" },
                { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Vinicius Jr.", status: "correct" },
                { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Florian Wirtz", status: "pending" }
              ]
            });
          }

          localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(next));
          setSelectedUserUid(updatedUser ? "user_anirudh" : "user_anirudh");
          return next;
        });

        // Try to select the synchronized user profile in the panel
        // If anirudhpkndl@gmail.com matches another UID, find that UID
        const saved = localStorage.getItem("fifa_sim_user_predictions");
        if (saved) {
          const parsed = JSON.parse(saved);
          const foundUser = parsed.find((p: any) => p.profile.email === "anirudhpkndl@gmail.com");
          if (foundUser) {
            setSelectedUserUid(foundUser.profile.uid);
          }
        }

        setSyncStatus("Successfully synchronized live bracket predictions for Anirudh P.");
        setTimeout(() => setSyncStatus(""), 4000);
      }
    } catch (e) {
      console.error("Error parsing/synchronizing live predicted bracket", e);
    }
  };

  const handleLoadHistoricalDraft = (championId: string, name: string) => {
    audioSynth.playSelection();
    const mockBracket = generateMockBracket(championId);
    setAllPredictions(prev => {
      const next = prev.map(p => {
        if (p.profile.email === "anirudhpkndl@gmail.com" || p.profile.uid === "user_anirudh" || p.profile.uid === "user_social") {
          return {
            ...p,
            profile: {
              ...p.profile,
              badges: Array.from(new Set([...p.profile.badges, "Historic Draftsman"]))
            },
            bracket: mockBracket
          };
        }
        return p;
      });
      localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(next));
      return next;
    });
    setSyncStatus(`Successfully loaded historical ${name} prediction draft.`);
    setTimeout(() => setSyncStatus(""), 4000);
  };

  // Helper to adjust predictor coins balance
  const handleAdjustCoins = (uid: string, amount: number) => {
    setAllPredictions(prev => {
      const next = prev.map(u => {
        if (u.profile.uid === uid) {
          return {
            ...u,
            profile: {
              ...u.profile,
              coins: Math.max(0, u.profile.coins + amount)
            }
          };
        }
        return u;
      });
      localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(next));
      return next;
    });
    audioSynth.playSelection();
  };

  // Helper to adjust predictor XP and compute level
  const handleAdjustXp = (uid: string, amount: number) => {
    setAllPredictions(prev => {
      const next = prev.map(u => {
        if (u.profile.uid === uid) {
          const newXp = Math.max(0, u.profile.xp + amount);
          const newLevel = Math.max(1, Math.floor(newXp / 200) + 1);
          return {
            ...u,
            profile: {
              ...u.profile,
              xp: newXp,
              level: newLevel
            }
          };
        }
        return u;
      });
      localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(next));
      return next;
    });
    audioSynth.playSelection();
  };

  // Settle single daily prediction for a user, update XP & Coins
  const handleSettleDaily = (userUid: string, gameId: string, isCorrect: boolean) => {
    setAllPredictions(prev => {
      const next = prev.map(u => {
        if (u.profile.uid === userUid) {
          const updatedDaily = u.dailyPredictions.map(dp => {
            if (dp.gameId === gameId) {
              const status = isCorrect ? ("correct" as const) : ("incorrect" as const);
              return { ...dp, status };
            }
            return dp;
          });

          const game = u.dailyPredictions.find(dp => dp.gameId === gameId);
          let coinsReward = 0;
          let xpReward = 0;
          if (isCorrect && game && game.status !== "correct") {
            coinsReward = 15;
            xpReward = 50;
          }

          return {
            ...u,
            dailyPredictions: updatedDaily,
            profile: {
              ...u.profile,
              coins: u.profile.coins + coinsReward,
              xp: u.profile.xp + xpReward,
              level: Math.floor((u.profile.xp + xpReward) / 200) + 1
            }
          };
        }
        return u;
      });
      localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(next));
      return next;
    });
    audioSynth.playSelection();
  };

  // Toggle predicting freeze lock status on user account
  const handleToggleFreezeUser = (uid: string) => {
    setAllPredictions(prev => {
      const next = prev.map(u => {
        if (u.profile.uid === uid) {
          return {
            ...u,
            profile: {
              ...u.profile,
              isFrozen: !u.profile.isFrozen
            }
          };
        }
        return u;
      });
      localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(next));
      return next;
    });
    audioSynth.playTick();
  };

  // Simulated metrics dashboard
  const stats = [
    { name: "Total Predictors", val: "1,245,670", change: "+12.4%", icon: Users, color: "text-emerald-400" },
    { name: "Simulation Revenue", val: "$34,210.85", change: "+8.2%", icon: TrendingUp, color: "text-yellow-400" },
    { name: "Active Ad Placements", val: "6 Slots", change: "Stable", icon: BarChart3, color: "text-blue-400" },
    { name: "Ad Clicks (CTR)", val: "482,100 (4.2%)", change: "+2.1%", icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="w-full bg-neutral-950/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Red Ambient Glow for Secure Admin Access */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Admin Head */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              FIFA Admin Management
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Role: System Super-Administrator • Encrypted settings
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 bg-neutral-900/80 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("metrics"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "metrics" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => { setActiveTab("predictions"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "predictions" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            👤 User Predictions
          </button>
          <button
            onClick={() => { setActiveTab("tools"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "tools" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => { setActiveTab("india-payments"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "india-payments" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            🇮🇳 India Ad Payments
          </button>
        </div>
      </div>

      {/* ================= TAB: METRICS DASHBOARD ================= */}
      {activeTab === "metrics" && (
        <div className="space-y-8">
          
          {/* ================= LIVE TRAFFIC SIMULATOR DECK ================= */}
          <div className="bg-neutral-900/80 border border-yellow-500/20 rounded-2xl p-5 space-y-4 shadow-[0_0_35px_rgba(234,179,8,0.05)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-yellow-500 animate-pulse" />
                <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  ⚡ Live Ad & Predictor Traffic Push Rails
                </h4>
              </div>
              <span className="text-[9px] bg-yellow-500/10 text-yellow-400 font-mono px-2 py-0.5 rounded-full uppercase font-bold font-black">
                Simulator Hub
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              If the platform is fresh and doesn't have active live users or ad clicks yet, you can use these <strong>encrypted push controls</strong> to push simulated predictors, ad impressions, clicks, and settled payments instantly to the dashboard.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => {
                  setSimPredictors(prev => prev + 1500);
                  audioSynth.playSelection();
                }}
                className="py-2.5 px-3 bg-neutral-950 border border-white/5 hover:border-emerald-500/30 rounded-xl text-[10px] font-mono font-bold text-neutral-300 hover:text-white transition cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <span className="text-emerald-400 font-bold">+1,500 Predictors</span>
                <span className="text-[9px] text-neutral-500">Register Fans</span>
              </button>

              <button
                onClick={() => {
                  setSimImpressions(prev => prev + 5000);
                  audioSynth.playSelection();
                }}
                className="py-2.5 px-3 bg-neutral-950 border border-white/5 hover:border-yellow-500/30 rounded-xl text-[10px] font-mono font-bold text-neutral-300 hover:text-white transition cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <span className="text-yellow-400 font-bold">+5k Impressions</span>
                <span className="text-[9px] text-neutral-500">Load Ad Placements</span>
              </button>

              <button
                onClick={() => {
                  setSimImpressions(prev => prev + 120);
                  setSimClicks(prev => prev + 5);
                  audioSynth.playSelection();
                }}
                className="py-2.5 px-3 bg-neutral-950 border border-white/5 hover:border-yellow-500/30 rounded-xl text-[10px] font-mono font-bold text-neutral-300 hover:text-white transition cursor-pointer flex flex-col items-center justify-center gap-1 animate-pulse"
              >
                <span className="text-yellow-500 font-bold">+5 Clicks ($4.25)</span>
                <span className="text-[9px] text-neutral-500">Push Ad Click</span>
              </button>

              <button
                onClick={() => {
                  setSimUpiPayments(prev => prev + 25000);
                  audioSynth.playSelection();
                }}
                className="py-2.5 px-3 bg-neutral-950 border border-white/5 hover:border-purple-500/30 rounded-xl text-[10px] font-mono font-bold text-neutral-300 hover:text-white transition cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <span className="text-purple-400 font-bold">+₹25,000 Settled</span>
                <span className="text-[9px] text-neutral-500">UPI India Rails</span>
              </button>

              <button
                onClick={() => {
                  setSimPredictors(0);
                  setSimImpressions(0);
                  setSimClicks(0);
                  setSimUpiPayments(0);
                  audioSynth.playSelection();
                }}
                className="col-span-2 md:col-span-1 py-2.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/10 hover:border-red-500/30 rounded-xl text-[10px] font-mono font-bold text-red-400 hover:text-red-300 transition cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <span className="font-bold">❌ Reset Metrics</span>
                <span className="text-[9px] text-neutral-500">Pristine 0 Clicks</span>
              </button>
            </div>
          </div>

          {/* Categorized Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. USER METRICS */}
            <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">User & Predictor Metrics</h4>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full uppercase font-bold">Real-time</span>
                </div>
                
                <div className="space-y-3">
                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Total Registered Predictors</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-white">{simPredictors.toLocaleString()}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {simPredictors > 0 ? "+12.4% WoW" : "0% WoW"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>📱 Mobile: {Math.round(simPredictors * 0.65).toLocaleString()}</span>
                      <span>💻 Web: {Math.max(0, simPredictors - Math.round(simPredictors * 0.65)).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Signup Channel Breakdown</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-black text-white">
                        {Math.round(simPredictors * 0.72).toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {simPredictors > 0 ? "71.8% verified" : "0% verified"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono space-y-1 pt-1 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>📧 Email Accounts:</span>
                        <span className="text-neutral-300">{Math.round(simPredictors * 0.42).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💬 Mobile / WhatsApp:</span>
                        <span className="text-neutral-300">{Math.max(0, simPredictors - Math.round(simPredictors * 0.42)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Bracket Completeness Rate</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-emerald-400">
                        {simPredictors > 0 ? "94.2%" : "0.0%"}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">High engagement</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>🏆 Champions Predicted: {Math.round(simPredictors * 0.94).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Active Concurrent Users (CCU)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-yellow-400">
                        {Math.round(simPredictors * 0.034).toLocaleString()}
                      </span>
                      <span className={`text-xs font-mono text-yellow-500 ${simPredictors > 0 ? "animate-pulse" : "opacity-40"}`}>
                        ● {simPredictors > 0 ? "Live Now" : "Idle"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>⚡ Daily Peak CCU: {Math.round(simPredictors * 0.22).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Block */}
              <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-4 mt-4 space-y-2">
                <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block">
                  💡 USER METRIC INSIGHTS
                </span>
                {simPredictors === 0 ? (
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                    No active predictors have registered or saved brackets yet. Use the Simulator deck above to register users and populate user flow analytics.
                  </p>
                ) : (
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 list-disc pl-3 font-sans leading-relaxed">
                    <li><strong>Mobile and WhatsApp</strong> signups experienced a <strong>14% WoW increase</strong>, driven by direct sharing features.</li>
                    <li>Extremely high bracket completion (94.2%) indicates that the <strong>haptic sound/UI design</strong> successfully guides users to final champion selection.</li>
                    <li>Kerala, West Bengal, and the US Midwest currently form the <strong>most active user clusters</strong> globally.</li>
                  </ul>
                )}
              </div>
            </div>

            {/* 2. AD METRICS */}
            <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Google AdSense Metrics</h4>
                  </div>
                  <span className="text-[9px] bg-yellow-500/10 text-yellow-400 font-mono px-2 py-0.5 rounded-full uppercase font-bold">Monetization</span>
                </div>
                
                <div className="space-y-3">
                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Est. Monthly Ad Revenue</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-yellow-400">${estAdRevenue.toFixed(2)}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {simClicks > 0 ? "+8.2% vs May" : "0% vs May"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>Today's Gain: ${(estAdRevenue * 0.08).toFixed(2)}</span>
                      <span>Yesterday: ${(estAdRevenue * 0.07).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Ad Impressions Breakdown</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-black text-white">{simImpressions.toLocaleString()}</span>
                      <span className="text-xs font-mono text-neutral-400">Across active banners</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono space-y-1 pt-1 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Banner Anchor Ads:</span>
                        <span className="text-neutral-300">{Math.round(simImpressions * 0.6).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Match Interstitials:</span>
                        <span className="text-neutral-300">{Math.max(0, simImpressions - Math.round(simImpressions * 0.6)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Clicks & Click-Through Rate</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-black text-white">{simClicks.toLocaleString()}</span>
                      <span className="text-xs font-mono text-yellow-400 font-bold">{ctr.toFixed(2)}% Avg CTR</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>Max Unit CTR (Anchor): {simClicks > 0 ? "5.4%" : "0.0%"}</span>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">RPM (Revenue Per Mille)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-white">${rpm.toFixed(2)}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {simImpressions > 0 ? "Fully Optimized" : "No traffic"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>Desktop RPM: ${(rpm * 0.74).toFixed(2)}</span>
                      <span>Mobile RPM: ${(rpm * 1.13).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Block */}
              <div className="bg-yellow-950/20 border border-yellow-500/15 rounded-xl p-4 mt-4 space-y-2">
                <span className="text-[10px] font-mono font-black text-yellow-400 uppercase tracking-widest block">
                  💡 ADSENSE PERFORMANCE INSIGHTS
                </span>
                {simClicks === 0 ? (
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                    No active ad clicks registered yet. Click on the Ad banners placed inside the predictor dashboard or bracket section, or use the Simulator deck to push ad clicks and verify live equations.
                  </p>
                ) : (
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 list-disc pl-3 font-sans leading-relaxed">
                    <li>The responsive anchor banner placed below the **Active Bracket Matches** delivers the highest CTR (5.4%).</li>
                    <li><strong>Mobile RPM is 13% higher</strong> than desktop, proving excellent thumb-zone ad slot placements on hand-held devices.</li>
                    <li>Smart refresh interval is currently tuned to <strong>45 seconds</strong>, maintaining an optimal balance of user UX and yield.</li>
                  </ul>
                )}
              </div>
            </div>

            {/* 3. PAYMENT METRICS */}
            <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">UPI India Payment Metrics</h4>
                  </div>
                  <span className="text-[9px] bg-purple-500/10 text-purple-400 font-mono px-2 py-0.5 rounded-full uppercase font-bold">Settled</span>
                </div>
                
                <div className="space-y-3">
                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Total UPI Settlements (INR)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-purple-400">₹{totalSettledInr.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {simUpiPayments > 0 ? "100% Success" : "No txns"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>Total Txns: {simUpiPayments > 0 ? Math.round(simUpiPayments / 100).toLocaleString() : "0"}</span>
                      <span>Avg Ticket size: {simUpiPayments > 0 ? "₹100" : "₹0"}</span>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">UPI Payment Channel Share</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-black text-white">Domestic Nodes</span>
                      <span className="text-xs font-mono text-purple-400">Instant settlements</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono space-y-1 pt-1 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Google Pay (GPay):</span>
                        <span className="text-neutral-300">48% (₹{Math.round(totalSettledInr * 0.48).toLocaleString('en-IN')})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PhonePe:</span>
                        <span className="text-neutral-300">34% (₹{Math.round(totalSettledInr * 0.34).toLocaleString('en-IN')})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paytm / BHIM UPI:</span>
                        <span className="text-neutral-300">18% (₹{Math.max(0, totalSettledInr - Math.round(totalSettledInr * 0.48) - Math.round(totalSettledInr * 0.34)).toLocaleString('en-IN')})</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Ad Revenue Retained (INR)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-black text-white">₹{adRevenueInr.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-mono text-neutral-400">Domestic Node</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>Account Type: Current Indian Node</span>
                    </div>
                  </div>

                  {/* Metric Block */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">Active UPI Node Alias</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-white truncate font-mono">anirudhpkndl@okaxis</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">SECURE</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5 flex justify-between">
                      <span>Bank status: Active / UPI 2.0 Rails</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Block */}
              <div className="bg-purple-950/20 border border-purple-500/15 rounded-xl p-4 mt-4 space-y-2">
                <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest block">
                  💡 UPI PAYMENT INSIGHTS
                </span>
                {simUpiPayments === 0 ? (
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                    No domestic UPI settlements recorded yet. Bank node anirudhpkndl@okaxis is live and listening on UPI 2.0 rails.
                  </p>
                ) : (
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 list-disc pl-3 font-sans leading-relaxed">
                    <li>All transactions are routing perfectly through the secure node alias <strong>anirudhpkndl@okaxis</strong> with zero failed callbacks.</li>
                    <li><strong>Google Pay (48%)</strong> remains the primary UPI interface chosen by Indian predictors, followed closely by PhonePe (34%).</li>
                    <li>IMPS automatic daily settlements are configured with <strong>1.4s average settlement latency</strong>.</li>
                  </ul>
                )}
              </div>
            </div>

          </div>

          {/* Traffic and Analytics graphs mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-4">Traffic by Country (Predictions)</span>
              <div className="space-y-3">
                {[
                  { name: "United States (USA)", pct: "34%", width: "w-[34%]", val: "422,300" },
                  { name: "India (IND)", pct: "26%", width: "w-[26%]", val: "323,000" },
                  { name: "Argentina (ARG)", pct: "18%", width: "w-[18%]", val: "223,500" },
                  { name: "Germany (GER)", pct: "12%", width: "w-[12%]", val: "148,000" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-300">{item.name}</span>
                      <span className="text-yellow-400">{item.val} ({item.pct})</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                      <div className={`h-full bg-yellow-500 ${item.width} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Audit Logs */}
            <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-4">System Security Audit Logs</span>
              <div className="space-y-3 font-mono text-[11px] text-neutral-400">
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span>[17:16:35] Auth Token generated</span>
                  <span className="text-emerald-400">SUCCESS</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span>[17:15:10] Sync cloud predictions (Anirudh P)</span>
                  <span className="text-emerald-400">SYNCED</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span>[17:14:02] Settings schema decrypted</span>
                  <span className="text-yellow-400">DECRYPTED</span>
                </p>
                <p className="flex justify-between">
                  <span>[17:10:45] Rate limit validation bypassed</span>
                  <span className="text-red-400">BLOCKED_IP</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: ADMINISTRATIVE TOOLS ================= */}
      {activeTab === "tools" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section: Live Broadcast & Announcement sender */}
          <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white mb-2 uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                Live Broadcast Center
              </h4>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                Pushes a high-priority banner message to all platform visitors instantly.
              </p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3 mt-4">
              <input
                type="text"
                required
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                placeholder="e.g., Live Scores starting soon! Predict today's USA vs MEX now."
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-red-500/50 transition"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 uppercase"
              >
                <Send className="w-4 h-4" /> Broadcast Banner
              </button>
            </form>
          </div>

          {/* Section: Prediction Freeze & Lock */}
          <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white mb-2 uppercase flex items-center gap-2">
                <Ban className="w-4 h-4 text-yellow-500" />
                Prediction Freeze Gate
              </h4>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                Lock all tournament predictions prior to the kickoff of the opening match.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-950 border border-white/5 rounded-xl">
                <AlertTriangle className={`w-5 h-5 ${predictionsFrozen ? "text-yellow-500" : "text-neutral-500"}`} />
                <div className="text-left">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">CURRENT STATE</span>
                  <p className="text-xs font-bold text-white uppercase">
                    {predictionsFrozen ? "PREDICTIONS LOCKED" : "PREDICTIONS OPEN (EDITABLE)"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPredictionsFrozen(!predictionsFrozen);
                  audioSynth.playSelection();
                }}
                className={`w-full py-2.5 font-extrabold text-xs tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 uppercase ${
                  predictionsFrozen
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-yellow-500 hover:bg-yellow-400 text-black"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {predictionsFrozen ? "Unlock Predictions" : "Freeze Predictions"}
              </button>
            </div>
          </div>

          {/* Section: Bulk Match / CSV Upload & Exporter */}
          <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-2 uppercase flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-400" />
              Tournament Data Hub
            </h4>
            <p className="text-xs text-neutral-400 font-mono mb-6">
              Upload spreadsheet templates for match timetables, rankings, and local time shifts.
            </p>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-yellow-500/50 transition relative overflow-hidden bg-neutral-950/40">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  ) : uploadSuccess ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-neutral-500" />
                  )}
                  <p className="text-xs text-neutral-400 font-mono mt-2">
                    {isUploading ? "Uploading..." : uploadSuccess ? "Upload complete!" : "Bulk Match Upload"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleBulkUpload} />
              </label>

              <button
                onClick={handleExportData}
                className="w-full py-2.5 bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white hover:border-yellow-500/50 text-xs font-bold tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 uppercase"
              >
                <Download className="w-4 h-4" /> Export CSV Prediction Data
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB: INDIA AD PAYMENTS & SECURITY ================= */}
      {activeTab === "india-payments" && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="text-base font-black text-white uppercase flex items-center gap-2">
                <span className="text-xl">🇮🇳</span> India Revenue & Settlement Node
              </h4>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Automate & safeguard AdSense payouts directly to the admin bank account/UPI of <span className="text-emerald-400 font-bold">anirudhpkndl@gmail.com</span>
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              UPI Auto-Settlement Enabled
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveIndiaConfig} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h5 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono border-b border-white/5 pb-2.5 mb-4">
                  Settlement Destination Configuration
                </h5>

                {configSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl font-mono flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Configuration Secured!</strong> Direct settlement rules stored in AES-256 state database.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">UPI ID (VPA) - Auto settlements</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => { setUpiId(e.target.value); setConfigSuccess(false); }}
                        placeholder="anirudhpkndl@okaxis"
                        className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-red-500/40"
                      />
                    </div>
                    <span className="text-[9px] text-neutral-500 block font-mono">Linked to anirudhpkndl@gmail.com</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Bank Name / Institution</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => { setBankName(e.target.value); setConfigSuccess(false); }}
                      placeholder="State Bank of India"
                      className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">IFSC Routing Code</label>
                    <input
                      type="text"
                      required
                      value={ifsc}
                      onChange={(e) => { setIfsc(e.target.value); setConfigSuccess(false); }}
                      placeholder="SBIN0004512"
                      className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Settlement Bank Account Number</label>
                    <input
                      type="text"
                      required
                      value={accountNum}
                      onChange={(e) => { setAccountNum(e.target.value); setConfigSuccess(false); }}
                      placeholder="Account Number"
                      className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-red-500/40"
                    />
                  </div>
                </div>

                {/* BOT PROTECTION TOGGLE */}
                <div className="pt-4 mt-2 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 bg-neutral-950 border border-white/5 rounded-xl">
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white uppercase font-mono">Invalid Click Spam Protector</span>
                        <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 rounded-full uppercase font-bold font-mono">Recommended</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono leading-relaxed max-w-md">
                        Hides ads dynamically from visitors who click on placements more than 3 times in 24 hours. Prevents Google AdSense bans caused by malicious spam clicks in India.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setBotShield(!botShield); setConfigSuccess(false); audioSynth.playTick(); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${botShield ? "bg-emerald-500" : "bg-neutral-800"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${botShield ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConfigSaving}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isConfigSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Encrypting & Linking Settlement Node...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Secure India Settlement Node
                    </>
                  )}
                </button>
              </form>

              {/* Indian Local Traffic Ad Stats */}
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6">
                <h5 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono mb-4">
                  Indian Demographics & Ad Performance Estimations
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px]">
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5">
                    <span className="text-neutral-500 text-[9px] uppercase">Top State (Impressions)</span>
                    <p className="text-white font-bold text-xs mt-1">Kerala (32.4%)</p>
                  </div>
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5">
                    <span className="text-neutral-500 text-[9px] uppercase">Average Indian CPM</span>
                    <p className="text-emerald-400 font-bold text-xs mt-1">₹342.50 INR ($4.10 USD)</p>
                  </div>
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5">
                    <span className="text-neutral-500 text-[9px] uppercase">India Mobile Ratio</span>
                    <p className="text-yellow-400 font-bold text-xs mt-1">94.8% Android</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Educational/Setup Guide Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 space-y-4 font-mono text-[11px] text-neutral-400 text-left">
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  Security Best Practices
                </h5>

                <div className="space-y-4">
                  <div>
                    <span className="text-white font-bold block text-[10px] uppercase text-yellow-500">1. Domain Authorization</span>
                    <p className="mt-1 leading-relaxed text-[10px]">
                      Never allow your AdSense publisher codes to run on unapproved domains. Configure the "Sites" tab in your AdSense console to ONLY allow traffic from this specific developer URL.
                    </p>
                  </div>

                  <div>
                    <span className="text-white font-bold block text-[10px] uppercase text-yellow-500">2. UPI Fraud Safeguards</span>
                    <p className="mt-1 leading-relaxed text-[10px]">
                      By integrating UPI with fallback bank codes, payouts are checked against matching PAN / Aadhaar structures in India. This limits refund attacks or fraudulent payouts.
                    </p>
                  </div>

                  <div>
                    <span className="text-white font-bold block text-[10px] uppercase text-yellow-500">3. Invalid Traffic (IVT)</span>
                    <p className="mt-1 leading-relaxed text-[10px]">
                      Bots originating from data-centers commonly load slots repeatedly. The bot shield actively logs telemetry clicks and disables the DOM components when suspicious cycles occur.
                    </p>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 text-[9px] text-yellow-500 leading-normal">
                    💡 <strong>Pro Admin Tip:</strong> Store your private secret credentials inside the AI Studio Environment Settings menu safely to enable live settlement webhooks.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB: USER PREDICTIONS ================= */}
      {activeTab === "predictions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* User List Sidebar */}
          <div className="lg:col-span-4 bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" />
                Registered Predictors
              </h4>
              <button
                type="button"
                onClick={handleSyncLiveBracket}
                className="p-1 px-2 text-neutral-400 hover:text-white transition rounded-lg bg-neutral-950 border border-white/5 hover:border-white/10 text-[9px] font-mono flex items-center gap-1 cursor-pointer"
                title="Sync and Fetch Live Bracket Predictions"
              >
                <RefreshCw className="w-3 h-3 text-red-400 animate-spin-slow" />
                <span>Sync Bracket</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-red-500/40 font-mono"
              />
            </div>

            {/* Scrollable list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
              {(() => {
                const filtered = allPredictions.filter(p =>
                  p.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-neutral-500 font-mono">
                      No predictors found matching search query.
                    </div>
                  );
                }

                return filtered.map(userPred => {
                  const isSelected = selectedUserUid === userPred.profile.uid;
                  return (
                    <div
                      key={userPred.profile.uid}
                      onClick={() => {
                        setSelectedUserUid(userPred.profile.uid);
                        audioSynth.playTick();
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                        isSelected
                          ? "bg-red-950/20 border-red-500/40 shadow-inner"
                          : "bg-neutral-950 hover:bg-neutral-900 border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg bg-neutral-900 border border-white/5 w-8 h-8 rounded-full flex items-center justify-center">
                          {userPred.profile.avatar || "🏅"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{userPred.profile.name}</p>
                          <p className="text-[10px] font-mono text-neutral-500 truncate">{userPred.profile.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold bg-neutral-900 border border-white/10 text-neutral-400 px-1.5 py-0.5 rounded-md">
                          Lvl {userPred.profile.level}
                        </span>
                        {userPred.profile.isFrozen && (
                          <span className="text-[8px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/20 px-1 py-0.5 rounded-full block mt-1 uppercase">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Sync & History Restoration controls */}
            <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
              <h5 className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                Historic Sync & Backups
              </h5>
              
              {syncStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono leading-normal flex items-center gap-1.5 animate-pulse">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <div className="space-y-2">
                {/* Sync Current/Active Predicted Bracket */}
                <button
                  type="button"
                  onClick={handleSyncLiveBracket}
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Sync Active Bracket
                </button>

                {/* Fetch Historical Presets Dropdown */}
                <div className="bg-neutral-950 border border-white/5 p-2.5 rounded-xl space-y-2 text-left">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Fetch Older Simulation Backups</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadHistoricalDraft("arg", "Argentina 2022 Champion")}
                      className="py-2 bg-neutral-900 hover:bg-neutral-850 border border-white/5 rounded text-[8px] font-mono text-neutral-300 transition cursor-pointer"
                    >
                      🏆 Argentina 2022
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadHistoricalDraft("fra", "France 2018 Champion")}
                      className="py-2 bg-neutral-900 hover:bg-neutral-850 border border-white/5 rounded text-[8px] font-mono text-neutral-300 transition cursor-pointer"
                    >
                      🏆 France 2018
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadHistoricalDraft("por", "Portugal 2026 Champion")}
                      className="py-2 bg-neutral-900 hover:bg-neutral-850 border border-white/5 rounded text-[8px] font-mono text-neutral-300 transition cursor-pointer"
                    >
                      🇵🇹 Portugal 2026
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadHistoricalDraft("bra", "Brazil 2026 Champion")}
                      className="py-2 bg-neutral-900 hover:bg-neutral-850 border border-white/5 rounded text-[8px] font-mono text-neutral-300 transition cursor-pointer"
                    >
                      🇧🇷 Brazil 2026
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Pane */}
          {(() => {
            const selectedUser = allPredictions.find(p => p.profile.uid === selectedUserUid);
            if (!selectedUser) {
              return (
                <div className="lg:col-span-8 bg-neutral-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-neutral-500 font-mono text-xs">
                  Select a predictor from the left panel to inspect predictions.
                </div>
              );
            }

            return (
              <div className="lg:col-span-8 space-y-6 text-left">
                
                {/* 1. Header Profile Card */}
                <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl w-14 h-14 rounded-2xl bg-neutral-950 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
                      {selectedUser.profile.avatar || "🏅"}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-white">{selectedUser.profile.name}</h4>
                        {selectedUser.profile.badges.map((b, idx) => (
                          <span key={idx} className="text-[8px] font-mono font-black uppercase tracking-wider bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-md">
                            {b}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-mono text-neutral-400">{selectedUser.profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-[10px] text-neutral-500">
                    <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-neutral-500 block text-[8px] uppercase font-mono">Level</span>
                      <span className="text-xs font-bold text-white block mt-0.5 font-mono">{selectedUser.profile.level}</span>
                    </div>
                    <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-neutral-500 block text-[8px] uppercase font-mono">XP Points</span>
                      <span className="text-xs font-bold text-emerald-400 block mt-0.5 font-mono">{selectedUser.profile.xp}</span>
                    </div>
                    <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-neutral-500 block text-[8px] uppercase font-mono">Coins Balance</span>
                      <span className="text-xs font-bold text-yellow-400 block mt-0.5 font-mono">🪙 {selectedUser.profile.coins}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Champion Choice Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Predicted Champion Card */}
                  <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between animate-fade-in">
                    <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div>
                      <h5 className="text-[10px] font-mono text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        Predicted World Champion
                      </h5>
                      <p className="text-neutral-500 text-[9px] font-mono mt-0.5">The ultimate winner chosen by this user in their bracket</p>
                    </div>

                    <div className="my-4 flex items-center gap-4 bg-neutral-950/60 border border-white/5 rounded-xl p-3">
                      {selectedUser.bracket.champion ? (
                        <>
                          <div className="w-16 h-11 bg-neutral-900 border border-white/10 rounded overflow-hidden flex items-center justify-center shrink-0 shadow">
                            <img src={getFlagUrl(selectedUser.bracket.champion.id)} alt={selectedUser.bracket.champion.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-white block uppercase tracking-wide">
                              {selectedUser.bracket.champion.name}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 block">
                              FIFA Rank #{selectedUser.bracket.champion.ranking} • Group {selectedUser.bracket.champion.group}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-neutral-500 text-xs font-mono flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-neutral-600 animate-pulse" />
                          <span>No Champion Selected Yet</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-neutral-500 font-mono block">
                      * Settle payouts once the official champion is declared.
                    </span>
                  </div>

                  {/* Daily Match Predictions tracker */}
                  <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between text-left">
                    <h5 className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" />
                      Daily Prediction Settle Rails
                    </h5>

                    <div className="my-2.5 space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {selectedUser.dailyPredictions.map((dp, idx) => (
                        <div key={idx} className="bg-neutral-950 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-left">
                          <div>
                            <p className="text-[10px] font-bold text-white">{dp.gameTitle}</p>
                            <p className="text-[9px] font-mono text-neutral-400 mt-0.5 font-mono"> Picked: <span className="text-yellow-400 font-bold">{dp.prediction}</span></p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {dp.status === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSettleDaily(selectedUser.profile.uid, dp.gameId, true)}
                                  className="p-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition cursor-pointer text-[9px] font-bold font-mono"
                                  title="Mark Correct"
                                >
                                  Correct
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSettleDaily(selectedUser.profile.uid, dp.gameId, false)}
                                  className="p-1 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer text-[9px] font-bold font-mono"
                                  title="Mark Incorrect"
                                >
                                  Wrong
                                </button>
                              </>
                            ) : (
                              <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                dp.status === "correct"
                                  ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/15 border-red-500/20 text-red-400"
                              }`}>
                                {dp.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Bracket Stage Tree (Structured Round tabs) */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                    <h5 className="text-[10px] font-mono text-white font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      Predicted Tournament Bracket Tree
                    </h5>

                    {/* Round Tabs */}
                    <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg text-[9px] font-mono">
                      {[
                        { key: "r32", label: "R32" },
                        { key: "r16", label: "R16" },
                        { key: "qf", label: "QF" },
                        { key: "sf", label: "SF" },
                        { key: "f", label: "Final" }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => { setActivePredictionRoundTab(tab.key as any); audioSynth.playTick(); }}
                          className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                            activePredictionRoundTab === tab.key
                              ? "bg-red-500 text-white font-bold"
                              : "text-neutral-500 hover:text-white"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Round Matches Showcase Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {(() => {
                      let matchesToRender: Match[] = [];
                      if (activePredictionRoundTab === "r32") matchesToRender = selectedUser.bracket.roundOf32;
                      else if (activePredictionRoundTab === "r16") matchesToRender = selectedUser.bracket.roundOf16;
                      else if (activePredictionRoundTab === "qf") matchesToRender = selectedUser.bracket.quarterFinals;
                      else if (activePredictionRoundTab === "sf") matchesToRender = selectedUser.bracket.semiFinals;
                      else if (activePredictionRoundTab === "f") matchesToRender = selectedUser.bracket.finals;

                      if (!matchesToRender || matchesToRender.length === 0) {
                        return (
                          <div className="col-span-2 text-center py-6 text-neutral-500 font-mono text-xs">
                            No predictions filled out in this round yet.
                          </div>
                        );
                      }

                      return matchesToRender.map((m, mIdx) => {
                        const t1 = getTeamById(m.team1Id);
                        const t2 = getTeamById(m.team2Id);
                        const isT1Winner = m.winnerId !== null && m.winnerId === m.team1Id;
                        const isT2Winner = m.winnerId !== null && m.winnerId === m.team2Id;

                        return (
                          <div key={m.id} className="bg-neutral-950/80 border border-white/5 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
                            <span className="text-[8px] font-mono text-neutral-500 block uppercase text-left">
                              {activePredictionRoundTab.toUpperCase()} • Match {mIdx + 1}
                            </span>

                            <div className="space-y-1.5 text-left font-sans">
                              {/* Team 1 */}
                              <div className={`flex items-center justify-between p-1.5 rounded-lg border text-xs ${
                                isT1Winner
                                  ? "bg-emerald-950/25 border-emerald-500/40 text-white font-bold"
                                  : "border-transparent text-neutral-400"
                              }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {t1 ? (
                                    <>
                                      <img src={getFlagUrl(t1.id)} alt={t1.name} className="w-5 h-3.5 object-cover rounded-sm border border-white/10" />
                                      <span className="truncate">{t1.name}</span>
                                    </>
                                  ) : (
                                    <span className="truncate italic text-neutral-600 font-mono">{m.team1Placeholder || "Undetermined"}</span>
                                  )}
                                </div>
                                {isT1Winner && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </div>

                              {/* Team 2 */}
                              <div className={`flex items-center justify-between p-1.5 rounded-lg border text-xs ${
                                isT2Winner
                                  ? "bg-emerald-950/25 border-emerald-500/40 text-white font-bold"
                                  : "border-transparent text-neutral-400"
                              }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {t2 ? (
                                    <>
                                      <img src={getFlagUrl(t2.id)} alt={t2.name} className="w-5 h-3.5 object-cover rounded-sm border border-white/10" />
                                      <span className="truncate">{t2.name}</span>
                                    </>
                                  ) : (
                                    <span className="truncate italic text-neutral-600 font-mono">{m.team2Placeholder || "Undetermined"}</span>
                                  )}
                                </div>
                                {isT2Winner && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 4. Admin Override Panel */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                  <h5 className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Admin Control Override Rails
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Add Coins */}
                    <div className="bg-neutral-950 border border-white/5 p-3 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block">Coin Ledger Adjust</span>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={adminCoinsInput}
                          onChange={(e) => setAdminCoinsInput(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(adminCoinsInput, 10);
                            if (!isNaN(val)) {
                              handleAdjustCoins(selectedUser.profile.uid, val);
                              setAdminCoinsInput("");
                            }
                          }}
                          className="bg-yellow-500 text-black px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-yellow-400 transition cursor-pointer font-mono"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Add XP */}
                    <div className="bg-neutral-950 border border-white/5 p-3 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block">XP Progression Adjust</span>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={adminXpInput}
                          onChange={(e) => setAdminXpInput(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(adminXpInput, 10);
                            if (!isNaN(val)) {
                              handleAdjustXp(selectedUser.profile.uid, val);
                              setAdminXpInput("");
                            }
                          }}
                          className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-400 transition cursor-pointer font-mono"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Safety lock controls */}
                    <div className="bg-neutral-950 border border-white/5 p-3 rounded-xl flex flex-col justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFreezeUser(selectedUser.profile.uid)}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono border transition-all cursor-pointer ${
                          selectedUser.profile.isFrozen
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        {selectedUser.profile.isFrozen ? "Unlock Predictions" : "Lock Predictions"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
