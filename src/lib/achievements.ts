import { LucideIcon, Trophy, Flame, Clock, Target, Zap, Crown, Star, LayoutGrid } from "lucide-react"

export interface Achievement {
    id: string
    title: string
    description: string
    icon: LucideIcon
    condition: (stats: { sessions: number; totalMinutes: number; streak: number; dailyGoalMet: number }) => boolean
    xpReward: number
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "first-step",
        title: "The First Step",
        description: "Complete your first focus session",
        icon: Star,
        condition: (stats) => stats.sessions >= 1,
        xpReward: 50,
    },
    {
        id: "entering-gotham",
        title: "Entering Gotham",
        description: "Complete 5 focus sessions",
        icon: LayoutGrid,
        condition: (stats) => stats.sessions >= 5,
        xpReward: 100,
    },
    {
        id: "dark-knight",
        title: "The Dark Knight",
        description: "Complete 25 focus sessions",
        icon: Trophy,
        condition: (stats) => stats.sessions >= 25,
        xpReward: 500,
    },
    {
        id: "streak-apprentice",
        title: "Consistency is Key",
        description: "Reach a 3-day streak",
        icon: Flame,
        condition: (stats) => stats.streak >= 3,
        xpReward: 150,
    },
    {
        id: "streak-master",
        title: "Unstoppable Force",
        description: "Reach a 7-day streak",
        icon: Zap,
        condition: (stats) => stats.streak >= 7,
        xpReward: 400,
    },
    {
        id: "marathon-runner",
        title: "Marathon Runner",
        description: "Focus for 10 total hours (600 mins)",
        icon: Clock,
        condition: (stats) => stats.totalMinutes >= 600,
        xpReward: 300,
    },
    {
        id: "goal-crusher",
        title: "Goal Crusher",
        description: "Meet your daily goal 5 times",
        icon: Target,
        condition: (stats) => stats.dailyGoalMet >= 5,
        xpReward: 250,
    },
    {
        id: "legend",
        title: "Gotham Legend",
        description: "Complete 100 focus sessions",
        icon: Crown,
        condition: (stats) => stats.sessions >= 100,
        xpReward: 1000,
    },
]
