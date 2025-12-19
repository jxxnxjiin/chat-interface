"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Send, Plus, Settings, MessageSquare, FileText, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! 무엇을 도와드릴까요?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [showReportPanel, setShowReportPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isTyping, setIsTyping] = useState(false);

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

  const handleNewChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "안녕하세요! 오늘 해결하고 싶은 업무나, 머릿속을 맴도는 아이디어가 있으신가요?",
      },
    ])
    setReportContent(null)
    setShowReportPanel(false)
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }), // 전체 대화 내역 전송
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "보고서 생성 실패");
      }

      setReportContent(data.report)
      setShowReportPanel(true)
    } catch (error) {
      console.error("Report Error:", error);
      alert("보고서 생성 중 오류가 발생했습니다.");
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
    link.download = `report_${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true); // AI 답변 대기 시작

    try {
      // ✅ 우리가 만든 API(/api/chat) 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }), // 전체 메시지 내역 전송
      });

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || data.error,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false); // 로딩 종료
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="fixed left-0 top-0 z-30 h-full w-[280px] bg-card border-r border-border text-card-foreground shadow-2xl lg:relative"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-xl font-semibold">Chats</h2>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-accent"
              onClick={handleNewChat}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            <button
              className="w-full rounded-xl bg-accent px-4 py-3 text-left text-sm transition-colors hover:bg-accent/70"
              onClick={handleNewChat}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4" />
                <span>New Conversation</span>
              </div>
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 opacity-60" />
                <span className="opacity-70">Previous Chat</span>
              </div>
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-border p-4">
            <Button variant="ghost" className="w-full justify-start hover:bg-accent">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Progress Stepper Header */}
        <header className="border-b border-border bg-card shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* 3-Step Progress Stepper */}
            <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
              {/* Step 1: Initiation - Active */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <span className="hidden text-sm font-medium text-foreground sm:inline">Initiation</span>
              </div>

              {/* Connector */}
              <div className="h-0.5 w-12 bg-border sm:w-20"></div>

              {/* Step 2: In Progress - Inactive */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:inline">In Progress</span>
              </div>

              {/* Connector */}
              <div className="h-0.5 w-12 bg-border sm:w-20"></div>

              {/* Step 3: Completion - Inactive */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:inline">Completion</span>
              </div>
            </div>

            {/* Report Generation Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={messages.filter(m => m.role === "user").length < 3 || isGeneratingReport}
              className="hidden sm:flex items-center gap-2"
              title={messages.filter(m => m.role === "user").length < 3 ? "보고서를 생성하려면 사용자가 보낸 메시지가 3개 이상 필요합니다" : "대화 내용을 기반으로 보고서 생성"}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">
                {isGeneratingReport ? "생성 중..." : "보고서 생성"}
              </span>
            </Button>

            {/* Mobile: Icon only */}
            <Button
              size="icon"
              onClick={handleGenerateReport}
              disabled={messages.filter(m => m.role === "user").length < 3 || isGeneratingReport}
              className="sm:hidden"
              title={messages.filter(m => m.role === "user").length < 3 ? "보고서를 생성하려면 사용자가 보낸 메시지가 3개 이상 필요합니다" : "대화 내용을 기반으로 보고서 생성"}
            >
              <FileText className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[24px] px-6 py-3 shadow-md ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "backdrop-blur-glass bg-muted/80 text-card-foreground"
                    }`}
                  >
                    <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none ${
                      message.role === "user" ? "prose-invert" : "dark:prose-invert"
                    }`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-[24px] bg-muted/80 px-6 py-3 shadow-md backdrop-blur-glass">
                    <div className="flex gap-1">
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-lg">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3">
              <div className="flex-1 rounded-[24px] bg-muted/50 px-5 py-3 shadow-sm ring-1 ring-border/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-ring">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="메시지를 입력하세요..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none py-1 min-h-[24px] leading-relaxed"
                />
              </div>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 disabled:opacity-50 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 px-4 text-center">
              Shift + Enter로 줄바꿈, Enter로 전송
            </p>
          </div>
        </div>
      </div>

      {/* Report Panel */}
      <AnimatePresence>
        {showReportPanel && reportContent && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowReportPanel(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-[600px] lg:w-[800px] bg-background border-l border-border shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-border p-4 bg-card">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  생성된 보고서
                </h2>
                <div className="flex items-center gap-2">
                  <Button onClick={handleDownloadReport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                  <Button onClick={() => setShowReportPanel(false)} variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reportContent}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
