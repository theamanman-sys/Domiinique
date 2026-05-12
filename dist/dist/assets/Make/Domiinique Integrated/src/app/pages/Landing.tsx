import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1625579041727-d0c565eaac31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwc2VyZW5lJTIwbGlmZXN0eWxlJTIwY29uc2Npb3VzbmVzc3xlbnwxfHx8fDE3NzQ3OTAzMjR8MA&ixlib=rb-4.1.0&q=80&w=1080";

const pillars = [
  {
    label: "Awareness",
    desc: "See yourself clearly and understand your patterns.",
    icon: "◎",
  },
  {
    label: "Rituals",
    desc: "Structure your mornings and evenings with intention.",
    icon: "◇",
  },
  {
    label: "Sensory",
    desc: "Control your environment through sound, light & scent.",
    icon: "◈",
  },
  {
    label: "Environment",
    desc: "Design your physical space to support your state.",
    icon: "▣",
  },
  {
    label: "Energy",
    desc: "Track and protect your most precious resource.",
    icon: "◉",
  },
  {
    label: "Legacy",
    desc: "Build systems that compound over time.",
    icon: "◆",
  },
];

function AnimatedCircle() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ overflow: "hidden" }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${300 + i * 160}px`,
            height: `${300 + i * 160}px`,
            borderColor: `rgba(214,207,199,${0.35 - i * 0.07})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.03, 1] }}
          transition={{
            duration: 20 + i * 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "120px",
          height: "120px",
          background:
            "radial-gradient(circle, rgba(214,207,199,0.4) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Landing() {
  const cardsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        background: "#F8F7F4",
        fontFamily: "'Inter', sans-serif",
        color: "#111111",
      }}
    >
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5"
        style={{ background: "rgba(248,247,244,0.85)", backdropFilter: "blur(12px)" }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.2rem",
            letterSpacing: "0.14em",
          }}
        >
          DOMIINIQUE
        </span>
        <Link
          to="/onboarding"
          className="flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200 hover:opacity-80"
          style={{ background: "#111111", color: "#F8F7F4", fontSize: "0.85rem", letterSpacing: "0.06em" }}
        >
          Enter System <ArrowRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ paddingTop: "80px" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.07,
          }}
        />
        <AnimatedCircle />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.p
            className="mb-4"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#888",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Life System Design
          </motion.p>
          <motion.h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              lineHeight: 1.12,
              color: "#111111",
              letterSpacing: "-0.01em",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Design Your
            <br />
            <em style={{ fontStyle: "italic", color: "#555" }}>Reality</em>
          </motion.h1>
          <motion.p
            className="mt-6 mx-auto"
            style={{
              maxWidth: "520px",
              fontSize: "1.05rem",
              color: "#555",
              lineHeight: 1.7,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            A system for conscious living, alignment, and total control of your
            environment.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              to="/onboarding"
              className="flex items-center gap-2 px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "#111111",
                color: "#F8F7F4",
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                boxShadow: "0 4px 24px rgba(17,17,17,0.18)",
              }}
            >
              Enter the System <ArrowRight size={16} />
            </Link>
            <button
              onClick={() =>
                cardsRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-2 px-8 py-4 rounded-full transition-all duration-200 hover:bg-[#EAE6E1]"
              style={{
                background: "transparent",
                border: "1.5px solid #D6CFC7",
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                color: "#111",
              }}
            >
              Explore Framework
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "#aaa" }}>
            SCROLL
          </span>
          <ChevronDown size={16} color="#aaa" />
        </motion.div>
      </section>

      {/* Framework Cards */}
      <section ref={cardsRef} className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: "12px",
            }}
          >
            The Framework
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "#111111",
            }}
          >
            Six Pillars of Design
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              className="group relative p-8 rounded-3xl cursor-pointer transition-all duration-300"
              style={{
                background: "#EAE6E1",
                border: "1.5px solid transparent",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{
                background: "#111111",
                borderColor: "#111111",
                y: -4,
                boxShadow: "0 16px 40px rgba(17,17,17,0.15)",
              }}
            >
              <motion.span
                className="block mb-4"
                style={{ fontSize: "1.8rem", color: "#D6CFC7" }}
                whileHover={{ color: "#F8F7F4" }}
              >
                {p.icon}
              </motion.span>
              <h3
                className="mb-2 group-hover:text-[#F8F7F4] transition-colors"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.2rem",
                  color: "#111111",
                }}
              >
                {p.label}
              </h3>
              <p
                className="group-hover:text-[#D6CFC7] transition-colors"
                style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.6 }}
              >
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-24">
        <motion.div
          className="max-w-4xl mx-auto rounded-3xl px-10 py-16 text-center relative overflow-hidden"
          style={{ background: "#111111" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <AnimatedCircle />
          <div className="relative z-10">
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D6CFC7",
                marginBottom: "16px",
              }}
            >
              Begin Today
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                color: "#F8F7F4",
                marginBottom: "16px",
              }}
            >
              You don't need motivation.
              <br />
              <em>You need structure.</em>
            </h2>
            <p
              style={{
                color: "#D6CFC7",
                fontSize: "0.95rem",
                marginBottom: "32px",
                maxWidth: "420px",
                margin: "0 auto 32px",
              }}
            >
              Build your personal operating system in minutes.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-[1.03]"
              style={{
                background: "#F8F7F4",
                color: "#111111",
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
              }}
            >
              Build Your System <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-8 flex items-center justify-between"
        style={{ borderTop: "1px solid #D6CFC7" }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1rem",
            letterSpacing: "0.12em",
          }}
        >
          DOMIINIQUE
        </span>
        <p style={{ fontSize: "0.78rem", color: "#aaa" }}>
          © 2026 · Design Your Reality
        </p>
      </footer>
    </div>
  );
}
