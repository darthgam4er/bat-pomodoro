"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "batman" | "joker" | "robin"

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("batman")
    const [mounted, setMounted] = useState(false)

    // Load theme from local storage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("bat-pomodoro-theme") as Theme
        if (savedTheme) {
            setTheme(savedTheme)
        }
        setMounted(true)
    }, [])

    // Update theme in local storage and document class
    useEffect(() => {
        if (!mounted) return

        localStorage.setItem("bat-pomodoro-theme", theme)

        // Remove all theme classes first
        document.documentElement.classList.remove("theme-batman", "theme-joker", "theme-robin")
        // Add current theme class
        document.documentElement.classList.add(`theme-${theme}`)

        // Also update meta theme-color
        const themeColor = {
            batman: "#FFD700",
            joker: "#9D4EDD",
            robin: "#2ECC71",
        }[theme]

        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)

    }, [theme, mounted])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
