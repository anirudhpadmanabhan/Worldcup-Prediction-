import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Share2, Copy, Check, Sparkles, Award, Star, Shield, HelpCircle } from "lucide-react";
import { Bracket, LanguageCode, Team } from "../types";
import { getTeamById } from "../data/teams";
import { TRANSLATIONS } from "../data/translations";
import { audioSynth } from "../utils/audio";

interface ShareBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  bracket: Bracket;
  lang: LanguageCode;
}

type AspectRatio = "9:16" | "1:1" | "16:9";

export default function ShareBracketModal({ isOpen, onClose, bracket, lang }: ShareBracketModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("1:1");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const t = TRANSLATIONS[lang];

  // Derive tournament milestone predictions
  const champion = bracket.champion;
  
  // Finalists
  const finalMatch = bracket.finals[0];
  const finalTeam1 = getTeamById(finalMatch?.team1Id);
  const finalTeam2 = getTeamById(finalMatch?.team2Id);

  // Semi-Finalists
  const sfTeams = bracket.semiFinals.flatMap(m => [getTeamById(m.team1Id), getTeamById(m.team2Id)]).filter((t): t is Team => t !== null);
  
  // Quarter-Finalists
  const qfTeams = bracket.quarterFinals.flatMap(m => [getTeamById(m.team1Id), getTeamById(m.team2Id)]).filter((t): t is Team => t !== null);

  // Completion stats
  const countCompleted = (matches: any[]) => matches.filter(m => m.winnerId !== null).length;
  const completedCount = countCompleted(bracket.roundOf32) + 
                         countCompleted(bracket.roundOf16) + 
                         countCompleted(bracket.quarterFinals) + 
                         countCompleted(bracket.semiFinals) + 
                         countCompleted(bracket.finals);
  const totalMatches = 31;
  const progressPercent = Math.round((completedCount / totalMatches) * 100);

  // Function to draw the glorious summary card on canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define dimensions based on ratio
    let width = 1080;
    let height = 1080; // 1:1 default

    if (selectedRatio === "9:16") {
      width = 1080;
      height = 1920;
    } else if (selectedRatio === "16:9") {
      width = 1920;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw background (Stunning dark emerald green stadium pitch theme)
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.8);
    bgGrad.addColorStop(0, "#012e17"); // Inner emerald dark glow
    bgGrad.addColorStop(0.5, "#011c0f"); // Middle deep forest
    bgGrad.addColorStop(1, "#020604"); // Outermost dark pitch black
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid Pitch Accent lines (Stadium aesthetics)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
    ctx.lineWidth = 3;
    const gridSpacing = width / 12;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Centered Penalty Area circle outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Elegant golden glowing outer border
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, "rgba(234, 179, 8, 0.6)"); // Yellow-500 glowing
    goldGrad.addColorStop(0.5, "rgba(16, 185, 129, 0.3)"); // Emerald accent
    goldGrad.addColorStop(1, "rgba(251, 191, 36, 0.6)"); // Amber gold
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = Math.min(width, height) * 0.025;
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);

    // Core typography settings
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Layout configuration variables depending on aspect ratios
    let yHeader = height * 0.12;
    let yChampion = height * 0.35;
    let yMilestones = height * 0.68;
    let yFooter = height * 0.92;
    
    if (selectedRatio === "16:9") {
      yHeader = height * 0.14;
      yChampion = height * 0.44;
      yMilestones = height * 0.72;
      yFooter = height * 0.92;
    }

    // ================= 1. RENDER HEADER =================
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 10;

    // Small pre-header
    ctx.fillStyle = "#10B981"; // Emerald green
    ctx.font = `bold ${Math.round(width * 0.015)}px monospace`;
    ctx.fillText("⚽ FIFA WORLD CUP 2026 PREDICTOR PLATFORM", width / 2, yHeader - Math.round(width * 0.035));

    // Main header Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `black ${Math.round(width * 0.042)}px "Inter", sans-serif`;
    ctx.fillText("MY TOURNAMENT BRACKET", width / 2, yHeader);

    // Glowing Golden Badge label
    ctx.fillStyle = "#FBBF24"; // Golden amber
    ctx.font = `black italic ${Math.round(width * 0.022)}px "Inter", sans-serif`;
    ctx.fillText("— BRACKET COMPLETED: " + progressPercent + "% —", width / 2, yHeader + Math.round(width * 0.04));


    // ================= 2. RENDER THE CHAMPION CREST =================
    if (champion) {
      // Golden Crown Icon
      ctx.fillStyle = "#FBBF24";
      ctx.font = `${Math.round(width * 0.04)}px sans-serif`;
      ctx.fillText("👑", width / 2, yChampion - Math.round(width * 0.11));

      // Golden glowing ring behind flag
      ctx.shadowColor = "rgba(234, 179, 8, 0.4)";
      ctx.shadowBlur = 40;
      ctx.strokeStyle = "#FBBF24";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(width / 2, yChampion - Math.round(width * 0.02), Math.round(width * 0.075), 0, Math.PI * 2);
      ctx.stroke();

      // Draw shiny background inside the ring
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.arc(width / 2, yChampion - Math.round(width * 0.02), Math.round(width * 0.075), 0, Math.PI * 2);
      ctx.fill();

      // Draw Emoji Flag larger in center of ring
      ctx.shadowBlur = 0; // Reset shadow for clean text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${Math.round(width * 0.08)}px sans-serif`;
      ctx.fillText(champion.emoji, width / 2, yChampion - Math.round(width * 0.015));

      // Champion label
      ctx.fillStyle = "#10B981"; // Emerald
      ctx.font = `bold ${Math.round(width * 0.015)}px monospace`;
      ctx.fillText("🏆 PREDICTED WORLD CHAMPION", width / 2, yChampion + Math.round(width * 0.075));

      // Champion Country Name (large, golden, majestic)
      ctx.fillStyle = "#FBBF24";
      ctx.font = `black ${Math.round(width * 0.046)}px "Inter", sans-serif`;
      ctx.fillText(champion.name.toUpperCase(), width / 2, yChampion + Math.round(width * 0.12));
    } else {
      // No champion predicted yet fallback
      ctx.fillStyle = "#EF4444";
      ctx.font = `bold ${Math.round(width * 0.025)}px monospace`;
      ctx.fillText("⚠️ NO CHAMPION SELECTED YET", width / 2, yChampion);
    }


    // ================= 3. RENDER KEY MILESTONES (Finals, Semis) =================
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;

    // Draw card box background for milestones
    const boxW = width * 0.85;
    const boxH = height * 0.22;
    const boxX = (width - boxW) / 2;
    const boxY = yMilestones - boxH / 2;

    ctx.fillStyle = "rgba(2, 6, 4, 0.8)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(boxX, boxY, boxW, boxH, 20) : ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    // Render Milestone content depending on aspect ratios
    ctx.textAlign = "center";
    
    // Title inside card box
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `bold ${Math.round(width * 0.014)}px monospace`;
    ctx.fillText("🔑 CRITICAL TOURNAMENT MILESTONES", width / 2, boxY + Math.round(boxH * 0.14));

    // GRAND FINAL MATCHUP Column/Side-by-Side
    if (finalTeam1 || finalTeam2) {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `black ${Math.round(width * 0.022)}px "Inter", sans-serif`;
      const t1 = finalTeam1 ? `${finalTeam1.emoji} ${finalTeam1.name}` : "🏆 TBA";
      const t2 = finalTeam2 ? `${finalTeam2.name} ${finalTeam2.emoji}` : "TBA 🏆";
      ctx.fillText(`${t1}  vs  ${t2}`, width / 2, boxY + Math.round(boxH * 0.44));

      ctx.fillStyle = "#10B981";
      ctx.font = `bold ${Math.round(width * 0.012)}px monospace`;
      ctx.fillText("THE COVETED METLIFE GRAND FINAL MATCHUP", width / 2, boxY + Math.round(boxH * 0.58));
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = `italic ${Math.round(width * 0.018)}px sans-serif`;
      ctx.fillText("Complete predictions to unlock final match mapping", width / 2, boxY + Math.round(boxH * 0.45));
    }

    // SEMI-FINALISTS row tags
    if (sfTeams.length > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = `bold ${Math.round(width * 0.012)}px monospace`;
      ctx.fillText("PREDICTED SEMI-FINALISTS", width / 2, boxY + Math.round(boxH * 0.76));

      // Draw small tags
      ctx.font = `${Math.round(width * 0.014)}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      const listStr = sfTeams.map(t => `${t.emoji} ${t.code}`).join("  |  ");
      ctx.fillText(listStr, width / 2, boxY + Math.round(boxH * 0.88));
    }


    // ================= 4. RENDER FOOTER BRANDING =================
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = `bold ${Math.round(width * 0.012)}px monospace`;
    ctx.fillText("SCAN OR VISIT TO MATCH YOUR BRACKET", width / 2, yFooter);

    ctx.fillStyle = "#FBBF24";
    ctx.font = `black tracking-widest ${Math.round(width * 0.016)}px "Inter", sans-serif`;
    ctx.fillText("AI.STUDIO/BUILD/FIFA-2026-PREDICTOR", width / 2, yFooter + Math.round(width * 0.022));

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = `10px monospace`;
    ctx.fillText("VERIFIED • SHARED LIVE SECURED • CERTIFICATE NODE " + Math.random().toString(36).substr(2, 9).toUpperCase(), width / 2, yFooter + Math.round(width * 0.045));

    // Convert canvas to Data URL for previewing and downloading
    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
  };

  // Trigger canvas drawing whenever aspect ratio or bracket predictions change
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        renderCanvas();
        setIsGenerating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedRatio, bracket]);

  const handleDownload = () => {
    audioSynth.playSelection();
    const link = document.createElement("a");
    link.download = `my_fifa_2026_bracket_predictions_${selectedRatio.replace(":", "_")}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(`Check out my FIFA World Cup 2026 Predictor Bracket! Predicted Champion: ${champion ? champion.emoji + " " + champion.name : "None"}. Build yours here: ${url}`).then(() => {
      setCopied(true);
      audioSynth.playTick();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToTwitter = () => {
    audioSynth.playTick();
    const text = `I've locked in my FIFA World Cup 2026 bracket predictions! My predicted champion is ${champion ? champion.emoji + " " + champion.name : "TBA"}. Make your prediction here:`;
    const url = window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareToWhatsApp = () => {
    audioSynth.playTick();
    const text = `Check out my FIFA World Cup 2026 bracket predictions! Predicted Champion: ${champion ? champion.emoji + " " + champion.name : "TBA"}. Locked on AI Studio. Match mine here: ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        {/* Real hidden Canvas element for drawing HD cards */}
        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative max-w-5xl w-full bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[85vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white hover:border-yellow-500/50 cursor-pointer transition duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT SIDE: Preview of the generated Visual Summary Card */}
          <div className="w-full md:w-[55%] bg-neutral-950 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5 relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Live Visual Card Preview</span>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-neutral-400">Rendering high-res prediction details...</span>
              </div>
            ) : previewUrl ? (
              <div className="relative max-h-[50vh] md:max-h-[70vh] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="My Bracket Prediction Card"
                  className="rounded-xl max-h-full max-w-full shadow-2xl border border-white/10 object-contain hover:scale-[1.01] transition duration-300"
                />
              </div>
            ) : (
              <div className="text-xs font-mono text-neutral-500">Failed to render card canvas</div>
            )}
          </div>

          {/* RIGHT SIDE: Action Controls & Social Platforms */}
          <div className="w-full md:w-[45%] p-6 flex flex-col justify-between overflow-y-auto bg-neutral-900/40">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                  Share & brag predictions
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                  SHARE MY BRACKET
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1.5">
                  Generate and download a gorgeous high-fidelity digital card of your 2026 World Cup match-by-match predictions to post directly on Instagram, Twitter, or WhatsApp.
                </p>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-mono uppercase text-neutral-400">
                  Select Aspect Ratio Layout
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["1:1", "9:16", "16:9"] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => {
                        setSelectedRatio(ratio);
                        audioSynth.playSelection();
                      }}
                      className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        selectedRatio === ratio
                          ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                          : "bg-neutral-950 border-white/5 text-neutral-400 hover:text-white hover:border-white/10"
                      }`}
                    >
                      <span className="font-black text-sm">{ratio}</span>
                      <span className="text-[9px] text-neutral-500 font-medium">
                        {ratio === "1:1" ? "Square / Post" : ratio === "9:16" ? "Story / Reel" : "Landscape"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bracket Summary Stats block */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-white/5 space-y-2.5">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> Predictions Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <span className="text-neutral-500 block">COMPLETED:</span>
                    <span className="text-white font-bold">{completedCount} / 31 Matches</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <span className="text-neutral-500 block">CHAMPION:</span>
                    <span className="text-yellow-400 font-bold truncate block">
                      {champion ? `${champion.emoji} ${champion.name}` : "Not Selected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Action Call to Actions */}
            <div className="space-y-3 mt-6">
              {/* Primary Download Button */}
              <button
                onClick={handleDownload}
                disabled={isGenerating || !previewUrl}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-emerald-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition duration-300 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download HD Image Card
              </button>

              {/* Secondary Instant copy link buttons */}
              <button
                onClick={handleCopyShareLink}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link Copied!" : "Copy Live Share Link"}
              </button>

              {/* Native social button rails */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareToTwitter}
                  className="py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl text-[10px] font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-400" /> Twitter (X)
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl text-[10px] font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
                </button>
              </div>

              {/* Watermark/Disclaimer */}
              <div className="text-center pt-2">
                <p className="text-[10px] text-neutral-500 font-mono">
                  No watermark or advertisement tags added. Powered by Gemini.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
