"use client"

import Link from "next/link"

interface StepNavigationProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { step: 1, label: "Initiation", href: "/" },
  { step: 2, label: "In Progress", href: "/progress" },
  { step: 3, label: "Completion", href: "/completion" },
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
              <span className="text-sm font-semibold">{item.step}</span>
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
            <div className="h-0.5 w-12 bg-border sm:w-20"></div>
          )}
        </div>
      ))}
    </div>
  )
}

