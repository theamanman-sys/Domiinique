import { motion } from "motion/react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { AppTheme } from "../context/ThemeContext";

// Custom SVG Radar Chart — avoids recharts internal null-key bug
function RadarChartSVG({
  data,
  t,
}: {
  data: { subject: string; A: number }[];
  t: AppTheme;
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 76;
  const levels = 4;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const getAngle = (i: number) => -Math.PI / 2 + i * angleStep;
  const getPoint = (r: number, i: number) => ({
    x: cx + r * Math.cos(getAngle(i)),
    y: cy + r * Math.sin(getAngle(i)),
  });

  const gridPolygons = Array.from({ length: levels }, (_, lvl) => {
    const r = (radius * (lvl + 1)) / levels;
    const pts = data.map((_, i) => getPoint(r, i));
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  });

  const axisLines = data.map((_, i) => {
    const end = getPoint(radius, i);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  const dataPoints = data.map((d, i) => getPoint((d.A / 100) * radius, i));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labels = data.map((d, i) => {
    const labelR = radius + 18;
    const pt = getPoint(labelR, i);
    return { ...pt, text: d.subject };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridPolygons.map((pts, lvl) => (
        <polygon
          key={`grid-ring-${lvl}`}
          points={pts}
          fill="none"
          stroke={t.border}
          strokeWidth="0.8"
        />
      ))}
      {axisLines.map((l, i) => (
        <line
          key={`axis-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={t.border}
          strokeWidth="0.8"
        />
      ))}
      <polygon
        points={dataPolygon}
        fill={t.text}
        fillOpacity={0.12}
        stroke={t.text}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {labels.map((l, i) => (
        <text
          key={`label-${i}`}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fill={t.textMuted}
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}

const radarData = [
  { subject: "Energy", A: 72 },
  { subject: "Focus", A: 88 },
  { subject: "Clarity", A: 65 },
  { subject: "Routine", A: 80 },
  { subject: "Environment", A: 54 },
  { subject: "Legacy", A: 70 },
];

const weeklyData = [
  { day: "M", label: "Mon", score: 72 },
  { day: "Tu", label: "Tue", score: 68 },
  { day: "W", label: "Wed", score: 80 },
  { day: "Th", label: "Thu", score: 75 },
  { day: "F", label: "Fri", score: 85 },
  { day: "Sa", label: "Sat", score: 88 },
  { day: "Su", label: "Sun", score: 81 },
];

const patterns = [
  { type: "up", label: "High focus mornings", detail: "9–11am peak performance" },
  { type: "down", label: "Low energy evenings", detail: "3–5pm consistent dip" },
  { type: "up", label: "Ritual consistency", detail: "6/7 days this week" },
  { type: "down", label: "Environment control", detail: "Workspace not optimised" },
];

const suggestions = [
  {
    icon: "🌙",
    title: "Improve night ritual",
    desc: "Add a 10-min wind-down block before sleep.",
  },
  {
    icon: "📵",
    title: "Reduce screen exposure",
    desc: "No screens 45 min before bed for better recovery.",
  },
  {
    icon: "🏛️",
    title: "Redesign workspace",
    desc: "Apply your Minimal sensory preset during deep work.",
  },
];

export function Profile() {
  const { theme: t } = useTheme();
  const maxScore = Math.max(...weeklyData.map((d) => d.score));

  return (
    <div
      className="min-h-screen px-6 py-10 max-w-4xl mx-auto"
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
          System View
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            color: t.text,
          }}
        >
          Your System
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Score */}
        <motion.div
          className="lg:col-span-2 p-6 rounded-3xl transition-colors duration-300"
          style={{ background: t.surface }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: t.textMuted,
                  marginBottom: "4px",
                }}
              >
                Weekly Alignment
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2.8rem",
                  color: t.text,
                  lineHeight: 1,
                }}
              >
                81%
              </h2>
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{ background: t.invertBg, color: t.invertText }}
            >
              ↑ +3% this week
            </span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-28">
            {weeklyData.map((d, i) => (
              <div
                key={`bar-${d.label}`}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <motion.div
                  className="w-full rounded-t-xl"
                  style={{ background: t.text }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.score / maxScore) * 90}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.03 }}
                />
                <span style={{ fontSize: "0.72rem", color: t.textMuted }}>{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Overall score card */}
        <motion.div
          className="p-6 rounded-3xl flex flex-col items-center justify-center text-center transition-colors duration-300"
          style={{ background: t.invertBg }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: t.invertMuted,
              marginBottom: "8px",
            }}
          >
            Alignment
          </p>
          <div className="relative flex items-center justify-center w-24 h-24 mb-4">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={t.invertBorder}
                strokeWidth="6"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={t.invertMuted}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.81) }}
                transition={{ duration: 1.2, delay: 0.5 }}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.4rem",
                color: t.invertText,
              }}
            >
              81%
            </span>
          </div>
          <p style={{ fontSize: "0.82rem", color: t.invertMuted }}>↑ Strong: Focus</p>
          <p style={{ fontSize: "0.78rem", color: t.invertBorder, marginTop: "4px" }}>
            ↓ Weak: Environment
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radar */}
        <motion.div
          className="p-6 rounded-3xl transition-colors duration-300"
          style={{ background: t.surface }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
            Pillar Breakdown
          </p>
          <div className="flex justify-center">
            <RadarChartSVG data={radarData} t={t} />
          </div>
        </motion.div>

        {/* Patterns */}
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
            Patterns
          </p>
          <div className="flex flex-col gap-3">
            {patterns.map((p) => (
              <div
                key={p.label}
                className="flex items-start gap-3 p-3 rounded-2xl transition-colors duration-300"
                style={{ background: t.card }}
              >
                {p.type === "up" ? (
                  <TrendingUp size={16} color={t.textMuted} className="mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingDown size={16} color={t.textFaint} className="mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p style={{ fontSize: "0.88rem", color: t.text }}>{p.label}</p>
                  <p style={{ fontSize: "0.78rem", color: t.textMuted }}>{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div
        className="p-6 rounded-3xl transition-colors duration-300"
        style={{ background: t.invertBg }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: t.invertMuted,
            marginBottom: "16px",
          }}
        >
          System Suggestions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((s) => (
            <motion.div
              key={s.title}
              className="p-4 rounded-2xl flex flex-col gap-2 cursor-pointer"
              style={{ background: t.isDark ? "#F2EEE8" : "#1e1e1e" }}
              whileHover={{ y: -2 }}
            >
              <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: t.invertText,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {s.title}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: t.isDark ? "#666" : "#888",
                  lineHeight: 1.5,
                }}
              >
                {s.desc}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span style={{ fontSize: "0.75rem", color: t.invertMuted }}>Apply</span>
                <ArrowRight size={12} color={t.invertMuted} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
