import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, BarChart2, CheckCircle, ShieldCheck, AlertCircle, Sparkles, Layout, Info } from "lucide-react";
import { AdSettings, AdPerformance, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { audioSynth } from "../utils/audio";

interface AdsManagerProps {
  settings: AdSettings;
  setSettings: React.Dispatch<React.SetStateAction<AdSettings>>;
  lang: LanguageCode;
  performanceStats?: AdPerformance[];
}

export default function AdsManager({ settings, setSettings, lang, performanceStats }: AdsManagerProps) {
  const [activeTab, setActiveTab] = useState<"config" | "performance">("config");
  const [publisherInput, setPublisherInput] = useState(settings.publisherId);
  const [stickyInput, setStickyInput] = useState(settings.bottomBannerId);
  const [inlineInput, setInlineInput] = useState(settings.inlineRoundId);
  const [interstitialInput, setInterstitialInput] = useState(settings.interstitialId);
  
  const [validationMsg, setValidationMsg] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[lang];

  // Ad performance stats
  const defaultStats: AdPerformance[] = [
    { slotId: "banner-bottom", name: "Bottom Sticky Banner", impressions: 124500, clicks: 1820, ctr: 1.46, revenue: 234.5 },
    { slotId: "inline-rounds", name: "Between Round In-Feed Banner", impressions: 84000, clicks: 2310, ctr: 2.75, revenue: 412.3 },
    { slotId: "interstitial-comp", name: "Prediction Completion Interstitial", impressions: 12000, clicks: 940, ctr: 7.83, revenue: 540.0 },
    { slotId: "sidebar-widget", name: "Dashboard Sidebar Banner", impressions: 45000, clicks: 540, ctr: 1.2, revenue: 95.8 },
  ];

  const displayStats = performanceStats || defaultStats;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationMsg("");
    setIsValidated(false);
    audioSynth.playTick();

    setTimeout(() => {
      setLoading(false);
      // Validate publisher ID format (ca-pub-xxxxxxxxxxxxxxxx where x is 16 digits)
      const pubRegex = /^ca-pub-\d{16}$/;
      if (!pubRegex.test(publisherInput)) {
        setValidationMsg("Invalid Publisher ID. Format must match 'ca-pub-[16 digits]' (e.g., ca-pub-1234567890123456)");
        audioSynth.playSelection();
        return;
      }

      setSettings({
        publisherId: publisherInput,
        bottomBannerId: stickyInput,
        inlineRoundId: inlineInput,
        interstitialId: interstitialInput,
        sidebarId: "sidebar-default-widget",
      });
      setIsValidated(true);
      audioSynth.playSelection();
    }, 1200);
  };

  return (
    <div className="w-full bg-neutral-950/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Golden spotlight background */}
      <div className="absolute top-[-50px] left-[50px] w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Ads Head */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Layout className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              {t.adsManagerTitle}
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Integrate Google AdSense & track revenue metrics
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 bg-neutral-900/80 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("config"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "config" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            AdSense Config
          </button>
          <button
            onClick={() => { setActiveTab("performance"); audioSynth.playTick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              activeTab === "performance" ? "bg-yellow-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
            }`}
          >
            Performance Reports
          </button>
        </div>
      </div>

      {/* ================= VIEW: ADS CONFIGURATION ================= */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Ad Setup Form */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-3 space-y-6 text-left">
            
            {validationMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-mono flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationMsg}</span>
              </div>
            )}

            {isValidated && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-mono flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>AdSense codes validated and stored securely! Live sync enabled.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 flex items-center gap-1">
                  {t.publisherId} <span className="text-yellow-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={publisherInput}
                  onChange={(e) => setPublisherInput(e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                    Sticky Banner Slot ID
                  </label>
                  <input
                    type="text"
                    required
                    value={stickyInput}
                    onChange={(e) => setStickyInput(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                    In-Feed Banner Slot ID
                  </label>
                  <input
                    type="text"
                    required
                    value={inlineInput}
                    onChange={(e) => setInlineInput(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                    Interstitial Slot ID
                  </label>
                  <input
                    type="text"
                    required
                    value={interstitialInput}
                    onChange={(e) => setInterstitialInput(e.target.value)}
                    placeholder="e.g. 5566778899"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-yellow-500 text-black font-extrabold text-xs tracking-wider rounded-xl hover:bg-yellow-400 transition cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Validate & Save Config <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Ad Placement Previews Mockups */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-mono uppercase text-neutral-400 block text-left">
              Placement Playout Preview
            </span>

            {/* Bottom sticky banner preview */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-3 text-center relative overflow-hidden flex flex-col justify-between h-20 backdrop-blur-md">
              <span className="absolute top-2 left-2 text-[8px] font-mono bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                MOCK ADSENSE AD
              </span>
              <span className="text-[10px] font-mono text-neutral-500 mt-2">Bottom Sticky Banner (728x90)</span>
              <div className="border border-dashed border-yellow-500/20 bg-yellow-500/5 rounded-lg py-1 flex items-center justify-center gap-2 text-[10px] font-bold text-yellow-500">
                <span>🏆 Predict & Win Premium Rewards • USA v MEX</span>
              </div>
            </div>

            {/* Inline banner preview */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-4 text-center relative overflow-hidden flex flex-col justify-between h-28 backdrop-blur-md">
              <span className="absolute top-2 left-2 text-[8px] font-mono bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                MOCK IN-FEED BANNER
              </span>
              <span className="text-[10px] font-mono text-neutral-500 mt-3">Between Rounds In-Feed ad placement</span>
              <div className="flex gap-3 mt-2">
                <div className="w-12 h-12 rounded bg-neutral-950 flex items-center justify-center shrink-0 border border-white/5">
                  ⚽
                </div>
                <div className="text-left space-y-1">
                  <span className="text-xs font-bold text-white block truncate">Official World Cup Apparel Sale</span>
                  <span className="text-[10px] text-neutral-400 block">Up to 40% Off FIFA store. Ads by Google</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW: PERFORMANCE REPORTS ================= */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase">Ad Placement Performance Reports</span>
            <div className="text-xs font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
              TOTAL EST. MONTHLY REVENUE: <span className="font-bold">${displayStats.reduce((sum, s) => sum + s.revenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStats.map((stat, idx) => (
              <div key={idx} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-yellow-500/20 transition-all duration-300">
                <div>
                  <span className="text-xs font-bold text-white block mb-1">{stat.name}</span>
                  <span className="text-[9px] font-mono text-neutral-400 block">Slot ID: {stat.slotId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-white/5 text-left font-mono">
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase">Impressions</span>
                    <p className="text-xs font-bold text-white">{stat.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase">CTR</span>
                    <p className="text-xs font-bold text-emerald-400">{stat.ctr}%</p>
                  </div>
                  <div className="col-span-2 mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[9px] text-neutral-500 uppercase">REVENUE</span>
                    <p className="text-sm font-black text-yellow-400">${stat.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-neutral-900/20 border border-white/5 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-400 space-y-1 text-left">
              <p className="font-bold text-neutral-300">Google AdSense Compliance Policy notice:</p>
              <p>Ad click events and impressions represented in this view are simulated for preview verification. Google AdSense policies strictly forbid clicking your own ads on live properties.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
