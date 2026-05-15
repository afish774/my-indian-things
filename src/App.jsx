import React, { useEffect, useCallback, useState, useRef, memo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
  AnimatePresence,
  useScroll,
} from "framer-motion";
import { ArrowRight, Search, Leaf, Droplet, Sun, ShieldCheck } from "lucide-react";

import baseLight from './assets/base-light.jpg.png';
import baseDark from './assets/base-dark.jpg.png';
import wall1Light from './assets/wall1-light.jpg.png';
import wall1Dark from './assets/wall1-dark.jpg.png';
import wall2Light from './assets/wall2-light.jpg.png';
import wall2Dark from './assets/wall2-dark.jpg.png';
import wall3Light from './assets/wall3-light.jpg.png';
import wall3Dark from './assets/wall3-dark.jpg.png';

const WALLPAPERS = [
  { id: 1, lightImage: wall1Light, darkImage: wall1Dark, collection: "Mandala Heritage", tagline: "Sacred geometry, woven into your walls", accent: "#C2410C" },
  { id: 2, lightImage: wall2Light, darkImage: wall2Dark, collection: "Block Print Series", tagline: "Jaipur artisan heritage, reinvented", accent: "#0F766E" },
  { id: 3, lightImage: wall3Light, darkImage: wall3Dark, collection: "Floral Mughal", tagline: "The garden of emperors, in every room", accent: "#7C3AED" },
];

// ─── ANIMATION CONSTANTS ────────────────────────────────────────────────────
// All timing/easing values are centralised here for consistency.

/** Apple's signature deceleration curve */
const EASE_APPLE = [0.16, 1, 0.3, 1];
/** Soft cinematic enter */
const EASE_CINEMATIC = [0.25, 0.46, 0.45, 0.94];
/** Organic spring – snappy but not bouncy */
const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 40, mass: 0.8 };
/** Gentle float spring for hover/subtle motion */
const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 30, mass: 1 };
/** Scroll spring smoothing config */
const SPRING_SCROLL = { stiffness: 80, damping: 25, restDelta: 0.001 };

const DURATION = {
  xs:  0.3,
  sm:  0.5,
  md:  0.8,
  lg:  1.2,
  xl:  1.8,
  xxl: 2.4,
};

// ─── REUSABLE VARIANTS ───────────────────────────────────────────────────────

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.lg, ease: EASE_APPLE, delay },
  }),
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: DURATION.sm, ease: EASE_CINEMATIC },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const heroEyebrowVariants = {
  hidden: { opacity: 0, y: -14, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.md, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(3px)",
    transition: { duration: DURATION.sm, ease: EASE_CINEMATIC },
  },
};

const heroHeadlineVariants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: DURATION.lg, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
    transition: { duration: DURATION.sm, ease: EASE_CINEMATIC },
  },
};

const heroTaglineVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.md, ease: EASE_APPLE, delay: 0.15 },
  },
  exit: {
    opacity: 0,
    y: 6,
    filter: "blur(2px)",
    transition: { duration: DURATION.sm, ease: EASE_CINEMATIC },
  },
};

const collectionCardVariants = {
  hidden: { opacity: 0, y: 44 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.md, ease: EASE_APPLE, delay },
  }),
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

/** Memoised to prevent re-render when parent state changes */
const CenteredProgressBar = memo(function CenteredProgressBar({ duration, isActive, resetKey }) {
  const widthVal = useMotionValue(100);

  useEffect(() => {
    widthVal.set(100);
    if (!isActive) return;
    const ctrl = animate(widthVal, 0, { duration, ease: "linear" });
    return () => ctrl.stop();
  }, [isActive, duration, widthVal, resetKey]);

  const widthPct = useTransform(widthVal, (v) => `${v}%`);

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden rounded-full">
      <motion.div
        className="absolute top-0 bottom-0 right-0 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{ width: widthPct }}
      />
    </div>
  );
});

/** Scroll-triggered reveal with blur→sharp + vertical drift */
function ScrollRevealText({ children, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

/** Hover-spring button wrapper – wraps any button for premium feel */
function SpringButton({ children, className, onClick, style }) {
  return (
    <motion.button
      className={className}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAPPY}
    >
      {children}
    </motion.button>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [phase, setPhase] = useState("holding");
  const [sequenceKey, setSequenceKey] = useState(0);

  // ── Hero motion values ──
  const rollerProgress  = useMotionValue(100);
  const wallpaperOpacity = useMotionValue(1);
  // Subtle "breath" scale on the wallpaper during transition (1 → 1.03 → 1)
  const wallpaperScale  = useMotionValue(1);

  const clipPath  = useTransform(rollerProgress, [0, 100], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const rollerLeft = useTransform(rollerProgress, [0, 100], ["0%", "100%"]);

  // ── Nav scroll ──
  const { scrollY } = useScroll();
  const navBg       = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]);
  const navBackdrop = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(24px)"]);
  const navBorder   = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.1)"]);

  // ── Material sticky section scroll ──
  const materialRef = useRef(null);
  const { scrollYProgress: rawMaterialScroll } = useScroll({
    target: materialRef,
    offset: ["start start", "end end"],
  });
  // Spring-smooth the raw scroll progress → eliminates harsh jumps
  const materialScroll = useSpring(rawMaterialScroll, SPRING_SCROLL);

  // Parallax texture: scale & fade
  const textureScale   = useTransform(materialScroll, [0, 1], [1, 1.4]);
  const textureOpacity = useTransform(materialScroll, [0, 0.15, 0.85, 1], [0.25, 0.8, 0.8, 0.25]);

  // Per-block opacity with smooth ramp-in/out (wider windows = less abrupt)
  const text1Opacity = useTransform(materialScroll, [0.05, 0.18, 0.28, 0.35], [0, 1, 1, 0]);
  const text2Opacity = useTransform(materialScroll, [0.38, 0.50, 0.60, 0.67], [0, 1, 1, 0]);
  const text3Opacity = useTransform(materialScroll, [0.70, 0.80, 0.92, 1.0 ], [0, 1, 1, 0]);

  // Vertical drift – spring-smoothed so it feels weighty
  const rawTextY = useTransform(materialScroll, [0, 1], [48, -48]);
  const textY    = useSpring(rawTextY, SPRING_SCROLL);

  // Per-block blur: sharp when visible, soft when transitioning
  const text1Blur = useTransform(text1Opacity, [0, 1], ["blur(8px)", "blur(0px)"]);
  const text2Blur = useTransform(text2Opacity, [0, 1], ["blur(8px)", "blur(0px)"]);
  const text3Blur = useTransform(text3Opacity, [0, 1], ["blur(8px)", "blur(0px)"]);

  // ── Hero transition logic ──────────────────────────────────────────────────
  const triggerNext = useCallback(() => {
    if (phase !== "holding") return;
    setPhase("fading");

    // 1. Fade out current wallpaper + subtle scale-back
    animate(wallpaperOpacity, 0, { duration: DURATION.md, ease: EASE_CINEMATIC });
    animate(wallpaperScale, 0.97, { duration: DURATION.md, ease: EASE_CINEMATIC });

    // 2. After fade completes, wipe in new wallpaper
    setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % WALLPAPERS.length);
      rollerProgress.set(0);
      wallpaperOpacity.set(1);
      wallpaperScale.set(1);          // reset scale
      setPhase("wiping");
      setSequenceKey((k) => k + 1);

      // 3. Wipe across + subtle scale-up for depth
      animate(rollerProgress, 100, {
        duration: DURATION.xxl,
        ease: EASE_APPLE,
        onComplete: () => setPhase("holding"),
      });
      // scale breathes: 1 → 1.03 → 1 over the wipe duration
      animate(wallpaperScale, 1.03, {
        duration: DURATION.xxl / 2,
        ease: EASE_APPLE,
        onComplete: () =>
          animate(wallpaperScale, 1, { duration: DURATION.xxl / 2, ease: EASE_APPLE }),
      });
    }, DURATION.md * 1000 + 120); // slight buffer for seamless phase handoff
  }, [phase, rollerProgress, wallpaperOpacity, wallpaperScale]);

  const handleDotClick = useCallback((index) => {
    if (index === currentIdx || phase === "wiping") return;
    setPhase("wiping");
    setCurrentIdx(index);
    rollerProgress.set(0);
    wallpaperOpacity.set(1);
    wallpaperScale.set(1);
    setSequenceKey((k) => k + 1);

    animate(rollerProgress, 100, {
      duration: DURATION.xl,
      ease: EASE_APPLE,
      onComplete: () => setPhase("holding"),
    });
    animate(wallpaperScale, 1.03, {
      duration: DURATION.xl / 2,
      ease: EASE_APPLE,
      onComplete: () =>
        animate(wallpaperScale, 1, { duration: DURATION.xl / 2, ease: EASE_APPLE }),
    });
  }, [currentIdx, phase, rollerProgress, wallpaperOpacity, wallpaperScale]);

  useEffect(() => {
    const id = setInterval(() => {
      if (phase === "holding") triggerNext();
    }, 7000);
    return () => clearInterval(id);
  }, [triggerNext, phase]);

  const current = WALLPAPERS[currentIdx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #000;
          color: #fff;
          margin: 0;
          /* smooth-scroll at OS level for anchor links */
          scroll-behavior: smooth;
        }

        .glass-panel {
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.15);
        }

        @keyframes subtlePulse {
          0%   { box-shadow: 0 0 0 0   rgba(255,255,255,0.1); }
          70%  { box-shadow: 0 0 0 20px rgba(255,255,255,0);   }
          100% { box-shadow: 0 0 0 0   rgba(255,255,255,0);   }
        }
        .lamp-hotspot { animation: subtlePulse 3s infinite; }

        ::-webkit-scrollbar       { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-transparent"
        style={{
          backgroundColor: navBg,
          backdropFilter: navBackdrop,
          WebkitBackdropFilter: navBackdrop,
          borderBottomColor: navBorder,
        }}
      >
        <span className="font-inter text-[12px] md:text-[13px] tracking-[0.2em] font-medium text-white drop-shadow-md">
          MY INDIAN THINGS
        </span>

        <div className="hidden lg:flex items-center gap-12">
          {["Collections", "Material", "Philosophy", "Journal"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-inter text-[11px] tracking-[0.15em] uppercase text-white/80"
              whileHover={{ color: "#ffffff", y: -1 }}
              transition={SPRING_GENTLE}
            >
              {item}
            </motion.a>
          ))}
        </div>

        <div className="flex items-center gap-6 text-white">
          <motion.button
            className="hidden md:block"
            whileHover={{ scale: 1.15, opacity: 0.8 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_SNAPPY}
          >
            <Search size={18} />
          </motion.button>

          <SpringButton className="font-inter text-[10px] md:text-[11px] tracking-widest uppercase border border-white/30 rounded-full px-5 py-2.5 bg-white/5 backdrop-blur-sm">
            Order Sample
          </SpringButton>
        </div>
      </motion.nav>

      <main className="w-full">

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section className="h-[100dvh] w-full relative overflow-hidden bg-black">

          {/* Base Room – css transition for dark-mode swap */}
          <div className="absolute inset-0 z-0">
            <img
              src={baseLight} alt="Room Light"
              className="absolute inset-0 object-cover w-full h-full scale-105"
              style={{ opacity: isDarkMode ? 0 : 1, transition: "opacity 1s ease" }}
            />
            <img
              src={baseDark} alt="Room Dark"
              className="absolute inset-0 object-cover w-full h-full scale-105"
              style={{ opacity: isDarkMode ? 1 : 0, transition: "opacity 1s ease" }}
            />
          </div>

          {/* Wallpaper overlay – clip-path wipe + opacity + subtle scale */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{
              clipPath,
              opacity: wallpaperOpacity,
              scale: wallpaperScale,
              willChange: "clip-path, opacity, transform",
            }}
          >
            <img
              src={current.lightImage} alt="Wallpaper Light"
              className="absolute inset-0 object-cover w-full h-full scale-105"
              style={{ opacity: isDarkMode ? 0 : 1, transition: "opacity 1s ease" }}
            />
            <img
              src={current.darkImage} alt="Wallpaper Dark"
              className="absolute inset-0 object-cover w-full h-full scale-105"
              style={{ opacity: isDarkMode ? 1 : 0, transition: "opacity 1s ease" }}
            />
          </motion.div>

          {/* Interactive Lamp hotspot */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            <div className="relative w-full h-full max-w-[2000px] mx-auto">
              <motion.button
                onClick={() => setIsDarkMode((d) => !d)}
                className="absolute pointer-events-auto rounded-full cursor-pointer focus:outline-none lamp-hotspot"
                style={{ top: "27%", right: "13%", width: "11%", height: "15%", minWidth: "40px", minHeight: "40px" }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(255,255,255,0.25)" }}
                transition={SPRING_GENTLE}
              />
            </div>
          </div>

          {/* Shadow overlay */}
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            animate={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)" }}
            transition={{ duration: DURATION.lg, ease: EASE_CINEMATIC }}
          />

          {/* Paint Roller Line – opacity driven by phase */}
          <motion.div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center"
            style={{ left: rollerLeft, x: "-50%", willChange: "left" }}
            animate={{ opacity: phase === "wiping" ? 1 : 0 }}
            transition={{ duration: DURATION.xs, ease: EASE_CINEMATIC }}
          >
            <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#C9973A] to-transparent shadow-[0_0_30px_8px_rgba(201,151,58,0.5)]" />
            <motion.div
              className="h-48 md:h-64 w-8 rounded-full glass-panel shadow-2xl flex flex-col items-center justify-center gap-2"
              animate={{ scaleY: phase === "wiping" ? [1, 1.04, 1] : 1 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-1 h-8 rounded-full bg-white/50" />
              <div className="w-1 h-12 rounded-full bg-white/90" />
              <div className="w-1 h-8 rounded-full bg-white/50" />
            </motion.div>
          </motion.div>

          {/* Hero Typography – staggered children */}
          <div className="absolute z-30 inset-0 flex flex-col items-center justify-center pointer-events-none px-6 mt-12">
            <div className="w-full text-center">

              <AnimatePresence mode="wait">
                <motion.div
                  key={`eyebrow-${current.id}`}
                  className="flex items-center justify-center gap-4 mb-6 md:mb-8"
                  variants={heroEyebrowVariants}
                  initial="hidden" animate="visible" exit="exit"
                >
                  <motion.div
                    className="h-[1px] w-8 md:w-12"
                    style={{ backgroundColor: current.accent }}
                    layoutId="accent-line-left"
                  />
                  <span className="font-inter text-[9px] md:text-[11px] tracking-[0.4em] uppercase text-white drop-shadow-lg font-medium">
                    {current.collection}
                  </span>
                  <motion.div
                    className="h-[1px] w-8 md:w-12"
                    style={{ backgroundColor: current.accent }}
                    layoutId="accent-line-right"
                  />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={`headline-${current.id}`}
                  variants={heroHeadlineVariants}
                  initial="hidden" animate="visible" exit="exit"
                  className="font-cormorant text-white leading-[1.05] text-[4rem] md:text-[6.5rem] lg:text-[8rem] font-medium tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  Transform Your <br /> Walls Into Art.
                </motion.h1>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`tagline-${current.id}`}
                  variants={heroTaglineVariants}
                  initial="hidden" animate="visible" exit="exit"
                  className="font-inter text-sm md:text-lg tracking-wide text-white mt-6 md:mt-8 w-full max-w-lg mx-auto font-light drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                >
                  {current.tagline}
                </motion.p>
              </AnimatePresence>

              {/* CTA Button */}
              <div className="mt-10 md:mt-14 flex items-center justify-center pointer-events-auto">
                <motion.button
                  className="font-inter text-white rounded-full px-10 py-4 md:px-12 md:py-5 text-[10px] md:text-[11px] tracking-widest uppercase font-medium flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 bg-black/20 backdrop-blur-md group"
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,1)",
                    color: "#000",
                    scale: 1.04,
                    boxShadow: "0 14px 50px rgba(0,0,0,0.6)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_SNAPPY}
                >
                  Explore Designs
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={SPRING_GENTLE}
                    style={{ display: "inline-flex" }}
                  >
                    <ArrowRight size={14} />
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="absolute z-40 left-1/2 bottom-12 -translate-x-1/2 flex items-center gap-4 md:gap-6">
            {WALLPAPERS.map((wp, i) => (
              <motion.button
                key={wp.id}
                onClick={() => handleDotClick(i)}
                className="relative flex items-center justify-center pointer-events-auto p-2"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
              >
                <motion.div
                  className="rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                  animate={{
                    width: i === currentIdx ? "36px" : "8px",
                    opacity: i === currentIdx ? 1 : 0.3,
                  }}
                  style={{ height: "8px" }}
                  transition={{ duration: DURATION.sm, ease: EASE_APPLE }}
                >
                  {i === currentIdx && (
                    <CenteredProgressBar duration={7} isActive={phase === "holding"} resetKey={sequenceKey} />
                  )}
                </motion.div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── 2. STICKY MATERIAL PARALLAX ─────────────────────────────────── */}
        <section id="material" ref={materialRef} className="h-[300vh] w-full bg-[#050505] relative">
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

            {/* Scaling background texture */}
            <motion.div
              className="absolute inset-0 z-0"
              style={{
                scale: textureScale,
                opacity: textureOpacity,
                willChange: "transform, opacity",
              }}
            >
              <img
                src={wall3Light} alt="Texture Detail"
                className="w-full h-full object-cover filter brightness-50 contrast-125"
              />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80" />
            </motion.div>

            {/* Text blocks – blur/sharp + vertical spring drift */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">

              {/* Block 1 */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  opacity: text1Opacity,
                  y: textY,
                  filter: text1Blur,
                  pointerEvents: "none",
                }}
              >
                <span className="font-inter text-[12px] tracking-[0.3em] uppercase text-[#C9973A] font-medium mb-6">
                  Uncompromising Quality
                </span>
                <h2 className="font-cormorant text-5xl md:text-8xl text-white font-medium leading-[1.1]">
                  Woven for durability.<br/>
                  <span className="italic text-white/70">Crafted for legacy.</span>
                </h2>
              </motion.div>

              {/* Block 2 */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  opacity: text2Opacity,
                  y: textY,
                  filter: text2Blur,
                  pointerEvents: "none",
                }}
              >
                <h2 className="font-cormorant text-5xl md:text-8xl text-white font-medium leading-[1.1] mb-6">
                  Zero Vinyl.<br/>
                  <span className="italic text-[#C9973A]">Zero Glare.</span>
                </h2>
                <p className="font-inter text-lg md:text-xl text-white/70 max-w-2xl font-light leading-relaxed">
                  Every roll is printed on heavy-weight, sustainable linen-blend canvas. It absorbs ambient light beautifully, providing a matte, museum-grade finish.
                </p>
              </motion.div>

              {/* Block 3 */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  opacity: text3Opacity,
                  y: textY,
                  filter: text3Blur,
                  pointerEvents: "none",
                }}
              >
                <h2 className="font-cormorant text-5xl md:text-8xl text-white font-medium leading-[1.1] mb-6">
                  Precision<br/>
                  <span className="italic text-white/70">in every pixel.</span>
                </h2>
                <p className="font-inter text-lg md:text-xl text-white/70 max-w-2xl font-light leading-relaxed">
                  Printed using archival inks that resist fading for decades, ensuring your walls look as vibrant in ten years as they do today.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 3. BENTO FEATURE GRID ───────────────────────────────────────── */}
        <section id="philosophy" className="w-full bg-[#050505] py-32 px-6 md:px-12 relative z-10">
          <div className="max-w-7xl mx-auto">

            <ScrollRevealText>
              <div className="mb-20 md:w-2/3">
                <span className="font-inter text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6 block">The Standard</span>
                <h2 className="font-cormorant text-4xl md:text-6xl text-white font-medium leading-tight">
                  Engineered to outlast trends. <br/> Built to protect your home.
                </h2>
              </div>
            </ScrollRevealText>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Leaf,        title: "Eco-Conscious",   desc: "PVC-free materials and water-based inks that are safe for your family and the planet." },
                { icon: Droplet,     title: "Washable Surface", desc: "Life happens. Our proprietary top-coat allows you to wipe away spills without damaging the art." },
                { icon: Sun,         title: "Fade Resistant",   desc: "UV-protected pigments ensure your vibrant colors won't dull, even in sun-drenched rooms." },
                { icon: ShieldCheck, title: "15-Year Warranty", desc: "We stand by our craftsmanship. Every purchase is backed by our comprehensive guarantee." },
              ].map((feature, i) => (
                <ScrollRevealText key={feature.title} delay={i * 0.1}>
                  <motion.div
                    className="bg-[#111] border border-white/5 rounded-2xl p-8 h-full"
                    whileHover={{
                      backgroundColor: "#161616",
                      borderColor: "rgba(255,255,255,0.1)",
                      y: -4,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    }}
                    transition={SPRING_GENTLE}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 3 }}
                      transition={SPRING_SNAPPY}
                      className="mb-8 w-fit"
                    >
                      <feature.icon size={32} strokeWidth={1.5} className="text-[#C9973A]" />
                    </motion.div>
                    <h3 className="font-cormorant text-2xl text-white mb-3">{feature.title}</h3>
                    <p className="font-inter text-sm text-white/50 leading-relaxed font-light">{feature.desc}</p>
                  </motion.div>
                </ScrollRevealText>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. ASYMMETRICAL COLLECTIONS GRID ────────────────────────────── */}
        <section id="collections" className="w-full bg-[#0a0a0a] py-32 px-6 md:px-12 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative z-20">
          <div className="max-w-screen-2xl mx-auto">

            <ScrollRevealText>
              <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <span className="font-inter text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">Curated Aesthetics</span>
                <h2 className="font-cormorant text-5xl md:text-7xl text-white font-medium">Explore the Collections</h2>
              </div>
            </ScrollRevealText>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">

              {/* Collection 1 (Tall) */}
              <motion.div
                className="lg:row-span-2 relative group overflow-hidden bg-[#111] rounded-xl cursor-pointer"
                variants={collectionCardVariants}
                custom={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.015 }}
                transition={SPRING_GENTLE}
              >
                <motion.div
                  className="absolute inset-0 bg-black/30 z-10"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  transition={{ duration: DURATION.md, ease: EASE_CINEMATIC }}
                />
                <motion.img
                  src={wall2Light} alt="Block Print"
                  className="w-full h-[500px] lg:h-[800px] object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 1.8, ease: EASE_CINEMATIC }}
                />
                <div className="absolute bottom-0 inset-x-0 p-10 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <span className="font-inter text-[10px] tracking-widest text-[#C9973A] uppercase mb-3 block">Bestseller</span>
                  <h3 className="font-cormorant text-4xl text-white mb-2">Block Print Series</h3>
                  <motion.p
                    className="font-inter text-sm text-white/70 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 0 }}       // stays hidden until hover
                    whileHover={{ opacity: 1, y: 0 }}  // group hover handled via motion
                    transition={{ duration: DURATION.sm, ease: EASE_APPLE }}
                  >
                    Heritage patterns engineered for modern, luxurious spaces.
                  </motion.p>
                  <button className="font-inter text-xs text-white uppercase tracking-widest border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-300">
                    View Gallery
                  </button>
                </div>
              </motion.div>

              {/* Collection 2 */}
              <motion.div
                className="relative group overflow-hidden bg-[#111] rounded-xl cursor-pointer"
                variants={collectionCardVariants}
                custom={0.1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.015 }}
                transition={SPRING_GENTLE}
              >
                <motion.div className="absolute inset-0 bg-black/30 z-10" whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }} transition={{ duration: DURATION.md }} />
                <motion.img
                  src={wall3Light} alt="Mughal"
                  className="w-full h-[400px] object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 1.8, ease: EASE_CINEMATIC }}
                />
                <div className="absolute bottom-0 inset-x-0 p-8 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <h3 className="font-cormorant text-3xl text-white mb-4">Mughal Botanicals</h3>
                  <button className="font-inter text-xs text-white uppercase tracking-widest border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-300">View Gallery</button>
                </div>
              </motion.div>

              {/* Collection 3 */}
              <motion.div
                className="relative group overflow-hidden bg-[#111] rounded-xl cursor-pointer"
                variants={collectionCardVariants}
                custom={0.2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.015 }}
                transition={SPRING_GENTLE}
              >
                <motion.div className="absolute inset-0 bg-black/30 z-10" whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }} transition={{ duration: DURATION.md }} />
                <motion.img
                  src={wall1Light} alt="Mandala"
                  className="w-full h-[400px] object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 1.8, ease: EASE_CINEMATIC }}
                />
                <div className="absolute bottom-0 inset-x-0 p-8 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <h3 className="font-cormorant text-3xl text-white mb-4">Mandala Heritage</h3>
                  <button className="font-inter text-xs text-white uppercase tracking-widest border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-300">View Gallery</button>
                </div>
              </motion.div>

              {/* Quote Block */}
              <motion.div
                className="md:col-span-2 bg-[#141414] p-12 lg:p-16 flex flex-col justify-center rounded-xl border border-white/5"
                variants={collectionCardVariants}
                custom={0.3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ borderColor: "rgba(201,151,58,0.15)", backgroundColor: "#161616" }}
                transition={SPRING_GENTLE}
              >
                <h3 className="font-cormorant text-3xl md:text-5xl text-white font-light italic leading-snug mb-10 text-center md:text-left">
                  "It's not just about covering a wall. It's about introducing soul, texture, and history into the space you live in."
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-12 h-[1px] bg-[#C9973A]" />
                  <span className="font-inter text-xs tracking-widest uppercase text-white/60">The Founder's Note</span>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 5. FOOTER / FINAL CTA ───────────────────────────────────────── */}
        <section className="w-full bg-black py-40 px-6 flex flex-col items-center justify-center text-center border-t border-white/10">
          <ScrollRevealText>
            <h2 className="font-cormorant text-5xl md:text-8xl text-white font-medium mb-10">
              Ready to redefine <br/> <span className="italic text-white/70">your space?</span>
            </h2>
          </ScrollRevealText>

          <ScrollRevealText delay={0.2}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.button
                className="font-inter text-black bg-white rounded-full px-12 py-5 text-[12px] tracking-widest uppercase font-semibold shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(255,255,255,0.35)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SNAPPY}
              >
                Shop Collections
              </motion.button>

              <motion.button
                className="font-inter text-white border border-white/30 rounded-full px-12 py-5 text-[12px] tracking-widest uppercase font-medium"
                whileHover={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.5)",
                  scale: 1.03,
                }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SNAPPY}
              >
                Order a Sample Kit
              </motion.button>
            </div>
          </ScrollRevealText>
        </section>

      </main>
    </>
  );
}