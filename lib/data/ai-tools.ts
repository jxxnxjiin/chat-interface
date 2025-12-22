import { ToolCategory } from "@/lib/types"

export const toolCategories: ToolCategory[] = [
  {
    type: "자료 조사",
    icon: "🔍",
    tools: [
      { name: "Perplexity", desc: "출처 기반 검색에 최적화", url: "https://perplexity.ai" },
      { name: "Gemini", desc: "구글 검색 연동 AI", url: "https://gemini.google.com" },
    ]
  },
  {
    type: "문서 작성",
    icon: "📝",
    tools: [
      { name: "ChatGPT", desc: "구조화된 문서 작성", url: "https://chat.openai.com" },
      { name: "Claude", desc: "긴 문서 분석 및 작문", url: "https://claude.ai" },
    ]
  },
  {
    type: "디자인",
    icon: "🎨",
    tools: [
      { name: "Midjourney", desc: "이미지 생성", url: "https://midjourney.com" },
      { name: "Canva AI", desc: "간편한 디자인 제작", url: "https://canva.com" },
    ]
  },
  {
    type: "데이터 분석",
    icon: "📊",
    tools: [
      { name: "ChatGPT ADA", desc: "Advanced Data Analysis", url: "https://chat.openai.com" },
    ]
  },
  {
    type: "회의록 정리",
    icon: "🎙️",
    tools: [
      { name: "Clova Note", desc: "음성 회의록 자동 정리", url: "https://clovanote.naver.com" },
      { name: "Zoom AI", desc: "회의 요약 기능", url: "https://zoom.us" },
    ]
  },
]

// 할 일 추가 시 선택 가능한 도구 목록 (평탄화)
export const selectableTools = toolCategories.flatMap(category => 
  category.tools.map(tool => ({
    name: tool.name,
    icon: category.icon,
    url: tool.url,
    category: category.type,
  }))
)
