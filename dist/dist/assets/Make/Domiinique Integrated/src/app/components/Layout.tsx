import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Layers,
  Headphones,
  BookOpen,
  User,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/rituals", label: "Rituals", icon: Layers },
  { path: "/sensory", label: "Sensory", icon: Headphones },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/profile", label: "System", icon: User },
];

function DayNightToggle({
  isDark,
  onToggle,
  t,
}: {
  isDark: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              transition={{ duration: 0.25 }}
            >
              <Moon size={13} color={t.textMuted} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -30, scale: 0.7 }}
              transition={{ duration: 0.25 }}
            >
              <Sun size={13} color={t.textMuted} />
            </motion.span>
          )}
        </AnimatePresence>
        <span
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: t.textMuted,
          }}
        >
          {isDark ? "Night" : "Day"}
        </span>
      </div>

      {/* Pill toggle */}
      <button
        onClick={onToggle}
        aria-label="Toggle day/night mode"
        className="relative flex items-center rounded-full transition-colors duration-400"
        style={{
          width: "48px",
          height: "26px",
          background: isDark ? "#2A2A2A" : t.border,
          flexShrink: 0,
        }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "20px",
            height: "20px",
            background: isDark ? t.invertBg : t.text,
            top: "3px",
          }}
          animate={{ left: isDark ? "25px" : "3px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
        {/* Sun icon on left side */}
        <span
          className="absolute"
          style={{
            left: "5px",
            opacity: isDark ? 0 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Sun size={10} color="#fff" />
        </span>
        {/* Moon icon on right side */}
        <span
          className="absolute"
          style={{
            right: "5px",
            opacity: isDark ? 0 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Moon size={10} color="#888" />
        </span>
      </button>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme: t, isDark, toggle } = useTheme();

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{
        background: t.bg,
        fontFamily: "'Inter', sans-serif",
        color: t.text,
      }}
    >
      {/* Sidebar – desktop */}
      <aside
        className="hidden md:flex flex-col w-64 min-h-screen px-6 py-8 border-r transition-colors duration-300"
        style={{ borderColor: t.border, background: t.bg }}
      >
        <Link to="/" className="mb-12">
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.35rem",
              letterSpacing: "0.12em",
              color: t.text,
            }}
          >
            DOMIINIQUE
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
                style={{
                  background: active ? t.invertBg : "transparent",
                  color: active ? t.invertText : t.text,
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span style={{ fontSize: "0.9rem", letterSpacing: "0.04em" }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Day/Night toggle */}
        <div
          className="mt-4 mb-4 px-2 py-3 rounded-2xl transition-colors duration-300"
          style={{ background: t.surface }}
        >
          <DayNightToggle isDark={isDark} onToggle={toggle} t={t} />
        </div>

        <div
          className="rounded-2xl p-4 transition-colors duration-300"
          style={{ background: t.surface }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              color: t.textMuted,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Alignment Score
          </p>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              color: t.text,
              lineHeight: 1.1,
              marginTop: "4px",
            }}
          >
            78%
          </p>
          <p style={{ fontSize: "0.8rem", color: t.textMuted, marginTop: "4px" }}>
            ↑ Strong: Focus
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 transition-colors duration-300"
        style={{ background: t.bg, borderBottom: `1px solid ${t.border}` }}
      >
        <Link to="/">
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.1rem",
              letterSpacing: "0.12em",
              color: t.text,
            }}
          >
            DOMIINIQUE
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <DayNightToggle isDark={isDark} onToggle={toggle} t={t} />
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} color={t.text} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.4)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col px-6 py-8 transition-colors duration-300"
              style={{ background: t.bg }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-10">
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.2rem",
                    letterSpacing: "0.12em",
                    color: t.text,
                  }}
                >
                  DOMIINIQUE
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} color={t.text} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname.startsWith(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                      style={{
                        background: active ? t.invertBg : "transparent",
                        color: active ? t.invertText : t.text,
                      }}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span style={{ fontSize: "0.9rem" }}>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:overflow-auto pt-[60px] md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
