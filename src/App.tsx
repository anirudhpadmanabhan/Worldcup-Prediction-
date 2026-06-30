import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Shield, LayoutGrid, Users, Settings, Volume2, VolumeX, 
  MapPin, Clock, Calendar, CheckCircle, Radio, X, LogIn, AlertCircle, Sparkles
} from "lucide-react";

import { Team, Bracket, UserProfile, AdSettings, AdPerformance, LanguageCode } from "./types";
import { TEAMS } from "./data/teams";
import { TRANSLATIONS } from "./data/translations";
import { audioSynth } from "./utils/audio";

import LandingPage from "./components/LandingPage";
import BracketSection from "./components/BracketSection";
import ChampionOverlay from "./components/ChampionOverlay";
import LoginModal from "./components/LoginModal";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import AdsManager from "./components/AdsManager";
import AdSenseBanner from "./components/AdSenseBanner";

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [lang, setLang] = useState<LanguageCode>("en");
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Authentication State
  const [user, setUser] = useState<UserProfile>({
    uid: "guest_default",
    name: "Guest Predictor",
    email: "guest@example.com",
    avatar: "👤",
    isLoggedIn: false,
    xp: 0,
    coins: 0,
    level: 1,
    badges: [],
    dailyStreak: 0,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pushNotifications, setPushNotifications] = useState<{ id: string; title: string; body: string; type: "completed" | "info" }[]>([]);

  const triggerPushNotification = (title: string, body: string, type: "completed" | "info" = "completed") => {
    const id = "push_" + Math.random().toString(36).substr(2, 9);
    setPushNotifications(prev => [...prev, { id, title, body, type }]);
    audioSynth.playTick();
    setTimeout(() => {
      setPushNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // Announcement broadcast banner states
  const [broadcasts, setBroadcasts] = useState<string[]>([
    "📢 Welcome to the FIFA 2026 Prediction experience! Secure your bracket and claim badging points.",
  ]);

  // Ad Settings
  const [adSettings, setAdSettings] = useState<AdSettings>({
    publisherId: "ca-pub-1234567890123456",
    bottomBannerId: "banner-default-bottom",
    inlineRoundId: "inline-default-rounds",
    interstitialId: "interstitial-default-comp",
    sidebarId: "sidebar-default-widget",
  });

  // Statefully managed ad stats updated in real-time by clicking ads
  const [adStats, setAdStats] = useState<AdPerformance[]>(() => {
    const savedClicks = parseInt(localStorage.getItem("fifa_sim_clicks") || "0", 10);
    const savedImpressions = parseInt(localStorage.getItem("fifa_sim_impressions") || "0", 10);
    
    const bottomClicks = Math.round(savedClicks * 0.3);
    const inlineClicks = Math.round(savedClicks * 0.4);
    const interstitialClicks = Math.round(savedClicks * 0.2);
    const sidebarClicks = Math.max(0, savedClicks - bottomClicks - inlineClicks - interstitialClicks);

    const bottomImps = Math.round(savedImpressions * 0.3) || (savedClicks > 0 ? bottomClicks * 25 : 0);
    const inlineImps = Math.round(savedImpressions * 0.4) || (savedClicks > 0 ? inlineClicks * 25 : 0);
    const interstitialImps = Math.round(savedImpressions * 0.1) || (savedClicks > 0 ? interstitialClicks * 25 : 0);
    const sidebarImps = Math.max(0, savedImpressions - bottomImps - inlineImps - interstitialImps) || (savedClicks > 0 ? sidebarClicks * 25 : 0);

    return [
      { slotId: "banner-bottom", name: "Bottom Sticky Banner", impressions: bottomImps, clicks: bottomClicks, ctr: bottomImps > 0 ? parseFloat(((bottomClicks / bottomImps) * 100).toFixed(2)) : 0, revenue: parseFloat((bottomClicks * 0.85).toFixed(2)) },
      { slotId: "inline-rounds", name: "Between Round In-Feed Banner", impressions: inlineImps, clicks: inlineClicks, ctr: inlineImps > 0 ? parseFloat(((inlineClicks / inlineImps) * 100).toFixed(2)) : 0, revenue: parseFloat((inlineClicks * 0.85).toFixed(2)) },
      { slotId: "interstitial-comp", name: "Prediction Completion Interstitial", impressions: interstitialImps, clicks: interstitialClicks, ctr: interstitialImps > 0 ? parseFloat(((interstitialClicks / interstitialImps) * 100).toFixed(2)) : 0, revenue: parseFloat((interstitialClicks * 0.85).toFixed(2)) },
      { slotId: "sidebar-widget", name: "Dashboard Sidebar Banner", impressions: sidebarImps, clicks: sidebarClicks, ctr: sidebarImps > 0 ? parseFloat(((sidebarClicks / sidebarImps) * 100).toFixed(2)) : 0, revenue: parseFloat((sidebarClicks * 0.85).toFixed(2)) },
    ];
  });

  const handleAdClick = (format: string, revenueEarned: number) => {
    let slotId = "banner-bottom";
    if (format === "sticky") slotId = "banner-bottom";
    else if (format === "leaderboard") slotId = "inline-rounds";
    else if (format === "skyscraper") slotId = "sidebar-widget";
    else if (format === "rectangle") slotId = "sidebar-widget";

    // Update simulation registers so AdminPanel displays accurate live updates in real-time
    const currentClicks = parseInt(localStorage.getItem("fifa_sim_clicks") || "0", 10);
    const currentImpressions = parseInt(localStorage.getItem("fifa_sim_impressions") || "0", 10);
    localStorage.setItem("fifa_sim_clicks", (currentClicks + 1).toString());
    localStorage.setItem("fifa_sim_impressions", (currentImpressions + 25).toString());

    // Dispatch custom event to notify AdminPanel if it is open
    window.dispatchEvent(new Event("storage"));

    setAdStats(prev => prev.map(stat => {
      if (stat.slotId === slotId) {
        const nextClicks = stat.clicks + 1;
        const nextImpressions = stat.impressions + 25; // 25 impressions per click for healthy 4% CTR
        const nextRevenue = parseFloat((stat.revenue + 0.85).toFixed(2));
        const nextCtr = parseFloat(((nextClicks / nextImpressions) * 100).toFixed(2));
        return {
          ...stat,
          clicks: nextClicks,
          impressions: nextImpressions,
          revenue: nextRevenue,
          ctr: nextCtr
        };
      }
      return stat;
    }));
  };

  // State for direct UPI bank deposit notifications
  const [adNotifications, setAdNotifications] = useState<{ id: string; amount: number; upi: string; bank: string }[]>([]);
  const prevClicksRef = React.useRef(parseInt(localStorage.getItem("fifa_sim_clicks") || "0", 10));

  // Sync state stats and handle credit notifications in real-time
  useEffect(() => {
    const syncAndNotify = () => {
      const savedClicks = parseInt(localStorage.getItem("fifa_sim_clicks") || "0", 10);
      const savedImpressions = parseInt(localStorage.getItem("fifa_sim_impressions") || "0", 10);

      const bottomClicks = Math.round(savedClicks * 0.3);
      const inlineClicks = Math.round(savedClicks * 0.4);
      const interstitialClicks = Math.round(savedClicks * 0.2);
      const sidebarClicks = Math.max(0, savedClicks - bottomClicks - inlineClicks - interstitialClicks);

      const bottomImps = Math.round(savedImpressions * 0.3) || (savedClicks > 0 ? bottomClicks * 25 : 0);
      const inlineImps = Math.round(savedImpressions * 0.4) || (savedClicks > 0 ? inlineClicks * 25 : 0);
      const interstitialImps = Math.round(savedImpressions * 0.1) || (savedClicks > 0 ? interstitialClicks * 25 : 0);
      const sidebarImps = Math.max(0, savedImpressions - bottomImps - inlineImps - interstitialImps) || (savedClicks > 0 ? sidebarClicks * 25 : 0);

      setAdStats([
        { slotId: "banner-bottom", name: "Bottom Sticky Banner", impressions: bottomImps, clicks: bottomClicks, ctr: bottomImps > 0 ? parseFloat(((bottomClicks / bottomImps) * 100).toFixed(2)) : 0, revenue: parseFloat((bottomClicks * 0.85).toFixed(2)) },
        { slotId: "inline-rounds", name: "Between Round In-Feed Banner", impressions: inlineImps, clicks: inlineClicks, ctr: inlineImps > 0 ? parseFloat(((inlineClicks / inlineImps) * 100).toFixed(2)) : 0, revenue: parseFloat((inlineClicks * 0.85).toFixed(2)) },
        { slotId: "interstitial-comp", name: "Prediction Completion Interstitial", impressions: interstitialImps, clicks: interstitialClicks, ctr: interstitialImps > 0 ? parseFloat(((interstitialClicks / interstitialImps) * 100).toFixed(2)) : 0, revenue: parseFloat((interstitialClicks * 0.85).toFixed(2)) },
        { slotId: "sidebar-widget", name: "Dashboard Sidebar Banner", impressions: sidebarImps, clicks: sidebarClicks, ctr: sidebarImps > 0 ? parseFloat(((sidebarClicks / sidebarImps) * 100).toFixed(2)) : 0, revenue: parseFloat((sidebarClicks * 0.85).toFixed(2)) },
      ]);

      // UPI Ad Revenue notifications disabled to avoid disturbing the user side.
      // We still update the prevClicksRef to sync internal state seamlessly.
      prevClicksRef.current = savedClicks;
    };

    window.addEventListener("storage", syncAndNotify);
    prevClicksRef.current = parseInt(localStorage.getItem("fifa_sim_clicks") || "0", 10);

    return () => window.removeEventListener("storage", syncAndNotify);
  }, []);

  // Predictions Freeze Gate
  const [predictionsFrozen, setPredictionsFrozen] = useState(false);

  // Bracket State Init
  const [bracket, setBracket] = useState<Bracket>({
    roundOf32: [],
    roundOf16: [],
    quarterFinals: [],
    semiFinals: [],
    finals: [],
    champion: null,
  });

  const [activeTab, setActiveTab] = useState<"bracket" | "dashboard" | "admin" | "ads">("bracket");
  const [selectedChampion, setSelectedChampion] = useState<Team | null>(null);

  // Load custom initial matchups for Round of 32 or from localStorage
  useEffect(() => {
    const savedBracket = localStorage.getItem("fifa_user_bracket");
    if (savedBracket) {
      try {
        const parsed = JSON.parse(savedBracket);
        if (parsed && parsed.roundOf32 && parsed.roundOf32.length > 0) {
          // Force set completed matches to ensure real-time accuracy is reflected
          let changed = false;
          const m0 = parsed.roundOf32.find((m: any) => m.id === "r32-m0" || (m.team1Id === "ger" && m.team2Id === "par"));
          if (m0 && (m0.winnerId !== "par" || m0.status !== "completed")) {
            m0.winnerId = "par";
            m0.status = "completed";
            changed = true;
            if (parsed.roundOf16 && parsed.roundOf16[0]) {
              parsed.roundOf16[0].team1Id = "par";
            }
          }
          const m8 = parsed.roundOf32.find((m: any) => m.id === "r32-m8" || (m.team1Id === "bra" && m.team2Id === "jpn"));
          if (m8 && (m8.winnerId !== "bra" || m8.status !== "completed")) {
            m8.winnerId = "bra";
            m8.status = "completed";
            changed = true;
            if (parsed.roundOf16 && parsed.roundOf16[4]) {
              parsed.roundOf16[4].team1Id = "bra";
            }
          }
          const m2 = parsed.roundOf32.find((m: any) => m.id === "r32-m2" || (m.team1Id === "rsa" && m.team2Id === "can"));
          if (m2 && (m2.winnerId !== "can" || m2.status !== "completed")) {
            m2.winnerId = "can";
            m2.status = "completed";
            changed = true;
            if (parsed.roundOf16 && parsed.roundOf16[1]) {
              parsed.roundOf16[1].team1Id = "can";
            }
          }
          const m3 = parsed.roundOf32.find((m: any) => m.id === "r32-m3" || (m.team1Id === "ned" && m.team2Id === "mar"));
          if (m3 && (m3.winnerId !== "mar" || m3.status !== "completed")) {
            m3.winnerId = "mar";
            m3.status = "completed";
            changed = true;
            if (parsed.roundOf16 && parsed.roundOf16[1]) {
              parsed.roundOf16[1].team2Id = "mar";
            }
          }
          setBracket(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved bracket", e);
      }
    }

    // Generate matches aligned with the official bracket top-to-bottom layout
    const r32Pairings = [
      // Left Side of Bracket (top-to-bottom of image)
      { teams: ["ger", "par"], date: "Tue, 30 Jun, 3:00 PM", timestamp: new Date("2026-06-30T15:00:00Z").getTime() },
      { teams: ["fra", "swe"], date: "Wed, 1 Jul, 3:00 PM", timestamp: new Date("2026-07-01T15:00:00Z").getTime() },
      { teams: ["rsa", "can"], date: "Sun, 28 Jun, 3:00 PM", timestamp: new Date("2026-06-28T15:00:00Z").getTime() },
      { teams: ["ned", "mar"], date: "Tue, 30 Jun, 6:00 PM", timestamp: new Date("2026-06-30T18:00:00Z").getTime() },
      { teams: ["por", "cro"], date: "Fri, 3 Jul, 3:00 PM", timestamp: new Date("2026-07-03T15:00:00Z").getTime() },
      { teams: ["spa", "aut"], date: "Fri, 3 Jul, 12:00 PM", timestamp: new Date("2026-07-03T12:00:00Z").getTime() },
      { teams: ["usa", "bos"], date: "Thu, 2 Jul, 6:00 PM", timestamp: new Date("2026-07-02T18:00:00Z").getTime() },
      { teams: ["bel", "sen"], date: "Thu, 2 Jul, 3:00 PM", timestamp: new Date("2026-07-02T15:00:00Z").getTime() },

      // Right Side of Bracket (top-to-bottom of image)
      { teams: ["bra", "jpn"], date: "Mon, 29 Jun, 3:00 PM", timestamp: new Date("2026-06-29T15:00:00Z").getTime() },
      { teams: ["civ", "nor"], date: "Tue, 30 Jun, 9:00 PM", timestamp: new Date("2026-06-30T21:00:00Z").getTime() },
      { teams: ["mex", "ecu"], date: "Wed, 1 Jul, 6:00 PM", timestamp: new Date("2026-07-01T18:00:00Z").getTime() },
      { teams: ["eng", "cod"], date: "Wed, 1 Jul, 9:00 PM", timestamp: new Date("2026-07-01T21:00:00Z").getTime() },
      { teams: ["arg", "cpv"], date: "Fri, 3 Jul, 6:00 PM", timestamp: new Date("2026-07-03T18:00:00Z").getTime() },
      { teams: ["aus", "egy"], date: "Fri, 3 Jul, 9:00 PM", timestamp: new Date("2026-07-03T21:00:00Z").getTime() },
      { teams: ["swi", "alg"], date: "Fri, 3 Jul, 1:00 PM", timestamp: new Date("2026-07-03T13:00:00Z").getTime() },
      { teams: ["col", "gha"], date: "Fri, 3 Jul, 7:00 PM", timestamp: new Date("2026-07-03T19:00:00Z").getTime() },
    ];

    const initialR32 = r32Pairings.map((pair, i) => {
      const isRsaCan = pair.teams.includes("rsa") && pair.teams.includes("can");
      const isBraJpn = pair.teams.includes("bra") && pair.teams.includes("jpn");
      const isGerPar = pair.teams.includes("ger") && pair.teams.includes("par");
      const isNedMar = pair.teams.includes("ned") && pair.teams.includes("mar");
      return {
        id: `r32-m${i}`,
        team1Id: pair.teams[0],
        team2Id: pair.teams[1],
        winnerId: isRsaCan ? "can" : (isBraJpn ? "bra" : (isGerPar ? "par" : (isNedMar ? "mar" : null))),
        date: pair.date,
        timestamp: pair.timestamp,
        status: (isRsaCan || isBraJpn || isGerPar || isNedMar ? "completed" : "scheduled") as "completed" | "scheduled",
      };
    });

    const initialR16 = Array.from({ length: 8 }, (_, i) => {
      const day = 4 + Math.floor(i / 2); // July 4, 5, 6, 7
      let team1Id: string | null = null;
      let team2Id: string | null = null;
      if (i === 0) team1Id = "par";
      else if (i === 1) {
        team1Id = "can";
        team2Id = "mar";
      }
      else if (i === 4) team1Id = "bra";

      return {
        id: `r16-m${i}`,
        team1Id,
        team2Id,
        team1Placeholder: `Winner R32 Match ${i * 2 + 1}`,
        team2Placeholder: `Winner R32 Match ${i * 2 + 2}`,
        winnerId: null,
        date: `Jul ${day}, 2026`,
        status: "scheduled" as const,
      };
    });

    const initialQf = Array.from({ length: 4 }, (_, i) => {
      const day = 9 + Math.floor(i / 1.5); // July 9, 10, 11
      return {
        id: `qf-m${i}`,
        team1Id: null,
        team2Id: null,
        team1Placeholder: `Winner R16 Match ${i * 2 + 1}`,
        team2Placeholder: `Winner R16 Match ${i * 2 + 2}`,
        winnerId: null,
        date: `Jul ${day}, 2026`,
        status: "scheduled" as const,
      };
    });

    const initialSf = Array.from({ length: 2 }, (_, i) => {
      const day = 14 + i; // July 14, 15
      return {
        id: `sf-m${i}`,
        team1Id: null,
        team2Id: null,
        team1Placeholder: `Winner QF Match ${i * 2 + 1}`,
        team2Placeholder: `Winner QF Match ${i * 2 + 2}`,
        winnerId: null,
        date: `Jul ${day}, 2026`,
        status: "scheduled" as const,
      };
    });

    const initialF = [{
      id: "f-m0",
      team1Id: null,
      team2Id: null,
      team1Placeholder: "Winner Semi-Final 1",
      team2Placeholder: "Winner Semi-Final 2",
      winnerId: null,
      date: "Jul 19, 2026",
      status: "scheduled" as const,
    }];

    setBracket({
      roundOf32: initialR32,
      roundOf16: initialR16,
      quarterFinals: initialQf,
      semiFinals: initialSf,
      finals: initialF,
      champion: null,
    });
  }, []);

  // Trigger staggered push notifications for already completed matches on mount
  useEffect(() => {
    const notificationsToTrigger = [
      {
        delay: 3000,
        title: "Match Completed (R32)",
        body: "🇿🇦 South Africa vs 🇨🇦 Canada (0 - 2). Canada advances to the Round of 16!"
      },
      {
        delay: 8000,
        title: "Match Completed (R32)",
        body: "🇧🇷 Brazil vs 🇯🇵 Japan (2 - 0). Brazil secures their Round of 16 spot!"
      },
      {
        delay: 13000,
        title: "Match Completed (R32)",
        body: "🇩🇪 Germany vs 🇵🇾 Paraguay (1 - 2). Stunning upset by Paraguay!"
      },
      {
        delay: 18000,
        title: "Match Completed (R32)",
        body: "🇳🇱 Netherlands vs 🇲🇦 Morocco (1 - 2). Morocco wins and advances!"
      }
    ];

    const timers = notificationsToTrigger.map(notif => {
      return setTimeout(() => {
        triggerPushNotification(notif.title, notif.body);
      }, notif.delay);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Save bracket and sync to central database under active user
  useEffect(() => {
    if (bracket && bracket.roundOf32 && bracket.roundOf32.length > 0) {
      localStorage.setItem("fifa_user_bracket", JSON.stringify(bracket));

      if (user.isLoggedIn && user.email) {
        const savedPreds = localStorage.getItem("fifa_sim_user_predictions");
        let allPreds = [];
        if (savedPreds) {
          try {
            allPreds = JSON.parse(savedPreds);
          } catch (e) {
            console.error("Failed to load user predictions inside App sync hook", e);
          }
        }

        let found = false;
        const updatedPreds = allPreds.map((p: any) => {
          if (p.profile.email === user.email) {
            found = true;
            return {
              ...p,
              profile: {
                ...p.profile,
                name: user.name,
                avatar: user.avatar,
                coins: user.coins,
                xp: user.xp,
                level: user.level,
              },
              bracket: bracket
            };
          }
          return p;
        });

        if (!found) {
          updatedPreds.push({
            profile: {
              uid: user.uid || ("user_created_" + Math.random().toString(36).substr(2, 9)),
              name: user.name,
              email: user.email,
              avatar: user.avatar || "🏅",
              isLoggedIn: true,
              xp: user.xp || 150,
              coins: user.coins || 50,
              level: user.level || 1,
              badges: user.badges || ["Pioneer Predictor"],
              dailyStreak: user.dailyStreak || 1,
            },
            bracket: bracket,
            dailyPredictions: [
              { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "USA Wins", status: "correct" },
              { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Vinicius Jr.", status: "correct" },
              { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Lamine Yamal", status: "pending" }
            ]
          });
        }

        localStorage.setItem("fifa_sim_user_predictions", JSON.stringify(updatedPreds));
      }
    }
  }, [bracket, user]);

  const isAdmin = user.isLoggedIn && user.email === "anirudhpkndl@gmail.com";

  useEffect(() => {
    if (!isAdmin && activeTab !== "bracket" && activeTab !== "dashboard") {
      setActiveTab("bracket");
    }
  }, [user, activeTab, isAdmin]);

  // Save prediction logic after choice - lets guest see the celebration, then choose how to save
  const handleChampionChosen = (team: Team) => {
    setSelectedChampion(team);
  };

  const handleQuickSave = (name: string, emailOrPhone: string) => {
    const isEnterAdmin = emailOrPhone.trim() === "anirudhpkndl@gmail.com";
    const profile: UserProfile = {
      uid: "guest_save_" + Math.random().toString(36).substr(2, 9),
      name: isEnterAdmin ? "Anirudh P (Admin)" : (name || "Predictor Guest"),
      email: emailOrPhone,
      avatar: isEnterAdmin ? "👑" : "🏅",
      isLoggedIn: true,
      xp: isEnterAdmin ? 350 : 150,
      coins: isEnterAdmin ? 120 : 50,
      level: isEnterAdmin ? 5 : 1,
      badges: isEnterAdmin ? ["Platform Creator", "Legend Predictor"] : ["Pioneer Predictor"],
      dailyStreak: isEnterAdmin ? 3 : 1,
    };
    setUser(profile);
    audioSynth.playSelection();
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setShowLoginModal(false);
    audioSynth.playSelection();
  };

  const toggleMute = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    audioSynth.setMute(nextState);
    if (!nextState) {
      audioSynth.startStadiumAmbience();
      audioSynth.playTick();
    }
  };

  const handleAddBroadcast = (msg: string) => {
    setBroadcasts(prev => [`📢 BROADCAST: ${msg}`, ...prev]);
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-black text-white font-sans relative select-none">
      
      {/* Background Stadium grass texture & lights */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.08)_0%,rgba(0,0,0,1)_100%)] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <LandingPage 
            key="landing" 
            onStart={() => setHasStarted(true)} 
            lang={lang} 
            setLang={setLang} 
          />
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full min-h-screen flex flex-col justify-between"
          >
            {/* Top Broadcast Banners */}
            {broadcasts.length > 0 && (
              <div className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-emerald-600 text-black py-2.5 px-6 flex items-center justify-between text-xs font-bold tracking-wide shadow-md z-30 font-sans">
                <div className="flex items-center gap-2 truncate">
                  <Radio className="w-4 h-4 shrink-0 text-black animate-pulse" />
                  <span className="truncate">{broadcasts[0]}</span>
                </div>
                <button
                  onClick={() => setBroadcasts(prev => prev.slice(1))}
                  className="p-1 rounded hover:bg-black/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Platform Main HUD Navigation Header */}
            <header className="w-full bg-neutral-950/80 border-b border-white/5 backdrop-blur-xl sticky top-0 z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                
                {/* Brand Logo */}
                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => audioSynth.playTick()}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] shrink-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                  <div>
                    <h1 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase font-sans">FIFA 2026</h1>
                    <span className="text-[8px] sm:text-[10px] text-neutral-400 font-mono tracking-wider hidden xs:inline">PREDICTOR</span>
                  </div>
                </div>

                {/* Tab Navigation Controls */}
                <nav className="hidden md:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => { setActiveTab("bracket"); audioSynth.playTick(); }}
                    className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                      activeTab === "bracket" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Bracket
                  </button>
                  
                  {(user.isLoggedIn || localStorage.getItem("fifa_user_bracket")) && (
                    <button
                      onClick={() => { setActiveTab("dashboard"); audioSynth.playTick(); }}
                      className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                        activeTab === "dashboard" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Dashboard
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => { setActiveTab("ads"); audioSynth.playTick(); }}
                        className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          activeTab === "ads" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        Ads Manager
                      </button>
                      <button
                        onClick={() => { setActiveTab("admin"); audioSynth.playTick(); }}
                        className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          activeTab === "admin" ? "bg-red-500 text-white shadow-md" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        Admin Portal
                      </button>
                    </>
                  )}
                </nav>

                {/* Right side utilities */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {/* Language Selector */}
                  <select
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value as LanguageCode);
                      audioSynth.playTick();
                    }}
                    className="bg-neutral-900 border border-white/5 rounded-lg text-[10px] sm:text-xs text-white px-2 sm:px-3 py-1 sm:py-1.5 outline-none cursor-pointer focus:border-yellow-500/50 hover:bg-neutral-800 transition"
                  >
                    <option value="en">English</option>
                    <option value="ml">മലയാളം</option>
                    <option value="hi">हिंदी</option>
                    <option value="ar">العربية</option>
                    <option value="es">Español</option>
                    <option value="pt">Português</option>
                  </select>

                  {/* Sound Controller */}
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:border-yellow-500/50 transition cursor-pointer shrink-0"
                    title="Mute Toggle"
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-yellow-500 animate-bounce" />}
                  </button>

                  {/* Login Indicator */}
                  {user.isLoggedIn ? (
                    <div className="flex items-center gap-1.5 sm:gap-2.5 bg-neutral-900 border border-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shrink-0">
                      <span className="text-sm sm:text-base">{user.avatar}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-neutral-300 hidden sm:inline max-w-[80px] truncate">{user.name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowLoginModal(true); audioSynth.playTick(); }}
                      className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[10px] sm:text-xs tracking-wider rounded-xl transition cursor-pointer uppercase shrink-0"
                    >
                      <LogIn className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> <span className="hidden xs:inline">Login</span><span className="xs:hidden">In</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Tab navigation drawer bar */}
              <div className="md:hidden flex border-t border-white/5 p-1 bg-neutral-900/40 gap-1 overflow-x-auto justify-around">
                <button
                  onClick={() => { setActiveTab("bracket"); audioSynth.playTick(); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                    activeTab === "bracket" ? "bg-yellow-500 text-black" : "text-neutral-400"
                  }`}
                >
                  Bracket
                </button>
                
                {(user.isLoggedIn || localStorage.getItem("fifa_user_bracket")) && (
                  <button
                    onClick={() => { setActiveTab("dashboard"); audioSynth.playTick(); }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                      activeTab === "dashboard" ? "bg-yellow-500 text-black" : "text-neutral-400"
                    }`}
                  >
                    Dashboard
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => { setActiveTab("ads"); audioSynth.playTick(); }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                        activeTab === "ads" ? "bg-yellow-500 text-black" : "text-neutral-400"
                      }`}
                    >
                      Ads
                    </button>
                    <button
                      onClick={() => { setActiveTab("admin"); audioSynth.playTick(); }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                        activeTab === "admin" ? "bg-red-500 text-white" : "text-neutral-400"
                      }`}
                    >
                      Admin
                    </button>
                  </>
                )}
              </div>
            </header>

            {/* Main Section Content Stage */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-12 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "bracket" && (
                  <motion.div
                    key="bracket-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {predictionsFrozen && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-2xl text-xs font-mono flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 animate-bounce" />
                        <div>
                          <p className="font-bold uppercase">Predictions Frozen</p>
                          <p className="text-neutral-400 mt-0.5">The tournament matches have kicked off. Predictions are locked until the active fixtures finish.</p>
                        </div>
                      </div>
                    )}

                    <BracketSection 
                      bracket={bracket} 
                      setBracket={setBracket} 
                      onChampionSelected={handleChampionChosen} 
                      lang={lang}
                      onNavigateTab={setActiveTab}
                    />

                    {/* Highly Polished Football In-Feed Google AdSense Leaderboard Banner */}
                    <div className="pt-6 border-t border-white/5">
                      <AdSenseBanner 
                        format="leaderboard" 
                        publisherId={adSettings.publisherId} 
                        onAdClicked={handleAdClick} 
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Dashboard 
                      user={user} 
                      setUser={setUser} 
                      lang={lang} 
                      onAdClicked={handleAdClick}
                      publisherId={adSettings.publisherId}
                      bracket={bracket}
                      setBracket={setBracket}
                      onNavigateTab={setActiveTab}
                    />
                  </motion.div>
                )}

                {activeTab === "admin" && (
                  <motion.div
                    key="admin-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AdminPanel 
                      onAddBroadcast={handleAddBroadcast} 
                      lang={lang} 
                      predictionsFrozen={predictionsFrozen}
                      setPredictionsFrozen={setPredictionsFrozen}
                      user={user}
                      setUser={setUser}
                    />
                  </motion.div>
                )}

                {activeTab === "ads" && (
                  <motion.div
                    key="ads-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AdsManager 
                      settings={adSettings} 
                      setSettings={setAdSettings} 
                      lang={lang} 
                      performanceStats={adStats}
                    />
                  </motion.div>
                )}
              </AnimatePresence>


            </main>

            {/* Sticky interactive bottom banner ad preview with live tracking */}
            <AdSenseBanner 
              format="sticky" 
              publisherId={adSettings.publisherId} 
              onAdClicked={handleAdClick} 
            />

            {/* Footer Credits */}
            <footer className="w-full border-t border-white/5 py-6 text-center text-[11px] font-mono text-neutral-500">
              <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span>© 2026 FIFA World Cup Prediction Platform.</span>
                <span>HOST CITY: UNITED STATES • MEXICO • CANADA</span>
              </div>
            </footer>

            {/* 1. Champion Celebration overlay */}
            <AnimatePresence>
              {selectedChampion && (
                <ChampionOverlay 
                  champion={selectedChampion} 
                  bracket={bracket} 
                  onClose={() => setSelectedChampion(null)} 
                  lang={lang}
                  isLoggedIn={user.isLoggedIn}
                  onTriggerLogin={() => setShowLoginModal(true)}
                  onQuickSave={handleQuickSave}
                />
              )}
            </AnimatePresence>

             {/* 2. Login Sync gate overlay */}
            <AnimatePresence>
              {showLoginModal && (
                <LoginModal 
                  onSuccess={handleLoginSuccess} 
                  onClose={() => setShowLoginModal(false)} 
                  lang={lang}
                />
              )}
            </AnimatePresence>

            {/* Real-time Push Notifications Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
              <AnimatePresence>
                {pushNotifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ x: 100, y: -20, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, opacity: 0, scale: 0.9 }}
                    className="bg-neutral-900/95 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md pointer-events-auto flex gap-3 items-start relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <span className="text-xl mt-0.5 select-none">🏆</span>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {notif.title}
                      </h4>
                      <p className="text-[10px] text-neutral-300 font-mono leading-normal">{notif.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushNotifications(prev => prev.filter(n => n.id !== notif.id))}
                      className="text-neutral-500 hover:text-white transition p-1 text-xs cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Real-Time UPI Ad Revenue Deposit Toast Overlay removed for user-side peace-of-mind */}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
