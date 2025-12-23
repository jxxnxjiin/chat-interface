"use client"

import { useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
  variant?: "default" | "compact"
  showHint?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "메시지를 입력하세요...",
  variant = "default",
  showHint = true,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 텍스트 영역 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [value])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  if (variant === "default") {
    return (
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pr-6 py-8">
        <div className="max-w-3xl mx-auto relative group">
          <div className="flex items-end gap-3 p-2 bg-card border border-border rounded-[28px] shadow-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[48px] max-h-[200px] leading-relaxed"
            />
            <Button
              size="icon"
              onClick={onSend}
              disabled={!value.trim() || disabled}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex-shrink-0 mb-1 mr-1"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {showHint && (
            <p className="text-[11px] text-muted-foreground mt-3 text-center font-medium opacity-60">
              Shift + Enter로 줄바꿈, Enter로 전송
            </p>
          )}
        </div>
      </div>
    )
  }

  // compact variant
  return (
    <div className="border-t border-border p-4">
      <div className="flex items-end gap-3 p-2 bg-background border border-border rounded-2xl">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[40px] max-h-[200px] leading-relaxed"
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
