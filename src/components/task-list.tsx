"use client"

import { useState } from "react"
import { usePomodoro, Task } from "@/context/pomodoro-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Check, Circle, Target } from "lucide-react"

export function TaskList() {
    const { tasks, activeTaskId, addTask, toggleTask, deleteTask, setActiveTask } = usePomodoro()
    const [inputValue, setInputValue] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim()) {
            addTask(inputValue.trim())
            setInputValue("")
        }
    }

    // Sort: Active first, then uncompleted, then completed
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.id === activeTaskId) return -1
        if (b.id === activeTaskId) return 1
        if (a.completed === b.completed) return 0
        return a.completed ? 1 : -1
    })

    return (
        <div className="w-full max-w-sm space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-yellow-400">
                Objectives
            </h2>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Add new objective..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-card/50 border-border"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim()}
                    aria-label="Add new objective"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </form>

            {/* List */}
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {sortedTasks.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground italic">
                        No active missions.
                    </p>
                )}

                {sortedTasks.map((task) => (
                    <div
                        key={task.id}
                        className={`group flex items-center justify-between rounded-lg border p-3 transition-all ${task.id === activeTaskId
                                ? "border-primary bg-primary/10"
                                : task.completed
                                    ? "border-transparent bg-secondary/30 opacity-60"
                                    : "border-border bg-card/40 hover:bg-card/60"
                            }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`flex-shrink-0 rounded-full transition-colors ${task.completed ? "text-green-500" : "text-muted-foreground hover:text-primary"
                                    }`}
                                aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
                            >
                                {task.completed ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </button>

                            <span
                                className={`truncate text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"
                                    }`}
                                title={task.text}
                            >
                                {task.text}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!task.completed && (
                                <button
                                    onClick={() => setActiveTask(task.id === activeTaskId ? null : task.id)}
                                    className={`rounded-full p-1.5 transition-colors ${task.id === activeTaskId
                                            ? "text-primary bg-primary/20"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                    title={task.id === activeTaskId ? "Active Mission" : "Set as Target"}
                                    aria-label={task.id === activeTaskId ? "Unset active mission" : "Set as active mission"}
                                >
                                    <Target className="h-4 w-4" />
                                </button>
                            )}

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="rounded-full p-1.5 text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                title="Delete"
                                aria-label="Delete task"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
