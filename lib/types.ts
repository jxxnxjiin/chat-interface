// 공통 타입 정의

// 채팅 메시지
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// 할 일
export interface Task {
  id: string
  title: string
  completed: boolean
  recommendedTool?: {
    name: string
    icon: string
    url: string
  }
}

export interface ToolCategory {
  type: string
  icon: string
  tools: {
    name: string
    desc: string
    url: string
  }[]
}

export type MenuItem = "timeline" | "today" | "ai-tools"

