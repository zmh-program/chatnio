import { createContext, useContext, useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "./ui/button"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme?: () => void
}

export function activeTheme(theme: Theme) {
  const root = window.document.documentElement

  root.classList.remove("light", "dark")
  if (theme === "system") theme = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "dark"
    : "light"

  root.classList.add(theme)
  localStorage.setItem("theme", theme)
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: (theme: Theme) => {
    activeTheme(theme)
  },
  toggleTheme: () => {
    const theme = localStorage.getItem("theme") as Theme
    activeTheme(theme === "dark" ? "light" : "dark")
  }
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
                                defaultTheme = "system",
                                ...props
                              }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem("theme", theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value} />
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

export function ModeToggle() {
  const toggleTheme = useTheme().toggleTheme

  return (
    <Button variant="outline" size="icon" onClick={() => toggleTheme?.()}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

export default ModeToggle
