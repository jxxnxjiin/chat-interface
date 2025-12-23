"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Save, FileText, Download, Loader2, Layout, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectHeader, SlidePanel, ChatMessageList, ChatInput } from "@/components/shared"
import { Message } from "@/lib/types"
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

export default function InitiationPage() {
  const projectId = getCurrentProjectId()

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-initiation-messages`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: "1",
        role: "assistant",
        content: `안녕하세요! 👋
이번 프로젝트의 목표는 무엇인가요?

편하게 말씀해 주시면 제가 구체적인 계획 수립을 도와드릴게요. 😊`,
      },
    ]
  })
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // 실시간 기획안 데이터
  const [planData, setPlanData] = useState<PlanData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-initiation-planData`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return {
      reason: "",
      goal: "",
      detailedPlan: "",
      resources: "",
    }
  })

  // 보고서 관련 state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [showReportPanel, setShowReportPanel] = useState(false)

  // localStorage에 messages 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-initiation-messages`, JSON.stringify(messages))
    }
  }, [messages, projectId])

  // localStorage에 planData 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-initiation-planData`, JSON.stringify(planData))
    }
  }, [planData, projectId])

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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

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

          return {
            reason: addContent(prev.reason, data.report.reason || ""),
            goal: addContent(prev.goal, data.report.goal || ""),
            detailedPlan: addContent(prev.detailedPlan, data.report.detailedPlan || ""),
            resources: addContent(prev.resources, data.report.resources || ""),
          }
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsTyping(false)
    }
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
            {/* Chat Header */}
            {/* <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md pr-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">업무 이니시에이터</h1>
                  <p className="text-xs text-muted-foreground font-medium">Gemini 2.5 Flash</p>
                </div>
              </div>
            </div> */}

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
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3.5 bg-primary/40 rounded-full" />
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  기획 배경
                </label>
              </div>
              <textarea
                value={planData.reason}
                onChange={(e) => setPlanData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="대화 내용을 바탕으로 자동 입력됩니다..."
                className="w-full min-h-[90px] px-4 py-3 text-sm bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed transition-all"
              />
            </div>

            {/* 목표 */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3.5 bg-primary/40 rounded-full" />
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  목표
                </label>
              </div>
              <textarea
                value={planData.goal}
                onChange={(e) => setPlanData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="..."
                className="w-full min-h-[70px] px-4 py-3 text-sm bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed transition-all"
              />
            </div>

            {/* 상세 계획 */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3.5 bg-primary/40 rounded-full" />
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  상세 계획
                </label>
              </div>
              <textarea
                value={planData.detailedPlan}
                onChange={(e) => setPlanData(prev => ({ ...prev, detailedPlan: e.target.value }))}
                placeholder="..."
                className="w-full min-h-[120px] px-4 py-3 text-sm bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed transition-all"
              />
            </div>

            {/* 필요 자원 */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3.5 bg-primary/40 rounded-full" />
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  필요 자원
                </label>
              </div>
              <textarea
                value={planData.resources}
                onChange={(e) => setPlanData(prev => ({ ...prev, resources: e.target.value }))}
                placeholder="..."
                className="w-full min-h-[70px] px-4 py-3 text-sm bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed transition-all"
              />
            </div>

            
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
