import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type AppTheme = {
  bg: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  invertBg: string;
  invertText: string;
  invertMuted: string;
  invertBorder: string;
  isDark: boolean;
};

const lightTheme: AppTheme = {
  bg: "#F8F7F4",
  surface: "#EAE6E1",
  card: "#F8F7F4",
  text: "#111111",
  textMuted: "#888888",
  textFaint: "#aaaaaa",
  border: "#D6CFC7",
  invertBg: "#111111",
  invertText: "#F8F7F4",
  invertMuted: "#D6CFC7",
  invertBorder: "#333333",
  isDark: false,
};

const darkTheme: AppTheme = {
  bg: "#0D0D0D",
  surface: "#1C1C1C",
  card: "#262626",
  text: "#F0EDE8",
  textMuted: "#888888",
  textFaint: "#555555",
  border: "#333333",
  invertBg: "#EAE6E1",
  invertText: "#111111",
  invertMuted: "#666666",
  invertBorder: "#C8C1BA",
  isDark: true,
};

type ThemeContextType = {
  theme: AppTheme;
  isDark: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
