"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, Settings, History } from "lucide-react"

const navItems = [
    { href: "/", icon: Timer, label: "Timer" },
    { href: "/history", icon: History, label: "History" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-md items-center justify-around py-2">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all ${isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_8px_var(--primary)]" : ""}`} />
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
