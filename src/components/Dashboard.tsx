import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, Trophy, Coins, CheckCircle2, AlertCircle, X, 
  Eye, ShieldAlert, Award, PlayCircle
} from "lucide-react";
import { UserProfile, LanguageCode, Bracket, Match, Team } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { getTeamById, getFlagUrl } from "../data/teams";
import { audioSynth } from "../utils/audio";

interface DashboardProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  lang: LanguageCode;
  onAdClicked?: (format: string, revenueEarned: number) => void;
  publisherId?: string;
  bracket?: Bracket;
  setBracket?: React.Dispatch<React.SetStateAction<Bracket>>;
  onNavigateTab?: (tab: "bracket" | "dashboard" | "admin" | "ads") => void;
}

// Hardcoded map of official results/winners for completed fixtures
const OFFICIAL_WINNERS: Record<string, string> = {
  "r32-m0": "par", // Paraguay Wins
  "r32-m2": "can", // Canada Wins
  "r32-m3": "mar", // Morocco Wins
  "r32-m8": "bra", // Brazil Wins
};

// Deterministic simulated score generator
const getSimulatedMatchScore = (gameId: string, result: string, homeTeamCode: string, awayTeamCode: string) => {
  let score1 = 1;
  let score2 = 0;
  if (gameId === "r32-m0") { score1 = 1; score2 = 2; } // Germany vs Paraguay (Paraguay Wins)
  else if (gameId === "r32-m2") { score1 = 0; score2 = 2; } // South Africa vs Canada (Canada Wins)
  else if (gameId === "r32-m3") { score1 = 1; score2 = 2; } // Netherlands vs Morocco (Morocco Wins)
  else if (gameId === "r32-m8") { score1 = 2; score2 = 0; } // Brazil vs Japan (Brazil Wins)
  else {
    const codeSum = gameId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (result.includes("Draw")) {
      score1 = codeSum % 3;
      score2 = score1;
    } else if (result.includes("Wins") || result.includes("Win")) {
      const isHomeWinner = result.includes(homeTeamCode) || result.includes("Home");
      score1 = isHomeWinner ? (codeSum % 3) + 1 : codeSum % 2;
      score2 = isHomeWinner ? codeSum % 2 : (codeSum % 3) + 1;
      if (score1 === score2) {
        if (isHomeWinner) score1 += 1;
        else score2 += 1;
      }
    }
  }
  return { score1, score2 };
};

// Deterministic simulated stats based on match ID
const getSimulatedStats = (gameId: string) => {
  const hash = gameId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const possessionHome = 42 + (hash % 17); // between 42% and 58%
  const possessionAway = 100 - possessionHome;
  
  const shotsHome = 8 + (hash % 9); // 8 to 16
  const shotsAway = 7 + ((hash * 3) % 9); // 7 to 15
  
  const shotsOnTargetHome = Math.max(1, Math.round(shotsHome * (0.3 + (hash % 4) * 0.1)));
  const shotsOnTargetAway = Math.max(1, Math.round(shotsAway * (0.3 + ((hash * 2) % 4) * 0.1)));
  
  const foulsHome = 9 + (hash % 8); // 9 to 16
  const foulsAway = 8 + ((hash * 5) % 8); // 8 to 15
  
  const passAccuracyHome = 78 + (hash % 12); // 78% to 89%
  const passAccuracyAway = 77 + ((hash * 7) % 12); // 77% to 88%

  return {
    possessionHome,
    possessionAway,
    shotsHome,
    shotsAway,
    shotsOnTargetHome,
    shotsOnTargetAway,
    foulsHome,
    foulsAway,
    passAccuracyHome,
    passAccuracyAway
  };
};

// Dynamic simulated goalscorers based on team pools
const getSimulatedGoalscorers = (teamId: string, goals: number, seed: number) => {
  if (goals <= 0) return [];
  const playerPools: Record<string, string[]> = {
    usa: ["C. Pulisic", "F. Balogun", "T. Weah", "W. McKennie", "G. Reyna"],
    mex: ["S. Giménez", "H. Lozano", "E. Álvarez", "U. Antuna", "L. Chávez"],
    can: ["J. David", "A. Davies", "C. Larin", "T. Buchanan", "I. Koné"],
    ecu: ["E. Valencia", "K. Rodríguez", "M. Caicedo", "P. Estupiñán", "J. Sifuentes"],
    arg: ["L. Messi", "L. Martínez", "J. Álvarez", "A. Di María", "E. Fernández"],
    bra: ["Vinícius Jr.", "Rodrygo", "Richarlison", "Neymar Jr.", "Bruno Guimarães"],
    col: ["L. Díaz", "J. Rodríguez", "R. Borré", "J. Arias", "Y. Asprilla"],
    eng: ["H. Kane", "J. Bellingham", "B. Saka", "P. Foden", "M. Rashford"],
    fra: ["K. Mbappé", "A. Griezmann", "O. Dembélé", "M. Thuram", "K. Coman"],
    spa: ["Á. Morata", "L. Yamal", "N. Williams", "Dani Olmo", "Pedri"],
    ger: ["K. Havertz", "J. Musiala", "F. Wirtz", "N. Füllkrug", "L. Sané"],
    por: ["C. Ronaldo", "B. Fernandes", "R. Leão", "João Félix", "G. Ramos"],
    ned: ["C. Gakpo", "M. Depay", "X. Simons", "D. Malen", "W. Weghorst"],
    bel: ["R. Lukaku", "K. De Bruyne", "L. Trossard", "J. Doku", "Y. Tielemans"],
    cro: ["A. Kramarić", "L. Modrić", "I. Perišić", "M. Pašalić", "M. Kovačić"],
    swi: ["B. Embolo", "X. Shaqiri", "Z. Amdouni", "G. Xhaka", "R. Freuler"],
    mar: ["Y. En-Nesyri", "H. Ziyech", "A. Ounahi", "S. Boufal", "A. Hakimi"],
    sen: ["S. Mané", "N. Jackson", "I. Sarr", "P. Gueye", "L. Camara"],
    jpn: ["K. Mitoma", "A. Ueda", "T. Kubo", "R. Doan", "W. Endo"],
    aus: ["M. Duke", "C. Goodwin", "J. Bos", "M. Boyle", "K. Baccus"],
    rsa: ["P. Tau", "T. Zwane", "E. Makgopa", "T. Mokoena", "A. Modiba"],
    par: ["M. Almirón", "A. Sanabria", "J. Enciso", "R. Sosa", "D. Gómez"],
    swe: ["A. Isak", "V. Gyökeres", "D. Kulusevski", "E. Forsberg", "J. Larsson"],
    bos: ["E. Džeko", "E. Demirović", "H. Hajradinović", "M. Stevanović", "A. Krunić"],
    aut: ["M. Sabitzer", "C. Baumgartner", "M. Gregoritsch", "K. Laimer", "P. Wimmer"],
    civ: ["S. Haller", "S. Adingra", "F. Kessié", "I. Sangaré", "J. Boga"],
    nor: ["E. Haaland", "M. Ødegaard", "A. Sørloth", "O. Bobb", "S. Berge"],
    cod: ["Y. Wissa", "T. Bongonda", "C. Bakambu", "M. Elia", "S. Moutoussamy"],
    alg: ["R. Mahrez", "B. Bounedjah", "A. Gouiri", "H. Aouar", "I. Bennacer"],
    gha: ["M. Kudus", "I. Williams", "J. Ayew", "A. Semenyo", "E. Nuamah"],
    egy: ["M. Salah", "M. Mostafa", "Trezeguet", "O. Marmoush", "M. Elneny"],
    cpv: ["Ryan Mendes", "Garry Rodrigues", "Bebé", "Jovane Cabral", "Jamiro Monteiro"]
  };

  const pool = playerPools[teamId.toLowerCase()] || ["Striker", "Midfielder", "Defender"];
  const scorers: string[] = [];
  for (let i = 0; i < goals; i++) {
    const playerIndex = (seed + i * 11) % pool.length;
    const minute = 4 + ((seed + i * 29) % 83); // random minute between 4 and 87
    scorers.push(`${pool[playerIndex]} ${minute}'`);
  }
  return scorers.sort((a, b) => {
    const minA = parseInt(a.split(" ").pop() || "0");
    const minB = parseInt(b.split(" ").pop() || "0");
    return minA - minB;
  });
};

const getMatchTimestamp = (match: Match) => {
  if (match.timestamp) return match.timestamp;
  if (!match.date) return 0;
  
  // Convert Jul 4, 2026 into dynamic timestamp
  if (match.date.includes("Jul")) {
    const day = parseInt(match.date.replace(/[^0-9]/g, ""));
    if (!isNaN(day)) {
      return new Date(`2026-07-${day < 10 ? '0' + day : day}T18:00:00Z`).getTime();
    }
  }
  return 0;
};

export default function Dashboard({ user, setUser, lang, bracket, onNavigateTab }: DashboardProps) {
  const t = TRANSLATIONS[lang];

  // Active chronological filter: all, completed fixtures
  const [filter, setFilter] = useState<"all" | "completed">("all");
  
  // Selected settled match for the detailed Winner modal overlay
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const currentBracket = bracket || {
    roundOf32: [],
    roundOf16: [],
    quarterFinals: [],
    semiFinals: [],
    finals: [],
    champion: null,
  };

  // Compile all 31 matches into a single chronological array
  const allMatches: Match[] = [
    ...(currentBracket.roundOf32 || []),
    ...(currentBracket.roundOf16 || []),
    ...(currentBracket.quarterFinals || []),
    ...(currentBracket.semiFinals || []),
    ...(currentBracket.finals || [])
  ];

  // Sort them strictly based on chronological timestamps
  const sortedMatches = [...allMatches].sort((a, b) => {
    return getMatchTimestamp(a) - getMatchTimestamp(b);
  });

  // Calculate user prediction stats on completed matches
  const completedMatches = sortedMatches.filter(m => m.status === "completed");
  const correctCount = completedMatches.filter(m => m.winnerId === OFFICIAL_WINNERS[m.id]).length;
  const accuracyRate = completedMatches.length > 0 ? Math.round((correctCount / completedMatches.length) * 100) : 100;

  // Filter matches based on user's chronological toggle
  const filteredMatches = sortedMatches.filter((match) => {
    if (filter === "all") return true;
    if (filter === "completed") {
      return match.status === "completed";
    }
    return true;
  });

  const getTeamInfo = (teamId: string | null, placeholder: string) => {
    if (!teamId) return { name: placeholder, emoji: "", id: null };
    const team = getTeamById(teamId);
    return team ? { name: team.name, emoji: team.emoji, id: team.id } : { name: placeholder, emoji: "", id: null };
  };

  const handleRowClick = (match: Match) => {
    if (match.status === "completed") {
      audioSynth.playSelection();
      setSelectedMatch(match);
    }
  };

  // Detailed simulated specs for the selected completed match overlay
  const selectedMatchDetails = selectedMatch ? (() => {
    const team1 = getTeamById(selectedMatch.team1Id);
    const team2 = getTeamById(selectedMatch.team2Id);
    
    const officialWinnerId = OFFICIAL_WINNERS[selectedMatch.id] || "TBD";
    const officialResultStr = officialWinnerId === selectedMatch.team1Id 
      ? `${team1?.name || "Team A"} Wins` 
      : (officialWinnerId === selectedMatch.team2Id ? `${team2?.name || "Team B"} Wins` : "Draw");

    const { score1, score2 } = getSimulatedMatchScore(
      selectedMatch.id, 
      officialResultStr, 
      team1?.code || "HOME", 
      team2?.code || "AWAY"
    );

    const stats = getSimulatedStats(selectedMatch.id);
    const seedValue = selectedMatch.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const homeScorers = team1 ? getSimulatedGoalscorers(team1.id, score1, seedValue) : [];
    const awayScorers = team2 ? getSimulatedGoalscorers(team2.id, score2, seedValue + 42) : [];

    // Map winner name for presentation
    const winnerTeam = getTeamById(officialWinnerId);

    return {
      team1,
      team2,
      score1,
      score2,
      stats,
      homeScorers,
      awayScorers,
      officialWinnerId,
      officialResultStr,
      winnerTeamName: winnerTeam ? `${winnerTeam.name} ${winnerTeam.emoji}` : "Paraguay"
    };
  })() : null;

  return (
    <div id="daily-prediction-dashboard" className="w-full bg-neutral-950/40 border border-white/5 rounded-3xl p-4 sm:p-6 backdrop-blur-xl relative overflow-visible shadow-2xl">
      {/* Stadium Grid Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none rounded-3xl" />

      {/* Header Info Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        {onNavigateTab && (
          <button
            id="back-bracket-btn"
            onClick={() => {
              onNavigateTab("bracket");
              audioSynth.playSelection();
            }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg active:scale-95 uppercase tracking-wider shrink-0"
          >
            ← OPEN BRACKET STAGE
          </button>
        )}
        
        <div id="stats-ribbon" className="bg-neutral-900 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-4 shadow-md ml-auto">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-bold text-white">{user.xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-400">{user.coins} Coins</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-4 font-mono text-[10px] text-neutral-400">
            <span>Streak: {user.dailyStreak} days</span>
          </div>
        </div>
      </div>

      {/* Dynamic Accuracy Banner */}
      <div id="accuracy-banner" className="mb-6 bg-gradient-to-r from-emerald-500/10 via-neutral-900/10 to-transparent border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden backdrop-blur-md z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wide">🏆 DAILY PREDICTIONS ARENA</h4>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
              Your predictions are mapped directly from your tournament bracket. Click on any completed match row below to view official scores, goalscorers, and detailed stats!
            </p>
          </div>
        </div>
        
        <div className="bg-neutral-950/60 border border-white/5 p-2 px-4 rounded-xl flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between">
          <div className="text-right">
            <span className="text-[9px] text-neutral-500 font-mono uppercase block">ARENA ACCURACY</span>
            <span className="text-sm font-black text-emerald-400 block">{accuracyRate}% ACCURACY</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-500/10 shrink-0">
            <span className="text-[10px] font-black text-white">{accuracyRate}%</span>
          </div>
        </div>
      </div>

      {/* Simplified Date Centric Filter Tabs */}
      <div id="round-filter-pills" className="flex flex-wrap gap-1.5 mb-5 relative z-10">
        <button
          onClick={() => { setFilter("all"); audioSynth.playSelection(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer ${
            filter === "all" ? "bg-white text-black font-black" : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-white/5"
          }`}
        >
          All Dates ({sortedMatches.length})
        </button>
        <button
          onClick={() => { setFilter("completed"); audioSynth.playSelection(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer border flex items-center gap-1.5 ${
            filter === "completed" 
              ? "bg-emerald-500 text-neutral-950 border-emerald-400 font-black" 
              : "bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-950/40"
          }`}
        >
          Completed Results ({completedMatches.length})
        </button>
      </div>

      {/* Dynamic Accurate Arena Grid */}
      <div id="arena-table-wrapper" className="relative z-10 bg-neutral-900/40 border border-white/10 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-950 border-b border-white/5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Match Up</div>
          <div className="col-span-3">My Prediction</div>
          <div className="col-span-3 text-right">Official Result</div>
        </div>

        {/* Prediction Rows */}
        <div className="divide-y divide-white/5">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 font-mono text-xs">
              No matches found for the selected filter.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const team1 = getTeamInfo(match.team1Id, match.team1Placeholder || "TBD");
              const team2 = getTeamInfo(match.team2Id, match.team2Placeholder || "TBD");
              
              const userPredictedWinner = match.winnerId ? getTeamById(match.winnerId) : null;
              const officialWinnerId = OFFICIAL_WINNERS[match.id];
              const officialWinnerTeam = officialWinnerId ? getTeamById(officialWinnerId) : null;
              
              const isPredictionCorrect = match.status === "completed" && match.winnerId === officialWinnerId;

              return (
                <div
                  key={match.id}
                  onClick={() => handleRowClick(match)}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-4 items-center transition-all text-left ${
                    match.status === "completed" 
                      ? "cursor-pointer hover:bg-white/5 bg-neutral-900/25 border-l-2 border-emerald-500" 
                      : "hover:bg-white/[0.01]"
                  }`}
                >
                  {/* Date Column */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-xs text-neutral-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{match.date}</span>
                  </div>

                  {/* Match Column */}
                  <div className="col-span-1 md:col-span-4 text-sm font-bold text-white flex flex-row items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      {team1.id && <img src={getFlagUrl(team1.id)} alt="" className="w-5 h-3.5 rounded object-cover inline-block mr-1" />}
                      <span>{team1.name}</span>
                    </span>
                    <span className="text-xs font-normal text-neutral-500 italic">vs</span>
                    <span className="flex items-center gap-1">
                      {team2.id && <img src={getFlagUrl(team2.id)} alt="" className="w-5 h-3.5 rounded object-cover inline-block mr-1" />}
                      <span>{team2.name}</span>
                    </span>
                  </div>

                  {/* Prediction Column */}
                  <div className="col-span-1 md:col-span-3">
                    {userPredictedWinner ? (
                      <div className="inline-flex flex-col">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-0.5">My Pick</span>
                        <div className="flex items-center gap-1.5">
                          {userPredictedWinner.id && <img src={getFlagUrl(userPredictedWinner.id)} alt="" className="w-4 h-3 rounded object-cover" />}
                          <span className="text-xs font-bold text-yellow-400">
                            {userPredictedWinner.name} Wins
                          </span>
                        </div>
                      </div>
                    ) : match.status === "completed" ? (
                      <span className="text-xs text-neutral-500 italic font-mono">No prediction made</span>
                    ) : (
                      onNavigateTab && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab("bracket");
                            audioSynth.playSelection();
                          }}
                          className="px-2.5 py-1.5 bg-neutral-950 hover:bg-yellow-500 hover:text-black border border-white/5 rounded-lg text-[10px] font-bold text-neutral-300 transition-all cursor-pointer active:scale-95 uppercase font-mono tracking-wider"
                        >
                          👈 Make Pick
                        </button>
                      )
                    )}
                  </div>

                  {/* Result Column */}
                  <div className="col-span-1 md:col-span-3 md:text-right flex items-center justify-between md:justify-end gap-2">
                    {match.status === "completed" && officialWinnerTeam ? (
                      <div className="flex items-center gap-2">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-0.5">Official Winner</span>
                          <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                            <span>{officialWinnerTeam.name}</span>
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          isPredictionCorrect ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {isPredictionCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500 font-mono italic">Scheduled (TBD)</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Completed Match Ceremony Overlay (The "Winner Details Page") */}
      <AnimatePresence>
        {selectedMatch && selectedMatchDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="relative max-w-2xl w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden my-8"
            >
              {/* Decorative Spotlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Info */}
              <div className="text-center mb-6">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono font-black uppercase tracking-widest">
                  🏆 TOURNAMENT MATCH CEREMONY
                </span>
                <p className="text-xs text-neutral-400 mt-2 font-mono">
                  {selectedMatch.date} • Official Result Certified
                </p>
              </div>

              {/* Scoreboard block */}
              <div className="bg-neutral-950/80 border border-white/5 rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 relative">
                {/* Home Team */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 mb-2 relative bg-neutral-900 shadow-md">
                    {selectedMatchDetails.team1 ? (
                      <img 
                        src={getFlagUrl(selectedMatchDetails.team1.id)} 
                        alt={selectedMatchDetails.team1.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400 font-mono">TBD</div>
                    )}
                  </div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">Home</span>
                  <span className="text-sm font-black text-white leading-tight">{selectedMatchDetails.team1?.name}</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center">
                  <div className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-4 shadow-inner">
                    <span className="text-3xl font-black text-white font-mono">{selectedMatchDetails.score1}</span>
                    <span className="text-neutral-600 font-mono text-lg">:</span>
                    <span className="text-3xl font-black text-white font-mono">{selectedMatchDetails.score2}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 mt-1.5 uppercase font-bold tracking-wider">Full Time</span>
                </div>

                {/* Away Team */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 mb-2 relative bg-neutral-900 shadow-md">
                    {selectedMatchDetails.team2 ? (
                      <img 
                        src={getFlagUrl(selectedMatchDetails.team2.id)} 
                        alt={selectedMatchDetails.team2.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400 font-mono">TBD</div>
                    )}
                  </div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">Away</span>
                  <span className="text-sm font-black text-white leading-tight">{selectedMatchDetails.team2?.name}</span>
                </div>
              </div>

              {/* Goal Scorers list */}
              <div className="grid grid-cols-2 gap-4 px-4 mb-6 text-xs text-neutral-400 font-mono">
                {/* Home scorers */}
                <div className="text-left space-y-0.5 border-r border-white/5 pr-4">
                  {selectedMatchDetails.homeScorers.map((scorer, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span>⚽</span> <span>{scorer}</span>
                    </div>
                  ))}
                  {selectedMatchDetails.homeScorers.length === 0 && <span className="text-neutral-600">No goals scored</span>}
                </div>
                {/* Away scorers */}
                <div className="text-right space-y-0.5 pl-4">
                  {selectedMatchDetails.awayScorers.map((scorer, idx) => (
                    <div key={idx} className="flex items-center justify-end gap-1">
                      <span>{scorer}</span> <span>⚽</span>
                    </div>
                  ))}
                  {selectedMatchDetails.awayScorers.length === 0 && <span className="text-neutral-600">No goals scored</span>}
                </div>
              </div>

              {/* User prediction verification card */}
              <div className="mb-6 p-4 rounded-2xl backdrop-blur-md relative overflow-hidden">
                {selectedMatch.winnerId === selectedMatchDetails.officialWinnerId ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-center space-y-2 relative shadow-lg">
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none rounded-xl" />
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">🎉 Prediction Certified Correct!</h4>
                    <p className="text-xs text-emerald-300">
                      You correctly predicted that <strong className="text-white">"{selectedMatchDetails.winnerTeamName}"</strong> would advance!
                    </p>
                    <div className="inline-flex items-center gap-3 bg-neutral-900 px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold font-mono text-yellow-400 mt-2">
                      <span>+50 XP</span>
                      <span className="border-l border-white/20 h-3" />
                      <span>+15 Coins (Bonus)</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 text-center space-y-2 shadow-lg">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Consolation Reward Credited</h4>
                    <p className="text-xs text-neutral-300">
                      Your selection: <strong className="text-white">"{selectedMatch.winnerId ? getTeamById(selectedMatch.winnerId)?.name : "No Prediction"}"</strong>. Official Winner: <strong className="text-emerald-400">"{selectedMatchDetails.winnerTeamName}"</strong>.
                    </p>
                    <div className="inline-flex items-center gap-3 bg-neutral-950 px-4 py-1.5 rounded-full border border-white/5 text-xs font-bold font-mono text-yellow-500 mt-2">
                      <span>+25 XP</span>
                      <span className="border-l border-white/20 h-3" />
                      <span>+5 Coins (Consolation)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Match Statistics Compare section */}
              <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block border-b border-white/5 pb-2">
                  📊 PREMIUM MATCH STATISTICS
                </span>

                {/* Stat Line: Possession */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-300">
                    <span>{selectedMatchDetails.stats.possessionHome}%</span>
                    <span className="text-neutral-500 font-bold">Possession</span>
                    <span>{selectedMatchDetails.stats.possessionAway}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full flex overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-1000" 
                      style={{ width: `${selectedMatchDetails.stats.possessionHome}%` }} 
                    />
                    <div 
                      className="bg-neutral-700 h-full transition-all duration-1000" 
                      style={{ width: `${selectedMatchDetails.stats.possessionAway}%` }} 
                    />
                  </div>
                </div>

                {/* Stat Line: Shots (On Target) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-300">
                    <span>{selectedMatchDetails.stats.shotsHome} ({selectedMatchDetails.stats.shotsOnTargetHome})</span>
                    <span className="text-neutral-500 font-bold">Shots (On Target)</span>
                    <span>{selectedMatchDetails.stats.shotsAway} ({selectedMatchDetails.stats.shotsOnTargetAway})</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full flex overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full transition-all duration-1000" 
                      style={{ width: `${(selectedMatchDetails.stats.shotsHome / (selectedMatchDetails.stats.shotsHome + selectedMatchDetails.stats.shotsAway)) * 100}%` }} 
                    />
                    <div 
                      className="bg-neutral-600 h-full transition-all duration-1000" 
                      style={{ width: `${(selectedMatchDetails.stats.shotsAway / (selectedMatchDetails.stats.shotsHome + selectedMatchDetails.stats.shotsAway)) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Stat Line: Pass Accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-300">
                    <span>{selectedMatchDetails.stats.passAccuracyHome}%</span>
                    <span className="text-neutral-500 font-bold">Pass Accuracy</span>
                    <span>{selectedMatchDetails.stats.passAccuracyAway}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full flex overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-1000" 
                      style={{ width: `${selectedMatchDetails.stats.passAccuracyHome}%` }} 
                    />
                    <div 
                      className="bg-neutral-700 h-full transition-all duration-1000" 
                      style={{ width: `${selectedMatchDetails.stats.passAccuracyAway}%` }} 
                    />
                  </div>
                </div>

                {/* Stat Line: Fouls */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-300">
                    <span>{selectedMatchDetails.stats.foulsHome}</span>
                    <span className="text-neutral-500 font-bold">Fouls</span>
                    <span>{selectedMatchDetails.stats.foulsAway}</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full flex overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-1000" 
                      style={{ width: `${(selectedMatchDetails.stats.foulsHome / (selectedMatchDetails.stats.foulsHome + selectedMatchDetails.stats.foulsAway)) * 100}%` }} 
                    />
                    <div 
                      className="bg-neutral-600 h-full transition-all duration-1000" 
                      style={{ width: `${(selectedMatchDetails.stats.foulsAway / (selectedMatchDetails.stats.foulsHome + selectedMatchDetails.stats.foulsAway)) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Footer Close button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="px-6 py-2.5 bg-neutral-900 border border-white/15 rounded-xl text-xs font-bold font-mono text-neutral-300 hover:text-white hover:border-white/30 transition active:scale-95 cursor-pointer"
                >
                  DISMISS CEREMONY DETAILS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
