"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  CheckSquare,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { Task, MenuItem } from "@/lib/types"
import { StepNavigation } from "@/components/shared"
import { TimelineView, TodayView, AIToolsView, CustomRecommendationsView } from "@/components/progress"

// 사이드바 메뉴 아이템
const menuItems = [
  { id: "timeline" as MenuItem, label: "프로젝트 타임라인", icon: Calendar },
  { id: "today" as MenuItem, label: "오늘 할 일", icon: CheckSquare },
  { id: "ai-tools" as MenuItem, label: "추천 도구 목록", icon: Sparkles },
  { id: "custom-recommendations" as MenuItem, label: "맞춤 추천", icon: Sparkles },
]

// 초기 할 일 데이터
const initialTasks: Task[] = [
  {
    id: "1",
    title: "미팅 내용 정리",
    completed: false,
    recommendedTool: { name: "Clova Note", icon: "🎙️", url: "#" }
  },
  {
    id: "2",
    title: "프로젝트 기획서 작성",
    completed: false,
    recommendedTool: { name: "Claude", icon: "💬", url: "#" }
  },
  {
    id: "3",
    title: "디자인 시안 작성",
    completed: true,
    recommendedTool: { name: "Midjourney", icon: "🎨", url: "#" }
  },
]

// 현재 프로젝트 ID 가져오기
const getCurrentProjectId = () => {
  if (typeof window === "undefined") return "default"
  try {
    const currentProject = localStorage.getItem("chat-current-project")
    if (currentProject) {
      const project = JSON.parse(currentProject)
      return project.id || "default"
    }
  } catch (e) {
    console.error("Failed to get current project:", e)
  }
  return "default"
}

export default function ProgressPage() {
  const projectId = getCurrentProjectId()
  const [activeMenu, setActiveMenu] = useState<MenuItem>("today")
  const [projectName, setProjectName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      // 현재 프로젝트 정보에서 이름 가져오기
      const currentProject = localStorage.getItem("chat-current-project")
      if (currentProject) {
        try {
          const project = JSON.parse(currentProject)
          return project.name || "프로젝트명"
        } catch (e) {
          console.error("Failed to parse current project:", e)
        }
      }
    }
    return "프로젝트명"
  })
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-progress-tasks`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return initialTasks
  })

  // localStorage에 tasks 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-progress-tasks`, JSON.stringify(tasks))
    }
  }, [tasks, projectId])

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = (title: string, recommendedTool?: Task["recommendedTool"]) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      recommendedTool,
    }
    setTasks(prev => [newTask, ...prev])
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-center px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <StepNavigation currentStep={3} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-muted/30 flex flex-col">
          {/* Project Info */}
          <div className="px-4 py-6">
            <h2 className="font-semibold text-foreground">{projectName}</h2>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          {/* Bottom Info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground">
              마감일: 2025-01-15
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="px-8 py-6 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-foreground">
              {menuItems.find(m => m.id === activeMenu)?.label}
            </h2>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8">
            {activeMenu === "timeline" && <TimelineView />}
            {activeMenu === "today" && (
              <TodayView tasks={tasks} onToggle={toggleTask} onAddTask={addTask} />
            )}
            {activeMenu === "ai-tools" && <AIToolsView />}
            {activeMenu === "custom-recommendations" && <CustomRecommendationsView />}
          </div>
        </main>
      </div>
    </div>
  )
}
