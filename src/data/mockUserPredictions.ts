import { Team, Match, Bracket, UserProfile } from "../types";
import { TEAMS, getTeamById } from "./teams";

export interface UserPredictionData {
  profile: UserProfile;
  bracket: Bracket;
  dailyPredictions: {
    gameId: string;
    gameTitle: string;
    prediction: string;
    status: "correct" | "incorrect" | "pending";
  }[];
}

// Generates a valid tournament bracket dynamically where a specified champion team is guaranteed to win.
export function generateMockBracket(championId: string): Bracket {
  const r32Pairings = [
    // Left Side of Bracket (top-to-bottom of image)
    { teams: ["ger", "par"], date: "Tue, 30 Jun, 2:00 AM" },
    { teams: ["fra", "swe"], date: "Wed, 1 Jul, 2:30 AM" },
    { teams: ["rsa", "can"], date: "Sun, 28 Jun, 7:30 PM" }, // South Africa vs Canada completed
    { teams: ["ned", "mar"], date: "Tue, 30 Jun, 6:30 AM" },
    { teams: ["por", "cro"], date: "Fri, 3 Jul, 4:30 AM" },
    { teams: ["spa", "aut"], date: "Fri, 3 Jul, 12:30 AM" },
    { teams: ["usa", "bos"], date: "Thu, 2 Jul, 5:30 AM" },
    { teams: ["bel", "sen"], date: "Thu, 2 Jul, 1:30 AM" },

    // Right Side of Bracket (top-to-bottom of image)
    { teams: ["bra", "jpn"], date: "Mon, 29 Jun, 10:30 PM" },
    { teams: ["civ", "nor"], date: "Tue, 30 Jun, 10:30 PM" },
    { teams: ["mex", "ecu"], date: "Wed, 1 Jul, 6:30 AM" },
    { teams: ["eng", "cod"], date: "Wed, 1 Jul, 9:30 PM" },
    { teams: ["arg", "cpv"], date: "Fri, 3 Jul, 3:30 PM" },
    { teams: ["aus", "egy"], date: "Fri, 3 Jul, 11:30 PM" },
    { teams: ["swi", "alg"], date: "Fri, 3 Jul, 8:30 AM" },
    { teams: ["col", "gha"], date: "Fri, 3 Jul, 7:00 PM" },
  ];

  // 1. Round of 32
  const roundOf32: Match[] = r32Pairings.map((pair, idx) => {
    const isRsaCan = pair.teams.includes("rsa") && pair.teams.includes("can");
    let winnerId: string | null = null;
    
    if (isRsaCan) {
      winnerId = "can"; // Canada always wins completed match
    } else {
      // If champion is in this match, they must win
      if (pair.teams[0] === championId) winnerId = pair.teams[0];
      else if (pair.teams[1] === championId) winnerId = pair.teams[1];
      else {
        // Otherwise pick the higher-ranking team or first team
        const t1 = getTeamById(pair.teams[0]);
        const t2 = getTeamById(pair.teams[1]);
        if (t1 && t2) {
          winnerId = t1.ranking < t2.ranking ? t1.id : t2.id;
        } else {
          winnerId = pair.teams[0];
        }
      }
    }

    return {
      id: `r32-m${idx}`,
      team1Id: pair.teams[0],
      team2Id: pair.teams[1],
      winnerId,
      date: pair.date,
      status: isRsaCan ? "completed" : "scheduled"
    };
  });

  // 2. Round of 16
  const roundOf16: Match[] = Array.from({ length: 8 }, (_, i) => {
    const team1Id = roundOf32[i * 2].winnerId;
    const team2Id = roundOf32[i * 2 + 1].winnerId;
    let winnerId: string | null = null;

    if (team1Id === championId) winnerId = team1Id;
    else if (team2Id === championId) winnerId = team2Id;
    else {
      const t1 = getTeamById(team1Id);
      const t2 = getTeamById(team2Id);
      if (t1 && t2) winnerId = t1.ranking < t2.ranking ? t1.id : t2.id;
      else winnerId = team1Id || team2Id;
    }

    const day = 4 + Math.floor(i / 2);
    return {
      id: `r16-m${i}`,
      team1Id,
      team2Id,
      team1Placeholder: `Winner R32 Match ${i * 2 + 1}`,
      team2Placeholder: `Winner R32 Match ${i * 2 + 2}`,
      winnerId,
      date: `Jul ${day}, 2026`,
      status: "scheduled"
    };
  });

  // 3. Quarter Finals
  const quarterFinals: Match[] = Array.from({ length: 4 }, (_, i) => {
    const team1Id = roundOf16[i * 2].winnerId;
    const team2Id = roundOf16[i * 2 + 1].winnerId;
    let winnerId: string | null = null;

    if (team1Id === championId) winnerId = team1Id;
    else if (team2Id === championId) winnerId = team2Id;
    else {
      const t1 = getTeamById(team1Id);
      const t2 = getTeamById(team2Id);
      if (t1 && t2) winnerId = t1.ranking < t2.ranking ? t1.id : t2.id;
      else winnerId = team1Id || team2Id;
    }

    const day = 9 + Math.floor(i / 1.5);
    return {
      id: `qf-m${i}`,
      team1Id,
      team2Id,
      team1Placeholder: `Winner R16 Match ${i * 2 + 1}`,
      team2Placeholder: `Winner R16 Match ${i * 2 + 2}`,
      winnerId,
      date: `Jul ${day}, 2026`,
      status: "scheduled"
    };
  });

  // 4. Semi Finals
  const semiFinals: Match[] = Array.from({ length: 2 }, (_, i) => {
    const team1Id = quarterFinals[i * 2].winnerId;
    const team2Id = quarterFinals[i * 2 + 1].winnerId;
    let winnerId: string | null = null;

    if (team1Id === championId) winnerId = team1Id;
    else if (team2Id === championId) winnerId = team2Id;
    else {
      const t1 = getTeamById(team1Id);
      const t2 = getTeamById(team2Id);
      if (t1 && t2) winnerId = t1.ranking < t2.ranking ? t1.id : t2.id;
      else winnerId = team1Id || team2Id;
    }

    const day = 14 + i;
    return {
      id: `sf-m${i}`,
      team1Id,
      team2Id,
      team1Placeholder: `Winner QF Match ${i * 2 + 1}`,
      team2Placeholder: `Winner QF Match ${i * 2 + 2}`,
      winnerId,
      date: `Jul ${day}, 2026`,
      status: "scheduled"
    };
  });

  // 5. Finals
  const team1Id = semiFinals[0].winnerId;
  const team2Id = semiFinals[1].winnerId;
  const finals: Match[] = [{
    id: "f-m0",
    team1Id,
    team2Id,
    team1Placeholder: "Winner Semi-Final 1",
    team2Placeholder: "Winner Semi-Final 2",
    winnerId: championId,
    date: "Jul 19, 2026",
    status: "scheduled"
  }];

  return {
    roundOf32,
    roundOf16,
    quarterFinals,
    semiFinals,
    finals,
    champion: getTeamById(championId)
  };
}

export function getInitialUserPredictions(): UserPredictionData[] {
  return [
    {
      profile: {
        uid: "user_kylian",
        name: "Kylian_Predicts",
        email: "k@psg.fr",
        avatar: "⚽",
        isLoggedIn: true,
        xp: 2850,
        coins: 850,
        level: 15,
        badges: ["Legend Predictor", "First Goalscorer MVP"],
        dailyStreak: 12
      },
      bracket: generateMockBracket("fra"), // France Champion
      dailyPredictions: [
        { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "USA Wins", status: "correct" },
        { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Vinicius Jr.", status: "correct" },
        { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Jamal Musiala", status: "pending" }
      ]
    },
    {
      profile: {
        uid: "user_messi",
        name: "MessiMagic",
        email: "leo@miami.com",
        avatar: "🐐",
        isLoggedIn: true,
        xp: 2790,
        coins: 1200,
        level: 14,
        badges: ["Golden Boot", "Predictor Extraordinaire"],
        dailyStreak: 8
      },
      bracket: generateMockBracket("arg"), // Argentina Champion
      dailyPredictions: [
        { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "Draw", status: "incorrect" },
        { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "L. Messi", status: "correct" },
        { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Lamine Yamal", status: "pending" }
      ]
    },
    {
      profile: {
        uid: "user_neymar",
        name: "NeymarNerve",
        email: "ney@hilal.sa",
        avatar: "🇧🇷",
        isLoggedIn: true,
        xp: 2610,
        coins: 540,
        level: 11,
        badges: ["Prediction Master", "Streak Specialist"],
        dailyStreak: 5
      },
      bracket: generateMockBracket("bra"), // Brazil Champion
      dailyPredictions: [
        { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "Mexico Wins", status: "incorrect" },
        { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Rodrygo", status: "incorrect" },
        { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Pedri", status: "pending" }
      ]
    },
    {
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
      bracket: generateMockBracket("por"), // Portugal Champion
      dailyPredictions: [
        { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "USA Wins", status: "correct" },
        { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Vinicius Jr.", status: "correct" },
        { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Florian Wirtz", status: "pending" }
      ]
    },
    {
      profile: {
        uid: "user_ronaldo",
        name: "SuiiiPredict",
        email: "cr7@alnasr.com",
        avatar: "🇵🇹",
        isLoggedIn: true,
        xp: 2320,
        coins: 900,
        level: 9,
        badges: ["Classic Predictor", "Power Shot"],
        dailyStreak: 4
      },
      bracket: generateMockBracket("por"), // Portugal Champion
      dailyPredictions: [
        { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "USA Wins", status: "correct" },
        { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Lautaro Martinez", status: "incorrect" },
        { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Lamine Yamal", status: "pending" }
      ]
    },
    {
      profile: {
        uid: "user_malayali",
        name: "MalayaliVibe",
        email: "kerala@gold.in",
        avatar: "🌴",
        isLoggedIn: true,
        xp: 2210,
        coins: 1050,
        level: 8,
        badges: ["Pioneer Predictor", "Kerala Champ"],
        dailyStreak: 20
      },
      bracket: generateMockBracket("spa"), // Spain Champion
      dailyPredictions: [
        { gameId: "dg_1", gameTitle: "United States vs Mexico", prediction: "Draw", status: "incorrect" },
        { gameId: "dg_2", gameTitle: "Argentina vs Brazil", prediction: "Vinicius Jr.", status: "correct" },
        { gameId: "dg_3", gameTitle: "Germany vs Spain", prediction: "Lamine Yamal", status: "pending" }
      ]
    }
  ];
}
