import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Share2, Copy, X, Check, Instagram, MessageSquare, Award } from "lucide-react";
import { Team, Bracket, LanguageCode } from "../types";
import { getFlagUrl } from "../data/teams";
import { audioSynth } from "../utils/audio";
import { TRANSLATIONS } from "../data/translations";

interface ChampionOverlayProps {
  champion: Team;
  bracket: Bracket;
  onClose: () => void;
  lang: LanguageCode;
  isLoggedIn: boolean;
  onTriggerLogin: () => void;
  onQuickSave: (name: string, emailOrPhone: string) => void;
}

export default function ChampionOverlay({ 
  champion, 
  bracket, 
  onClose, 
  lang, 
  isLoggedIn, 
  onTriggerLogin,
  onQuickSave
}: ChampionOverlayProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveConfetti, setSaveConfetti] = useState<any[]>([]);

  const triggerConfettiBurst = () => {
    const colors = ["#10B981", "#FBBF24", "#F59E0B", "#FFFFFF", "#3B82F6", "#EC4899", "#8B5CF6"];
    const shapes = ["circle", "square"];
    const newParticles = Array.from({ length: 85 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 250;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity - (60 + Math.random() * 120);
      
      return {
        id: Math.random() + i,
        destX,
        destY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 0.08,
        duration: 1.0 + Math.random() * 1.2,
      };
    });
    setSaveConfetti(newParticles);
  };

  useEffect(() => {
    if (saveSuccess) {
      triggerConfettiBurst();
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        triggerConfettiBurst();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const t = TRANSLATIONS[lang];

  const handleQuickSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setSaveError("Please enter your name");
      return;
    }
    if (!guestContact.trim()) {
      setSaveError("Please enter your Email or Mobile Number");
      return;
    }
    setSaveError("");
    onQuickSave(guestName, guestContact);
    setSaveSuccess(true);
    audioSynth.playSelection();
  };

  useEffect(() => {
    // Play majestic synthesized fanfare and stadium roar
    audioSynth.playChampionFanfare();
    
    // Trigger mobile vibration if supported
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } catch (e) {
        // ignore
      }
    }
  }, [champion]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      audioSynth.playTick();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // HD bracket generator using canvas
  const downloadBracketImage = (aspectRatio: "16:9" | "1:1" | "9:16") => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define dimensions based on chosen aspect ratio
    let width = 1920;
    let height = 1080;

    if (aspectRatio === "1:1") {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === "9:16") {
      width = 1080;
      height = 1920;
    }

    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Dark Football pitch slate)
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
    bgGrad.addColorStop(0, "#022c22"); // Dark green emerald center
    bgGrad.addColorStop(1, "#000000"); // Jet black corners
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Pitch gridlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Render Title
    ctx.fillStyle = "#FBBF24"; // Amber Gold
    ctx.font = `black ${Math.round(width * 0.045)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("FIFA WORLD CUP 2026", width / 2, height * 0.12);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(width * 0.02)}px monospace`;
    ctx.fillText("MY CHAMPION PREDICTION BRACKET", width / 2, height * 0.17);

    // Draw Champion Flag & Info in the center
    const champX = width / 2;
    const champY = height * 0.45;

    // Draw gold ring
    ctx.strokeStyle = "#FBBF24";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(champX, champY, width * 0.08, 0, Math.PI * 2);
    ctx.stroke();

    // Fill ring back
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.arc(champX, champY, width * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Emoji Flag / Text fallback
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `${Math.round(width * 0.06)}px sans-serif`;
    ctx.fillText(champion.emoji, champX, champY + width * 0.02);

    // Champion Name
    ctx.fillStyle = "#FBBF24";
    ctx.font = `black ${Math.round(width * 0.032)}px sans-serif`;
    ctx.fillText(champion.name.toUpperCase(), champX, champY + width * 0.14);

    ctx.fillStyle = "#10B981"; // Emerald accent
    ctx.font = `bold ${Math.round(width * 0.015)}px monospace`;
    ctx.fillText("WORLD CHAMPION 2026", champX, champY + width * 0.17);

    // Add brief info stamp
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "12px monospace";
    ctx.fillText("PREDICTION SECURED VIA AI STUDIO PREDICTOR PLATFORM • NO WATERMARK", width / 2, height - 50);

    // Trigger local download
    const format = "image/png";
    const dataUrl = canvas.toDataURL(format);
    const link = document.createElement("a");
    link.download = `fifa_world_cup_2026_bracket_${aspectRatio}.png`;
    link.href = dataUrl;
    link.click();
    setIsGeneratingImage(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Hidden Canvas for Bracket generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Confetti and Particle Cascade overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              background: i % 3 === 0 ? "#FBBF24" : i % 3 === 1 ? "#10B981" : "#FFFFFF",
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              top: "110%",
              x: [0, Math.sin(i) * 100, 0],
              rotate: [0, 720],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-2xl w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border border-yellow-500/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.25)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:border-yellow-500/50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cinematic Spotlight behind trophy */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/15 rounded-full blur-[80px]" />

        {/* Falling Trophy animation */}
        <motion.div
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 80 }}
          className="w-32 h-32 mx-auto relative mb-6"
        >
          {/* Animated Gold Aura */}
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full filter blur-xl animate-ping" />
          <Award className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
        </motion.div>

        {/* Title and Champion */}
        <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">
          {t.championLabel}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mt-2 mb-4">
          {champion.name}
        </h2>

        {/* Champion flag banner waving */}
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mx-auto w-32 h-20 rounded-xl overflow-hidden border border-white/20 shadow-lg flex items-center justify-center mb-8 relative"
        >
          <img src={getFlagUrl(champion.id)} alt={champion.name} className="w-full h-full object-cover relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-20" />
        </motion.div>

        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8">
          Congratulations! Your World Cup 2026 tournament bracket is complete. Share your prediction with the world or download high-fidelity layout files.
        </p>

        {!isLoggedIn ? (
          <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 max-w-md mx-auto mb-8 text-left space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="text-center">
              <span className="text-yellow-400 font-extrabold text-[11px] tracking-widest uppercase block font-mono">
                ✨ SAVE YOUR PREDICTION (OPTIONAL) ✨
              </span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Store your 2026 World Cup prediction permanently in global leaderboards.
              </p>
            </div>

            {saveSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center space-y-2 relative overflow-visible">
                {/* Save Confetti burst overlay */}
                {saveConfetti.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-50">
                    {saveConfetti.map((p) => (
                      <motion.div
                        key={p.id}
                        className="absolute"
                        style={{
                          width: p.size,
                          height: p.shape === "circle" ? p.size : p.size * 1.5,
                          backgroundColor: p.color,
                          borderRadius: p.shape === "circle" ? "50%" : "1px",
                        }}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                        animate={{
                          x: p.destX,
                          y: p.destY,
                          scale: [0, 1.3, 0.9, 0],
                          opacity: [1, 1, 0.7, 0],
                          rotate: [0, Math.random() * 720],
                        }}
                        transition={{
                          duration: p.duration,
                          delay: p.delay,
                          ease: [0.1, 0.8, 0.3, 1],
                        }}
                      />
                    ))}
                  </div>
                )}
                <Check className="w-8 h-8 text-emerald-400 mx-auto animate-bounce relative z-10" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider relative z-10">Prediction Secured!</h4>
                <p className="text-[10px] text-neutral-300 font-mono relative z-10">
                  Your bracket with {champion.name} has been synchronized.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickSaveSubmit} className="space-y-3">
                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[10px] text-red-400 font-mono text-center">
                    {saveError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase text-neutral-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Anirudh P"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase text-neutral-400">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    placeholder="e.g. +91 9876543210 or user@gmail.com"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-yellow-500/50 transition font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition duration-200 cursor-pointer shadow-md"
                >
                  Save Bracket Instantly
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-3 text-[9px] text-neutral-500 font-mono uppercase">or social login</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerLogin();
                      audioSynth.playSelection();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl text-[10px] font-bold text-white transition cursor-pointer"
                  >
                    <span>🌐 Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerLogin();
                      audioSynth.playSelection();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl text-[10px] font-bold text-white transition cursor-pointer"
                  >
                    <span>🍎 Apple</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 max-w-md mx-auto mb-8 text-center space-y-2 relative overflow-visible">
            {/* Save Confetti burst overlay */}
            {saveConfetti.length > 0 && (
              <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-50">
                {saveConfetti.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute"
                    style={{
                      width: p.size,
                      height: p.shape === "circle" ? p.size : p.size * 1.5,
                      backgroundColor: p.color,
                      borderRadius: p.shape === "circle" ? "50%" : "1px",
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: p.destX,
                      y: p.destY,
                      scale: [0, 1.3, 0.9, 0],
                      opacity: [1, 1, 0.7, 0],
                      rotate: [0, Math.random() * 720],
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: [0.1, 0.8, 0.3, 1],
                    }}
                  />
                ))}
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 relative z-10">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider relative z-10">Prediction Synced Successfully</h4>
            <p className="text-[10px] text-neutral-400 font-mono relative z-10">
              Saved for user: <strong className="text-emerald-400">{guestName || "Authenticated Predictor"}</strong>
            </p>
          </div>
        )}



        {/* Share Tools & Buttons */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {/* Download PNG */}
            <button
              onClick={() => downloadBracketImage("16:9")}
              disabled={isGeneratingImage}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-xs font-bold text-white hover:border-yellow-500/50 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-yellow-500" />
              16:9 HD Bracket
            </button>

            {/* Download Instagram square */}
            <button
              onClick={() => downloadBracketImage("1:1")}
              disabled={isGeneratingImage}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-xs font-bold text-white hover:border-yellow-500/50 transition cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-amber-500" />
              1:1 Insta Square
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-white/5 pt-6 max-w-md mx-auto">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-xs font-bold text-neutral-300 hover:text-white hover:border-emerald-500/50 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? t.copied : t.copyLink}
            </button>

            <button
              onClick={() => {
                const text = `Check out my FIFA World Cup 2026 Champion prediction: ${champion.emoji} ${champion.name}!`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-xs font-bold text-emerald-400 hover:border-emerald-500/40 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Share
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
