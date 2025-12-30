/**
 * LocalStorage 유틸리티 함수들
 */

/**
 * 현재 프로젝트 ID 가져오기
 */
export function getCurrentProjectId(): string {
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

/**
 * localStorage에서 JSON 데이터 가져오기
 * @param key - localStorage 키
 * @param defaultValue - 기본값 (데이터가 없을 때 반환)
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved) as T
    }
  } catch (e) {
    console.error(`Failed to get storage item: ${key}`, e)
  }

  return defaultValue
}

/**
 * localStorage에 JSON 데이터 저장하기
 * @param key - localStorage 키
 * @param value - 저장할 값
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to set storage item: ${key}`, e)
  }
}

/**
 * 프로젝트별 storage 키 생성
 * @param projectId - 프로젝트 ID
 * @param key - 키 이름
 */
export function getProjectStorageKey(projectId: string, key: string): string {
  return `chat-${projectId}-${key}`
}

/**
 * 프로젝트별 데이터 가져오기
 * @param key - 키 이름 (프로젝트 ID는 자동으로 추가됨)
 * @param defaultValue - 기본값
 */
export function getProjectStorageItem<T>(key: string, defaultValue: T): T {
  const projectId = getCurrentProjectId()
  const storageKey = getProjectStorageKey(projectId, key)
  return getStorageItem(storageKey, defaultValue)
}

/**
 * 프로젝트별 데이터 저장하기
 * @param key - 키 이름 (프로젝트 ID는 자동으로 추가됨)
 * @param value - 저장할 값
 */
export function setProjectStorageItem<T>(key: string, value: T): void {
  const projectId = getCurrentProjectId()
  const storageKey = getProjectStorageKey(projectId, key)
  setStorageItem(storageKey, value)
}

/**
 * 프로젝트별로 사용되는 모든 스토리지 키 목록
 */
const PROJECT_STORAGE_KEYS = [
  "initiation-messages",
  "initiation-planData",
  "progress-tasks",
  "progress-gantt",
  "custom-tools",
  "tool-search-messages",
  "tool-search-tools",
] as const

/**
 * 프로젝트의 모든 데이터 삭제
 * @param projectId - 삭제할 프로젝트 ID
 */
export function deleteProjectData(projectId: string): void {
  if (typeof window === "undefined") return

  try {
    PROJECT_STORAGE_KEYS.forEach((key) => {
      const storageKey = getProjectStorageKey(projectId, key)
      localStorage.removeItem(storageKey)
    })
  } catch (e) {
    console.error(`Failed to delete project data: ${projectId}`, e)
  }
}

/**
 * 프로젝트의 모든 데이터 복사
 * @param sourceProjectId - 원본 프로젝트 ID
 * @param targetProjectId - 대상 프로젝트 ID
 */
export function copyProjectData(
  sourceProjectId: string,
  targetProjectId: string
): void {
  if (typeof window === "undefined") return

  try {
    PROJECT_STORAGE_KEYS.forEach((key) => {
      const sourceKey = getProjectStorageKey(sourceProjectId, key)
      const targetKey = getProjectStorageKey(targetProjectId, key)

      const data = localStorage.getItem(sourceKey)
      if (data) {
        localStorage.setItem(targetKey, data)
      }
    })
  } catch (e) {
    console.error(
      `Failed to copy project data from ${sourceProjectId} to ${targetProjectId}`,
      e
    )
  }
}
