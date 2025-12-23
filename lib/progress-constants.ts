import { MenuItem } from "./types"

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
