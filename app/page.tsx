"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Send, Plus, Settings, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatInterface() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "안녕하세요! 무엇을 도와드릴까요?",
      },
    ],
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "안녕하세요! 무엇을 도와드릴까요?",
      },
    ])
  }

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
          <div className="flex items-center justify-between px-6 py-4">
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

            {/* Spacer for alignment */}
            <div className="w-10 lg:hidden"></div>
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
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-[24px] backdrop-blur-glass bg-muted/80 px-6 py-3 shadow-md">
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
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 rounded-[24px] bg-muted/50 px-5 py-3 shadow-sm ring-1 ring-border/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
