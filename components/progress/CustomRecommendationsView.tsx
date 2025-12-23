"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProjectStorageItem, setProjectStorageItem } from "@/lib/storage-utils"

interface CustomTool {
  tool_name: string
  description: string
  url?: string
  category: string
}

export function CustomRecommendationsView() {
  const [tools, setTools] = useState<CustomTool[]>(() =>
    getProjectStorageItem("custom-tools", [])
  )
  const [isLoading, setIsLoading] = useState(false)

  // localStorage에 tools 저장
  useEffect(() => {
    setProjectStorageItem("custom-tools", tools)
  }, [tools])

  const handleGetRecommendations = async () => {
    setIsLoading(true)

    try {
      // localStorage에서 프로젝트 데이터 가져오기
      const planData = getProjectStorageItem("initiation-planData", null)

      // 기획안 데이터가 없으면 경고
      if (!planData) {
        alert("기획안을 먼저 생성하세요.")
        return
      }

      const ganttItems = getProjectStorageItem("progress-gantt", [])
      const tasks = getProjectStorageItem("progress-tasks", [])

      const response = await fetch("/api/custom-tool-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planData, ganttItems, tasks }),
      })

      const data = await response.json()

      if (data.tools && Array.isArray(data.tools)) {
        setTools(data.tools)
      } else if (data.error) {
        alert(`오류: ${data.error}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("도구 추천 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 콜아웃 */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium">
            1단계 기획안과 프로젝트 일정을 분석하여 맞춤형 도구를 추천받으세요.
          </p>
        </div>
        <Button
          onClick={handleGetRecommendations}
          disabled={isLoading}
          size="sm"
          className="gap-2 flex-shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              추천 받기
            </>
          )}
        </Button>
      </div>

      {/* 도구 목록 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              아직 추천된 도구가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              버튼을 클릭하여 프로젝트에 맞는 도구를 추천받으세요!
            </p>
          </div>
        ) : (
          /* 변경된 부분: md 이상일 때 2열 그리드 적용 */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                /* 변경된 부분: h-full과 flex-col을 추가하여 카드 높이를 맞춤 */
                className="bg-muted/50 rounded-xl p-6 border border-border hover:border-primary/50 transition-colors relative h-full flex flex-col justify-between"
              >
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-semibold pr-8">{tool.tool_name}</h3>
                  <p className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full inline-block border">
                    {tool.category}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tool.description}
                  </p>
                </div>
                
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-6 right-6"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}