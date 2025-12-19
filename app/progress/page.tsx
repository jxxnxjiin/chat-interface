"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  Settings,
  ChevronRight,
  Plus,
  ExternalLink,
  GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"

type MenuItem = "timeline" | "today" | "ai-tools" | "settings"

interface Task {
  id: string
  title: string
  completed: boolean
  recommendedTool?: {
    name: string
    icon: string
    url: string
  }
}

export default function ProgressPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("today")
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "사용자 인터뷰 정리",
      completed: false,
      recommendedTool: { name: "Clova Note", icon: "🎙️", url: "#" }
    },
    {
      id: "2",
      title: "기획서 v2 작성",
      completed: false,
      recommendedTool: { name: "ChatGPT", icon: "💬", url: "#" }
    },
    {
      id: "3",
      title: "와이어프레임 검토",
      completed: true,
      recommendedTool: { name: "Figma", icon: "🎨", url: "#" }
    },
  ])

  const menuItems = [
    { id: "timeline" as MenuItem, label: "타임라인", icon: Calendar },
    { id: "today" as MenuItem, label: "오늘 할 일", icon: CheckSquare },
    { id: "ai-tools" as MenuItem, label: "AI 도구 추천", icon: Sparkles },
    { id: "settings" as MenuItem, label: "설정", icon: Settings },
  ]

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30 flex flex-col">
        {/* Logo / Project Name */}
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">프로젝트명</h1>
          <p className="text-sm text-muted-foreground mt-1">In Progress</p>
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
        <div className="p-4 border-t border-border">
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
          {activeMenu === "timeline" && (
            <TimelineView />
          )}

          {activeMenu === "today" && (
            <TodayView tasks={tasks} onToggle={toggleTask} />
          )}

          {activeMenu === "ai-tools" && (
            <AIToolsView />
          )}

          {activeMenu === "settings" && (
            <SettingsView />
          )}
        </div>
      </main>
    </div>
  )
}

/* ============================================
   Sub Components (각 뷰)
   ============================================ */

function TimelineView() {
  // 간트 차트 예시 데이터
  const ganttItems = [
    { id: 1, title: "기획", start: 0, duration: 30, color: "bg-blue-500" },
    { id: 2, title: "디자인", start: 20, duration: 40, color: "bg-purple-500" },
    { id: 3, title: "개발", start: 50, duration: 50, color: "bg-green-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Mini Calendar / Week View */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">이번 주 타임라인</h3>
        
        {/* Gantt Chart Placeholder */}
        <div className="space-y-3">
          {ganttItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <span className="w-20 text-sm text-muted-foreground">{item.title}</span>
              <div className="flex-1 h-8 bg-muted rounded-lg relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.duration}%` }}
                  transition={{ duration: 0.5, delay: item.id * 0.1 }}
                  className={`absolute h-full rounded-lg ${item.color}`}
                  style={{ left: `${item.start}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Week Labels */}
        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          <span>12/16 (월)</span>
          <span>12/17</span>
          <span>12/18</span>
          <span>12/19</span>
          <span>12/20</span>
          <span>12/21</span>
          <span>12/22 (일)</span>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">다가오는 마감</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="text-sm">기획서 최종본 제출</span>
            <span className="text-xs text-orange-500 font-medium">D-3</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="text-sm">디자인 시안 검토</span>
            <span className="text-xs text-muted-foreground">D-7</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TodayView({ tasks, onToggle }: { tasks: Task[], onToggle: (id: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">오늘의 집중 과업</h3>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
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
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">오늘의 진행률</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-sm font-medium">
            {tasks.filter(t => t.completed).length} / {tasks.length}
          </span>
        </div>
      </div>
    </div>
  )
}

function AIToolsView() {
  const toolCategories = [
    {
      type: "자료 조사",
      icon: "🔍",
      tools: [
        { name: "Perplexity", desc: "출처 기반 검색에 최적화", url: "https://perplexity.ai" },
        { name: "Gemini", desc: "구글 검색 연동 AI", url: "https://gemini.google.com" },
      ]
    },
    {
      type: "문서 작성",
      icon: "📝",
      tools: [
        { name: "ChatGPT", desc: "구조화된 문서 작성", url: "https://chat.openai.com" },
        { name: "Claude", desc: "긴 문서 분석 및 작문", url: "https://claude.ai" },
      ]
    },
    {
      type: "디자인",
      icon: "🎨",
      tools: [
        { name: "Midjourney", desc: "이미지 생성", url: "https://midjourney.com" },
        { name: "Canva AI", desc: "간편한 디자인 제작", url: "https://canva.com" },
      ]
    },
    {
      type: "데이터 분석",
      icon: "📊",
      tools: [
        { name: "ChatGPT ADA", desc: "Advanced Data Analysis", url: "https://chat.openai.com" },
      ]
    },
    {
      type: "회의록 정리",
      icon: "🎙️",
      tools: [
        { name: "Clova Note", desc: "음성 회의록 자동 정리", url: "https://clovanote.naver.com" },
        { name: "Zoom AI", desc: "회의 요약 기능", url: "https://zoom.us" },
      ]
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        업무 유형에 맞는 최적의 AI 도구를 찾아보세요.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolCategories.map((category) => (
          <motion.div
            key={category.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="text-lg font-semibold">{category.type}</h3>
            </div>

            <div className="space-y-3">
              {category.tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted transition-colors group"
                >
                  <div>
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">프로젝트 설정</h3>
        <p className="text-muted-foreground text-sm">
          설정 기능은 추후 구현 예정입니다.
        </p>
      </div>
    </div>
  )
}

