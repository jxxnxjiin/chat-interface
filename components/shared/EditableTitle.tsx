"use client"

import { useState, useRef, useEffect } from "react"
import { Pencil, Check } from "lucide-react"

interface EditableTitleProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
}

export function EditableTitle({ 
  value, 
  onChange, 
  placeholder = "프로젝트명 입력",
  className = "",
  inputClassName = "",
  size = "md"
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = tempValue.trim()
    if (trimmed) {
      onChange(trimmed)
    } else {
      setTempValue(value) // 빈 값이면 원래 값으로 복원
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setTempValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`bg-transparent border-b-2 border-primary focus:outline-none font-semibold w-full max-w-[180px] ${sizeClasses[size]} ${inputClassName}`}
        />
        <button
          onClick={handleSave}
          className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
        >
          <Check className="h-3.5 w-3.5 text-primary" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`group flex items-center gap-1.5 text-left hover:bg-muted/50 rounded-md px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors max-w-full ${className}`}
    >
      <span className={`font-semibold text-foreground truncate ${sizeClasses[size]}`}>
        {value || placeholder}
      </span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  )
}

