import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ExternalLink, Sparkles, X, Info } from "lucide-react";
import { audioSynth } from "../utils/audio";

export type AdFormat = "leaderboard" | "skyscraper" | "rectangle" | "sticky";

interface AdSenseBannerProps {
  format: AdFormat;
  publisherId?: string;
  onAdClicked?: (slotId: string, revenueEarned: number) => void;
}

interface FootballAdCampaign {
  id: string;
  brand: string;
  tagline: string;
  cta: string;
  colorTheme: string; // Tailwind classes
  accentColor: string;
  imageUrl: string;
  icon: string;
  targetUrl: string;
}

const CAMPAIGNS: FootballAdCampaign[] = [
  {
    id: "camp-adidas",
    brand: "Adidas Football",
    tagline: "Feel the tournament flow. Experience the official World Cup 2026 Match Ball.",
    cta: "Shop Official Ball",
    colorTheme: "from-neutral-900 to-zinc-950 border-white/10",
    accentColor: "text-white bg-white hover:bg-neutral-200 text-black",
    imageUrl: "⚽",
    icon: "⭐",
    targetUrl: "https://adidas.com/football"
  },
  {
    id: "camp-nike",
    brand: "Nike Mercurial",
    tagline: "Write your legacy. Speed-tuned boots for the game's greatest stage.",
    cta: "Explore Mercurial",
    colorTheme: "from-orange-950/40 to-neutral-950 border-orange-500/20",
    accentColor: "text-orange-400 bg-orange-500/20 hover:bg-orange-500/35 border border-orange-400/40 text-orange-200",
    imageUrl: "⚡",
    icon: "🔥",
    targetUrl: "https://nike.com/football"
  },
  {
    id: "camp-ea",
    brand: "EA Sports FC 26",
    tagline: "Enter the world's game early. Play the FIFA World Cup 2026 campaign.",
    cta: "Pre-order Now",
    colorTheme: "from-blue-950/40 to-neutral-950 border-blue-500/20",
    accentColor: "text-blue-400 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/40 text-blue-200",
    imageUrl: "🎮",
    icon: "🏆",
    targetUrl: "https://ea.com/fc"
  },
  {
    id: "camp-fifastore",
    brand: "FIFA Official Store",
    tagline: "Support your country in style. Customized premium jerseys with 40% off.",
    cta: "Get 40% Off",
    colorTheme: "from-emerald-950/40 to-neutral-950 border-emerald-500/20",
    accentColor: "text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200",
    imageUrl: "👕",
    icon: "🌍",
    targetUrl: "https://store.fifa.com"
  }
];

export default function AdSenseBanner({ format, publisherId = "ca-pub-1234567890123456", onAdClicked }: AdSenseBannerProps) {
  const [campaign, setCampaign] = useState<FootballAdCampaign>(CAMPAIGNS[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Select a random campaign on mount
    const randomIndex = Math.floor(Math.random() * CAMPAIGNS.length);
    setCampaign(CAMPAIGNS[randomIndex]);
  }, [format]);

  if (!isVisible) return null;

  const handleAdClick = () => {
    audioSynth.playSelection();
    
    // Simulate estimated Google AdSense PPC (Pay-Per-Click) revenue
    // Standard CPC for premium niches ranges from $0.20 to $1.85 per click
    const simulatedCpc = parseFloat((0.25 + Math.random() * 1.50).toFixed(2));
    
    if (onAdClicked) {
      onAdClicked(format, simulatedCpc);
    }

    // Open ad campaign in safe sandbox tab
    window.open(campaign.targetUrl, "_blank", "noopener,noreferrer");
  };

  // Render formats
  if (format === "sticky") {
    return (
      <div className="w-full bg-neutral-950/95 border-t border-white/10 py-3.5 px-6 sticky bottom-0 z-40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
        
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-sm shrink-0">
            {campaign.imageUrl}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-yellow-500 text-black px-1.5 py-0.5 rounded">
                ADSENSE SPONSOR
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {publisherId}
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-200 mt-0.5 tracking-wide">
              {campaign.brand}: <span className="text-neutral-400 font-normal">{campaign.tagline}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAdClick}
            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition flex items-center gap-1.5 shrink-0 cursor-pointer ${campaign.accentColor}`}
          >
            {campaign.cta} <ExternalLink className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-neutral-500 hover:text-white p-1 rounded transition shrink-0"
            title="Dismiss Ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (format === "leaderboard") {
    return (
      <div className={`w-full max-w-4xl mx-auto rounded-2xl border p-4 backdrop-blur-md overflow-hidden bg-gradient-to-r ${campaign.colorTheme} shadow-xl relative text-left flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-2xl shrink-0">
            {campaign.imageUrl}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono font-bold tracking-widest bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-1.5 py-0.5 rounded">
                ADS BY GOOGLE
              </span>
              <span className="text-[9px] text-neutral-500 font-mono">
                Slot: {publisherId}-leaderboard
              </span>
            </div>
            <h4 className="text-sm font-black text-white mt-1 tracking-wide flex items-center gap-1.5">
              {campaign.brand} <span className="text-xs text-yellow-400/80 font-bold">{campaign.icon}</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans leading-relaxed">
              {campaign.tagline}
            </p>
          </div>
        </div>

        <button
          onClick={handleAdClick}
          className={`w-full md:w-auto px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${campaign.accentColor}`}
        >
          {campaign.cta} <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (format === "skyscraper") {
    return (
      <div className={`w-full h-full max-h-[500px] min-h-[300px] rounded-2xl border p-5 backdrop-blur-md overflow-hidden bg-gradient-to-b ${campaign.colorTheme} shadow-xl relative text-center flex flex-col justify-between gap-6`}>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono font-bold tracking-widest bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded uppercase">
              GOOGLE SPONSOR
            </span>
            <span className="text-[8px] text-neutral-600 font-mono">
              {publisherId}
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center text-4xl mx-auto shadow-inner">
            {campaign.imageUrl}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-1">
              {campaign.brand}
            </h4>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed px-2">
              {campaign.tagline}
            </p>
          </div>
        </div>

        <button
          onClick={handleAdClick}
          className={`w-full py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${campaign.accentColor}`}
        >
          {campaign.cta} <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // default rectangle
  return (
    <div className={`w-full rounded-2xl border p-5 backdrop-blur-md overflow-hidden bg-gradient-to-br ${campaign.colorTheme} shadow-xl relative text-left flex flex-col justify-between gap-5 h-48`}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono font-bold tracking-widest bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-1.5 py-0.5 rounded uppercase">
            ADS BY GOOGLE
          </span>
          <span className="text-[8px] text-neutral-600 font-mono">
            300x250
          </span>
        </div>

        <div className="flex items-start gap-3 mt-3">
          <span className="text-2xl mt-0.5 shrink-0">{campaign.imageUrl}</span>
          <div>
            <h4 className="text-xs font-extrabold text-white tracking-wide">
              {campaign.brand}
            </h4>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              {campaign.tagline}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleAdClick}
        className={`w-full py-2 rounded-xl text-[10px] font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${campaign.accentColor}`}
      >
        {campaign.cta} <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
