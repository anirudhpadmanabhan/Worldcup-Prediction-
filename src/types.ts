export interface Team {
  id: string;
  name: string;
  code: string;
  flagColor: string; // Gradient color representer
  bgColor: string;   // Secondary brand color
  emoji: string;     // Fallback high-res country emoji
  ranking: number;
  group: string;
}

export interface Match {
  id: string;
  team1Id: string | null;
  team2Id: string | null;
  team1Placeholder?: string;
  team2Placeholder?: string;
  winnerId: string | null;
  score1?: number;
  score2?: number;
  date: string;
  timestamp?: number;
  status: "scheduled" | "completed";
}

export interface Bracket {
  roundOf32: Match[];
  roundOf16: Match[];
  quarterFinals: Match[];
  semiFinals: Match[];
  finals: Match[];
  champion: Team | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  xp: number;
  coins: number;
  level: number;
  badges: string[];
  dailyStreak: number;
}

export interface DailyPrediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  category: "Match Winner" | "First Goalscorer" | "Man of the Match";
  options: string[];
  userPrediction?: string;
  result?: string;
  xpReward: number;
  coinsReward: number;
  status: "active" | "locked" | "settled";
}

export interface AdSettings {
  publisherId: string;
  bottomBannerId: string;
  inlineRoundId: string;
  interstitialId: string;
  sidebarId: string;
}

export interface AdPerformance {
  slotId: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  eventName: string;
  userEmail: string;
  details: string;
}

export type LanguageCode = "en" | "ml" | "hi" | "ar" | "es" | "pt";
