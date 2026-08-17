import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, useSpring } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import stacksImg from "../assets/stacks.png";
import AnimatedLoop from "../components/ui/AnimatedLoop";
import ChaosMap from "../components/ui/ChaosMap";

const WHATSAPP = "14155238886";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=480&h=360&fit=crop",
    label: "🛣️ Road Pothole",
  },
  {
    src: "https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=480&h=360&fit=crop",
    label: "🌧️ Waterlogging",
  },
  {
    src: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=480&h=360&fit=crop",
    label: "🗑️ Garbage Overflow",
  },
  {
    src: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=480&h=360&fit=crop",
    label: "🚆 Rail Damage",
  },
  {
    src: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=480&h=360&fit=crop",
    label: "💧 Pipe Burst",
  },
  {
    src: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=480&h=360&fit=crop",
    label: "🚨 Highway Accident",
  },
];

const catItems = [
  {
    emoji: "🛣️",
    name: "Road Issues",
    desc: "Potholes, damaged roads, broken dividers and surface hazards impacting traffic.",
    dept: "Municipal Road Department",
  },
  {
    emoji: "🚆",
    name: "Rail Track Issues",
    desc: "Track damage, alignment issues and safety concerns near rail corridors.",
    dept: "Railway Authority",
  },
  {
    emoji: "🗑️",
    name: "Garbage / Sanitation",
    desc: "Overflowing bins, uncollected waste, illegal dumping and sanitation emergencies.",
    dept: "Sanitation Department",
  },
  {
    emoji: "🌧️",
    name: "Drainage Problems",
    desc: "Blocked drains, waterlogging, flooded streets and storm drain failures.",
    dept: "Drainage Department",
  },
  {
    emoji: "💧",
    name: "Water Overflow / Leakage",
    desc: "Pipe bursts, water main leaks, overflowing tanks and municipal water wastage.",
    dept: "Water Supply Department",
  },
  {
    emoji: "🚨",
    name: "Highway Accidents",
    desc: "Emergency road incidents, accident scenes and immediate safety risks on highways.",
    dept: "Traffic Police / Emergency",
  },
];

const howSteps = [
  {
    num: "01",
    icon: "📍",
    title: "Spot the Issue",
    desc: "See a pothole, overflowing bin, or broken drain? Open CivicSeva from anywhere.",
  },
  {
    num: "02",
    icon: "📋",
    title: "Select Category",
    desc: "Choose the issue type — we auto-route it to the correct government department.",
  },
  {
    num: "03",
    icon: "📸",
    title: "Upload Evidence",
    desc: "Attach photos. Visual proof speeds up response and confirms the issue location.",
  },
  {
    num: "04",
    icon: "✅",
    title: "Track & Resolve",
    desc: "Get a unique ticket ID. Track your complaint and receive updates on resolution.",
  },
];

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Classification",
    desc: "Natural language processing instantly categorises your report and routes it to the right department.",
    badge: "NLP Engine",
  },
  {
    icon: "🗺️",
    title: "Location Intelligence",
    desc: "GPS tagging and map pinning ensures field teams find the exact issue location fast.",
    badge: "Maps API",
  },
  {
    icon: "🔔",
    title: "Real-Time Tracking",
    desc: "Live status updates via SMS and WhatsApp keep citizens informed throughout resolution.",
    badge: "Live Updates",
  },
  {
    icon: "📊",
    title: "Department Routing",
    desc: "Smart routing eliminates middlemen and sends each complaint directly to the right authority.",
    badge: "Instant",
  },
  {
    icon: "📸",
    title: "Photo Evidence",
    desc: "Attach photographic proof to your report. Visual evidence dramatically speeds up resolution.",
    badge: "Media Upload",
  },
  {
    icon: "🔁",
    title: "Duplicate Detection",
    desc: "AI detects and merges duplicate reports, preventing resource waste on the same issue.",
    badge: "AI Merge",
  },
];

/* -----------------------------
   Reusable animation variants
----------------------------- */
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -100,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.75,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

export default function Home() {
  const navigate = useNavigate();

  /* ---------- Page-wide cursor spotlight ---------- */
  const [spotVisible, setSpotVisible] = useState(false);
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotBackground = useMotionTemplate`radial-gradient(500px circle at ${spotX}px ${spotY}px, rgba(78,205,196,0.35), rgba(26,158,143,0.16) 35%, transparent 70%)`;

  useEffect(() => {
    const handleMouseMove = (e) => {
      spotX.set(e.clientX);
      spotY.set(e.clientY);
      setSpotVisible(true);
    };
    const handleMouseLeave = () => setSpotVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [spotX, spotY]);

  /* ---------- Gradient refs ---------- */

  // HERO — static base gradient; on hover it cycles through color stops on a loop
  const heroRef = useRef(null);
  const heroBaseGradient =
    "linear-gradient(160deg, var(--bg) 0%, #f3f7f6 45%, #e8f3f1 100%)";

  // HERO GRID — parallax offset + zoom-out on cursor hover
  const [heroGridHovered, setHeroGridHovered] = useState(false);
  const gridRawX = useMotionValue(0);
  const gridRawY = useMotionValue(0);
  const gridX = useSpring(gridRawX, { stiffness: 60, damping: 15, mass: 0.5 });
  const gridY = useSpring(gridRawY, { stiffness: 60, damping: 15, mass: 0.5 });

  const handleHeroGridMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    gridRawX.set(relX * -30);
    gridRawY.set(relY * -30);
  };

  const handleHeroGridLeave = () => {
    setHeroGridHovered(false);
    gridRawX.set(0);
    gridRawY.set(0);
  };

  // PRIMARY STATS BAND — gradient sweeps as it enters/exits viewport
  const statsBandRef = useRef(null);
  const { scrollYProgress: statsBandProgress } = useScroll({
    target: statsBandRef,
    offset: ["start end", "end start"],
  });
  const statsBandBackground = useTransform(
    statsBandProgress,
    [0, 0.5, 1],
    [
      "linear-gradient(120deg, var(--primary) 0%, #12897a 55%, #0e6f63 100%)",
      "linear-gradient(120deg, #0e6f63 0%, var(--primary) 55%, #12897a 100%)",
      "linear-gradient(120deg, var(--primary) 0%, #12897a 55%, #0e6f63 100%)",
    ]
  );

  // DARK STATS SECTION — gradient direction "breathes" through scroll
  const darkStatsRef = useRef(null);
  const { scrollYProgress: darkStatsProgress } = useScroll({
    target: darkStatsRef,
    offset: ["start end", "end start"],
  });
  const darkStatsBackground = useTransform(
    darkStatsProgress,
    [0, 0.5, 1],
    [
      "linear-gradient(135deg, var(--fg) 0%, #1a2420 100%)",
      "linear-gradient(135deg, #1a2420 0%, var(--fg) 100%)",
      "linear-gradient(135deg, var(--fg) 0%, #1a2420 100%)",
    ]
  );

  // CTA SECTION — subtle sweep as it enters
  const ctaRef = useRef(null);
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaBackground = useTransform(
    ctaProgress,
    [0, 0.5, 1],
    [
      "linear-gradient(100deg, var(--primary) 0%, #0e6f63 100%)",
      "linear-gradient(100deg, #0e6f63 0%, var(--primary) 100%)",
      "linear-gradient(100deg, var(--primary) 0%, #0e6f63 100%)",
    ]
  );

  const hov = (on) => {
    document.body.classList.toggle("cursor-hover", on);
  };

  return (
    <div style={{ background: "var(--bg)", position: "relative" }}>
      {/* Page-wide cursor spotlight — fixed to viewport, follows mouse everywhere */}
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 40,
          background: spotBackground,
        }}
        animate={{ opacity: spotVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      <Navbar />

      {/* =========================================
          HERO
      ========================================= */}

      <motion.div
        ref={heroRef}
        style={{ background: heroBaseGradient, position: "relative", overflow: "hidden" }}
        className="min-h-screen"
        onMouseMove={handleHeroGridMouseMove}
        onHoverStart={() => setHeroGridHovered(true)}
        onHoverEnd={handleHeroGridLeave}
      >
        {/* Animated grid pattern — drifts on its own, parallax-shifts and zooms out on cursor hover */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-5%",
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(14,17,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,17,23,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 35%, #000 20%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 35%, #000 20%, transparent 85%)",
            x: gridX,
            y: gridY,
          }}
          animate={{
            backgroundPosition: ["0px 0px", "44px 44px"],
            scale: heroGridHovered ? 0.94 : 1,
          }}
          transition={{
            backgroundPosition: {
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
        <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}

          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-2 mb-6">

              <motion.span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "inline-block",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />

              <span
                style={{
                  color: "var(--muted)",
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Civic Tech Platform
              </span>
            </div>

            <motion.h1
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 800,
                lineHeight: 1.08,
                color: "var(--fg)",
                letterSpacing: "-0.02em",
              }}
              className="text-5xl lg:text-6xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
            >
              Fix Persistent
              <br />
              Issues in
              <br />
              Your City.
            </motion.h1>

            <motion.p
              style={{
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "30rem",
              }}
              className="text-base mb-10"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Report civic problems — potholes, garbage, drainage — and our AI
              instantly routes them to the right government department.
            </motion.p>

            <motion.div
              className="flex items-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <motion.button
                onClick={() => navigate("/login")}
                style={{
                  fontFamily: "'Sora',sans-serif",
                  background: "var(--fg)",
                  cursor: "none",
                  boxShadow: "0 4px 20px rgba(14,17,23,.25)",
                }}
                className="flex items-center gap-3 px-8 py-4 text-white font-bold text-base rounded-full"
                onMouseEnter={() => hov(true)}
                onMouseLeave={() => hov(false)}
                whileHover={{
                  y: -5,
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                Report an Issue

                <span
                  style={{
                    width: 28,
                    height: 28,
                    background: "#fff",
                    borderRadius: "50%",
                  }}
                  className="flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="var(--fg)"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/track")}
                style={{
                  cursor: "none",
                  color: "#6b7280",
                  fontFamily: "'Sora',sans-serif",
                }}
                className="text-sm font-semibold bg-transparent border-none"
                onMouseEnter={() => hov(true)}
                onMouseLeave={() => hov(false)}
                whileHover={{
                  x: 5,
                  color: "#0e1117",
                }}
              >
                Track Complaint →
              </motion.button>
            </motion.div>

            {/* STACKS IMAGE */}

            <motion.div
              style={{
                marginTop: "2.5rem",
              }}
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                delay: 0.6,
                duration: 0.8,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "70%",
                    height: "40px",
                    background:
                      "radial-gradient(ellipse at center, rgba(0,0,0,0.18), transparent 70%)",
                    filter: "blur(14px)",
                    opacity: 0.8,
                    zIndex: 0,
                  }}
                />

                <motion.img
                  src={stacksImg}
                  alt="City Issues"
                  style={{
                    width: "460px",
                    maxWidth: "100%",
                    position: "relative",
                    zIndex: 1,
                  }}
                animate={{
  y: [0, -18, 0, 12, 0],
  rotate: [-3, 1, -2, 1, -3],
  scale: [1, 1.02, 1, 1.015, 1],
}}
transition={{
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut",
}}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE */}

          <motion.div
            className="flex flex-col items-center justify-center"
            variants={fadeRight}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              style={{
                transform: "translateX(40px)",
              }}
              animate={{
  y: [0, -20, 0, 15, 0],
  rotate: [0, 1.5, 0, -1.5, 0],
  scale: [1, 1.025, 1, 1.02, 1],
}}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <AnimatedLoop />
            </motion.div>

            <motion.p
              style={{
                textAlign: "center",
                marginTop: "1.2rem",
                color: "var(--muted)",
                fontSize: "0.95rem",
                lineHeight: "1.6",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Reports get delayed.
              <br />
              Issues remain unresolved.
            </motion.p>
          </motion.div>
        </div>

        {/* TRUST BAR */}

        <motion.div
          style={{
            background: "#fff",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            padding: "1.5rem 2.5rem",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-12 flex-wrap">
            {[
              "No Login Required",
              "WhatsApp Support",
              "Available 24/7",
              "AI-Powered Routing",
              "Govt. Verified",
            ].map((item) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--muted)" }}
                whileHover={{ scale: 1.05 }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* STATS */}

        <motion.div
          ref={statsBandRef}
          style={{
            background: statsBandBackground,
            padding: "3.5rem 2.5rem",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { val: "12,400+", lbl: "Complaints Filed" },
              { val: "94%", lbl: "Resolution Rate" },
              { val: "48 hrs", lbl: "Avg Response Time" },
              { val: "6", lbl: "Departments" },
            ].map((s) => (
              <motion.div key={s.lbl} variants={fadeUp}>
                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {s.val}
                </div>

                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: "0.4rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.lbl}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        </div>
      </motion.div>

      {/* =========================================
          LIVE CITY CHAOS
      ========================================= */}

      <section
        style={{
          background: "var(--bg)",
          padding: "5rem 2rem",
        }}
      >
        <div className="max-w-6xl mx-auto">

          <motion.div
            style={{ marginBottom: "2rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "0.75rem",
              }}
            >
              Live Infrastructure
            </p>

            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}
            >
              What's happening in your city?
            </h2>

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "520px",
              }}
            >
              Real-time civic issues visualized across the city.
              Monitor potholes, construction, railway damage and
              other infrastructure problems in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ChaosMap />
          </motion.div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS
      ========================================= */}

      <div id="how" style={{ background: "var(--bg)" }}>
        <section className="max-w-6xl mx-auto px-8 py-24">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "0.75rem",
              }}
            >
              Process
            </p>

            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}
            >
              How CivicSeva works
            </h2>

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "480px",
                fontSize: "1rem",
              }}
            >
              Four simple steps from spotting an issue to getting it resolved
              by the right authority.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {howSteps.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 border relative overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 15px 35px rgba(0,0,0,.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    color: "#f0f0ec",
                    lineHeight: 1,
                    marginBottom: "0.75rem",
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  {step.num}
                </div>

                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#f5f5f0",
                    fontSize: "1.4rem",
                    marginBottom: "1.25rem",
                  }}
                  className="flex items-center justify-center"
                >
                  {step.icon}
                </div>

                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </div>

                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* =========================================
          CATEGORIES
      ========================================= */}

      <div
        id="categories-section"
        style={{
          background:
            "radial-gradient(circle at top,#111 0%,#000 100%)",
        }}
      >
        <section className="max-w-6xl mx-auto px-8 py-24">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p
              style={{
                color: "#6ee7b7",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "0.75rem",
              }}
            >
              Routing Categories
            </p>

            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#fff",
                marginBottom: "1rem",
              }}
            >
              What can you report?
            </h2>

            <p
              style={{
                color: "#888",
                lineHeight: 1.7,
                maxWidth: "480px",
              }}
            >
              Every complaint is instantly routed to the right department —
              no middlemen, no delays.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {catItems.map((cat) => (
              <motion.div
                key={cat.name}
                variants={fadeUp}
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{
                  background: "#1c1c1c",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#2a2a2a",
                  cursor: "none",
                }}
                onMouseEnter={() => hov(true)}
                onMouseLeave={() => hov(false)}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  borderColor: "#4ecdc4",
                }}
              >
                <motion.span
                  style={{
                    fontSize: "2rem",
                    marginBottom: "1rem",
                    display: "block",
                  }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 8,
                  }}
                >
                  {cat.emoji}
                </motion.span>

                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "0.4rem",
                  }}
                >
                  {cat.name}
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#888",
                    lineHeight: 1.6,
                    marginBottom: "0.75rem",
                  }}
                >
                  {cat.desc}
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.3rem 0.8rem",
                    borderRadius: "9999px",
                    background: "rgba(26,158,143,.15)",
                    color: "#4ecdc4",
                  }}
                >
                  {cat.dept}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* =========================================
          PHOTO GALLERY
      ========================================= */}

      <div
        style={{
          background: "var(--bg)",
          padding: "5rem 0",
        }}
      >
        <section className="max-w-6xl mx-auto px-8 pb-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "0.75rem",
              }}
            >
              Real Issues. Real City.
            </p>

            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              Problems we solve every day
            </h2>
          </motion.div>
        </section>

        <div className="photo-scroll-track">
          <motion.div
            className="photo-scroll-inner"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...photos, ...photos].map((p, i) => (
              <motion.div
                key={i}
                style={{
                  width: 240,
                  height: 180,
                  borderRadius: "1rem",
                  overflow: "hidden",
                  flexShrink: 0,
                  position: "relative",
                  background: "#ddd",
                }}
                whileHover={{
                  scale: 1.05,
                  zIndex: 10,
                }}
              >
                <img
                  src={p.src}
                  alt={p.label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  loading="lazy"
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    background: "rgba(0,0,0,.65)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontSize: "0.72rem",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* =========================================
          DARK STATS
      ========================================= */}

      <motion.div
        ref={darkStatsRef}
        style={{
          background: darkStatsBackground,
          padding: "5rem 0",
          color: "#fff",
        }}
      >
        <div className="max-w-6xl mx-auto px-8 text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            By The Numbers
          </motion.div>

          <motion.h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "clamp(2rem,4vw,2.8rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "3rem",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Built for your city,
            <br />
            designed for impact
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { val: "6", lbl: "Issue Categories" },
              { val: "24/7", lbl: "Reporting Available" },
              { val: "Instant", lbl: "Department Routing" },
              { val: "3", lbl: "Gov. Departments" },
            ].map((s) => (
              <motion.div
                key={s.lbl}
                variants={scaleIn}
                className="text-center p-8 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.1)",
                }}
                whileHover={{
                  scale: 1.05,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "2.75rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                  }}
                >
                  {s.val}
                </div>

                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,.55)",
                    marginTop: "0.375rem",
                  }}
                >
                  {s.lbl}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* =========================================
          AI FEATURES
      ========================================= */}

      <div
        style={{
          background: "var(--bg)",
          padding: "5rem 0",
        }}
      >
        <section className="max-w-6xl mx-auto px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
              }}
            >
              AI Features
            </p>

            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(2rem,4vw,2.8rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              Intelligent by design
            </h2>

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "36rem",
              }}
            >
              Every complaint is enhanced by AI to be faster, smarter, and
              more effective.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="bg-white rounded-2xl p-7 relative overflow-hidden"
                style={{
                  border: "1.5px solid var(--border)",
                  boxShadow: "0 4px 24px rgba(14,17,23,0.08)",
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: "0 15px 40px rgba(14,17,23,0.12)",
                }}
              >
                <motion.div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    background: "rgba(26,158,143,.1)",
                    fontSize: "1.4rem",
                    marginBottom: "1.1rem",
                  }}
                  className="flex items-center justify-center"
                  whileHover={{
                    rotate: 10,
                    scale: 1.15,
                  }}
                >
                  {f.icon}
                </motion.div>

                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  {f.title}
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    marginTop: "0.85rem",
                    padding: "0.25rem 0.7rem",
                    borderRadius: "9999px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    fontFamily: "'Sora',sans-serif",
                    background: "rgba(26,158,143,.1)",
                    color: "var(--primary)",
                  }}
                >
                  {f.badge}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* =========================================
          CTA
      ========================================= */}

      <motion.div
        ref={ctaRef}
        style={{
          background: ctaBackground,
          padding: "4.5rem 0",
        }}
      >
        <div className="max-w-6xl mx-auto px-8 text-center">

          <motion.h2
            style={{
              color: "#fff",
              fontSize: "clamp(1.75rem,3.5vw,2.5rem)",
              fontWeight: 800,
              marginBottom: "1rem",
              fontFamily: "'Sora',sans-serif",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to make your city better?
          </motion.h2>

          <motion.p
            style={{
              color: "rgba(255,255,255,.75)",
              fontSize: "1.05rem",
              marginBottom: "2rem",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Join thousands of citizens who've already made a difference.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            <motion.button
              onClick={() => navigate("/login")}
              style={{
                background: "#fff",
                color: "var(--primary)",
                cursor: "none",
                fontFamily: "'Sora',sans-serif",
                boxShadow: "0 4px 20px rgba(0,0,0,.15)",
              }}
              className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base border-none"
              onMouseEnter={() => hov(true)}
              onMouseLeave={() => hov(false)}
              whileHover={{
                y: -5,
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              Report an Issue
            </motion.button>

            <motion.button
              onClick={() => navigate("/gov-login")}
              style={{
                fontSize: "0.95rem",
                color: "rgba(255,255,255,.8)",
                fontWeight: 500,
                cursor: "none",
                background: "none",
                border: "none",
              }}
              onMouseEnter={() => hov(true)}
              onMouseLeave={() => hov(false)}
              whileHover={{
                x: 5,
                color: "#fff",
              }}
            >
              Government Portal →
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}