"use client"

import Link from "next/link"
import { Home } from "lucide-react"

interface StepNavigationProps {
  currentStep: 1 | 2 | 3 | 4
}

const steps = [
  { step: 1, displayNumber: null, label: "Project Home", href: "/", isHome: true },
  { step: 2, displayNumber: 1, label: "Initiation", href: "/initiation", isHome: false },
  { step: 3, displayNumber: 2, label: "In Progress", href: "/progress", isHome: false },
  { step: 4, displayNumber: 3, label: "Completion", href: "/completion", isHome: false },
]

export function StepNavigation({ currentStep }: StepNavigationProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {steps.map((item, index) => (
        <div key={item.step} className="flex items-center gap-2 sm:gap-4">
          <Link href={item.href} className="flex items-center gap-2 group">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                currentStep === item.step
                  ? "bg-primary text-primary-foreground shadow-lg group-hover:scale-105"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              }`}
            >
              {item.isHome ? (
                <Home className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">{item.displayNumber}</span>
              )}
            </div>
            <span
              className={`hidden sm:inline text-sm transition-colors ${
                currentStep === item.step
                  ? "font-medium text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {item.label}
            </span>
          </Link>

          {/* Connector (마지막 아이템 제외) */}
          {index < steps.length - 1 && (
            <div className="h-0.5 w-8 bg-border sm:w-12"></div>
          )}
        </div>
      ))}
    </div>
  )
}
