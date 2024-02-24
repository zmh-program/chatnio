import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "./ui/button";
import { getMemory, setMemory } from "@/utils/memory.ts";
import { themeEvent } from "@/events/theme.ts";

const defaultTheme: Theme = "dark";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme?: () => void;
};

export function activeTheme(theme: Theme) {
  const root = window.document.documentElement;

  root.classList.remove("light", "dark");
  if (theme === "system")
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  root.classList.add(theme);
  setMemory("theme", theme);
  themeEvent.emit(theme);
}

export function getTheme() {
  return (getMemory("theme") as Theme) || defaultTheme;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: (theme: Theme) => {
    activeTheme(theme);
  },
  toggleTheme: () => {
    const key = getMemory("theme");
    const theme = (key.length > 0 ? key : defaultTheme) as Theme;

    activeTheme(theme === "dark" ? "light" : "dark");
  },
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  defaultTheme = "dark",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (getMemory("theme") as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setMemory("theme", theme);
      setTheme(theme);
    },
  };

  return <ThemeProviderContext.Provider {...props} value={value} />;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export function ModeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button variant="outline" size="icon" onClick={() => toggleTheme?.()}>
      <Sun
        className={`relative dark:absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}
      />
      <Moon
        className={`absolute dark:relative h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
      />
    </Button>
  );
}

export default ModeToggle;
