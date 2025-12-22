"use client"

import { motion } from "framer-motion"

export function TimelineView() {
  const ganttItems = [
    { id: 1, title: "기획", start: 0, duration: 30, color: "bg-blue-500" },
    { id: 2, title: "디자인", start: 20, duration: 40, color: "bg-purple-500" },
    { id: 3, title: "개발", start: 50, duration: 50, color: "bg-green-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Mini Calendar / Week View */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">이번 주</h3>
        
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
          <span>12/22 (월)</span>
          <span>12/23</span>
          <span>12/24</span>
          <span>12/25🎄</span>
          <span>12/26</span>
          <span>12/27</span>
          <span>12/28 (일)</span>
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

