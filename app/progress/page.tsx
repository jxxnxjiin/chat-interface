"use client"

import { useState, useEffect } from "react"
import { Task, MenuItem, GanttItem } from "@/lib/types"
import { ProjectHeader } from "@/components/shared"
import { TimelineView, TodayView, CustomRecommendationsView, ToolSearchView } from "@/components/progress"

// 탭 메뉴 아이템
const menuItems = [
  { id: "timeline" as MenuItem, label: "프로젝트 타임라인"},
  { id: "custom-recommendations" as MenuItem, label: "맞춤 추천"},
  { id: "tool-search" as MenuItem, label: "도구 검색"},
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

// 초기 간트 아이템 데이터
const today = new Date()
const formatDate = (date: Date) => date.toISOString().split("T")[0]

const initialGanttItems: GanttItem[] = [
  {
    id: "1",
    title: "기획",
    startDate: formatDate(today),
    endDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
    color: "bg-blue-500"
  },
  {
    id: "2",
    title: "디자인",
    startDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
    color: "bg-purple-500"
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
  const [activeMenu, setActiveMenu] = useState<MenuItem>("timeline")

  // Tasks state (localStorage 연동)
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-progress-tasks`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return initialTasks
  })

  // Gantt Items state (localStorage 연동)
  const [ganttItems, setGanttItems] = useState<GanttItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-progress-gantt`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return initialGanttItems
  })

  // localStorage에 tasks 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-progress-tasks`, JSON.stringify(tasks))
    }
  }, [tasks, projectId])

  // localStorage에 ganttItems 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-progress-gantt`, JSON.stringify(ganttItems))
    }
  }, [ganttItems, projectId])

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

  const addGanttItem = (item: Omit<GanttItem, "id">) => {
    const newItem: GanttItem = {
      id: Date.now().toString(),
      ...item,
    }
    setGanttItems(prev => [...prev, newItem])
  }

  const deleteGanttItem = (id: string) => {
    setGanttItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Project Header */}
      <ProjectHeader currentStep={2} />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <nav className="flex items-center gap-2 mb-6">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

        {/* Content */}
        <div className="pb-8">
          {activeMenu === "timeline" && (
            <div className="grid grid-cols-2 gap-6">
              {/* 왼쪽: TO-DO (1/2) */}
              <div className="col-span-1">
                <TodayView tasks={tasks} onToggle={toggleTask} onAddTask={addTask} />
              </div>
              {/* 오른쪽: 간트차트 (1/2) */}
              <div className="col-span-1">
                <TimelineView
                  items={ganttItems}
                  onAddItem={addGanttItem}
                  onDeleteItem={deleteGanttItem}
                />
              </div>
            </div>
            )}
            {activeMenu === "custom-recommendations" && (
              <div className="h-[calc(100vh-220px)]">
                <CustomRecommendationsView />
              </div>
            )}
            {activeMenu === "tool-search" && (
              <div className="h-[calc(100vh-220px)]">
                <ToolSearchView />
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
