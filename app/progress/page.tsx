"use client"

import { useState, useEffect } from "react"
import { Task, MenuItem, GanttItem } from "@/lib/types"
import { ProjectHeader } from "@/components/shared"
import { TimelineView, TodayView, CustomRecommendationsView, ToolSearchView } from "@/components/progress"
import { getCurrentProjectId, getProjectStorageItem, setProjectStorageItem } from "@/lib/storage-utils"
import { menuItems } from "@/lib/data/project-constants"
import { initialTasks, initialGanttItems } from "@/lib/data/initial-data"

// 초기 샘플 프로젝트 ID 목록 (이 프로젝트들만 디폴트 데이터 사용)
const INITIAL_PROJECT_IDS = ["1", "2", "3", "4", "5"]

export default function ProgressPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("timeline")

  // Tasks state (localStorage 연동)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const projectId = getCurrentProjectId()
    const defaultValue = INITIAL_PROJECT_IDS.includes(projectId) ? initialTasks : []
    return getProjectStorageItem("progress-tasks", defaultValue)
  })

  // Gantt Items state (localStorage 연동)
  const [ganttItems, setGanttItems] = useState<GanttItem[]>(() => {
    const projectId = getCurrentProjectId()
    const defaultValue = INITIAL_PROJECT_IDS.includes(projectId) ? initialGanttItems : []
    return getProjectStorageItem("progress-gantt", defaultValue)
  })

  // localStorage에 tasks 저장
  useEffect(() => {
    setProjectStorageItem("progress-tasks", tasks)
  }, [tasks])

  // localStorage에 ganttItems 저장
  useEffect(() => {
    setProjectStorageItem("progress-gantt", ganttItems)
  }, [ganttItems])

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
