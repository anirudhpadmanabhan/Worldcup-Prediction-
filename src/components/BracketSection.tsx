import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, HelpCircle, Trophy, Zap, RefreshCw, Calendar, Share2 } from "lucide-react";
import { Team, Match, Bracket, LanguageCode } from "../types";
import { TEAMS, getTeamById, getFlagUrl } from "../data/teams";
import { TRANSLATIONS } from "../data/translations";
import { audioSynth } from "../utils/audio";
import ShareBracketModal from "./ShareBracketModal";

interface BracketSectionProps {
  bracket: Bracket;
  setBracket: React.Dispatch<React.SetStateAction<Bracket>>;
  onChampionSelected: (team: Team) => void;
  lang: LanguageCode;
  onNavigateTab?: (tab: "bracket" | "dashboard" | "admin" | "ads") => void;
}

export default function BracketSection({ bracket, setBracket, onChampionSelected, lang, onNavigateTab }: BracketSectionProps) {
  const [activeRound, setActiveRound] = useState<"r32" | "r16" | "qf" | "sf" | "f">("r32");
  const [sortBy, setSortBy] = useState<"bracket" | "date">("bracket");
  const [lastPredictedMatchId, setLastPredictedMatchId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [coords, setCoords] = useState<{ x1: number; y1: number; x2: number; y2: number; active: boolean; winnerPredicted: boolean }[]>([]);
  
  // Refs to auto scroll to next rounds
  const r32Ref = useRef<HTMLDivElement>(null);
  const r16Ref = useRef<HTMLDivElement>(null);
  const qfRef = useRef<HTMLDivElement>(null);
  const sfRef = useRef<HTMLDivElement>(null);
  const fRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const updateCoords = () => {
      const container = document.getElementById("bracket-tree-inner");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newCoords: typeof coords = [];

      // Helper to add a connection
      const addConnection = (el1Id: string, el2Id: string, isWinnerSelected: boolean, isWinnerCorrect: boolean) => {
        const el1 = document.getElementById(el1Id);
        const el2 = document.getElementById(el2Id);
        if (el1 && el2) {
          const rect1 = el1.getBoundingClientRect();
          const rect2 = el2.getBoundingClientRect();

          const x1 = rect1.right - containerRect.left;
          const y1 = rect1.top + rect1.height / 2 - containerRect.top;

          const x2 = rect2.left - containerRect.left;
          const y2 = rect2.top + rect2.height / 2 - containerRect.top;

          newCoords.push({ x1, y1, x2, y2, active: isWinnerSelected, winnerPredicted: isWinnerCorrect });
        }
      };

      // 1. R32 to R16
      bracket.roundOf32.forEach((match, i) => {
        const originalIdx = i;
        const nextIdx = Math.floor(originalIdx / 2);
        const winnerSelected = match.winnerId !== null;
        addConnection(`match-card-r32-${match.id}`, `match-card-r16-r16-m${nextIdx}`, winnerSelected, winnerSelected);
      });

      // 2. R16 to QF
      bracket.roundOf16.forEach((match, i) => {
        const nextIdx = Math.floor(i / 2);
        const winnerSelected = match.winnerId !== null;
        addConnection(`match-card-r16-${match.id}`, `match-card-qf-qf-m${nextIdx}`, winnerSelected, winnerSelected);
      });

      // 3. QF to SF
      bracket.quarterFinals.forEach((match, i) => {
        const nextIdx = Math.floor(i / 2);
        const winnerSelected = match.winnerId !== null;
        addConnection(`match-card-qf-${match.id}`, `match-card-sf-sf-m${nextIdx}`, winnerSelected, winnerSelected);
      });

      // 4. SF to F
      bracket.semiFinals.forEach((match, i) => {
        const winnerSelected = match.winnerId !== null;
        addConnection(`match-card-sf-${match.id}`, `match-card-f-f-m0`, winnerSelected, winnerSelected);
      });

      // 5. F to Champ
      if (bracket.finals[0]) {
        const winnerSelected = bracket.finals[0].winnerId !== null;
        addConnection(`match-card-f-f-m0`, `match-card-champ`, winnerSelected, winnerSelected);
      }

      setCoords(newCoords);
    };

    updateCoords();
    window.addEventListener("resize", updateCoords);
    
    const timer1 = setTimeout(updateCoords, 100);
    const timer2 = setTimeout(updateCoords, 300);
    const timer3 = setTimeout(updateCoords, 600);

    return () => {
      window.removeEventListener("resize", updateCoords);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [bracket, activeRound, sortBy]);

  // Auto-advance to the next incomplete match to eliminate any confusion
  useEffect(() => {
    if (!lastPredictedMatchId) return;

    // Reset the tracker
    setLastPredictedMatchId(null);

    // Identify which round the predicted match belongs to
    let roundKey: "r32" | "r16" | "qf" | "sf" | "f" = "r32";
    let matchesOrdered: Match[] = [];

    if (bracket.roundOf32.some(m => m.id === lastPredictedMatchId)) {
      roundKey = "r32";
      matchesOrdered = sortBy === "date"
        ? [...bracket.roundOf32].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        : bracket.roundOf32;
    } else if (bracket.roundOf16.some(m => m.id === lastPredictedMatchId)) {
      roundKey = "r16";
      matchesOrdered = bracket.roundOf16;
    } else if (bracket.quarterFinals.some(m => m.id === lastPredictedMatchId)) {
      roundKey = "qf";
      matchesOrdered = bracket.quarterFinals;
    } else if (bracket.semiFinals.some(m => m.id === lastPredictedMatchId)) {
      roundKey = "sf";
      matchesOrdered = bracket.semiFinals;
    } else if (bracket.finals.some(m => m.id === lastPredictedMatchId)) {
      roundKey = "f";
      matchesOrdered = bracket.finals;
    }

    const currentIdx = matchesOrdered.findIndex(m => m.id === lastPredictedMatchId);
    if (currentIdx !== -1) {
      // Find the next incomplete match in the active round
      const nextIncomplete = matchesOrdered.slice(currentIdx + 1).find(m => m.winnerId === null)
        || matchesOrdered.find(m => m.winnerId === null && m.id !== lastPredictedMatchId);

      if (nextIncomplete) {
        setTimeout(() => {
          const nextEl = document.getElementById(`match-card-${roundKey}-${nextIncomplete.id}`);
          if (nextEl) {
            // Instantly and smoothly scroll to make both countries in the match card centered and fully visible
            nextEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
            nextEl.classList.add("ring-2", "ring-yellow-500/60", "scale-[1.02]", "bg-neutral-900/90", "shadow-[0_0_25px_rgba(234,179,8,0.2)]");
            setTimeout(() => {
              nextEl.classList.remove("ring-2", "ring-yellow-500/60", "scale-[1.02]", "bg-neutral-900/90", "shadow-[0_0_25px_rgba(234,179,8,0.2)]");
            }, 1000);
          }
        }, 50);
      }
    }
  }, [bracket, lastPredictedMatchId, sortBy]);

  // Helper to calculate completion stats
  const countCompleted = (matches: Match[]) => matches.filter(m => m.winnerId !== null).length;
  
  const r32Completed = countCompleted(bracket.roundOf32);
  const r16Completed = countCompleted(bracket.roundOf16);
  const qfCompleted = countCompleted(bracket.quarterFinals);
  const sfCompleted = countCompleted(bracket.semiFinals);
  const fCompleted = countCompleted(bracket.finals);

  const totalCompleted = r32Completed + r16Completed + qfCompleted + sfCompleted + fCompleted;
  const progressPercent = Math.round((totalCompleted / 31) * 100);

  // Auto navigation effect based on round completion
  useEffect(() => {
    if (r32Completed === 16 && r16Completed < 8) {
      setActiveRound("r16");
      setTimeout(() => {
        const nextIncomplete = bracket.roundOf16.find(m => m.winnerId === null);
        if (nextIncomplete) {
          const el = document.getElementById(`match-card-r16-${nextIncomplete.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          } else {
            r16Ref.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          }
        } else {
          r16Ref.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
      }, 100);
    } else if (r16Completed === 8 && qfCompleted < 4) {
      setActiveRound("qf");
      setTimeout(() => {
        const nextIncomplete = bracket.quarterFinals.find(m => m.winnerId === null);
        if (nextIncomplete) {
          const el = document.getElementById(`match-card-qf-${nextIncomplete.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          } else {
            qfRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          }
        } else {
          qfRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
      }, 100);
    } else if (qfCompleted === 4 && sfCompleted < 2) {
      setActiveRound("sf");
      setTimeout(() => {
        const nextIncomplete = bracket.semiFinals.find(m => m.winnerId === null);
        if (nextIncomplete) {
          const el = document.getElementById(`match-card-sf-${nextIncomplete.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          } else {
            sfRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          }
        } else {
          sfRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
      }, 100);
    } else if (sfCompleted === 2 && fCompleted < 1) {
      setActiveRound("f");
      setTimeout(() => {
        const nextIncomplete = bracket.finals.find(m => m.winnerId === null);
        if (nextIncomplete) {
          const el = document.getElementById(`match-card-f-${nextIncomplete.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          } else {
            fRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          }
        } else {
          fRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
      }, 100);
    } else if (fCompleted === 1 && bracket.champion) {
      setTimeout(() => {
        champRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }, 100);
    }
  }, [r32Completed, r16Completed, qfCompleted, sfCompleted, fCompleted, bracket.champion]);

  // Handle Match Selection & Progression
  const selectWinner = (roundKey: "r32" | "r16" | "qf" | "sf" | "f", matchIndex: number, winnerId: string) => {
    audioSynth.playSelection();

    let matchId = "";
    if (roundKey === "r32") matchId = bracket.roundOf32[matchIndex].id;
    else if (roundKey === "r16") matchId = bracket.roundOf16[matchIndex].id;
    else if (roundKey === "qf") matchId = bracket.quarterFinals[matchIndex].id;
    else if (roundKey === "sf") matchId = bracket.semiFinals[matchIndex].id;
    else if (roundKey === "f") matchId = bracket.finals[matchIndex].id;

    setLastPredictedMatchId(matchId);

    setBracket((prev) => {
      const next = { ...prev };

      if (roundKey === "r32") {
        next.roundOf32 = [...prev.roundOf32];
        next.roundOf32[matchIndex] = { ...next.roundOf32[matchIndex], winnerId };
        
        // Propagate to Round of 16
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isTeam1 = matchIndex % 2 === 0;
        next.roundOf16 = [...prev.roundOf16];
        const nextMatch = { ...next.roundOf16[nextMatchIndex] };
        if (isTeam1) {
          nextMatch.team1Id = winnerId;
        } else {
          nextMatch.team2Id = winnerId;
        }
        // Invalidate next rounds' selections if changed
        if (nextMatch.winnerId && nextMatch.winnerId !== winnerId) {
          nextMatch.winnerId = null;
          // Recursively clear down stream matches
          clearDownstream(next, "r16", nextMatchIndex);
        }
        next.roundOf16[nextMatchIndex] = nextMatch;
      } 
      
      else if (roundKey === "r16") {
        next.roundOf16 = [...prev.roundOf16];
        next.roundOf16[matchIndex] = { ...next.roundOf16[matchIndex], winnerId };
        
        // Propagate to Quarter Finals
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isTeam1 = matchIndex % 2 === 0;
        next.quarterFinals = [...prev.quarterFinals];
        const nextMatch = { ...next.quarterFinals[nextMatchIndex] };
        if (isTeam1) {
          nextMatch.team1Id = winnerId;
        } else {
          nextMatch.team2Id = winnerId;
        }
        if (nextMatch.winnerId && nextMatch.winnerId !== winnerId) {
          nextMatch.winnerId = null;
          clearDownstream(next, "qf", nextMatchIndex);
        }
        next.quarterFinals[nextMatchIndex] = nextMatch;
      } 
      
      else if (roundKey === "qf") {
        next.quarterFinals = [...prev.quarterFinals];
        next.quarterFinals[matchIndex] = { ...next.quarterFinals[matchIndex], winnerId };
        
        // Propagate to Semi Finals
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isTeam1 = matchIndex % 2 === 0;
        next.semiFinals = [...prev.semiFinals];
        const nextMatch = { ...next.semiFinals[nextMatchIndex] };
        if (isTeam1) {
          nextMatch.team1Id = winnerId;
        } else {
          nextMatch.team2Id = winnerId;
        }
        if (nextMatch.winnerId && nextMatch.winnerId !== winnerId) {
          nextMatch.winnerId = null;
          clearDownstream(next, "sf", nextMatchIndex);
        }
        next.semiFinals[nextMatchIndex] = nextMatch;
      } 
      
      else if (roundKey === "sf") {
        next.semiFinals = [...prev.semiFinals];
        next.semiFinals[matchIndex] = { ...next.semiFinals[matchIndex], winnerId };
        
        // Propagate to Finals
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isTeam1 = matchIndex % 2 === 0;
        next.finals = [...prev.finals];
        const nextMatch = { ...next.finals[nextMatchIndex] };
        if (isTeam1) {
          nextMatch.team1Id = winnerId;
        } else {
          nextMatch.team2Id = winnerId;
        }
        if (nextMatch.winnerId && nextMatch.winnerId !== winnerId) {
          nextMatch.winnerId = null;
          next.champion = null;
        }
        next.finals[nextMatchIndex] = nextMatch;
      } 
      
      else if (roundKey === "f") {
        next.finals = [...prev.finals];
        next.finals[matchIndex] = { ...next.finals[matchIndex], winnerId };
        
        const champTeam = getTeamById(winnerId);
        next.champion = champTeam;
        if (champTeam) {
          // Trigger champion fireworks celebration overlay
          setTimeout(() => {
            onChampionSelected(champTeam);
          }, 300);
        }
      }

      return next;
    });
  };

  // Helper to clear selections if team changes
  const clearDownstream = (next: Bracket, startRound: "r16" | "qf" | "sf", matchIndex: number) => {
    if (startRound === "r16") {
      // Clear QF parent
      const qfIdx = Math.floor(matchIndex / 2);
      const isTeam1 = matchIndex % 2 === 0;
      const qfMatch = { ...next.quarterFinals[qfIdx] };
      if (isTeam1) qfMatch.team1Id = null; else qfMatch.team2Id = null;
      qfMatch.winnerId = null;
      next.quarterFinals[qfIdx] = qfMatch;
      
      // Clear SF parent
      const sfIdx = Math.floor(qfIdx / 2);
      const isSfTeam1 = qfIdx % 2 === 0;
      const sfMatch = { ...next.semiFinals[sfIdx] };
      if (isSfTeam1) sfMatch.team1Id = null; else sfMatch.team2Id = null;
      sfMatch.winnerId = null;
      next.semiFinals[sfIdx] = sfMatch;

      // Clear Finals parent
      const fMatch = { ...next.finals[0] };
      const isFTeam1 = sfIdx % 2 === 0;
      if (isFTeam1) fMatch.team1Id = null; else fMatch.team2Id = null;
      fMatch.winnerId = null;
      next.finals[0] = fMatch;
      next.champion = null;
    } else if (startRound === "qf") {
      const sfIdx = Math.floor(matchIndex / 2);
      const isTeam1 = matchIndex % 2 === 0;
      const sfMatch = { ...next.semiFinals[sfIdx] };
      if (isTeam1) sfMatch.team1Id = null; else sfMatch.team2Id = null;
      sfMatch.winnerId = null;
      next.semiFinals[sfIdx] = sfMatch;

      const fMatch = { ...next.finals[0] };
      const isFTeam1 = sfIdx % 2 === 0;
      if (isFTeam1) fMatch.team1Id = null; else fMatch.team2Id = null;
      fMatch.winnerId = null;
      next.finals[0] = fMatch;
      next.champion = null;
    } else if (startRound === "sf") {
      const fMatch = { ...next.finals[0] };
      const isTeam1 = matchIndex % 2 === 0;
      if (isTeam1) fMatch.team1Id = null; else fMatch.team2Id = null;
      fMatch.winnerId = null;
      next.finals[0] = fMatch;
      next.champion = null;
    }
  };

  const resetPredictions = () => {
    audioSynth.playCinematicZoom();
    const freshR32 = bracket.roundOf32.map(m => {
      const isRsaCan = m.team1Id === "rsa" && m.team2Id === "can";
      const isBraJpn = m.team1Id === "bra" && m.team2Id === "jpn";
      const isGerPar = m.team1Id === "ger" && m.team2Id === "par";
      const isNedMar = m.team1Id === "ned" && m.team2Id === "mar";
      return {
        ...m,
        winnerId: isRsaCan ? "can" : (isBraJpn ? "bra" : (isGerPar ? "par" : (isNedMar ? "mar" : null))),
        status: (isRsaCan || isBraJpn || isGerPar || isNedMar ? "completed" : "scheduled") as "completed" | "scheduled"
      };
    });
    const freshR16 = Array.from({ length: 8 }, (_, i) => {
      const day = 4 + Math.floor(i / 2);
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
        status: "scheduled" as const
      };
    });
    const freshQf = Array.from({ length: 4 }, (_, i) => {
      const day = 9 + Math.floor(i / 1.5);
      return {
        id: `qf-m${i}`,
        team1Id: null,
        team2Id: null,
        team1Placeholder: `Winner R16 Match ${i * 2 + 1}`,
        team2Placeholder: `Winner R16 Match ${i * 2 + 2}`,
        winnerId: null,
        date: `Jul ${day}, 2026`,
        status: "scheduled" as const
      };
    });
    const freshSf = Array.from({ length: 2 }, (_, i) => {
      const day = 14 + i;
      return {
        id: `sf-m${i}`,
        team1Id: null,
        team2Id: null,
        team1Placeholder: `Winner QF Match ${i * 2 + 1}`,
        team2Placeholder: `Winner QF Match ${i * 2 + 2}`,
        winnerId: null,
        date: `Jul ${day}, 2026`,
        status: "scheduled" as const
      };
    });
    const freshF = [{
      id: "f-m0",
      team1Id: null,
      team2Id: null,
      team1Placeholder: "Winner Semi-Final 1",
      team2Placeholder: "Winner Semi-Final 2",
      winnerId: null,
      date: "Jul 19, 2026",
      status: "scheduled" as const
    }];

    setBracket({
      roundOf32: freshR32,
      roundOf16: freshR16,
      quarterFinals: freshQf,
      semiFinals: freshSf,
      finals: freshF,
      champion: null
    });
    setActiveRound("r32");
  };

  // Quick helper to render country glass card
  const renderCountryCard = (
    teamId: string | null,
    placeholder: string,
    isWinner: boolean,
    onClick: () => void,
    isInteractive: boolean
  ) => {
    const team = getTeamById(teamId);

    if (!team) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/35 border border-white/5 rounded-xl text-neutral-500 text-xs font-mono select-none">
          <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">
            ?
          </div>
          <span className="truncate max-w-[120px]">{placeholder}</span>
        </div>
      );
    }

    return (
      <motion.div
        whileHover={isInteractive ? { scale: 1.04, y: -1 } : {}}
        whileTap={isInteractive ? { scale: 0.98 } : {}}
        onHoverStart={() => isInteractive && audioSynth.playTick()}
        onClick={() => isInteractive && onClick()}
        className={`flex items-center justify-between px-4 py-3 bg-neutral-900/60 border rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-md select-none group relative overflow-hidden ${
          isWinner
            ? "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white"
            : "border-white/10 text-neutral-300 hover:border-yellow-500/40"
        }`}
      >
        {/* Dynamic Country Flag Gradient Orb */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-5.5 rounded bg-neutral-950 flex items-center justify-center overflow-hidden border border-white/10 relative shrink-0 shadow-sm">
            <img src={getFlagUrl(team.id)} alt={team.name} className="w-full h-full object-cover relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide">{team.name}</span>
            <span className="text-[10px] font-mono text-neutral-400">Rank: #{team.ranking}</span>
          </div>
        </div>

        {isWinner && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      {onNavigateTab && (
        <div className="flex justify-start">
          <button
            onClick={() => {
              onNavigateTab("dashboard");
              audioSynth.playSelection();
            }}
            className="flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg active:scale-95 uppercase tracking-wider font-mono"
          >
            ← BACK TO ARENA DASHBOARD
          </button>
        </div>
      )}

      {/* Dynamic Header Metrics Bar */}
      <div className="w-full bg-neutral-950/80 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-lg relative overflow-hidden">
        {/* Decorative Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center animate-pulse">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide uppercase font-sans">
              {t.title}
            </h2>
            <p className="text-xs text-neutral-400 font-mono tracking-wider">
              {t.progress}: <span className="text-emerald-400 font-bold">{progressPercent}%</span> Completed
            </p>
          </div>
        </div>

        {/* Global Progress Line Tracker */}
        <div className="flex-1 max-w-md w-full px-4 z-10">
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden relative border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1.5 uppercase">
            <span>R32</span>
            <span>R16</span>
            <span>QF</span>
            <span>SF</span>
            <span>Final</span>
          </div>
        </div>

        {/* Actions Button Container */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          {/* RESET Button */}
          <button
            onClick={resetPredictions}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-neutral-400 hover:text-white hover:border-yellow-500/50 cursor-pointer transition duration-300 font-mono font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RESET
          </button>

          {/* SHARE Button */}
          <button
            onClick={() => {
              setIsShareModalOpen(true);
              audioSynth.playSelection();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs tracking-wider rounded-xl cursor-pointer transition duration-300 shadow-[0_4px_15px_rgba(234,179,8,0.25)]"
          >
            <Share2 className="w-3.5 h-3.5" /> SHARE MY BRACKET
          </button>
        </div>
      </div>

      {/* Main Bracket Interactive Scrolling Tree */}
      <div id="bracket-tree-container" className="w-full overflow-x-auto overflow-y-hidden py-8 px-4 scrollbar-thin scrollbar-thumb-neutral-800 relative">
        <div id="bracket-tree-inner" className="min-w-[1400px] flex gap-12 items-stretch justify-between relative">
          {/* Overlay SVG for Connecting Lines */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
            <g strokeLinecap="round" strokeLinejoin="round">
              {coords.map((line, idx) => {
                const xmid = line.x1 + (line.x2 - line.x1) / 2;
                const pathD = `M ${line.x1} ${line.y1} H ${xmid} V ${line.y2} H ${line.x2}`;
                return (
                  <g key={idx}>
                    {/* Background glow for active lines */}
                    {line.active && (
                      <path
                        d={pathD}
                        stroke={line.winnerPredicted ? "#10b981" : "#eab308"}
                        strokeWidth={6}
                        strokeOpacity={0.15}
                        fill="none"
                        className="blur-sm"
                      />
                    )}
                    {/* Foreground crisp path line */}
                    <path
                      d={pathD}
                      stroke={line.active 
                        ? (line.winnerPredicted ? "#10b981" : "#eab308") 
                        : "rgba(255, 255, 255, 0.05)"
                      }
                      strokeWidth={line.active ? 2.5 : 1.5}
                      strokeDasharray={line.active ? "none" : "3 3"}
                      fill="none"
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </g>
          </svg>
          
          {/* ================= ROUND OF 32 ================= */}
          <div ref={r32Ref} className="flex-1 flex flex-col justify-around gap-4 min-w-[260px]">
            <div className="text-center mb-2 flex flex-col gap-2 items-center">
              <span className="text-xs font-bold tracking-widest font-mono text-yellow-500 bg-yellow-500/5 px-4 py-1.5 rounded-full border border-yellow-500/15 uppercase">
                {t.roundOf32}
              </span>
              
              {/* Chronological Sorting Switcher */}
              <div className="flex bg-neutral-950/85 border border-white/5 p-1 rounded-xl text-[10px] font-mono select-none shadow-md">
                <button
                  onClick={() => { setSortBy("bracket"); audioSynth.playTick(); }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${sortBy === "bracket" ? "bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/10" : "text-neutral-500 hover:text-white"}`}
                >
                  BRACKET
                </button>
                <button
                  onClick={() => { setSortBy("date"); audioSynth.playTick(); }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${sortBy === "date" ? "bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/10" : "text-neutral-500 hover:text-white"}`}
                >
                  <Calendar className="w-3 h-3 text-yellow-500/80" /> DATE ORDER
                </button>
              </div>
            </div>

            {(() => {
              const r32MatchesToRender = sortBy === "date"
                ? [...bracket.roundOf32].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                : bracket.roundOf32;

              return r32MatchesToRender.map((match) => {
                const originalIdx = bracket.roundOf32.findIndex(m => m.id === match.id);
                return (
                  <div key={match.id} id={`match-card-r32-${match.id}`} className="p-4 bg-neutral-950/60 border border-white/5 rounded-2xl flex flex-col gap-2 relative shadow-md hover:border-white/10 transition-all duration-300">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono bg-neutral-900 border border-white/10 text-neutral-400 px-2 py-0.5 rounded-md">
                          MATCH {originalIdx + 1}
                        </span>
                        {match.status === "completed" && (
                          <span className="text-[8px] font-black font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Official Result
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                        <Calendar className="w-2.5 h-2.5 text-yellow-500/80" /> {match.date}
                      </span>
                    </div>
                    {renderCountryCard(match.team1Id, "Team A", match.winnerId === match.team1Id, () => selectWinner("r32", originalIdx, match.team1Id!), match.team1Id !== null && match.status !== "completed")}
                    {renderCountryCard(match.team2Id, "Team B", match.winnerId === match.team2Id, () => selectWinner("r32", originalIdx, match.team2Id!), match.team2Id !== null && match.status !== "completed")}
                    {match.winnerId && (
                      <div className="mt-1 text-[8px] font-mono text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 animate-pulse">
                        <Zap className="w-2.5 h-2.5" /> ADVANCES TO R16 M{Math.floor(originalIdx / 2) + 1}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* ================= ROUND OF 16 ================= */}
          <div ref={r16Ref} className="flex-1 flex flex-col justify-around gap-8 min-w-[240px]">
            <div className="text-center mb-2">
              <span className={`text-xs font-bold tracking-widest font-mono px-4 py-1.5 rounded-full border uppercase ${activeRound === "r16" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse" : "text-neutral-500 bg-neutral-950 border-white/5"}`}>
                {t.roundOf16}
              </span>
            </div>
            {bracket.roundOf16.map((match, idx) => (
              <div key={match.id} id={`match-card-r16-${match.id}`} className="p-4 bg-neutral-950/60 border border-white/5 rounded-2xl flex flex-col gap-2 relative shadow-md transition-all duration-300">
                <span className="absolute -top-2 left-4 text-[9px] font-mono bg-neutral-900 border border-white/10 text-neutral-400 px-2 rounded-md">
                  R16 M{idx + 1}
                </span>
                {renderCountryCard(match.team1Id, match.team1Placeholder || "Winner Match", match.winnerId === match.team1Id, () => selectWinner("r16", idx, match.team1Id!), match.team1Id !== null)}
                {renderCountryCard(match.team2Id, match.team2Placeholder || "Winner Match", match.winnerId === match.team2Id, () => selectWinner("r16", idx, match.team2Id!), match.team2Id !== null)}
                {match.winnerId && (
                  <div className="mt-1 text-[8px] font-mono text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 animate-pulse">
                    <Zap className="w-2.5 h-2.5" /> ADVANCES TO QF M{Math.floor(idx / 2) + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ================= QUARTER FINALS ================= */}
          <div ref={qfRef} className="flex-1 flex flex-col justify-around gap-16 min-w-[240px]">
            <div className="text-center mb-2">
              <span className={`text-xs font-bold tracking-widest font-mono px-4 py-1.5 rounded-full border uppercase ${activeRound === "qf" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse" : "text-neutral-500 bg-neutral-950 border-white/5"}`}>
                {t.quarterFinals}
              </span>
            </div>
            {bracket.quarterFinals.map((match, idx) => (
              <div key={match.id} id={`match-card-qf-${match.id}`} className="p-4 bg-neutral-950/60 border border-white/5 rounded-2xl flex flex-col gap-2 relative shadow-md transition-all duration-300">
                <span className="absolute -top-2 left-4 text-[9px] font-mono bg-neutral-900 border border-white/10 text-neutral-400 px-2 rounded-md">
                  QF M{idx + 1}
                </span>
                {renderCountryCard(match.team1Id, match.team1Placeholder || "Winner R16", match.winnerId === match.team1Id, () => selectWinner("qf", idx, match.team1Id!), match.team1Id !== null)}
                {renderCountryCard(match.team2Id, match.team2Placeholder || "Winner R16", match.winnerId === match.team2Id, () => selectWinner("qf", idx, match.team2Id!), match.team2Id !== null)}
                {match.winnerId && (
                  <div className="mt-1 text-[8px] font-mono text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 animate-pulse">
                    <Zap className="w-2.5 h-2.5" /> ADVANCES TO SF M{Math.floor(idx / 2) + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ================= SEMI FINALS ================= */}
          <div ref={sfRef} className="flex-1 flex flex-col justify-around gap-24 min-w-[240px]">
            <div className="text-center mb-2">
              <span className={`text-xs font-bold tracking-widest font-mono px-4 py-1.5 rounded-full border uppercase ${activeRound === "sf" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse" : "text-neutral-500 bg-neutral-950 border-white/5"}`}>
                {t.semiFinals}
              </span>
            </div>
            {bracket.semiFinals.map((match, idx) => (
              <div key={match.id} id={`match-card-sf-${match.id}`} className="p-4 bg-neutral-950/60 border border-white/5 rounded-2xl flex flex-col gap-2 relative shadow-md transition-all duration-300">
                <span className="absolute -top-2 left-4 text-[9px] font-mono bg-neutral-900 border border-white/10 text-neutral-400 px-2 rounded-md">
                  SF M{idx + 1}
                </span>
                {renderCountryCard(match.team1Id, match.team1Placeholder || "Winner QF", match.winnerId === match.team1Id, () => selectWinner("sf", idx, match.team1Id!), match.team1Id !== null)}
                {renderCountryCard(match.team2Id, match.team2Placeholder || "Winner QF", match.winnerId === match.team2Id, () => selectWinner("sf", idx, match.team2Id!), match.team2Id !== null)}
                {match.winnerId && (
                  <div className="mt-1 text-[8px] font-mono text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 animate-pulse">
                    <Zap className="w-2.5 h-2.5" /> ADVANCES TO WORLD CUP FINAL
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ================= GRAND FINAL ================= */}
          <div ref={fRef} className="flex-1 flex flex-col justify-center gap-32 min-w-[240px]">
            <div className="text-center mb-2">
              <span className={`text-xs font-bold tracking-widest font-mono px-4 py-1.5 rounded-full border uppercase ${activeRound === "f" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse" : "text-neutral-500 bg-neutral-950 border-white/5"}`}>
                {t.finals}
              </span>
            </div>
            {bracket.finals.map((match, idx) => (
              <div key={match.id} id={`match-card-f-${match.id}`} className="p-4 bg-neutral-950/80 border border-yellow-500/30 rounded-2xl flex flex-col gap-2 relative shadow-[0_0_30px_rgba(234,179,8,0.1)] transition-all duration-300">
                <span className="absolute -top-2 left-4 text-[9px] font-mono bg-yellow-950 border border-yellow-500/30 text-yellow-400 px-2 rounded-md">
                  WORLD CUP FINAL
                </span>
                {renderCountryCard(match.team1Id, match.team1Placeholder || "Winner SF 1", match.winnerId === match.team1Id, () => selectWinner("f", idx, match.team1Id!), match.team1Id !== null)}
                {renderCountryCard(match.team2Id, match.team2Placeholder || "Winner SF 2", match.winnerId === match.team2Id, () => selectWinner("f", idx, match.team2Id!), match.team2Id !== null)}
                {match.winnerId && (
                  <div className="mt-1 text-[8px] font-mono text-yellow-400 flex items-center justify-center gap-1 bg-yellow-500/10 py-1 px-2 rounded-lg border border-yellow-500/20 animate-pulse">
                    <Trophy className="w-2.5 h-2.5" /> WORLD CUP CHAMPION!
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ================= CHAMPION CELEBRATION NODE ================= */}
          <div ref={champRef} className="flex-1 flex flex-col justify-center items-center min-w-[200px] border-l border-white/5 pl-8">
            <span className="text-xs font-bold tracking-widest font-mono text-yellow-500 uppercase mb-4">
              {t.championLabel}
            </span>
            <div id="match-card-champ" className="w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-500/10 to-amber-500/20 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)] relative group hover:border-yellow-500 transition-all duration-300">
              <div className="absolute inset-2 rounded-full border border-dashed border-yellow-500/20" />
              {bracket.champion ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-16 h-11 rounded bg-neutral-950 border border-white/20 flex items-center justify-center shrink-0 shadow-md relative overflow-hidden">
                    <img src={getFlagUrl(bracket.champion.id)} alt={bracket.champion.name} className="w-full h-full object-cover relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
                  </div>
                  <span className="text-white font-black text-sm tracking-wide px-2 uppercase truncate max-w-[140px]">
                    {bracket.champion.name}
                  </span>
                  <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-neutral-500 text-xs">
                  <HelpCircle className="w-8 h-8 text-neutral-600 animate-pulse" />
                  <span>PREDICT WINNER</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Share predictions visual summary card modal overlay */}
      <ShareBracketModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        bracket={bracket} 
        lang={lang} 
      />
    </div>
  );
}
