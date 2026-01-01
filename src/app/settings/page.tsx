"use client"

import { usePomodoro } from "@/context/pomodoro-context"
import { useTheme, Theme } from "@/context/theme-context"
import { useAmbientSound } from "@/hooks/use-ambient-sound"
import { BatmanLogo } from "@/components/batman-logo"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RotateCcw, Volume2, VolumeX, Play, Pause, Square, Download, Target, Palette, Headphones, Radio } from "lucide-react"
import { AMBIENT_SOUNDS } from "@/lib/audio-config"
import { useLofiRadio, LOFI_STATIONS } from "@/hooks/use-lofi-radio"

export default function SettingsPage() {
    const { settings, updateSettings, resetSettings, sessions, playSound } = usePomodoro()
    const { theme, setTheme } = useTheme()
    const ambientSound = useAmbientSound(settings.ambientSound, settings.ambientVolume)
    const lofiRadio = useLofiRadio(settings.lofiStation, settings.lofiVolume)

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
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-primary" />
                            <label className="text-sm font-medium text-foreground">Focus Ambience</label>
                        </div>
                        {settings.ambientSound !== 'none' && (
                            <Button
                                variant={ambientSound.isPlaying ? "destructive" : "default"}
                                size="sm"
                                onClick={() => ambientSound.toggle()}
                                className="gap-2"
                            >
                                {ambientSound.isPlaying ? (
                                    <>
                                        <Square className="h-3 w-3" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3 w-3" />
                                        Preview
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {AMBIENT_SOUNDS.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => {
                                    updateSettings({ ambientSound: sound.id })
                                    ambientSound.setSound(sound.id)
                                }}
                                className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all ${settings.ambientSound === sound.id
                                    ? "border-primary bg-primary/10"
                                    : "border-transparent hover:bg-secondary"
                                    }`}
                            >
                                <span className="text-xl">{sound.icon}</span>
                                <span className="text-[10px] font-medium text-center">{sound.name}</span>
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
                                onValueChange={([value]) => {
                                    updateSettings({ ambientVolume: value })
                                    ambientSound.setVolume(value)
                                }}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full"
                            />
                        </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                        {ambientSound.isPlaying
                            ? `🎵 Now playing: ${AMBIENT_SOUNDS.find(s => s.id === settings.ambientSound)?.name}`
                            : 'Ambient sounds play automatically during focus sessions'
                        }
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

                {/* Discord Rich Presence */}
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        Discord Rich Presence
                    </div>

                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">Show status in Discord</span>
                        <Switch
                            checked={settings.discordEnabled ?? true}
                            onCheckedChange={(checked) => updateSettings({ discordEnabled: checked })}
                        />
                    </div>

                    {/* Image URL Input */}
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Image URL (GIF supported)</label>
                        <input
                            type="url"
                            placeholder="https://i.imgur.com/example.gif"
                            value={settings.discordImageUrl ?? ''}
                            onChange={(e) => updateSettings({ discordImageUrl: e.target.value })}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {settings.discordImageUrl && (
                            <div className="flex items-center gap-2 mt-2">
                                <img
                                    src={settings.discordImageUrl}
                                    alt="Preview"
                                    className="h-12 w-12 rounded-md object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                                <span className="text-xs text-muted-foreground">Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Focus Text Input */}
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Focus Status Text</label>
                        <input
                            type="text"
                            placeholder="Adaptation in Progress 🔄"
                            value={settings.discordFocusText ?? ''}
                            onChange={(e) => updateSettings({ discordFocusText: e.target.value })}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Break Text Input */}
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Break Status Text</label>
                        <input
                            type="text"
                            placeholder="Recovering Energy ✨"
                            value={settings.discordBreakText ?? ''}
                            onChange={(e) => updateSettings({ discordBreakText: e.target.value })}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Lo-fi Radio */}
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Radio className="h-4 w-4" />
                        Lo-fi Radio
                    </div>

                    {/* Station Selector */}
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Station</label>
                        <select
                            value={settings.lofiStation ?? 'none'}
                            onChange={(e) => {
                                updateSettings({ lofiStation: e.target.value as any })
                                lofiRadio.setStation(e.target.value as any)
                            }}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {LOFI_STATIONS.map(station => (
                                <option key={station.id} value={station.id}>
                                    {station.name} {station.description && `- ${station.description}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Play/Pause Controls */}
                    {settings.lofiStation !== 'none' && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => lofiRadio.toggle()}
                                className="gap-2"
                                disabled={lofiRadio.isLoading}
                            >
                                {lofiRadio.isLoading ? (
                                    <span className="animate-pulse">Loading...</span>
                                ) : lofiRadio.isPlaying ? (
                                    <><Pause className="h-3 w-3" /> Pause</>
                                ) : (
                                    <><Play className="h-3 w-3" /> Play</>
                                )}
                            </Button>
                            {lofiRadio.error && (
                                <span className="text-xs text-destructive">{lofiRadio.error}</span>
                            )}
                        </div>
                    )}

                    {/* Volume */}
                    {settings.lofiStation !== 'none' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-muted-foreground">Volume</label>
                                <span className="text-xs text-muted-foreground">{settings.lofiVolume ?? 50}%</span>
                            </div>
                            <Slider
                                value={[settings.lofiVolume ?? 50]}
                                max={100}
                                step={5}
                                onValueChange={([value]) => {
                                    updateSettings({ lofiVolume: value })
                                    lofiRadio.setVolume(value)
                                }}
                            />
                        </div>
                    )}
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

