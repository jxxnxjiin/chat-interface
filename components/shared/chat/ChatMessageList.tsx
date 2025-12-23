"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Message } from "@/lib/types"
import { TypingIndicator } from "@/components/shared"

interface ChatMessageListProps {
  messages: Message[]
  isTyping?: boolean
  variant?: "default" | "compact"
}

export function ChatMessageList({ messages, isTyping = false, variant = "default" }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 스타일 변형
  const styles = {
    default: {
      container: "flex-1 pr-6 py-10 space-y-8",
      avatar: "w-9 h-9 rounded-xl",
      avatarText: "text-xs",
      message: "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm",
      text: "text-[15px] leading-relaxed",
    },
    compact: {
      container: "flex-1 overflow-y-auto p-6 space-y-6",
      avatar: "w-8 h-8 rounded-lg",
      avatarText: "text-xs",
      message: "max-w-[75%] rounded-xl px-5 py-3 shadow-sm",
      text: "text-sm leading-relaxed",
    },
  }

  const currentStyle = styles[variant]

  return (
    <div className={currentStyle.container}>
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex-shrink-0 ${currentStyle.avatar} flex items-center justify-center ${currentStyle.avatarText} font-bold shadow-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {message.role === "user" ? "ME" : "AI"}
            </div>

            <div
              className={`${currentStyle.message} ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : variant === "default"
                  ? "bg-card text-foreground border border-border"
                  : "bg-muted/50 text-foreground border border-border"
              }`}
            >
              <div
                className={`${currentStyle.text} prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ul]:ml-0 [&>ol]:ml-0 [&>blockquote]:ml-0 [&>*]:px-0 ${
                  message.role === "user" ? "prose-invert" : "dark:prose-invert"
                }`}
              >
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
  )
}
