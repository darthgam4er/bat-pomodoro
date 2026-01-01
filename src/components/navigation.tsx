"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, Settings, History, Brain } from "lucide-react"

const navItems = [
    { href: "/", icon: Timer, label: "Timer" },
    { href: "/coach", icon: Brain, label: "Coach" },
    { href: "/history", icon: History, label: "History" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Matte glassmorphism floating pill - per design brief */}
            <div className="mx-4 mb-4 rounded-2xl backdrop-blur-lg bg-card/80 border border-border/50 shadow-xl shadow-black/30">
                <div className="flex items-center justify-around py-2.5 px-2">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-300 ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {/* Subtle active glow - not bright */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-xl bg-primary/5 blur-sm" />
                                )}
                                <Icon
                                    className={`relative h-5 w-5 transition-all duration-300 ${isActive ? "scale-105" : ""
                                        }`}
                                    style={isActive ? { filter: 'drop-shadow(0 0 4px var(--primary))' } : {}}
                                />
                                <span className={`relative text-[10px] font-medium transition-all ${isActive ? "text-primary opacity-100" : "opacity-70"
                                    }`}>
                                    {label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
