"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { ChatMessageList, ChatInput } from "@/components/shared"
import { Message } from "@/lib/types"

interface RecommendedTool {
  id: string
  tool_name: string
  description: string
  url?: string
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

export function ToolSearchView() {
  const projectId = getCurrentProjectId()

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-tool-search-messages`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: "1",
        role: "assistant",
        content: "안녕하세요!\n\n어떤 작업을 하시나요? 맞춤형 도구를 추천해드릴게요. 🔍",
      },
    ]
  })
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [recommendedTools, setRecommendedTools] = useState<RecommendedTool[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat-${projectId}-tool-search-tools`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return []
  })

  // localStorage에 messages 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-tool-search-messages`, JSON.stringify(messages))
    }
  }, [messages, projectId])

  // localStorage에 recommendedTools 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat-${projectId}-tool-search-tools`, JSON.stringify(recommendedTools))
    }
  }, [recommendedTools, projectId])

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
      const response = await fetch("/api/tool-recommendations", {
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

      // tools 배열이 있으면 추천 도구 리스트에 추가 (중복 제거)
      if (data.tools && Array.isArray(data.tools) && data.tools.length > 0) {
        setRecommendedTools((prev) => {
          const existingNames = new Set(prev.map(t => t.tool_name.toLowerCase()))
          const newTools: RecommendedTool[] = data.tools
            .filter((tool: any) => !existingNames.has(tool.tool_name.toLowerCase()))
            .map((tool: any, index: number) => ({
              id: (Date.now() + index).toString(),
              tool_name: tool.tool_name,
              description: tool.description,
              url: tool.url || "",
            }))
          return [...prev, ...newTools]
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* 왼쪽: 채팅 UI (2/3) */}
      <div className="col-span-2 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
        {/* 채팅 메시지 */}
        <ChatMessageList messages={messages} isTyping={isTyping} variant="compact" />

        {/* 입력 영역 */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isTyping}
          placeholder="어떤 작업을 하시나요?"
          variant="compact"
          showHint={false}
        />
      </div>

      {/* 오른쪽: 추천 도구 카드 리스트 (1/3) */}
      <div className="col-span-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">추천 도구</h3>
          <p className="text-xs text-muted-foreground mt-1">
            AI가 추천한 도구들이 여기에 표시됩니다
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recommendedTools.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              아직 추천된 도구가 없습니다
            </div>
          ) : (
            <AnimatePresence>
              {recommendedTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-sm mb-1">{tool.tool_name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                    {tool.url && (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
