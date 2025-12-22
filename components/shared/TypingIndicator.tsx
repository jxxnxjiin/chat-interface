"use client"

import { motion } from "framer-motion"

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className = "" }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex justify-start ${className}`}
    >
      <div className="max-w-[80%] rounded-[24px] bg-muted/80 px-6 py-3 shadow-md backdrop-blur-sm">
        <div className="flex gap-1">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </motion.div>
  )
}

