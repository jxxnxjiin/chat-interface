"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Lightbulb, AlertTriangle } from "lucide-react"

export type ProjectResult = "success" | "failure" | null

interface EvaluationStepProps {
  projectResult: ProjectResult
  onSelect: (result: ProjectResult) => void
}

export function EvaluationStep({ projectResult, onSelect }: EvaluationStepProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">프로젝트 결과 평가</h2>
        <p className="text-muted-foreground">이 프로젝트의 최종 결과는 어떠셨나요?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 성공 카드 */}
        <button
          onClick={() => onSelect("success")}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            projectResult === "success"
              ? "border-green-500 bg-green-500/10"
              : "border-border hover:border-green-500/50 hover:bg-green-500/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className={`h-8 w-8 ${projectResult === "success" ? "text-green-500" : "text-muted-foreground"}`} />
            <span className="text-xl font-semibold">성공</span>
          </div>
          <p className="text-sm text-muted-foreground">
            목표를 달성했습니다. 성공 요인을 분석하고 자산화합니다.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
            <Lightbulb className="h-4 w-4" />
            <span>프롬프트 · 템플릿 · 프로세스 추출</span>
          </div>
        </button>

        {/* 실패 카드 */}
        <button
          onClick={() => onSelect("failure")}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            projectResult === "failure"
              ? "border-orange-500 bg-orange-500/10"
              : "border-border hover:border-orange-500/50 hover:bg-orange-500/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <XCircle className={`h-8 w-8 ${projectResult === "failure" ? "text-orange-500" : "text-muted-foreground"}`} />
            <span className="text-xl font-semibold">실패 / 보류</span>
          </div>
          <p className="text-sm text-muted-foreground">
            목표 달성에 실패했거나 보류되었습니다. 원인을 분석합니다.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Lessons Learned 리포트 작성</span>
          </div>
        </button>
      </div>
    </motion.div>
  )
}

