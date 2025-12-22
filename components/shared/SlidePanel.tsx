"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  titleIcon?: ReactNode
  headerActions?: ReactNode
  children: ReactNode
  width?: "sm" | "md" | "lg" | "xl"
}

const widthClasses = {
  sm: "w-full sm:w-[400px]",
  md: "w-full sm:w-[500px] lg:w-[600px]",
  lg: "w-full sm:w-[600px] lg:w-[800px]",
  xl: "w-full sm:w-[800px] lg:w-[1000px]",
}

export function SlidePanel({ 
  isOpen, 
  onClose, 
  title, 
  titleIcon,
  headerActions,
  children,
  width = "lg"
}: SlidePanelProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed right-0 top-0 z-50 h-full ${widthClasses[width]} bg-background border-l border-border shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-card">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {titleIcon}
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {headerActions}
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </motion.div>
    </>
  )
}

