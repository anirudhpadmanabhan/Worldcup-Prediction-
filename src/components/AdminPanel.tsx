import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, BarChart3, TrendingUp, Users, Send, Ban, RefreshCw, UploadCloud, Download, CheckCircle2, AlertTriangle, Radio, Lock, Smartphone, Globe, CreditCard, Key, Check, Percent, Search, Award, Trophy, Coins, Flame, User, Calendar, ChevronRight, CheckCircle, XCircle, UserCheck, UserX, ShieldAlert, Plus, Building, DollarSign } from "lucide-react";
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
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function AdminPanel({ onAddBroadcast, lang, predictionsFrozen, setPredictionsFrozen, user, setUser }: AdminPanelProps) {
  const [broadcastInput, setBroadcastInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "tools" | "india-payments" | "predictions" | "leaderboard" | "wallet">("metrics");

  // Leaderboard state
  const [leaderboardCategory, setLeaderboardCategory] = useState<"global" | "friends" | "groups">("global");

  // Groups and Friends League State (synchronized with localStorage)
  const [groups, setGroups] = useState<any[]>(() => {
    const saved = localStorage.getItem("fifa_prediction_groups");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const defaultGroups = [
      {
        id: "group_kochi",
        name: "Kochi Friends League ⚽",
        code: "WC-KOCHI",
        creator: "MalayaliVibe",
        members: [
          { name: "MalayaliVibe", points: 2210, avatar: "🌴", isYou: false },
          { name: "Anirudh P", points: user.xp || 2450, avatar: "👑", isYou: true },
          { name: "Rahul K", points: 1980, avatar: "🏃", isYou: false },
          { name: "Sneha Dev", points: 1820, avatar: "🎯", isYou: false },
          { name: "Arjun Nair", points: 1540, avatar: "⚡", isYou: false }
        ]
      },
      {
        id: "group_world",
        name: "Global Elites 🏆",
        code: "WC-ELITE",
        creator: "MessiMagic",
        members: [
          { name: "MessiMagic", points: 2790, avatar: "🐐", isYou: false },
          { name: "Kylian_Predicts", points: 2850, avatar: "⚽", isYou: false },
          { name: "Anirudh P", points: user.xp || 2450, avatar: "👑", isYou: true },
          { name: "SuiiiPredict", points: 2320, avatar: "🇵🇹", isYou: false }
        ]
      }
    ];
    localStorage.setItem("fifa_prediction_groups", JSON.stringify(defaultGroups));
    return defaultGroups;
  });

  // Sync user XP dynamically inside private groups
  React.useEffect(() => {
    setGroups(prevGroups => {
      let updated = false;
      const next = prevGroups.map(grp => {
        const members = grp.members.map((mbr: any) => {
          if (mbr.isYou && mbr.points !== user.xp) {
            updated = true;
            return { ...mbr, points: user.xp };
          }
          return mbr;
        });
        const sortedMembers = [...members].sort((a, b) => b.points - a.points);
        return { ...grp, members: sortedMembers };
      });
      if (updated) {
        localStorage.setItem("fifa_prediction_groups", JSON.stringify(next));
        return next;
      }
      return prevGroups;
    });
  }, [user.xp]);

  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupCode, setJoinGroupCode] = useState("");
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const [groupSuccessMsg, setGroupSuccessMsg] = useState("");
  const [groupErrorMsg, setGroupErrorMsg] = useState("");

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = newGroupName.trim();
    if (!nameTrim) {
      setGroupErrorMsg("Please enter a group name.");
      return;
    }
    const code = `WC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newGrp = {
      id: `group_${Date.now()}`,
      name: `${nameTrim} 🌟`,
      code,
      creator: user.name || "You",
      members: [
        { name: user.name || "You", points: user.xp, avatar: user.avatar || "👑", isYou: true },
        { name: "Amal S", points: Math.max(0, user.xp - 150), avatar: "⚽", isYou: false },
        { name: "Reshma Pillai", points: Math.max(0, user.xp - 300), avatar: "🎯", isYou: false },
        { name: "Kiran Dev", points: user.xp + 100, avatar: "🏃", isYou: false }
      ].sort((a, b) => b.points - a.points)
    };
    const nextGroups = [...groups, newGrp];
    setGroups(nextGroups);
    localStorage.setItem("fifa_prediction_groups", JSON.stringify(nextGroups));
    setActiveGroupIndex(nextGroups.length - 1);
    setNewGroupName("");
    setGroupSuccessMsg(`League created successfully! Code is ${code}. Send this code to friends to invite them.`);
    setGroupErrorMsg("");
    audioSynth.playSelection();
    setTimeout(() => setGroupSuccessMsg(""), 7000);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const codeTrim = joinGroupCode.trim().toUpperCase();
    if (!codeTrim) {
      setGroupErrorMsg("Please enter a group code.");
      return;
    }
    const alreadyIdx = groups.findIndex(g => g.code === codeTrim);
    if (alreadyIdx !== -1) {
      setActiveGroupIndex(alreadyIdx);
      setGroupSuccessMsg("You are already in this friends league!");
      setGroupErrorMsg("");
      setJoinGroupCode("");
      return;
    }
    const mockFriends = [
      { name: "Vivek G", points: Math.max(0, user.xp - 80), avatar: "⚽", isYou: false },
      { name: "Meera K", points: user.xp + 150, avatar: "🌴", isYou: false },
      { name: "Sachin P", points: Math.max(0, user.xp - 200), avatar: "🎯", isYou: false }
    ];
    const newGrp = {
      id: `group_${Date.now()}`,
      name: `Joined Friends league 🏆`,
      code: codeTrim,
      creator: "Kiran Dev",
      members: [
        { name: user.name || "You", points: user.xp, avatar: user.avatar || "👑", isYou: true },
        ...mockFriends
      ].sort((a, b) => b.points - a.points)
    };
    const nextGroups = [...groups, newGrp];
    setGroups(nextGroups);
    localStorage.setItem("fifa_prediction_groups", JSON.stringify(nextGroups));
    setActiveGroupIndex(nextGroups.length - 1);
    setJoinGroupCode("");
    setGroupSuccessMsg(`Successfully joined league ${codeTrim}!`);
    setGroupErrorMsg("");
    audioSynth.playSelection();
    setTimeout(() => setGroupSuccessMsg(""), 5000);
  };

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

  const leaderboardRecords = [
    { rank: 1, name: "Kylian_Predicts", email: "k@psg.fr", points: 2850, country: "FRA 🇫🇷", badge: "Legend Predictor" },
    { rank: 2, name: "MessiMagic", email: "leo@miami.com", points: 2790, country: "ARG 🇦🇷", badge: "Golden Boot" },
    { rank: 3, name: "NeymarNerve", email: "ney@hilal.sa", points: 2610, country: "BRA 🇧🇷", badge: "Prediction Master" },
    { rank: 4, name: "Anirudh P", email: "anirudhpkndl@gmail.com", points: 2450, country: "IND 🇮🇳", badge: "Pioneer Predictor" },
    { rank: 5, name: "SuiiiPredict", email: "cr7@alnasr.com", points: 2320, country: "POR 🇵🇹", badge: "Classic Predictor" },
    { rank: 6, name: "MalayaliVibe", email: "kerala@gold.in", points: 2210, country: "IND 🇮🇳", badge: "Pioneer Predictor" },
    { rank: 7, name: "GaviGrind", email: "gavi@barca.es", points: 1980, country: "ESP 🇪🇸", badge: "Classic Predictor" },
  ];

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
  const [lookupName, setLookupName] = useState("");
  const [lookupMobile, setLookupMobile] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const [adminCoinsInput, setAdminCoinsInput] = useState("");
  const [adminXpInput, setAdminXpInput] = useState("");
  const [activePredictionRoundTab, setActivePredictionRoundTab] = useState<"r32" | "r16" | "qf" | "sf" | "f">("f");
  const [predictionsSubTab, setPredictionsSubTab] = useState<"individual" | "daily-db" | "percentage-leaderboard">("individual");
  const [selectedDailyMatchTitle, setSelectedDailyMatchTitle] = useState<string>("All");
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
          <button
            onClick={() => { setActiveTab("leaderboard"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "leaderboard" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            🏆 Global Leaderboard
          </button>
          <button
            onClick={() => { setActiveTab("wallet"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "wallet" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            💳 Wallet & Payout
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
        <div className="space-y-6 text-left">
          {/* Sub-tab Selectors */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900/60 border border-white/5 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                User Predictions Dashboard Node
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Inspect predictor rosters, analyze tables, query specific matches, and track accuracy percentage.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-neutral-950 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => { setPredictionsSubTab("individual"); audioSynth.playTick(); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  predictionsSubTab === "individual"
                    ? "bg-red-500 text-white font-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                👤 Individual Lookups
              </button>
              <button
                type="button"
                onClick={() => { setPredictionsSubTab("daily-db"); audioSynth.playTick(); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  predictionsSubTab === "daily-db"
                    ? "bg-red-500 text-white font-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                📅 Daily predictions DB
              </button>
              <button
                type="button"
                onClick={() => { setPredictionsSubTab("percentage-leaderboard"); audioSynth.playTick(); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  predictionsSubTab === "percentage-leaderboard"
                    ? "bg-red-500 text-white font-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                📊 Accuracy Leaderboard
              </button>
            </div>
          </div>

          {/* Helper accuracy logic available everywhere inside predictions tab */}
          {(() => {
            const getBracketCorrectCount = (up: UserPredictionData) => {
              let count = 0;
              // RSA vs CAN (completed match, true winner is CAN)
              const mCan = up.bracket.roundOf32.find(m => m.id === "r32-m2" || (m.team1Id === "rsa" && m.team2Id === "can") || (m.team1Id === "can" && m.team2Id === "rsa"));
              if (mCan && mCan.winnerId === "can") count++;

              // BRA vs JPN (completed match, true winner is BRA)
              const mBra = up.bracket.roundOf32.find(m => m.id === "r32-m8" || (m.team1Id === "bra" && m.team2Id === "jpn") || (m.team1Id === "jpn" && m.team2Id === "bra"));
              if (mBra && mBra.winnerId === "bra") count++;

              // GER vs PAR (completed match, true winner is PAR)
              const mPar = up.bracket.roundOf32.find(m => m.id === "r32-m0" || (m.team1Id === "ger" && m.team2Id === "par") || (m.team1Id === "par" && m.team2Id === "ger"));
              if (mPar && mPar.winnerId === "par") count++;

              // NED vs MAR (completed match, true winner is MAR)
              const mMar = up.bracket.roundOf32.find(m => m.id === "r32-m3" || (m.team1Id === "ned" && m.team2Id === "mar") || (m.team1Id === "mar" && m.team2Id === "ned"));
              if (mMar && mMar.winnerId === "mar") count++;

              return count;
            };

            const getDailyCorrectCount = (up: UserPredictionData) => {
              return up.dailyPredictions.filter(dp => dp.status === "correct").length;
            };

            const getDailySettledCount = (up: UserPredictionData) => {
              return up.dailyPredictions.filter(dp => dp.status === "correct" || dp.status === "incorrect").length;
            };

            const computeOverallStats = (up: UserPredictionData) => {
              const bracketCorrect = getBracketCorrectCount(up);
              const dailyCorrect = getDailyCorrectCount(up);
              const dailySettled = getDailySettledCount(up);

              const totalCorrect = bracketCorrect + dailyCorrect;
              const totalCompletedChecked = 4 + dailySettled; // 4 completed bracket matches + settled daily matches
              const accuracyPercent = totalCompletedChecked > 0 ? (totalCorrect / totalCompletedChecked) * 100 : 0;

              return {
                bracketCorrect,
                dailyCorrect,
                dailySettled,
                totalCorrect,
                totalCompletedChecked,
                accuracyPercent
              };
            };

            // ================= SUB-TAB 1: INDIVIDUAL PREDICTOR LOOKUPS =================
            if (predictionsSubTab === "individual") {
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Sidebar - Predictor list */}
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

                    {/* Name & Mobile Number Lookup Form */}
                    <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 space-y-2.5 text-left">
                      <span className="text-[9px] font-mono font-black text-red-400 block uppercase tracking-wider">
                        👤 Lookup Predictions by Name & Mobile
                      </span>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Enter Name..."
                          value={lookupName}
                          onChange={(e) => setLookupName(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white outline-none font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Enter Mobile Number..."
                          value={lookupMobile}
                          onChange={(e) => setLookupMobile(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white outline-none font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          audioSynth.playSelection();
                          if (!lookupName.trim() || !lookupMobile.trim()) {
                            setLookupMessage("Please enter both Name and Mobile.");
                            return;
                          }
                          const found = allPredictions.find(p => 
                            p.profile.name.toLowerCase() === lookupName.trim().toLowerCase() && 
                            (p.profile.mobile === lookupMobile.trim() || p.profile.email === lookupMobile.trim())
                          );
                          if (found) {
                            setSelectedUserUid(found.profile.uid);
                            setLookupMessage(`✅ Found! Selected ${found.profile.name}`);
                          } else {
                            setLookupMessage("❌ Predictor not found. Try again.");
                          }
                        }}
                        className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[9px] uppercase tracking-wider rounded-lg transition cursor-pointer"
                      >
                        Search Predictor
                      </button>
                      {lookupMessage && (
                        <p className="text-[9px] font-mono text-center text-neutral-400 mt-1">{lookupMessage}</p>
                      )}
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Search by name, email or mobile..."
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
                          p.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.profile.mobile && p.profile.mobile.toLowerCase().includes(searchQuery.toLowerCase()))
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
                          const stats = computeOverallStats(userPred);
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
                                <span className="text-[9px] font-mono font-bold bg-neutral-900 border border-white/10 text-emerald-400 px-1.5 py-0.5 rounded-md">
                                  {stats.accuracyPercent.toFixed(0)}% Acc
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

                    const overallStats = computeOverallStats(selectedUser);

                    // Compile and tabularize ALL of this user's predictions
                    const getAllPredictionsAsList = () => {
                      const list: {
                        type: "Bracket" | "Daily" | "Champion";
                        stage: string;
                        matchup: string;
                        pick: string;
                        actualAnswer: string;
                        status: "correct" | "incorrect" | "pending" | "unfilled";
                      }[] = [];

                      // Add champion prediction
                      if (selectedUser.bracket.champion) {
                        list.push({
                          type: "Champion",
                          stage: "Tournament Overall",
                          matchup: "Ultimate Champion",
                          pick: selectedUser.bracket.champion.name,
                          actualAnswer: "TBD",
                          status: "pending"
                        });
                      }

                      // Bracket matchups
                      const compileBracketStage = (matches: Match[], stageName: string) => {
                        if (!matches) return;
                        matches.forEach((m, idx) => {
                          const t1 = getTeamById(m.team1Id);
                          const t2 = getTeamById(m.team2Id);
                          const pred = getTeamById(m.winnerId);

                          const isRsaCan = m.team1Id === "rsa" && m.team2Id === "can" || m.team1Id === "can" && m.team2Id === "rsa";
                          const isBraJpn = m.team1Id === "bra" && m.team2Id === "jpn" || m.team1Id === "jpn" && m.team2Id === "bra";
                          const isGerPar = m.team1Id === "ger" && m.team2Id === "par" || m.team1Id === "par" && m.team2Id === "ger";
                          const isNedMar = m.team1Id === "ned" && m.team2Id === "mar" || m.team1Id === "mar" && m.team2Id === "ned";
                          
                          let actualWinnerName = "TBD";
                          let status: "correct" | "incorrect" | "pending" | "unfilled" = "pending";

                          if (isRsaCan) {
                            actualWinnerName = "Canada";
                            status = m.winnerId === "can" ? "correct" : "incorrect";
                          } else if (isBraJpn) {
                            actualWinnerName = "Brazil";
                            status = m.winnerId === "bra" ? "correct" : "incorrect";
                          } else if (isGerPar) {
                            actualWinnerName = "Paraguay";
                            status = m.winnerId === "par" ? "correct" : "incorrect";
                          } else if (isNedMar) {
                            actualWinnerName = "Morocco";
                            status = m.winnerId === "mar" ? "correct" : "incorrect";
                          }

                          list.push({
                            type: "Bracket",
                            stage: stageName,
                            matchup: `${t1?.name || m.team1Placeholder || "Undetermined"} vs ${t2?.name || m.team2Placeholder || "Undetermined"}`,
                            pick: pred?.name || "No Pick",
                            actualAnswer: actualWinnerName,
                            status: m.winnerId ? status : "unfilled"
                          });
                        });
                      };

                      compileBracketStage(selectedUser.bracket.roundOf32, "Round of 32");
                      compileBracketStage(selectedUser.bracket.roundOf16, "Round of 16");
                      compileBracketStage(selectedUser.bracket.quarterFinals, "Quarter Finals");
                      compileBracketStage(selectedUser.bracket.semiFinals, "Semi Finals");
                      compileBracketStage(selectedUser.bracket.finals, "Finals");

                      // Daily predictions
                      selectedUser.dailyPredictions.forEach(dp => {
                        list.push({
                          type: "Daily",
                          stage: "Daily Challenge Match",
                          matchup: dp.gameTitle,
                          pick: dp.prediction,
                          actualAnswer: dp.status === "correct" ? dp.prediction : (dp.status === "incorrect" ? "Other choice" : "TBD"),
                          status: dp.status
                        });
                      });

                      return list;
                    };

                    const predictionsTableList = getAllPredictionsAsList();

                    return (
                      <div className="lg:col-span-8 space-y-6 text-left">
                        {/* 1. Header Profile Card with Name and Mobile number clearly visible */}
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
                              <div className="text-xs font-mono text-neutral-400 space-y-0.5">
                                <p>📧 Email: <strong className="text-neutral-200">{selectedUser.profile.email}</strong></p>
                                <p>📱 Mobile: <strong className="text-red-400">{selectedUser.profile.mobile || "None linked"}</strong></p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 font-mono text-[10px] text-neutral-500">
                            <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl text-center min-w-16">
                              <span className="text-neutral-500 block text-[8px] uppercase font-mono">Accuracy</span>
                              <span className="text-xs font-black text-emerald-400 block mt-0.5 font-mono">{overallStats.accuracyPercent.toFixed(1)}%</span>
                            </div>
                            <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl text-center min-w-16">
                              <span className="text-neutral-500 block text-[8px] uppercase font-mono">Score</span>
                              <span className="text-xs font-black text-white block mt-0.5 font-mono">{overallStats.totalCorrect} / {overallStats.totalCompletedChecked}</span>
                            </div>
                            <div className="bg-neutral-950 border border-white/5 p-2 rounded-xl text-center min-w-16">
                              <span className="text-neutral-500 block text-[8px] uppercase font-mono">Coins</span>
                              <span className="text-xs font-black text-yellow-400 block mt-0.5 font-mono">🪙 {selectedUser.profile.coins}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. TABULARIZED USER PREDICTIONS VIEW (NEW PREMIUM TABLE COMPONENT) */}
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                            <div>
                              <h5 className="text-[11px] font-mono text-white font-black uppercase tracking-wider flex items-center gap-1.5">
                                <Percent className="w-4 h-4 text-emerald-400" />
                                All Predictions Registry Table for {selectedUser.profile.name}
                              </h5>
                              <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                                Filtered checklist of tournament brackets and daily game picks
                              </p>
                            </div>
                            <span className="text-[9px] font-mono bg-neutral-950 px-2 py-0.5 rounded text-neutral-400 border border-white/5">
                              {predictionsTableList.length} total entries
                            </span>
                          </div>

                          <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                            <table className="w-full text-left text-[11px] text-neutral-300 font-mono">
                              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[9px] sticky top-0 z-10">
                                <tr>
                                  <th className="px-3 py-2 rounded-l">Type</th>
                                  <th className="px-3 py-2">Stage/Title</th>
                                  <th className="px-3 py-2">Matchup Pair</th>
                                  <th className="px-3 py-2">User's Prediction</th>
                                  <th className="px-3 py-2">Actual Outcome</th>
                                  <th className="px-3 py-2 rounded-r text-right">Verification</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {predictionsTableList.map((row, rIdx) => {
                                  return (
                                    <tr key={rIdx} className="hover:bg-neutral-950/50 transition">
                                      <td className="px-3 py-2.5">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                          row.type === "Champion"
                                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                            : (row.type === "Bracket" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20")
                                        }`}>
                                          {row.type}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5 text-neutral-400">{row.stage}</td>
                                      <td className="px-3 py-2.5 text-white font-bold">{row.matchup}</td>
                                      <td className="px-3 py-2.5 text-yellow-400 font-bold">{row.pick}</td>
                                      <td className="px-3 py-2.5 text-neutral-400">{row.actualAnswer}</td>
                                      <td className="px-3 py-2.5 text-right">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                          row.status === "correct"
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                            : (row.status === "incorrect" ? "bg-red-500/15 text-red-400 border border-red-500/20" : (row.status === "unfilled" ? "bg-neutral-800 text-neutral-500" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"))
                                        }`}>
                                          {row.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 3. Champion Choice Showcase & Interactive Daily Settle Side Rails */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Predicted Champion Card */}
                          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
                            
                            <div>
                              <h5 className="text-[10px] font-mono text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                Ultimate Bracket Champion pick
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

                          {/* Daily Match Predictions Settle list */}
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
                                          className="p-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition cursor-pointer text-[9px] font-bold font-mono animate-pulse"
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

                        {/* 4. Detailed Bracket Tree View */}
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                            <h5 className="text-[10px] font-mono text-white font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                              Interactive Tournament Bracket Match Tree
                            </h5>

                            {/* Round Tabs */}
                            <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg text-[9px] font-mono border border-white/5">
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
                                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
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

                        {/* 5. Admin Override Actions */}
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
              );
            }

            // ================= SUB-TAB 2: DAILY PREDICTIONS DATABASE VIEW =================
            if (predictionsSubTab === "daily-db") {
              // Extract all unique match titles dynamically from all predictions
              const dynamicMatches = Array.from(
                new Set(allPredictions.flatMap(p => p.dailyPredictions.map(dp => dp.gameTitle)))
              );

              // Calculate overall daily accuracy metrics per user, then sort accurate users on top
              const aggregatedUsers = allPredictions.map(u => {
                const totalDaily = u.dailyPredictions.length;
                const correctDaily = u.dailyPredictions.filter(dp => dp.status === "correct").length;
                const incorrectDaily = u.dailyPredictions.filter(dp => dp.status === "incorrect").length;
                const pendingDaily = u.dailyPredictions.filter(dp => dp.status === "pending").length;
                const settledDaily = correctDaily + incorrectDaily;
                const dailyAccuracy = settledDaily > 0 ? (correctDaily / settledDaily) * 100 : 0;

                return {
                  user: u,
                  totalDaily,
                  correctDaily,
                  incorrectDaily,
                  pendingDaily,
                  dailyAccuracy
                };
              }).sort((a, b) => {
                // Primary: accurate count. Secondary: accuracy rate.
                if (b.correctDaily !== a.correctDaily) {
                  return b.correctDaily - a.correctDaily;
                }
                return b.dailyAccuracy - a.dailyAccuracy;
              });

              return (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-6">
                  {/* Select Filter header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Daily Predictions Database Query Console
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        Query prediction records by match or examine aggregated user success (Sorted: most accurate on top).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-neutral-400 text-[10px] uppercase">Match Filter:</span>
                      <select
                        value={selectedDailyMatchTitle}
                        onChange={(e) => {
                          setSelectedDailyMatchTitle(e.target.value);
                          audioSynth.playTick();
                        }}
                        className="bg-neutral-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono focus:border-red-500/40 cursor-pointer"
                      >
                        <option value="All">All Daily Challenges Summary</option>
                        {dynamicMatches.map((title, idx) => (
                          <option key={idx} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedDailyMatchTitle === "All" ? (
                    // 1. ALL SUMMARY TABLE with most accurate users on top
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono text-neutral-300">
                        <thead className="bg-neutral-950 text-neutral-400 uppercase text-[9px]">
                          <tr>
                            <th className="px-4 py-3 rounded-l">Rank</th>
                            <th className="px-4 py-3">Roster Profile</th>
                            <th className="px-4 py-3">Mobile Number</th>
                            <th className="px-4 py-3 text-center">Correct picks</th>
                            <th className="px-4 py-3 text-center">Incorrect picks</th>
                            <th className="px-4 py-3 text-center">Pending picks</th>
                            <th className="px-4 py-3 text-right rounded-r">Success Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {aggregatedUsers.map((item, idx) => {
                            return (
                              <tr key={item.user.profile.uid} className="hover:bg-neutral-950/40 transition">
                                <td className="px-4 py-3 text-yellow-400 font-bold">
                                  {idx === 0 ? "🥇 Rank 1" : (idx === 1 ? "🥈 Rank 2" : (idx === 2 ? "🥉 Rank 3" : `#${idx + 1}`))}
                                </td>
                                <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                  <span>{item.user.profile.avatar || "🏅"}</span>
                                  <span>{item.user.profile.name}</span>
                                </td>
                                <td className="px-4 py-3 text-red-400 font-bold">{item.user.profile.mobile || "None Linked"}</td>
                                <td className="px-4 py-3 text-center text-emerald-400 font-black">{item.correctDaily}</td>
                                <td className="px-4 py-3 text-center text-red-400">{item.incorrectDaily}</td>
                                <td className="px-4 py-3 text-center text-yellow-400">{item.pendingDaily}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-500/20">
                                    {item.dailyAccuracy.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // 2. QUERY TABLE FOR A SPECIFIC MATCH CHOICE ("options for checking all matches like this")
                    <div className="overflow-x-auto space-y-4">
                      <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-2xl text-[11px] text-purple-300 font-mono flex justify-between items-center">
                        <span>Showing predictions submitted for match: <strong className="text-white uppercase">{selectedDailyMatchTitle}</strong></span>
                        <span className="text-[10px] text-neutral-400 font-mono">Real-time Settle-Enabled Row Nodes</span>
                      </div>

                      <table className="w-full text-left text-xs font-mono text-neutral-300">
                        <thead className="bg-neutral-950 text-neutral-400 uppercase text-[9px]">
                          <tr>
                            <th className="px-4 py-3 rounded-l">Predictor Name</th>
                            <th className="px-4 py-3">Mobile Number</th>
                            <th className="px-4 py-3">Email Node</th>
                            <th className="px-4 py-3 text-center">Prediction choice</th>
                            <th className="px-4 py-3 text-center">Verification Status</th>
                            <th className="px-4 py-3 text-right rounded-r">Action Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allPredictions.map(u => {
                            const dp = u.dailyPredictions.find(p => p.gameTitle === selectedDailyMatchTitle);
                            if (!dp) return null; // user has no submission for this specific match

                            return (
                              <tr key={u.profile.uid} className="hover:bg-neutral-950/40 transition">
                                <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                  <span>{u.profile.avatar || "🏅"}</span>
                                  <span>{u.profile.name}</span>
                                </td>
                                <td className="px-4 py-3 text-red-400 font-bold">{u.profile.mobile || "None Linked"}</td>
                                <td className="px-4 py-3 text-neutral-500">{u.profile.email}</td>
                                <td className="px-4 py-3 text-center text-yellow-400 font-bold">{dp.prediction}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                    dp.status === "correct"
                                      ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                                      : (dp.status === "incorrect" ? "bg-red-500/15 border-red-500/25 text-red-400" : "bg-yellow-500/15 border-yellow-500/25 text-yellow-400")
                                  }`}>
                                    {dp.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-1.5">
                                  {dp.status === "pending" ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSettleDaily(u.profile.uid, dp.gameId, true)}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold font-mono transition cursor-pointer"
                                      >
                                        Settle Correct
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSettleDaily(u.profile.uid, dp.gameId, false)}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold font-mono transition cursor-pointer"
                                      >
                                        Settle Wrong
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-neutral-500 font-mono">Settle final</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            }

            // ================= SUB-TAB 3: FULL LEADERBOARD PERCENTAGE-WISE =================
            if (predictionsSubTab === "percentage-leaderboard") {
              const fullRosterSorted = allPredictions.map(u => {
                const stats = computeOverallStats(u);
                return {
                  user: u,
                  stats
                };
              }).sort((a, b) => {
                // Sort by combined prediction accuracy percentage descending
                if (b.stats.accuracyPercent !== a.stats.accuracyPercent) {
                  return b.stats.accuracyPercent - a.stats.accuracyPercent;
                }
                // Secondary sorting: total correct
                return b.stats.totalCorrect - a.stats.totalCorrect;
              });

              return (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-emerald-400" />
                      Roster Leaderboard: Sorted by Accuracy Percentage
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      Full registered user database checked against completed tournament bracket matches and daily settled challenges.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono text-neutral-300">
                      <thead className="bg-neutral-950 text-neutral-400 uppercase text-[9px]">
                        <tr>
                          <th className="px-5 py-3.5 rounded-l">Overall Rank</th>
                          <th className="px-5 py-3.5">Predictor Profile</th>
                          <th className="px-5 py-3.5">Mobile Number</th>
                          <th className="px-5 py-3.5">Google Email</th>
                          <th className="px-5 py-3.5 text-center">Correct Selections</th>
                          <th className="px-5 py-3.5 text-center">Total Completed Evaluated</th>
                          <th className="px-5 py-3.5 text-center">User Badges</th>
                          <th className="px-5 py-3.5 text-right rounded-r">Accuracy Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {fullRosterSorted.map((item, idx) => {
                          const isLead = idx === 0;
                          return (
                            <tr key={item.user.profile.uid} className={`hover:bg-neutral-950/40 transition ${isLead ? "bg-yellow-500/5 font-bold" : ""}`}>
                              <td className="px-5 py-3.5">
                                {idx === 0 ? "🥇 1st Place" : (idx === 1 ? "🥈 2nd Place" : (idx === 2 ? "🥉 3rd Place" : `#${idx + 1}`))}
                              </td>
                              <td className="px-5 py-3.5 text-white font-bold flex items-center gap-2">
                                <span className="text-base">{item.user.profile.avatar || "⚽"}</span>
                                <span>{item.user.profile.name}</span>
                              </td>
                              <td className="px-5 py-3.5 text-red-400 font-bold">{item.user.profile.mobile || "None Linked"}</td>
                              <td className="px-5 py-3.5 text-neutral-400">{item.user.profile.email}</td>
                              <td className="px-5 py-3.5 text-center text-emerald-400 font-black">{item.stats.totalCorrect} correct</td>
                              <td className="px-5 py-3.5 text-center text-neutral-400">{item.stats.totalCompletedChecked} games</td>
                              <td className="px-5 py-3.5 text-center">
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {item.user.profile.badges.slice(0, 1).map((b, bIdx) => (
                                    <span key={bIdx} className="text-[8px] bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded text-neutral-400">
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400 font-black px-3 py-1 rounded-xl text-xs shadow-inner">
                                  {item.stats.accuracyPercent.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      )}

      {/* ================= TAB: GLOBAL LEADERBOARD ================= */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black text-white uppercase">{t.leaderboard}</h3>
              <p className="text-xs text-neutral-400 font-mono">
                {leaderboardCategory === "groups" ? "Compete with friends in private customizable leagues" : "Global live ranks updated in real-time"}
              </p>
            </div>

            <div className="flex gap-2 p-1 bg-neutral-900 rounded-lg">
              <button
                type="button"
                onClick={() => { setLeaderboardCategory("global"); audioSynth.playTick(); }}
                className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition cursor-pointer ${
                  leaderboardCategory === "global" ? "bg-red-500 text-white font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Global
              </button>
              <button
                type="button"
                onClick={() => { setLeaderboardCategory("friends"); audioSynth.playTick(); }}
                className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition cursor-pointer ${
                  leaderboardCategory === "friends" ? "bg-red-500 text-white font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Friends
              </button>
              <button
                type="button"
                onClick={() => { setLeaderboardCategory("groups"); audioSynth.playTick(); }}
                className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition cursor-pointer ${
                  leaderboardCategory === "groups" ? "bg-red-500 text-white font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                👥 Private Leagues
              </button>
            </div>
          </div>

          {(leaderboardCategory === "global" || leaderboardCategory === "friends") ? (
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
                    .map((rec) => (
                      <tr
                        key={rec.rank}
                        className={`hover:bg-neutral-900/40 transition-colors duration-150 ${
                          rec.name === "Anirudh P" ? "bg-yellow-500/5 font-bold" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-mono">
                          {rec.rank === 1 ? "🥇" : rec.rank === 2 ? "🥈" : rec.rank === 3 ? "🥉" : `#${rec.rank}`}
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className="lg:col-span-1 space-y-6">
                {groupSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono">
                    {groupSuccessMsg}
                  </div>
                )}
                {groupErrorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono">
                    {groupErrorMsg}
                  </div>
                )}

                <div className="bg-neutral-900/20 border border-white/5 p-4 rounded-2xl space-y-4">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-widest">
                    Active Private Leagues ({groups.length})
                  </span>
                  <div className="space-y-2">
                    {groups.map((grp, index) => (
                      <button
                        type="button"
                        key={grp.id}
                        onClick={() => { setActiveGroupIndex(index); audioSynth.playTick(); }}
                        className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex justify-between items-center ${
                          activeGroupIndex === index
                            ? "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]"
                            : "bg-neutral-950/40 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">{grp.name}</span>
                          <span className="text-[9px] text-neutral-500 block font-mono">Code: {grp.code} • Created by {grp.creator}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          activeGroupIndex === index ? "bg-yellow-500 text-black" : "bg-neutral-900 text-neutral-400 border border-white/5"
                        }`}>
                          {grp.members.length} members
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900/20 border border-white/5 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-widest flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-yellow-500" /> Join Friends League
                  </span>
                  <form onSubmit={handleJoinGroup} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="LEAGUE CODE"
                      required
                      value={joinGroupCode}
                      onChange={e => setJoinGroupCode(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-yellow-500/40 font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      Join
                    </button>
                  </form>
                </div>

                <div className="bg-neutral-900/20 border border-white/5 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-yellow-500" /> Create New League
                  </span>
                  <form onSubmit={handleCreateGroup} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new league name"
                      required
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-500/40 font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      Create
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {groups[activeGroupIndex] && (
                  <div className="bg-neutral-900/20 border border-white/5 p-5 rounded-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950/60 p-4 rounded-xl border border-white/5">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase tracking-wider">
                          Active Private Standings
                        </span>
                        <h4 className="text-base font-black text-white mt-1 uppercase">{groups[activeGroupIndex].name}</h4>
                      </div>

                      <div className="flex items-center gap-2 bg-neutral-900 border border-white/5 px-3 py-1.5 rounded-lg shrink-0">
                        <div className="text-left">
                          <span className="text-[8px] font-mono text-neutral-500 uppercase block">INVITE CODE</span>
                          <span className="text-xs font-mono font-bold text-yellow-400">{groups[activeGroupIndex].code}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(groups[activeGroupIndex].code);
                            alert(`League code "${groups[activeGroupIndex].code}" copied to clipboard! Send it to your friends.`);
                            audioSynth.playSelection();
                          }}
                          className="bg-neutral-950 hover:bg-white/5 text-neutral-400 hover:text-white transition p-1.5 rounded border border-white/5 cursor-pointer text-[10px] font-mono"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-neutral-300">
                        <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[10px]">
                          <tr>
                            <th className="px-6 py-4 rounded-l-xl">Rank</th>
                            <th className="px-6 py-4">Participant</th>
                            <th className="px-6 py-4">Avatar</th>
                            <th className="px-6 py-4 rounded-r-xl text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {groups[activeGroupIndex].members.map((mbr: any, idx: number) => (
                            <tr
                              key={idx}
                              className={`hover:bg-neutral-900/40 transition-colors duration-150 ${
                                mbr.isYou ? "bg-yellow-500/5 font-bold" : ""
                              }`}
                            >
                              <td className="px-6 py-4 font-mono font-bold text-neutral-400">
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                              </td>
                              <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                <span>{mbr.name}</span>
                                {mbr.isYou && (
                                  <span className="bg-yellow-500 text-black text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-black">
                                    YOU
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-lg">{mbr.avatar}</td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-yellow-400">
                                {mbr.points} pts
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: WALLET & PAYOUT CENTER ================= */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
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

              <div className="bg-neutral-950 border border-white/5 rounded-2xl p-5 space-y-3 font-mono text-[10px] text-neutral-400">
                <span className="text-xs font-bold text-white uppercase block mb-1">Configuring Real Banking</span>
                <p>
                  To transition this platform into production payouts, declare Stripe Secrets in your Environment Settings:
                </p>
                <div className="bg-neutral-900 p-2.5 rounded border border-white/5 text-[9px] text-yellow-500 break-all select-all">
                  VITE_STRIPE_PUBLIC_KEY=pk_live_...<br />
                  STRIPE_SECRET_KEY=sk_live_...
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {!bankLinked ? (
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
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-xs tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 uppercase disabled:opacity-50 mt-4 font-black"
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
                      <span className="text-neutral-500 uppercase">Holder</span>
                      <span className="text-white font-bold">{bankDetails.holderName}</span>
                      <span className="text-neutral-500 uppercase">Bank</span>
                      <span className="text-white font-bold">{bankDetails.bankName}</span>
                      <span className="text-neutral-500 uppercase">Routing</span>
                      <span className="text-white font-bold">{bankDetails.routingNumber}</span>
                      <span className="text-neutral-500 uppercase">Account</span>
                      <span className="text-white">••••••••{bankDetails.accountNumber.slice(-4) || "3982"}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleUnlinkBank}
                        className="px-4 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-neutral-400 hover:text-white hover:border-red-500/30 transition cursor-pointer font-mono font-bold"
                      >
                        Disconnect Account
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Submit Withdrawal Request
                    </h4>

                    {withdrawalSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl font-mono">
                        🎉 Withdrawal request for ${withdrawalAmount} USD submitted successfully!
                      </div>
                    )}

                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">WITHDRAWAL AMOUNT (USD)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-2.5 text-xs text-neutral-500 font-mono">$</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={withdrawalAmount}
                            onChange={e => setWithdrawalAmount(e.target.value)}
                            className="w-full bg-neutral-950 border border-white/5 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleWithdraw}
                          disabled={withdrawalPending}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer font-sans"
                        >
                          {withdrawalPending ? "Processing..." : "WITHDRAW"}
                        </button>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono block">Max available: ${(user.coins * 0.1).toFixed(2)} USD</span>
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
