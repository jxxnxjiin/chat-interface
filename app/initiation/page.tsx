"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, Save, FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepNavigation, TypingIndicator, SlidePanel } from "@/components/shared"
import { Message } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface PlanData {
  reason: string
  goal: string
  detailedPlan: string
  resources: string
}

export default function InitiationPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `안녕하세요! 👋 
이번 프로젝트의 목표는 무엇인가요? 

편하게 말씀해 주시면 제가 구체적인 계획 수립을 도와드릴게요. 😊`,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  
  // 실시간 기획안 데이터
  const [planData, setPlanData] = useState<PlanData>({
    reason: "",
    goal: "",
    detailedPlan: "",
    resources: "",
  })

  // 보고서 관련 state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [showReportPanel, setShowReportPanel] = useState(false)

  // 텍스트 영역 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [inputValue])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      // reply는 채팅 메시지로 표시
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || data.error || "응답을 처리하는 중 오류가 발생했습니다.",
      }

      setMessages((prev) => [...prev, aiResponse])

      // report가 있으면 실시간 기획안에 반영
      if (data.report) {
        setPlanData(prev => ({
          ...prev,
          ...data.report // 넘어온 필드만 부분 업데이트
        }))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSavePlan = async () => {
    // 대화가 충분하지 않으면 경고
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top Navigation Bar - 다른 페이지와 동일한 구조 */}
      <header className="flex items-center justify-center px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <StepNavigation currentStep={2} />
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
          {/* Chat Header */}
          <div className="border-b border-border bg-card/50 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">업무 이니시에이터</h1>
                <p className="text-xs text-muted-foreground">Powered by Gemini</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <main className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar/Label */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {message.role === "user" ? "ME" : "AI"}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground border border-border"
                      }`}
                    >
                      <div className={`text-sm leading-relaxed prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
                        message.role === "user" ? "prose-invert" : "dark:prose-invert"
                      }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Input Area */}
          <div className="border-t border-border bg-background px-4 py-4">
            <div className="max-w-2xl mx-auto flex items-end gap-3">
              <div className="flex-1 rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-ring">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="내용을 입력하세요..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[24px] leading-relaxed"
                />
              </div>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Plan Panel */}
        <div className="w-[400px] flex flex-col bg-card overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="font-semibold text-foreground">실시간 기획안</h2>
            </div>
            <Button 
              onClick={handleSavePlan} 
              size="sm" 
              className="gap-2"
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  확정 및 저장
                </>
              )}
            </Button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 기획 배경 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                기획 배경
              </label>
              <textarea
                value={planData.reason}
                onChange={(e) => setPlanData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="대화 내용을 바탕으로 자동 입력됩니다..."
                className="w-full min-h-[80px] px-3 py-2.5 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* 목표 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                목표
              </label>
              <textarea
                value={planData.goal}
                onChange={(e) => setPlanData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="..."
                className="w-full min-h-[60px] px-3 py-2.5 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* 상세 계획 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                상세 계획
              </label>
              <textarea
                value={planData.detailedPlan}
                onChange={(e) => setPlanData(prev => ({ ...prev, detailedPlan: e.target.value }))}
                placeholder="..."
                className="w-full min-h-[120px] px-3 py-2.5 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* 필요 자원 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                필요 자원
              </label>
              <textarea
                value={planData.resources}
                onChange={(e) => setPlanData(prev => ({ ...prev, resources: e.target.value }))}
                placeholder="..."
                className="w-full min-h-[60px] px-3 py-2.5 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* AI Resource Check */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">자동 요약</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    대화 내용을 바탕으로 자동 요약됩니다. 보고서 작성을 원하시면 AI에게 직접 요청하거나, [확정 및 저장] 버튼을 눌러주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
              <Button onClick={handleDownloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            }
          >
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reportContent}
              </ReactMarkdown>
            </div>
          </SlidePanel>
        )}
      </AnimatePresence>
    </div>
  )
}
