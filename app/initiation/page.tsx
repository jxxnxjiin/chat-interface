"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Save, FileText, Download, Loader2, Layout, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectHeader, SlidePanel, ChatMessageList, ChatInput, PlanField } from "@/components/shared"
import { Message } from "@/lib/types"
import { getCurrentProjectId, getProjectStorageItem, setProjectStorageItem } from "@/lib/storage-utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

// 실시간 기획안 작성
interface PlanData {
  reason: string
  goal: string
  detailedPlan: string
  resources: string
}

export default function InitiationPage() {
  const [messages, setMessages] = useState<Message[]>(() =>
    getProjectStorageItem("initiation-messages", [
      {
        id: "1",
        role: "assistant",
        content: `안녕하세요! 👋
이번 프로젝트의 목표는 무엇인가요?

편하게 말씀해 주시면 제가 구체적인 계획 수립을 도와드릴게요. 😊`,
      },
    ])
  )
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // 실시간 기획안 데이터
  const [planData, setPlanData] = useState<PlanData>(() =>
    getProjectStorageItem("initiation-planData", {
      reason: "",
      goal: "",
      detailedPlan: "",
      resources: "",
    })
  )

  // 보고서 관련 state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [showReportPanel, setShowReportPanel] = useState(false)

  // localStorage에 messages 저장
  useEffect(() => {
    setProjectStorageItem("initiation-messages", messages)
  }, [messages])

  // localStorage에 planData 저장
  useEffect(() => {
    setProjectStorageItem("initiation-planData", planData)
  }, [planData])

  // 타임아웃과 함께 fetch 실행하는 헬퍼 함수
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT')
      }
      throw error
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setIsTyping(true)

    const MAX_RETRIES = 3
    let retryCount = 0
    let success = false

    while (retryCount < MAX_RETRIES && !success) {
      try {
        if (retryCount > 0) {
          console.log(`재시도 중... (${retryCount}/${MAX_RETRIES})`)
        }

        const response = await fetchWithTimeout(
          "/api/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages }),
          },
          15000 // 15초 타임아웃
        )

        const data = await response.json()

        // 디버깅: 받은 데이터 로그
        console.log("DEBUG: Received data from API:", data)
        if (data.report) {
          console.log("DEBUG: Report data:", data.report)
        } else {
          console.log("DEBUG: No report in response")
        }

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || data.error || "응답을 처리하는 중 오류가 발생했습니다.",
        }

        setMessages((prev) => [...prev, aiResponse])

        if (data.report) {
          setPlanData(prev => {
            const addContent = (existing: string, newContent: string) => {
              if (!newContent || newContent.trim() === "") return existing
              if (!existing || existing.trim() === "") return newContent
              // 중복 체크: 새 내용이 기존 내용에 포함되어 있으면 추가하지 않음
              if (existing.includes(newContent)) return existing
              return existing + "\n\n" + newContent
            }

            const newPlanData = {
              reason: addContent(prev.reason, data.report.reason || ""),
              goal: addContent(prev.goal, data.report.goal || ""),
              detailedPlan: addContent(prev.detailedPlan, data.report.detailedPlan || ""),
              resources: addContent(prev.resources, data.report.resources || ""),
            }

            console.log("DEBUG: Updated planData:", newPlanData)
            return newPlanData
          })
        }

        success = true
      } catch (error: any) {
        console.error(`Error (attempt ${retryCount + 1}):`, error)

        if (error.message === 'TIMEOUT') {
          retryCount++
          if (retryCount < MAX_RETRIES) {
            console.log(`타임아웃 발생. ${retryCount}초 후 재시도합니다...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // 점진적 딜레이
            continue
          } else {
            // 최대 재시도 횟수 초과
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "⚠️ 응답 시간이 초과되었습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.",
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        } else {
          // 다른 에러
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "⚠️ 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          }
          setMessages((prev) => [...prev, errorMessage])
        }
        break
      }
    }

    setIsTyping(false)
  }

  const handleSavePlan = async () => {
    if (messages.filter(m => m.role === "user").length < 1) {
      alert("먼저 AI와 대화를 진행해주세요.")
      return
    }

    setIsGeneratingReport(true)

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages, 
          planData 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "보고서 생성 실패")
      }

      setReportContent(data.report)
      setShowReportPanel(true)
    } catch (error) {
      console.error("Report Error:", error)
      alert("보고서 생성 중 오류가 발생했습니다.")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleDownloadReport = () => {
    if (!reportContent) return
    
    const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `work_definition_${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Project Header */}
      <ProjectHeader currentStep={1} />

      <div className="flex-1 flex justify-center overflow-hidden bg-background">
        <div className="w-full max-w-7xl flex overflow-hidden">
          {/* Main: Chat Area */}
          <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pl-6">

            {/* Chat Messages */}
            <ChatMessageList messages={messages} isTyping={isTyping} variant="default" />

            {/* Input Area (Centered) */}
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              disabled={isTyping}
              placeholder="프로젝트에 대해 설명해주세요..."
              variant="default"
              showHint={true}
            />
        </main>

          {/* Real-time Plan Panel */}
          <aside className="w-[420px] flex-shrink-0 flex flex-col bg-background px-6 py-4 z-10">
          <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Layout className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-bold text-foreground tracking-tight">실시간 기획안</h2>
              </div>
              <Button
                onClick={handleSavePlan}
                size="sm"
                className="h-8 gap-1.5 px-3 rounded-lg font-bold text-xs"
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    생성 중
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    보고서 생성
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* AI Guide Card */}
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-primary/10 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🤖</span>
                  <p className="font-bold text-xs text-primary tracking-tight">AI 인텔리전스 가이드</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  대화 내용이 깊어질수록 기획안이 더 정교하게 업데이트됩니다. <strong>[보고서 생성]</strong>을 눌러 구체적인 리포트를 생성하실 수 있습니다.
                </p>
              </div>
            </div>

            {/* 기획 배경 */}
            <PlanField
              label="기획 배경"
              value={planData.reason}
              onChange={(value) => setPlanData(prev => ({ ...prev, reason: value }))}
              placeholder="대화 내용을 바탕으로 자동 입력됩니다..."
              minHeight="90px"
            />

            {/* 목표 */}
            <PlanField
              label="목표"
              value={planData.goal}
              onChange={(value) => setPlanData(prev => ({ ...prev, goal: value }))}
            />

            {/* 상세 계획 */}
            <PlanField
              label="상세 계획"
              value={planData.detailedPlan}
              onChange={(value) => setPlanData(prev => ({ ...prev, detailedPlan: value }))}
              minHeight="120px"
            />

            {/* 필요 자원 */}
            <PlanField
              label="필요 자원"
              value={planData.resources}
              onChange={(value) => setPlanData(prev => ({ ...prev, resources: value }))}
            />

            
          </div>
          </div>
          </aside>
        </div>
      </div>

      {/* Report Panel (Slide) */}
      <AnimatePresence>
        {showReportPanel && reportContent && (
          <SlidePanel
            isOpen={showReportPanel}
            onClose={() => setShowReportPanel(false)}
            title="📑 업무 정의서"
            titleIcon={<FileText className="h-5 w-5" />}
            headerActions={
              <Button onClick={handleDownloadReport} variant="outline" size="sm" className="h-8 rounded-lg font-bold text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                다운로드
              </Button>
            }
          >
            <div className="prose prose-slate dark:prose-invert max-w-none px-2">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {reportContent}
              </ReactMarkdown>
            </div>
          </SlidePanel>
        )}
      </AnimatePresence>
    </div>
  )
}
