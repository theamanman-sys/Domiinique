import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft } from "lucide-react";

const steps = [
  {
    step: 1,
    question: "How do you feel most days?",
    options: [
      { label: "Low Energy", icon: "🌫️" },
      { label: "Distracted", icon: "🌀" },
      { label: "Focused but inconsistent", icon: "⚡" },
      { label: "Overwhelmed", icon: "🌊" },
    ],
  },
  {
    step: 2,
    question: "What do you want to improve?",
    options: [
      { label: "Focus", icon: "🎯" },
      { label: "Clarity", icon: "💎" },
      { label: "Routine", icon: "🔄" },
      { label: "Environment", icon: "🏛️" },
    ],
  },
  {
    step: 3,
    question: "Build your first system",
    body: "Based on your answers, we're generating your personal dashboard — rituals, sensory presets, and an alignment score tailored to you.",
    options: [],
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const step = steps[currentStep];

  function handleSelect(label: string) {
    setSelected(label);
  }

  function handleNext() {
    if (step.options.length > 0 && !selected) return;
    if (selected) setSelections((prev) => [...prev, selected]);
    setSelected(null);

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBuild() {
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 1600);
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#F8F7F4", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Progress */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex items-center justify-between mb-3">
          {currentStep > 0 ? (
            <button
              onClick={() => {
                setCurrentStep((s) => s - 1);
                setSelected(null);
              }}
              className="flex items-center gap-1 text-sm"
              style={{ color: "#888" }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}
          <span
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: "#aaa",
            }}
          >
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div
          className="h-1 w-full rounded-full overflow-hidden"
          style={{ background: "#D6CFC7" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#111111" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="w-full max-w-lg"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-2">
            <span
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#aaa",
              }}
            >
              Step {step.step}
            </span>
          </div>
          <h2
            className="mb-8"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: "#111",
              lineHeight: 1.25,
            }}
          >
            {step.question}
          </h2>

          {step.options.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {step.options.map(({ label, icon }) => (
                <motion.button
                  key={label}
                  onClick={() => handleSelect(label)}
                  className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200"
                  style={{
                    background:
                      selected === label ? "#111111" : "#EAE6E1",
                    color: selected === label ? "#F8F7F4" : "#111111",
                    border:
                      selected === label
                        ? "1.5px solid #111111"
                        : "1.5px solid transparent",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-2xl"
              style={{ background: "#EAE6E1" }}
            >
              <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {step.body}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {["Morning Ritual", "Deep Work Block", "Sensory Preset", "Evening Reset"].map(
                  (item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "#F8F7F4" }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#D6CFC7" }}
                      />
                      <span style={{ fontSize: "0.88rem", color: "#333" }}>{item}</span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            {currentStep < steps.length - 1 ? (
              <motion.button
                onClick={handleNext}
                disabled={step.options.length > 0 && !selected}
                className="flex items-center gap-2 px-8 py-4 rounded-full transition-all"
                style={{
                  background:
                    step.options.length === 0 || selected
                      ? "#111111"
                      : "#D6CFC7",
                  color:
                    step.options.length === 0 || selected
                      ? "#F8F7F4"
                      : "#888",
                  fontSize: "0.95rem",
                  letterSpacing: "0.04em",
                  cursor:
                    step.options.length > 0 && !selected
                      ? "not-allowed"
                      : "pointer",
                }}
                whileHover={
                  step.options.length === 0 || selected
                    ? { scale: 1.02 }
                    : {}
                }
              >
                Next <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleBuild}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-4 rounded-full"
                style={{
                  background: "#111111",
                  color: "#F8F7F4",
                  fontSize: "0.95rem",
                  letterSpacing: "0.04em",
                }}
                whileHover={{ scale: 1.02 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full"
                      style={{ borderColor: "#F8F7F4", borderTopColor: "transparent" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Building your system…
                  </>
                ) : (
                  <>
                    Build My System <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
