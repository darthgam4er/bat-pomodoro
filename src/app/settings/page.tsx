"use client"

import { usePomodoro } from "@/context/pomodoro-context"
import { useTheme, Theme } from "@/context/theme-context"
import { BatmanLogo } from "@/components/batman-logo"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RotateCcw, Volume2, VolumeX, Play, Download, Target, Palette, Headphones } from "lucide-react"
import { AMBIENT_SOUNDS } from "@/lib/audio-config"

export default function SettingsPage() {
    const { settings, updateSettings, resetSettings, sessions, playSound } = usePomodoro()
    const { theme, setTheme } = useTheme()

    const exportData = () => {
        const data = {
            sessions,
            settings,
            exportedAt: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bat-pomodoro-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <main className="relative flex min-h-screen flex-col items-center overflow-hidden overflow-y-auto bg-background px-4 pb-24 pt-8">
            {/* Background Pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

            {/* Header */}
            <header className="relative z-10 mb-8 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl">
                        <BatmanLogo className="h-12 w-auto text-primary/50" />
                    </div>
                    <BatmanLogo className="relative h-12 w-auto text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Configure your Pomodoro cycle</p>
            </header>

            {/* Settings Form */}
            <section className="relative z-10 w-full max-w-md space-y-6">
                {/* Focus Time */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Focus Time</label>
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                            {settings.focusMinutes} min
                        </span>
                    </div>
                    <Slider
                        value={[settings.focusMinutes]}
                        onValueChange={([value]) => updateSettings({ focusMinutes: value })}
                        min={1}
                        max={90}
                        step={1}
                        className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>1 min</span>
                        <span>90 min</span>
                    </div>
                </div>

                {/* Short Break */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Short Break</label>
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                            {settings.shortBreakMinutes} min
                        </span>
                    </div>
                    <Slider
                        value={[settings.shortBreakMinutes]}
                        onValueChange={([value]) => updateSettings({ shortBreakMinutes: value })}
                        min={1}
                        max={30}
                        step={1}
                        className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>1 min</span>
                        <span>30 min</span>
                    </div>
                </div>

                {/* Long Break */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Long Break</label>
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                            {settings.longBreakMinutes} min
                        </span>
                    </div>
                    <Slider
                        value={[settings.longBreakMinutes]}
                        onValueChange={([value]) => updateSettings({ longBreakMinutes: value })}
                        min={1}
                        max={90}
                        step={1}
                        className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>1 min</span>
                        <span>90 min</span>
                    </div>
                </div>

                {/* Periods Before Long Break */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Periods Before Long Break</label>
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                            {settings.periodsBeforeLongBreak}
                        </span>
                    </div>
                    <Slider
                        value={[settings.periodsBeforeLongBreak]}
                        onValueChange={([value]) => updateSettings({ periodsBeforeLongBreak: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>1 period</span>
                        <span>10 periods</span>
                    </div>
                </div>

                {/* Daily Goal */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <label className="text-sm font-medium text-foreground">Daily Goal</label>
                        </div>
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                            {settings.dailyGoal} sessions
                        </span>
                    </div>
                    <Slider
                        value={[settings.dailyGoal || 8]}
                        onValueChange={([value]) => updateSettings({ dailyGoal: value })}
                        min={1}
                        max={16}
                        step={1}
                        className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>1 session</span>
                        <span>16 sessions</span>
                    </div>
                </div>

                {/* Toggles */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {settings.soundEnabled ? (
                                <Volume2 className="h-4 w-4 text-primary" />
                            ) : (
                                <VolumeX className="h-4 w-4 text-muted-foreground" />
                            )}
                            <label className="text-sm font-medium text-foreground">Sound Effects</label>
                        </div>
                        <Switch
                            checked={settings.soundEnabled ?? true}
                            onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                        />
                    </div>

                    {/* Auto-start Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-primary" />
                            <label className="text-sm font-medium text-foreground">Auto-start Breaks</label>
                        </div>
                        <Switch
                            checked={settings.autoStartBreaks ?? false}
                            onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                        />
                    </div>
                </div>

                {/* Ambient Sounds */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center gap-2">
                        <Headphones className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Focus Ambience</label>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {AMBIENT_SOUNDS.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => updateSettings({ ambientSound: sound.id })}
                                className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${settings.ambientSound === sound.id
                                    ? "border-primary bg-primary/10"
                                    : "border-transparent hover:bg-secondary"
                                    }`}
                            >
                                <span className="text-xl">{sound.icon}</span>
                                <span className="text-[10px] font-medium">{sound.name}</span>
                            </button>
                        ))}
                    </div>
                    {settings.ambientSound !== 'none' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Volume</span>
                                <span>{settings.ambientVolume}%</span>
                            </div>
                            <Slider
                                value={[settings.ambientVolume]}
                                onValueChange={([value]) => updateSettings({ ambientVolume: value })}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full"
                            />
                        </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                        Ambient sounds play automatically during focus sessions
                    </p>
                </div>

                {/* Theme Selection */}
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
                    <div className="mb-4 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Theme</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setTheme("batman")}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all ${theme === "batman"
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:bg-secondary"
                                }`}
                        >
                            <div className="h-6 w-6 rounded-full bg-[#FFD700] ring-2 ring-black" />
                            <span className="text-xs font-medium">Batman</span>
                        </button>
                        <button
                            onClick={() => setTheme("joker")}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all ${theme === "joker"
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:bg-secondary"
                                }`}
                        >
                            <div className="h-6 w-6 rounded-full bg-[#9D4EDD] ring-2 ring-[#2ECC71]" />
                            <span className="text-xs font-medium">Joker</span>
                        </button>
                        <button
                            onClick={() => setTheme("robin")}
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all ${theme === "robin"
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:bg-secondary"
                                }`}
                        >
                            <div className="h-6 w-6 rounded-full bg-[#E74C3C] ring-2 ring-[#2ECC71]" />
                            <span className="text-xs font-medium">Robin</span>
                        </button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playSound(theme)}
                        className="w-full mt-2 gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Volume2 className="h-3 w-3" />
                        Preview {theme.charAt(0).toUpperCase() + theme.slice(1)} Sound
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        onClick={exportData}
                        className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/20"
                    >
                        <Download className="h-4 w-4" />
                        Export Data (JSON)
                    </Button>

                    <Button
                        variant="outline"
                        onClick={resetSettings}
                        className="w-full gap-2 border-border hover:bg-secondary"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset to Defaults
                    </Button>
                </div>
            </section>
        </main>
    )
}

