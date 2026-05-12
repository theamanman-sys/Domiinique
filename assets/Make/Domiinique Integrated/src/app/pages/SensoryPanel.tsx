import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

type SensoryState = {
  sound: string;
  light: string;
  scent: string;
  environment: string;
};

const modes: { name: string; state: SensoryState }[] = [
  {
    name: "Focus",
    state: { sound: "Lo-fi", light: "Bright", scent: "Mint", environment: "Minimal" },
  },
  {
    name: "Relax",
    state: { sound: "Ambient", light: "Warm", scent: "Lavender", environment: "Relaxed" },
  },
  {
    name: "Create",
    state: { sound: "Nature", light: "Warm", scent: "Wood", environment: "Creative" },
  },
  {
    name: "Sleep",
    state: { sound: "Off", light: "Dim", scent: "Lavender", environment: "Minimal" },
  },
];

const categories: {
  key: keyof SensoryState;
  label: string;
  icon: string;
  options: string[];
}[] = [
  {
    key: "sound",
    label: "Sound",
    icon: "🎧",
    options: ["Lo-fi", "Ambient", "Nature", "Off"],
  },
  {
    key: "light",
    label: "Light",
    icon: "💡",
    options: ["Bright", "Warm", "Dim"],
  },
  {
    key: "scent",
    label: "Scent",
    icon: "🌿",
    options: ["None", "Mint", "Lavender", "Wood"],
  },
  {
    key: "environment",
    label: "Environment",
    icon: "🏛️",
    options: ["Clean", "Minimal", "Creative", "Relaxed"],
  },
];

// Mode colors are intentional aesthetic choices per sensory mode, kept as-is
const modeColors: Record<string, { bg: string; text: string; pill: string }> = {
  Focus: { bg: "#111111", text: "#F8F7F4", pill: "#333" },
  Relax: { bg: "#D6CFC7", text: "#111111", pill: "#bfb8b0" },
  Create: { bg: "#EAE6E1", text: "#111111", pill: "#D6CFC7" },
  Sleep: { bg: "#2a2a2a", text: "#F8F7F4", pill: "#444" },
};

export function SensoryPanel() {
  const { theme: t } = useTheme();
  const [state, setState] = useState<SensoryState>(modes[0].state);
  const [activeMode, setActiveMode] = useState("Focus");
  const [activated, setActivated] = useState(false);

  function setOption(key: keyof SensoryState, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
    setActivated(false);
    const newState = { ...state, [key]: value };
    const matched = modes.find(
      (m) =>
        m.state.sound === newState.sound &&
        m.state.light === newState.light &&
        m.state.scent === newState.scent &&
        m.state.environment === newState.environment
    );
    setActiveMode(matched?.name ?? "Custom");
  }

  function loadMode(mode: (typeof modes)[0]) {
    setState(mode.state);
    setActiveMode(mode.name);
    setActivated(false);
  }

  function handleActivate() {
    setActivated(true);
    setTimeout(() => setActivated(false), 3000);
  }

  const colors = modeColors[activeMode] ?? modeColors["Focus"];

  return (
    <div
      className="min-h-screen px-6 py-10 max-w-2xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: t.textFaint,
            marginBottom: "6px",
          }}
        >
          Sensory Control
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            color: t.text,
          }}
        >
          Your Environment
        </h1>
      </motion.div>

      {/* Active state card — intentional mode-specific colors */}
      <motion.div
        className="p-7 rounded-3xl mb-8 relative overflow-hidden"
        style={{ background: colors.bg }}
        animate={{ background: colors.bg }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08), transparent 60%)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative z-10">
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: activeMode === "Focus" || activeMode === "Sleep" ? "#D6CFC7" : "#888",
              marginBottom: "6px",
            }}
          >
            Current State
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.2rem",
              color: colors.text,
              lineHeight: 1.1,
            }}
          >
            {activeMode}
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.values(state).map((v, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  background: colors.pill,
                  color: colors.text,
                  opacity: 0.9,
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mode shortcuts */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {modes.map((m) => (
          <button
            key={m.name}
            onClick={() => loadMode(m)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activeMode === m.name ? t.invertBg : t.surface,
              color: activeMode === m.name ? t.invertText : t.textMuted,
            }}
          >
            {m.name}
          </button>
        ))}
        {activeMode === "Custom" && (
          <span
            className="px-4 py-2 rounded-full text-sm"
            style={{ background: t.surface, color: t.textMuted, border: `1.5px dashed ${t.border}` }}
          >
            Custom
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-5 mb-8">
        {categories.map((cat) => (
          <motion.div
            key={cat.key}
            className="p-5 rounded-3xl transition-colors duration-300"
            style={{ background: t.surface }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: "1.1rem" }}>{cat.icon}</span>
              <p
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: t.textMuted,
                }}
              >
                {cat.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.options.map((opt) => (
                <motion.button
                  key={opt}
                  onClick={() => setOption(cat.key, opt)}
                  className="px-4 py-2 rounded-full text-sm transition-all"
                  style={{
                    background: state[cat.key] === opt ? t.invertBg : t.card,
                    color: state[cat.key] === opt ? t.invertText : t.text,
                    border: "1.5px solid transparent",
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activate */}
      <motion.button
        onClick={handleActivate}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-full transition-colors duration-300"
        style={{
          background: activated ? t.border : t.invertBg,
          color: activated ? t.invertBg : t.invertText,
          fontSize: "0.95rem",
          letterSpacing: "0.06em",
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Zap size={18} />
        <AnimatePresence mode="wait">
          {activated ? (
            <motion.span
              key="activated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeMode} Mode Active ✓
            </motion.span>
          ) : (
            <motion.span
              key="activate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Activate {activeMode} Mode
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
