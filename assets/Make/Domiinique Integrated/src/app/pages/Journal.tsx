import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const prompts = [
  "What drained your energy today?",
  "What moment felt most aligned today?",
  "What would you redesign about today?",
  "What are you grateful for in your system?",
  "What pattern did you notice about yourself?",
];

const moods = [
  { icon: "⚡", label: "Energised" },
  { icon: "🙂", label: "Calm" },
  { icon: "😐", label: "Neutral" },
  { icon: "😔", label: "Low" },
];

function DotsBar({
  value,
  onChange,
  total = 5,
  fill,
  empty,
}: {
  value: number;
  onChange: (v: number) => void;
  total?: number;
  fill: string;
  empty: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className="rounded-full transition-all hover:scale-110"
          style={{
            width: "13px",
            height: "13px",
            background: i < value ? fill : empty,
          }}
        />
      ))}
    </div>
  );
}

const pastEntries = [
  {
    date: "Mar 28",
    mood: "🙂",
    energy: 4,
    preview: "Today felt really focused after the morning ritual...",
  },
  {
    date: "Mar 27",
    mood: "😐",
    energy: 2,
    preview: "Struggled with afternoon energy dips again...",
  },
  {
    date: "Mar 26",
    mood: "⚡",
    energy: 5,
    preview: "Best deep work session this week. Sensory panel...",
  },
];

export function Journal() {
  const { theme: t } = useTheme();
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(3);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setText("");
      setMood(null);
      setEnergy(3);
    }, 2000);
  }

  function prevPrompt() {
    setPromptIdx((i) => (i - 1 + prompts.length) % prompts.length);
  }

  function nextPrompt() {
    setPromptIdx((i) => (i + 1) % prompts.length);
  }

  return (
    <div
      className="min-h-screen px-6 py-10 max-w-3xl mx-auto"
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
          Daily Journal
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            color: t.text,
          }}
        >
          Journal Entry
        </h1>
      </motion.div>

      {/* Prompt selector */}
      <motion.div
        className="p-6 rounded-3xl mb-6 transition-colors duration-300"
        style={{ background: t.invertBg }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: t.invertMuted,
            }}
          >
            Today's Prompt
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPrompt}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ color: t.invertMuted }}
            >
              <ChevronLeft size={14} color={t.invertMuted} />
            </button>
            <button
              onClick={nextPrompt}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            >
              <ChevronRight size={14} color={t.invertMuted} />
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={promptIdx}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.15rem",
              color: t.invertText,
              lineHeight: 1.4,
            }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            "{prompts[promptIdx]}"
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Text area */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing…"
          rows={7}
          className="w-full px-6 py-5 rounded-3xl outline-none resize-none transition-all"
          style={{
            background: t.surface,
            border: "1.5px solid transparent",
            fontSize: "0.95rem",
            color: t.text,
            lineHeight: 1.7,
          }}
          onFocus={(e) => (e.target.style.borderColor = t.border)}
          onBlur={(e) => (e.target.style.borderColor = "transparent")}
        />
        <p
          className="text-right mt-1"
          style={{ fontSize: "0.75rem", color: t.textFaint }}
        >
          {text.length} characters
        </p>
      </motion.div>

      {/* Mood + Energy */}
      <motion.div
        className="p-6 rounded-3xl mb-6 transition-colors duration-300"
        style={{ background: t.surface }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: t.textMuted,
                marginBottom: "12px",
              }}
            >
              Mood
            </p>
            <div className="flex gap-3">
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className="flex flex-col items-center gap-1 transition-all"
                  title={m.label}
                >
                  <span
                    className="text-xl w-10 h-10 flex items-center justify-center rounded-full transition-all"
                    style={{
                      background: mood === m.label ? t.invertBg : t.card,
                      transform: mood === m.label ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {m.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: mood === m.label ? t.text : t.textFaint,
                    }}
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: t.textMuted,
                marginBottom: "12px",
              }}
            >
              Energy Level
            </p>
            <DotsBar
              value={energy}
              onChange={setEnergy}
              fill={t.text}
              empty={t.border}
            />
            <p style={{ fontSize: "0.78rem", color: t.textMuted, marginTop: "8px" }}>
              {energy}/5 — {["Very Low", "Low", "Moderate", "High", "Peak"][energy - 1]}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.button
        onClick={handleSave}
        className="flex items-center gap-3 px-8 py-4 rounded-full mb-12 transition-colors duration-300"
        style={{
          background: saved ? t.border : t.invertBg,
          color: saved ? t.invertBg : t.invertText,
          fontSize: "0.95rem",
          letterSpacing: "0.04em",
          opacity: !text.trim() ? 0.5 : 1,
          cursor: !text.trim() ? "not-allowed" : "pointer",
        }}
        whileHover={text.trim() ? { scale: 1.02 } : {}}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span
              key="saved"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Check size={16} /> Entry Saved
            </motion.span>
          ) : (
            <motion.span
              key="save"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Save Entry
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Past entries */}
      <div>
        <p
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: t.textFaint,
            marginBottom: "14px",
          }}
        >
          Recent Entries
        </p>
        <div className="flex flex-col gap-3">
          {pastEntries.map((entry) => (
            <motion.div
              key={entry.date}
              className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-colors duration-300"
              style={{ background: t.surface }}
              whileHover={{ x: 2 }}
            >
              <span style={{ fontSize: "1.3rem" }}>{entry.mood}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span style={{ fontSize: "0.82rem", color: t.textMuted }}>
                    {entry.date}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: i < entry.energy ? t.text : t.border,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p
                  className="truncate"
                  style={{ fontSize: "0.88rem", color: t.textMuted }}
                >
                  {entry.preview}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
