"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Task } from "@/lib/types"
import { TaskItem } from "./TaskItem"
import { selectableTools } from "@/lib/data/ai-tools"

interface TodayViewProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onAddTask: (title: string, recommendedTool?: Task["recommendedTool"]) => void
}

export function TodayView({ tasks, onToggle, onAddTask }: TodayViewProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [selectedTool, setSelectedTool] = useState<Task["recommendedTool"] | null>(null)
  const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), selectedTool || undefined)
      setNewTaskTitle("")
      setSelectedTool(null)
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    } else if (e.key === "Escape") {
      setIsAdding(false)
      setNewTaskTitle("")
      setSelectedTool(null)
    }
  }

  const handleSelectTool = (tool: typeof selectableTools[0]) => {
    setSelectedTool({
      name: tool.name,
      icon: tool.icon,
      url: tool.url,
    })
    setIsToolDropdownOpen(false)
  }

  const handleClearTool = () => {
    setSelectedTool(null)
  }

  // 추가 모드 진입 시 인풋에 포커스
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const completedCount = tasks.filter(t => t.completed).length
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">✅ 오늘 할 일</h3>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        <div className="space-y-3">
          {/* 새로운 할 일 입력 필드 */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-background rounded-lg border-2 border-primary/50 space-y-3"
              >
                {/* 제목 입력 */}
                <div className="flex items-center gap-4">
                  <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="새로운 할 일을 입력하세요..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>

                {/* 도구 선택 & 버튼 */}
                <div className="flex items-center gap-3 pl-9">
                  {/* 도구 선택 드롭다운 */}
                  <div className="relative" ref={dropdownRef}>
                    {selectedTool ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-medium">
                        <span>{selectedTool.icon}</span>
                        <span>{selectedTool.name}</span>
                        <button 
                          onClick={handleClearTool}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsToolDropdownOpen(!isToolDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium transition-colors"
                      >
                        <span>🔧</span>
                        <span>도구 선택</span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${isToolDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}

                    {/* 드롭다운 메뉴 */}
                    <AnimatePresence>
                      {isToolDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                        >
                          <div className="max-h-64 overflow-y-auto py-2">
                            {selectableTools.map((tool) => (
                              <button
                                key={tool.name}
                                onClick={() => handleSelectTool(tool)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted transition-colors"
                              >
                                <span className="text-lg">{tool.icon}</span>
                                <div>
                                  <p className="text-sm font-medium">{tool.name}</p>
                                  <p className="text-xs text-muted-foreground">{tool.category}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1" />

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleAdd} disabled={!newTaskTitle.trim()}>
                      추가
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setIsAdding(false)
                        setNewTaskTitle("")
                        setSelectedTool(null)
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      {/* <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">오늘의 진행률</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-sm font-medium">
            {completedCount} / {tasks.length}
          </span>
        </div>
      </div> */}
    </div>
  )
}
