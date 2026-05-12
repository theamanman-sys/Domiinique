import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Plus, Headphones, BookOpen, Check, RefreshCw } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const days = ["M", "T", "W", "Th", "F", "Sa", "Su"];
const activeDay = 0;

function DotsBar({
  value,
  total = 5,
  fill,
  empty,
}: {
  value: number;
  total?: number;
  fill: string;
  empty: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: "10px",
            height: "10px",
            background: i < value ? fill : empty,
          }}
        />
      ))}
    </div>
  );
}

const metrics = [
  { label: "Energy", value: 3 },
  { label: "Focus", value: 4 },
  { label: "Clarity", value: 3 },
];

const initialTasks = [
  { id: 1, label: "Morning Ritual", done: true },
  { id: 2, label: "Deep Work Block", done: false },
  { id: 3, label: "Reset Ritual", done: false },
  { id: 4, label: "Night Shutdown", done: false },
];

export function Dashboard() {
  const { theme: t } = useTheme();
  const [tasks, setTasks] = useState(initialTasks);
  const [showAdjust, setShowAdjust] = useState(false);
  const [energyValues, setEnergyValues] = useState({ Energy: 3, Focus: 4, Clarity: 3 });

  const completedCount = tasks.filter((task) => task.done).length;
  const score = Math.round((completedCount / tasks.length) * 50 + 28);

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-10 max-w-5xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
          Sunday, March 29
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            color: t.text,
          }}
        >
          Good Morning, <em>You</em>
        </h1>
      </motion.div>

      {/* Week strip */}
      <div className="flex gap-2 mb-10">
        {days.map((d, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl"
            style={{
              background: i === activeDay ? t.invertBg : t.surface,
              color: i === activeDay ? t.invertText : t.textMuted,
            }}
          >
            <span style={{ fontSize: "0.72rem" }}>{d}</span>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background:
                  i < activeDay
                    ? t.border
                    : i === activeDay
                    ? t.invertText
                    : "transparent",
              }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Energy Panel */}
          <motion.div
            className="p-6 rounded-3xl transition-colors duration-300"
            style={{ background: t.surface }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: t.textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Current State
                </p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
                  Energy Panel
                </h3>
              </div>
              <button
                onClick={() => setShowAdjust(!showAdjust)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  background: showAdjust ? t.invertBg : "transparent",
                  color: showAdjust ? t.invertText : t.text,
                  border: `1.5px solid ${t.border}`,
                }}
              >
                <RefreshCw size={14} />
                Adjust State
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {Object.entries(energyValues).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span style={{ fontSize: "0.88rem", color: t.textMuted, minWidth: "70px" }}>
                    {key}
                  </span>
                  {showAdjust ? (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() =>
                            setEnergyValues((prev) => ({ ...prev, [key]: v }))
                          }
                          className="w-7 h-7 rounded-full transition-all"
                          style={{
                            background: v <= val ? t.invertBg : t.border,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <DotsBar value={val} fill={t.text} empty={t.border} />
                  )}
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: t.textMuted,
                      minWidth: "30px",
                      textAlign: "right",
                    }}
                  >
                    {val}/5
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Today's System */}
          <motion.div
            className="p-6 rounded-3xl transition-colors duration-300"
            style={{ background: t.surface }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: t.textMuted,
                    marginBottom: "2px",
                  }}
                >
                  Today's Blocks
                </p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
                  Your System
                </h3>
              </div>
              <span style={{ fontSize: "0.82rem", color: t.textMuted }}>
                {completedCount}/{tasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <motion.button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                  style={{
                    background: task.done ? t.invertBg : t.card,
                    color: task.done ? t.invertText : t.text,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: task.done ? t.invertText : "transparent",
                      border: task.done ? "none" : `1.5px solid ${t.border}`,
                    }}
                  >
                    {task.done && <Check size={11} color={t.invertBg} strokeWidth={2.5} />}
                  </div>
                  <span
                    style={{
                      fontSize: "0.92rem",
                      textDecoration: task.done ? "line-through" : "none",
                      opacity: task.done ? 0.7 : 1,
                    }}
                  >
                    {task.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Alignment Score */}
          <motion.div
            className="p-6 rounded-3xl flex flex-col transition-colors duration-300"
            style={{ background: t.invertBg, color: t.invertText }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: t.invertMuted,
                marginBottom: "4px",
              }}
            >
              Alignment Score
            </p>
            <div className="flex items-end gap-2 my-3">
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "3.5rem",
                  lineHeight: 1,
                  color: t.invertText,
                }}
              >
                {score}%
              </span>
            </div>

            <div
              className="w-full h-1.5 rounded-full mb-4 overflow-hidden"
              style={{ background: t.invertBorder }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: t.invertMuted }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <p style={{ fontSize: "0.82rem", color: t.invertMuted }}>↑ Strong: Focus</p>
              <p style={{ fontSize: "0.82rem", color: t.invertBorder }}>↓ Weak: Environment</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="p-6 rounded-3xl transition-colors duration-300"
            style={{ background: t.surface }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: t.textMuted,
                marginBottom: "16px",
              }}
            >
              Quick Actions
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/rituals"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{ background: t.card, color: t.text }}
              >
                <Plus size={16} color={t.textMuted} />
                <span style={{ fontSize: "0.88rem" }}>Add Ritual</span>
              </Link>
              <Link
                to="/sensory"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{ background: t.card, color: t.text }}
              >
                <Headphones size={16} color={t.textMuted} />
                <span style={{ fontSize: "0.88rem" }}>Open Sensory Panel</span>
              </Link>
              <Link
                to="/journal"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{ background: t.card, color: t.text }}
              >
                <BookOpen size={16} color={t.textMuted} />
                <span style={{ fontSize: "0.88rem" }}>Journal Entry</span>
              </Link>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="p-6 rounded-3xl text-center transition-colors duration-300"
            style={{ background: t.surface }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.2rem",
                color: t.text,
              }}
            >
              7
            </p>
            <p style={{ fontSize: "0.82rem", color: t.textMuted, marginTop: "4px" }}>
              Day streak
            </p>
            <p style={{ fontSize: "0.75rem", color: t.textFaint, marginTop: "2px" }}>
              Keep going ↑
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
