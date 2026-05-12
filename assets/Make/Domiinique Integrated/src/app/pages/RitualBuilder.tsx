import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Save, Check, ArrowUp, ArrowDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

type Block = { id: number; label: string; duration: string; icon: string };

const blockLibrary = [
  { label: "Breathwork", icon: "🌬️", duration: "2 min" },
  { label: "Music", icon: "🎵", duration: "∞" },
  { label: "Movement", icon: "🤸", duration: "5 min" },
  { label: "Journaling", icon: "✏️", duration: "10 min" },
  { label: "Meditation", icon: "🧘", duration: "5 min" },
  { label: "Cold Water", icon: "❄️", duration: "2 min" },
  { label: "Stretch", icon: "🙆", duration: "5 min" },
  { label: "Custom", icon: "⚙️", duration: "—" },
];

const presets = [
  {
    name: "Morning Reset",
    blocks: [
      { id: 1, label: "Breathwork", icon: "🌬️", duration: "2 min" },
      { id: 2, label: "Music", icon: "🎵", duration: "∞" },
      { id: 3, label: "Journaling", icon: "✏️", duration: "10 min" },
      { id: 4, label: "Stretch", icon: "🙆", duration: "5 min" },
    ],
  },
  {
    name: "Deep Work",
    blocks: [
      { id: 5, label: "Breathwork", icon: "🌬️", duration: "2 min" },
      { id: 6, label: "Meditation", icon: "🧘", duration: "5 min" },
      { id: 7, label: "Music", icon: "🎵", duration: "∞" },
    ],
  },
];

let nextId = 100;

export function RitualBuilder() {
  const { theme: t } = useTheme();
  const [ritualName, setRitualName] = useState("Morning Reset");
  const [blocks, setBlocks] = useState<Block[]>(presets[0].blocks);
  const [saved, setSaved] = useState(false);
  const [activePreset, setActivePreset] = useState(0);

  function addBlock(lib: (typeof blockLibrary)[0]) {
    setBlocks((prev) => [
      ...prev,
      { id: nextId++, label: lib.label, icon: lib.icon, duration: lib.duration },
    ]);
  }

  function removeBlock(id: number) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function loadPreset(idx: number) {
    setActivePreset(idx);
    setRitualName(presets[idx].name);
    setBlocks(presets[idx].blocks.map((b) => ({ ...b })));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          Ritual Builder
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            color: t.text,
          }}
        >
          Create Your Ritual
        </h1>
      </motion.div>

      {/* Presets */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {presets.map((p, i) => (
          <button
            key={p.name}
            onClick={() => loadPreset(i)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activePreset === i ? t.invertBg : t.surface,
              color: activePreset === i ? t.invertText : t.textMuted,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Name input */}
      <div className="mb-8">
        <label
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: t.textFaint,
            display: "block",
            marginBottom: "8px",
          }}
        >
          Ritual Name
        </label>
        <input
          value={ritualName}
          onChange={(e) => setRitualName(e.target.value)}
          className="w-full px-5 py-3 rounded-2xl outline-none transition-all"
          style={{
            background: t.surface,
            border: `1.5px solid transparent`,
            fontSize: "1rem",
            color: t.text,
          }}
          onFocus={(e) => (e.target.style.borderColor = t.border)}
          onBlur={(e) => (e.target.style.borderColor = "transparent")}
        />
      </div>

      {/* Block library */}
      <div className="mb-8">
        <p
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: t.textFaint,
            marginBottom: "12px",
          }}
        >
          Add Blocks
        </p>
        <div className="flex flex-wrap gap-2">
          {blockLibrary.map((lib) => (
            <motion.button
              key={lib.label}
              onClick={() => addBlock(lib)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                background: t.surface,
                border: `1.5px solid transparent`,
                fontSize: "0.85rem",
                color: t.text,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={13} />
              {lib.icon} {lib.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Block list */}
      <div className="mb-8">
        <p
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: t.textFaint,
            marginBottom: "12px",
          }}
        >
          Your Ritual — {blocks.length} blocks
        </p>

        {blocks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-3xl"
            style={{ background: t.surface, color: t.textFaint }}
          >
            <p style={{ fontSize: "1.6rem", marginBottom: "8px" }}>◇</p>
            <p style={{ fontSize: "0.88rem" }}>Add blocks to build your ritual</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {blocks.map((block, idx) => (
                <motion.div
                  key={block.id}
                  layout
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors duration-300"
                  style={{ background: t.surface }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <span style={{ fontSize: "1.3rem" }}>{block.icon}</span>
                  <div className="flex-1">
                    <p style={{ fontSize: "0.92rem", color: t.text }}>{block.label}</p>
                    <p style={{ fontSize: "0.78rem", color: t.textMuted }}>{block.duration}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveBlock(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                      style={{ color: t.textMuted }}
                    >
                      <ArrowUp size={13} color={t.textMuted} />
                    </button>
                    <button
                      onClick={() => moveBlock(idx, 1)}
                      disabled={idx === blocks.length - 1}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <ArrowDown size={13} color={t.textMuted} />
                    </button>
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="p-1.5 rounded-lg transition-colors ml-1"
                    >
                      <Trash2 size={14} color={t.textFaint} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Save */}
      <motion.button
        onClick={handleSave}
        className="flex items-center gap-3 px-8 py-4 rounded-full transition-colors duration-300"
        style={{
          background: saved ? t.border : t.invertBg,
          color: saved ? t.invertBg : t.invertText,
          fontSize: "0.95rem",
          letterSpacing: "0.04em",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
              <Check size={16} /> Ritual Saved
            </motion.span>
          ) : (
            <motion.span
              key="save"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Save size={16} /> Save Ritual
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
