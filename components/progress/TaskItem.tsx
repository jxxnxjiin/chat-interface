"use client"

import { motion } from "framer-motion"
import { GripVertical, ExternalLink } from "lucide-react"
import { Task } from "@/lib/types"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-4 p-4 bg-background rounded-lg border border-border transition-all ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      {/* Drag Handle */}
      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
          task.completed
            ? "bg-primary border-primary"
            : "border-muted-foreground hover:border-primary"
        }`}
      >
        {task.completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </button>

      {/* Task Title */}
      <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
        {task.title}
      </span>

      {/* Recommended Tool */}
      {task.recommendedTool && (
        <a
          href={task.recommendedTool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium hover:bg-muted/80 transition-colors"
        >
          <span>{task.recommendedTool.icon}</span>
          <span>{task.recommendedTool.name}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </motion.div>
  )
}

