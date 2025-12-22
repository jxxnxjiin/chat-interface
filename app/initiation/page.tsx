"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, Save, FileText, Download, Loader2, ChevronRight, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepNavigation, TypingIndicator, SlidePanel } from "@/components/shared"
import { Message } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

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

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || data.error || "응답을 처리하는 중 오류가 발생했습니다.",
      }

      setMessages((prev) => [...prev, aiResponse])

      if (data.report) {
        setPlanData(prev => ({
          ...prev,
          ...data.report
        }))
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
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 flex items-center justify-center px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm z-20">
        <StepNavigation currentStep={2} />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main: Chat Area (Centered) */}
        <main className="flex-1 flex flex-col items-center overflow-y-auto bg-background custom-scrollbar">
          <div className="w-full max-w-4xl flex flex-col min-h-full">
            {/* Chat Header */}
            <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">업무 이니시에이터</h1>
                  <p className="text-xs text-muted-foreground font-medium">Gemini 2.0 Flash</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 px-8 py-10 space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {message.role === "user" ? "ME" : "AI"}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground border border-border"
                      }`}
                    >
                      <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ul]:ml-0 [&>ol]:ml-0 [&>blockquote]:ml-0 [&>*]:px-0 ${
                        message.role === "user" ? "prose-invert" : "dark:prose-invert"
                      }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
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

            {/* Input Area (Centered) */}
            <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-8 py-8">
              <div className="max-w-3xl mx-auto relative group">
                <div className="flex items-end gap-3 p-2 bg-card border border-border rounded-[28px] shadow-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="프로젝트에 대해 설명해주세요..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-transparent px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[48px] max-h-[200px] leading-relaxed"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex-shrink-0 mb-1 mr-1"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center font-medium opacity-60">
                  Shift + Enter로 줄바꿈, Enter로 전송
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar: Real-time Plan Panel (Attached to Right) */}
        <aside className="w-[380px] flex-shrink-0 flex flex-col bg-muted/30 border-l border-border z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
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
                  확정 및 저장
                </>
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
                  대화 내용이 깊어질수록 기획안이 더 정교하게 업데이트됩니다. 준비가 되셨다면 <strong>[확정 및 저장]</strong>을 눌러 리포트를 생성하세요.
                </p>
              </div>
            </div>
          </div>
        </aside>
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
