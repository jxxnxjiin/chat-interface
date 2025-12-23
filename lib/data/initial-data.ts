import { Project, Task, GanttItem } from "./types"

/**
 * 예시용 초기 프로젝트 데이터
 * 실제 서비스에서는 localStorage나 DB에서 불러옴
 */
export const initialProjects: Project[] = [
  {
    id: "1",
    name: "신규 서비스 기획",
    status: "progress",
    createdAt: "2025-12-20",
    updatedAt: "2025-12-22",
  },
  {
    id: "2",
    name: "마케팅 캠페인 A",
    status: "initiation",
    createdAt: "2025-12-21",
    updatedAt: "2025-12-21",
  },
  {
    id: "3",
    name: "Q4 성과 보고서",
    status: "completion",
    createdAt: "2025-12-15",
    updatedAt: "2025-12-19",
  },
  {
    id: "4",
    name: "2024 연간 보고서",
    status: "archived",
    result: "success",
    createdAt: "2024-11-01",
    updatedAt: "2024-12-10",
  },
  {
    id: "5",
    name: "신규 기능 POC",
    status: "archived",
    result: "failure",
    createdAt: "2024-10-15",
    updatedAt: "2024-11-20",
  },
]

/**
 * 예시용 초기 할 일 데이터
 */
export const initialTasks: Task[] = [
  {
    id: "1",
    title: "미팅 내용 정리",
    completed: false,
    recommendedTool: { name: "Clova Note", icon: "🎙️", url: "#" }
  },
  {
    id: "2",
    title: "프로젝트 기획서 작성",
    completed: false,
    recommendedTool: { name: "Claude", icon: "💬", url: "#" }
  },
  {
    id: "3",
    title: "디자인 시안 작성",
    completed: true,
    recommendedTool: { name: "Midjourney", icon: "🎨", url: "#" }
  },
]

/**
 * 예시용 초기 간트 차트 데이터
 */
const today = new Date()
const formatDate = (date: Date) => date.toISOString().split("T")[0]

export const initialGanttItems: GanttItem[] = [
  {
    id: "1",
    title: "기획",
    startDate: formatDate(today),
    endDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
    color: "bg-blue-500"
  },
  {
    id: "2",
    title: "디자인",
    startDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
    color: "bg-purple-500"
  },
]
