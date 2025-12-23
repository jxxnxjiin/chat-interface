"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Pencil, Check, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProjectStatus = "initiation" | "progress" | "completion"
type StepStatus = "completed" | "in_progress" | "pending"

interface ProjectHeaderProps {
  currentStep: 1 | 2 | 3
}

interface StepInfo {
  step: 1 | 2 | 3
  label: string
  title: string
  description: string
  href: string
  status: ProjectStatus
}

const steps: StepInfo[] = [
  {
    step: 1,
    label: "단계",
    title: "1단계: 계획",
    description: "AI와 대화하며 업무 계획을 수립하고 필요한 자원을 점검합니다.",
    href: "/initiation",
    status: "initiation",
  },
  {
    step: 2,
    label: "단계",
    title: "2단계: 실행",
    description: "간트 차트로 일정을 관리하고 To-Do List를 통해 업무를 실행합니다.",
    href: "/progress",
    status: "progress",
  },
  {
    step: 3,
    label: "단계",
    title: "3단계: 마무리",
    description: "업무 결과를 정리하고 보고서를 작성하여 프로젝트를 마무리합니다.",
    href: "/completion",
    status: "completion",
  },
]

const statusLabels = {
  initiation: "INITIATION",
  progress: "EXECUTION",
  completion: "COMPLETION",
}

export function ProjectHeader({ currentStep }: ProjectHeaderProps) {
  const [projectName, setProjectName] = useState("프로젝트명")
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState("")

  // Load project name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentProject = localStorage.getItem("chat-current-project")
      if (currentProject) {
        try {
          const project = JSON.parse(currentProject)
          setProjectName(project.name || "프로젝트명")
        } catch (e) {
          console.error("Failed to parse current project:", e)
        }
      }
    }
  }, [])

  const handleStartEdit = () => {
    setTempName(projectName)
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmed = tempName.trim()
    if (trimmed && trimmed !== projectName) {
      setProjectName(trimmed)
      // Update localStorage
      if (typeof window !== "undefined") {
        const currentProject = localStorage.getItem("chat-current-project")
        if (currentProject) {
          try {
            const project = JSON.parse(currentProject)
            project.name = trimmed
            localStorage.setItem("chat-current-project", JSON.stringify(project))
            
            // Also update in projects list
            const projects = localStorage.getItem("chat-projects")
            if (projects) {
              const projectsList = JSON.parse(projects)
              const updatedProjects = projectsList.map((p: { id: string; name: string }) => 
                p.id === project.id ? { ...p, name: trimmed } : p
              )
              localStorage.setItem("chat-projects", JSON.stringify(updatedProjects))
            }
          } catch (e) {
            console.error("Failed to update project name:", e)
          }
        }
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const getStepStatus = (step: number): StepStatus => {
    if (step < currentStep) return "completed"
    if (step === currentStep) return "in_progress"
    return "pending"
  }

  const currentStatus = steps.find(s => s.step === currentStep)?.status || "initiation"

  return (
    <div className="border-b border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link 
            href="/" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            대시보드
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{projectName}</span>
        </nav>

        {/* Project Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  autoFocus
                  className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none px-1"
                />
                <button
                  onClick={handleSave}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <Check className="h-5 w-5 text-primary" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="group flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
              >
                <h1 className="text-2xl font-bold text-foreground">
                  {projectName}
                </h1>
                <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            className="font-semibold border-2"
          >
            {statusLabels[currentStatus]}
          </Button>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.step)
            const isActive = step.step === currentStep
            
            return (
              <Link key={step.step} href={step.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                    isActive 
                      ? "border-amber-400 bg-amber-50/50 shadow-lg" 
                      : status === "completed"
                        ? "border-border bg-card hover:border-primary/30"
                        : "border-border bg-card/50 hover:border-primary/20"
                  }`}
                >
                  {/* Top row: Label + Status badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        status === "completed" ? "bg-amber-500" : 
                        status === "in_progress" ? "bg-green-500" : 
                        "bg-gray-300"
                      }`} />
                      <span className={`text-xs font-medium ${
                        status === "completed" ? "text-amber-600" :
                        status === "in_progress" ? "text-green-600" :
                        "text-muted-foreground"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    
                    {/* Status indicator */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                      status === "completed" 
                        ? "bg-green-500 text-white" 
                        : status === "in_progress"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}>
                      {status === "completed" ? (
                        <Check className="h-5 w-5" strokeWidth={3} />
                      ) : (
                        <span className="text-sm font-bold">
                          {String(step.step).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Status text */}
                  <div className="flex items-center gap-1.5">
                    {status === "completed" && (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">완료</span>
                      </>
                    )}
                    {status === "in_progress" && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-600">진행중</span>
                      </>
                    )}
                    {status === "pending" && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-sm text-muted-foreground">대기중</span>
                      </>
                    )}
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

