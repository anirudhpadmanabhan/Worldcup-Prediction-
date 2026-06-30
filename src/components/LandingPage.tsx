import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Volume2, VolumeX, Shield, Trophy } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface LandingPageProps {
  onStart: () => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  key?: React.Key;
}

export default function LandingPage({ onStart, lang, setLang }: LandingPageProps) {
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shine, setShine] = useState(0);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Infinite shine cycle
    const interval = setInterval(() => {
      setShine(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartPredicting = () => {
    audioSynth.playCinematicZoom();
    setIsTransitioning(true);
    setTimeout(() => {
      onStart();
    }, 1500); // Allow cinematic zoom transition
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

  // Generate background particles
  const particles = Array.from({ length: 40 });

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-between z-50">
      {/* Background Stadium Lights & Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 via-black to-black pointer-events-none" />

      {/* Moving Spotlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse duration-[6000ms]" />
        <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-yellow-500/5 blur-[150px] animate-pulse duration-[8000ms]" />
        
        {/* Animated Stadium Spotlight Beams */}
        <div className="absolute top-0 left-1/4 w-32 h-[150vh] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent -rotate-12 transform origin-top blur-[40px] animate-pulse duration-[5000ms]" />
        <div className="absolute top-0 right-1/4 w-40 h-[150vh] bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent rotate-12 transform origin-top blur-[50px] animate-pulse duration-[7000ms]" />
      </div>

      {/* Interactive floating soccer ball and particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0
                ? "bg-yellow-500/20 w-1.5 h-1.5"
                : i % 3 === 1
                ? "bg-emerald-500/20 w-1 h-1"
                : "bg-white/10 w-2 h-2"
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.sin(i) * 30, 0],
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Top Bar (Language Selector & Mute) */}
      <div className="w-full max-w-7xl px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-mono tracking-wider text-neutral-400">FIFA 2026 PREDICTOR</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Picker */}
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value as LanguageCode);
              audioSynth.playTick();
            }}
            className="bg-neutral-900/80 border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 outline-none cursor-pointer focus:border-yellow-500/50 hover:bg-neutral-800 transition"
          >
            <option value="en">English</option>
            <option value="ml">മലയാളം</option>
            <option value="hi">हिंदी</option>
            <option value="ar">العربية</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
          </select>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-neutral-900/80 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-yellow-500/50 transition cursor-pointer"
            title="Toggle Sound Effects"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-yellow-500 animate-bounce" />}
          </button>
        </div>
      </div>

      {/* Cinematic Center Trophy Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full px-4">
        {/* Animated Background Crowd Cheer Simulation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] animate-pulse" />
        </div>

        {/* 3D Rotating Trophy Canvas / SVG container */}
        <motion.div
          id="trophy-wrapper"
          className="relative w-72 h-72 flex items-center justify-center cursor-pointer"
          style={{ perspective: 1000 }}
          animate={
            isTransitioning
              ? {
                  scale: 12,
                  rotateY: 720,
                  opacity: [1, 0.8, 0],
                  z: 400,
                }
              : {
                  y: [0, -10, 0],
                }
          }
          transition={
            isTransitioning
              ? { duration: 1.5, ease: "easeIn" }
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
          onClick={() => {
            setShine(prev => prev + 1);
            audioSynth.playSelection();
          }}
        >
          {/* Shiny Spotlight behind trophy */}
          <div className="absolute w-40 h-40 bg-radial-gradient from-yellow-500/20 to-transparent rounded-full blur-xl animate-pulse" />

          {/* Majestic Trophy SVG */}
          <motion.svg
            viewBox="0 0 200 300"
            className="w-full h-full drop-shadow-[0_0_35px_rgba(234,179,8,0.35)]"
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
          >
            <defs>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="30%" stopColor="#EAB308" />
                <stop offset="70%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#854D0E" />
              </linearGradient>
              <linearGradient id="malachite" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#064E3B" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
              <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base block */}
            <rect x="70" y="250" width="60" h="25" rx="5" fill="#1F2937" stroke="#374151" strokeWidth="2" />
            
            {/* Green Malachite Band 1 */}
            <rect x="75" y="240" width="50" h="8" rx="2" fill="url(#malachite)" />
            {/* Green Malachite Band 2 */}
            <rect x="78" y="224" width="44" h="8" rx="2" fill="url(#malachite)" />

            {/* Gold spacers */}
            <rect x="76" y="232" width="48" h="8" rx="1" fill="url(#gold)" />
            <rect x="80" y="216" width="40" h="8" rx="1" fill="url(#gold)" />

            {/* Elegant raising golden curves */}
            {/* Stem left */}
            <path d="M 82 216 Q 70 150 95 110" fill="none" stroke="url(#gold)" strokeWidth="12" strokeLinecap="round" />
            {/* Stem right */}
            <path d="M 118 216 Q 130 150 105 110" fill="none" stroke="url(#gold)" strokeWidth="12" strokeLinecap="round" />
            
            {/* Swirling figure left supporting globe */}
            <path d="M 90 140 C 60 100 80 60 100 90" fill="none" stroke="url(#gold)" strokeWidth="10" strokeLinecap="round" />
            {/* Swirling figure right supporting globe */}
            <path d="M 110 140 C 140 100 120 60 100 90" fill="none" stroke="url(#gold)" strokeWidth="10" strokeLinecap="round" />

            {/* Solid central golden pillar */}
            <path d="M 95 216 C 90 180 110 180 105 216 Z" fill="url(#gold)" />

            {/* The Globe representation on top */}
            <circle cx="100" cy="70" r="28" fill="url(#gold)" />
            {/* Embossed continents visual details */}
            <path d="M 82 62 Q 90 55 100 60 T 115 55" fill="none" stroke="#854D0E" strokeWidth="3" strokeLinecap="round" />
            <path d="M 80 75 Q 95 85 118 72" fill="none" stroke="#854D0E" strokeWidth="3" strokeLinecap="round" />
            <path d="M 90 85 Q 100 92 110 88" fill="none" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" />

            {/* Sparkling metallic shine effect */}
            <motion.path
              d="M 60 40 L 140 260"
              fill="none"
              stroke="url(#shineGradient)"
              strokeWidth="20"
              opacity="0.6"
              animate={{
                transform: ["translateX(-150px)", "translateX(150px)"]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
          </motion.svg>
        </motion.div>

        {/* Text Area */}
        <AnimatePresence>
          {!isTransitioning && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center mt-8 space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-100 via-yellow-400 to-amber-500 drop-shadow-sm font-sans">
                {t.title}
              </h1>
              
              <p className="text-neutral-400 text-lg font-medium tracking-wide">
                {t.subtitle}
              </p>

              {/* Large START PREDICTING Button */}
              <div className="pt-6">
                <motion.button
                  onClick={handleStartPredicting}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => audioSynth.playTick()}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-emerald-600 text-black font-extrabold text-sm tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] hover:brightness-110 transition duration-300 flex items-center gap-3 mx-auto uppercase cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  {t.startBtn}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center py-6 text-[10px] font-mono tracking-widest text-neutral-500 z-20 flex flex-col items-center gap-2">
        <span>© 2026 FIFA ORIGINAL PREDICTOR.</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-emerald-500/80">
            <Shield className="w-3 h-3" /> SECURE EXPERIENCE
          </span>
          <span>HOST CITY: UNITED STATES • MEXICO • CANADA</span>
        </div>
      </div>
    </div>
  );
}
