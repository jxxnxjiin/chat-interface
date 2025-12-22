"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GanttItem } from "@/lib/types"

// 색상 옵션
const colorOptions = [
  { name: "파랑", value: "bg-blue-500" },
  { name: "보라", value: "bg-purple-500" },
  { name: "초록", value: "bg-green-500" },
  { name: "주황", value: "bg-orange-500" },
  { name: "분홍", value: "bg-pink-500" },
]

// 오늘 날짜
const today = new Date()
const formatDate = (date: Date) => date.toISOString().split("T")[0]

// 일주일 날짜 계산
const getWeekDates = () => {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date)
  }
  return dates
}

// D-day 계산
const getDday = (endDate: string) => {
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// 간트 바 위치 계산 (일주일 기준)
const calculateGanttPosition = (startDate: string, endDate: string) => {
  const weekStart = new Date(today)
  weekStart.setHours(0, 0, 0, 0)
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // 시작점 (0-100%)
  const startDiff = Math.max(0, (start.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
  const startPercent = Math.min(100, (startDiff / 7) * 100)
  
  // 기간
  const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1)
  const durationPercent = Math.min(100 - startPercent, (duration / 7) * 100)
  
  return { left: startPercent, width: durationPercent }
}

interface TimelineViewProps {
  items?: GanttItem[]
  onAddItem?: (item: Omit<GanttItem, "id">) => void
  onDeleteItem?: (id: string) => void
}

export function TimelineView({ 
  items: propItems, 
  onAddItem, 
  onDeleteItem 
}: TimelineViewProps) {
  // 내부 상태 (props가 없을 경우 사용)
  const [internalItems, setInternalItems] = useState<GanttItem[]>([
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
  ])

  const ganttItems = propItems || internalItems

  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "",
    startDate: formatDate(today),
    endDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
    color: "bg-blue-500",
  })

  const weekDates = getWeekDates()

  const handleAddItem = () => {
    if (!newItem.title.trim()) return

    const item: GanttItem = {
      id: Date.now().toString(),
      ...newItem,
    }

    if (onAddItem) {
      onAddItem(newItem)
    } else {
      setInternalItems(prev => [...prev, item])
    }

    setNewItem({
      title: "",
      startDate: formatDate(today),
      endDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
      color: "bg-blue-500",
    })
    setIsAdding(false)
  }

  const handleDeleteItem = (id: string) => {
    if (onDeleteItem) {
      onDeleteItem(id)
    } else {
      setInternalItems(prev => prev.filter(item => item.id !== id))
    }
  }

  // 다가오는 마감 (일주일 이내)
  const upcomingDeadlines = ganttItems
    .map(item => ({ ...item, dday: getDday(item.endDate) }))
    .filter(item => item.dday >= 0 && item.dday <= 7)
    .sort((a, b) => a.dday - b.dday)

  return (
    <div className="space-y-6">
      {/* Gantt Chart */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">이번 주 일정</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            업무 추가
          </Button>
        </div>

        {/* 업무 추가 폼 */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-background rounded-lg border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">새 업무 추가</span>
              <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <input
              type="text"
              placeholder="업무명"
              value={newItem.title}
              onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">시작일</label>
                <input
                  type="date"
                  value={newItem.startDate}
                  onChange={(e) => setNewItem(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">종료일</label>
                <input
                  type="date"
                  value={newItem.endDate}
                  onChange={(e) => setNewItem(prev => ({ ...prev, endDate: e.target.value }))}
                  min={newItem.startDate}
                  className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">색상</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewItem(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full ${color.value} transition-all ${
                      newItem.color === color.value ? "ring-2 ring-offset-2 ring-ring" : ""
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleAddItem} disabled={!newItem.title.trim()} className="w-full">
              추가
            </Button>
          </motion.div>
        )}
        
        {/* Gantt Bars */}
        <div className="space-y-3">
          {ganttItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              등록된 업무가 없습니다. 업무를 추가해주세요.
            </p>
          ) : (
            ganttItems.map((item) => {
              const position = calculateGanttPosition(item.startDate, item.endDate)
              return (
                <div key={item.id} className="flex items-center gap-4 group">
                  <span className="w-24 text-sm text-muted-foreground truncate" title={item.title}>
                    {item.title}
                  </span>
                  <div className="flex-1 h-8 bg-muted rounded-lg relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${position.width}%` }}
                      transition={{ duration: 0.5 }}
                      className={`absolute h-full rounded-lg ${item.color} flex items-center justify-end pr-2`}
                      style={{ left: `${position.left}%` }}
                    >
                      <span className="text-xs text-white/80 font-medium">
                        {Math.ceil(position.width / 100 * 7)}일
                      </span>
                    </motion.div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Week Labels */}
        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          {weekDates.map((date, index) => {
            const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
            const isToday = date.toDateString() === today.toDateString()
            return (
              <span 
                key={index} 
                className={isToday ? "text-primary font-semibold" : ""}
              >
                {date.getMonth() + 1}/{date.getDate()} ({dayNames[date.getDay()]})
              </span>
            )
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">다가오는 마감</h3>
          <span className="text-xs text-muted-foreground">(일주일 이내)</span>
        </div>
        
        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            일주일 내 마감 예정인 업무가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className={`text-xs font-medium ${
                  item.dday <= 1 ? "text-red-500" : 
                  item.dday <= 3 ? "text-orange-500" : 
                  "text-muted-foreground"
                }`}>
                  {item.dday === 0 ? "오늘 마감" : `D-${item.dday}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
