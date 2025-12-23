import {
  PlayCircle,
  Clock,
  FileCheck,
  Archive,
  LucideIcon
} from "lucide-react"
import { MenuItem } from "./types"

export type ProjectStatus = "initiation" | "progress" | "completion" | "archived"

interface StatusConfig {
  label: string
  color: string
  textColor: string
  icon: LucideIcon
  href: string
}

export const statusConfig: Record<ProjectStatus, StatusConfig> = {
  initiation: {
    label: "Initiation",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    icon: PlayCircle,
    href: "/initiation",
  },
  progress: {
    label: "In Progress",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    icon: Clock,
    href: "/progress",
  },
  completion: {
    label: "Completion",
    color: "bg-purple-500",
    textColor: "text-purple-500",
    icon: FileCheck,
    href: "/completion",
  },
  archived: {
    label: "완료됨",
    color: "bg-gray-500",
    textColor: "text-gray-500",
    icon: Archive,
    href: "#", // archived는 클릭해도 이동 안 함
  },
}

interface MenuItemConfig {
  id: MenuItem
  label: string
}

/**
 * Progress 페이지 탭 메뉴 아이템
 */
export const menuItems: MenuItemConfig[] = [
  { id: "timeline", label: "프로젝트 타임라인" },
  { id: "custom-recommendations", label: "맞춤 추천" },
  { id: "tool-search", label: "도구 검색" },
]
