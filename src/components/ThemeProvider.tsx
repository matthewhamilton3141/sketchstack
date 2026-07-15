"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "sketchstack:theme";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "light", setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // On mount, adopt whatever the pre-hydration script already set on <html>.
  // Coerce anything unexpected (e.g. the removed "dusk") to a valid theme.
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    const valid: Theme = current === "dark" ? "dark" : "light";
    setThemeState(valid);
    document.documentElement.dataset.theme = valid;
    try {
      localStorage.setItem(STORAGE_KEY, valid);
    } catch {
      // ignore storage errors
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
