"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Send, Plus, Settings, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "hello",
        },
      ])
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""

      const aiMessageId = (Date.now() + 1).toString()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const jsonStr = line.substring(2)
                const parsed = JSON.parse(jsonStr)
                if (parsed.textDelta) {
                  accumulatedContent += parsed.textDelta

                  setMessages((prev) => {
                    const existingIndex = prev.findIndex((m) => m.id === aiMessageId)
                    if (existingIndex >= 0) {
                      const updated = [...prev]
                      updated[existingIndex] = {
                        ...updated[existingIndex],
                        content: accumulatedContent,
                      }
                      return updated
                    } else {
                      return [
                        ...prev,
                        {
                          id: aiMessageId,
                          role: "assistant",
                          content: accumulatedContent,
                        },
                      ]
                    }
                  })
                }
              } catch (e) {
                console.error("[v0] Error parsing chunk:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="fixed left-0 top-0 z-30 h-full w-[280px] bg-sidebar text-sidebar-foreground shadow-2xl lg:relative"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            <h2 className="text-xl font-semibold">Chats</h2>
            <Button size="icon" variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            <button className="w-full rounded-xl bg-sidebar-accent px-4 py-3 text-left text-sm transition-colors hover:bg-sidebar-accent/70">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sidebar-accent-foreground">New Conversation</span>
              </div>
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-sidebar-accent">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 opacity-60" />
                <span className="text-sidebar-foreground/70">Previous Chat</span>
              </div>
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-sidebar-border p-4">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
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
      <div className="flex flex-1 flex-col">
        {/* Progress Stepper Header */}
        <header className="border-b border-border bg-card shadow-sm">
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
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[24px] px-6 py-3 shadow-md ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "backdrop-blur-glass bg-muted/80 text-card-foreground"
                    }`}
                    style={
                      message.role === "assistant"
                        ? {
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                          }
                        : undefined
                    }
                  >
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
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
        <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-lg">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3">
              <div className="flex-1 rounded-[24px] bg-muted/50 px-5 py-3 shadow-sm ring-1 ring-border/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
              </div>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
