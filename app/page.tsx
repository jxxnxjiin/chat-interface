"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  FolderOpen,
  CheckCircle2,
  Trash2,
  Archive,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Project } from "@/lib/types"
import { statusConfig } from "@/lib/data/project-constants"
import { initialProjects } from "@/lib/data/initial-data"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // localStorage에서 projects 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-projects")
      if (saved) {
        setProjects(JSON.parse(saved))
      }
      setIsLoaded(true)
    }
  }, [])

  // localStorage에 projects 저장 (초기 로드 완료 후에만)
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("chat-projects", JSON.stringify(projects))
    }
  }, [projects, isLoaded])

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      status: "initiation",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setProjects(prev => [newProject, ...prev])

    // 새로 생성한 프로젝트를 현재 프로젝트로 설정
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-current-project", JSON.stringify(newProject))
    }

    setNewProjectName("")
    setIsCreating(false)
  }

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  // 진행 중인 프로젝트 (archived 제외)
  const activeProjects = projects.filter(p => p.status !== "archived")
  // 완료된 프로젝트
  const archivedProjects = projects.filter(p => p.status === "archived")

  const projectsByStatus = {
    initiation: projects.filter(p => p.status === "initiation"),
    progress: projects.filter(p => p.status === "progress"),
    completion: projects.filter(p => p.status === "completion"),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">프로젝트 대시보드</h1>
              <p className="text-muted-foreground mt-1">프로젝트 별로 워크플로우를 관리하세요.</p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              새 프로젝트
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 새 프로젝트 생성 폼 */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-card rounded-xl border-2 border-primary/50 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">새 프로젝트 만들기</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                placeholder="프로젝트 이름을 입력하세요..."
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                만들기
              </Button>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                취소
              </Button>
            </div>
          </motion.div>
        )}

        {/* 프로젝트 통계 (archived 제외) */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["initiation", "progress", "completion"] as const).map((status) => {
            const config = statusConfig[status]
            const Icon = config.icon
            const count = projectsByStatus[status].length
            
            return (
              <div
                key={status}
                className="p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}/10`}>
                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 진행 중인 프로젝트 목록 */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            진행 중인 프로젝트 ({activeProjects.length})
          </h2>

          {activeProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 프로젝트가 없습니다.</p>
              <p className="text-sm mt-1">새 프로젝트를 만들어 시작하세요!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeProjects.map((project, index) => {
                const config = statusConfig[project.status]
                const Icon = config.icon
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={config.href}
                      onClick={() => {
                        // 현재 프로젝트 정보를 localStorage에 저장
                        if (typeof window !== "undefined") {
                          localStorage.setItem("chat-current-project", JSON.stringify(project))
                        }
                      }}
                    >
                      <div className="group p-5 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${config.color}/10`}>
                              <Icon className={`h-6 w-6 ${config.textColor}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {project.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}/10 ${config.textColor}`}>
                                  {config.label}
                                </span>
                                <span>생성: {project.createdAt}</span>
                                <span>수정: {project.updatedAt}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteProject(project.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* 완료된 프로젝트 (히스토리) */}
        {archivedProjects.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showArchived ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <Archive className="h-5 w-5" />
              완료된 프로젝트 ({archivedProjects.length})
            </button>

            <AnimatePresence>
              {showArchived && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-3"
                >
                  {archivedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group p-4 bg-muted/30 rounded-xl border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${project.result === "success" ? "bg-green-500/10" : "bg-orange-500/10"}`}>
                            {project.result === "success" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Archive className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-muted-foreground">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${
                                project.result === "success" 
                                  ? "bg-green-500/10 text-green-500" 
                                  : "bg-orange-500/10 text-orange-500"
                              }`}>
                                {project.result === "success" ? "성공" : "실패/보류"}
                              </span>
                              <span>완료: {project.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
