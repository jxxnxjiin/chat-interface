"use client"

import { motion } from "framer-motion"
import { 
  Sparkles, 
  FileText, 
  Download, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectResult } from "./EvaluationStep"
import { SubmissionMethod } from "./SubmissionStep"

interface ReportStepProps {
  projectResult: ProjectResult
  submissionMethod: SubmissionMethod
  isGenerating: boolean
  hasGeneratedReport: boolean
  onGenerate: () => void
  onViewReport: () => void
  onDownload: () => void
}

export function ReportStep({
  projectResult,
  submissionMethod,
  isGenerating,
  hasGeneratedReport,
  onGenerate,
  onViewReport,
  onDownload,
}: ReportStepProps) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {projectResult === "success" ? "🎉 성공 리포트 생성" : "📝 Lessons Learned 리포트"}
        </h2>
        <p className="text-muted-foreground">
          {projectResult === "success" 
            ? "성공 요인을 분석하고 자산화합니다"
            : "실패 원인을 분석하고 개선 가이드를 작성합니다"}
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">선택 요약</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">프로젝트 결과:</span>
            <span className={`ml-2 font-medium ${projectResult === "success" ? "text-green-500" : "text-orange-500"}`}>
              {projectResult === "success" ? "✅ 성공" : "❌ 실패/보류"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">제출 방식:</span>
            <span className="ml-2 font-medium">
              {submissionMethod === "ai" ? "🤖 AI 자동 생성" : "📤 직접 업로드"}
            </span>
          </div>
        </div>
      </div>

      {/* 생성될 항목 미리보기 */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">생성될 리포트 항목</h3>
        <div className="space-y-3">
          {projectResult === "success" ? (
            <>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span>성공 요인 분석 (Success Factors)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Lightbulb className="h-5 w-5 text-green-500" />
                <span>효과적인 프롬프트 추출</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-5 w-5 text-green-500" />
                <span>재사용 가능한 템플릿/프로세스</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>실패 원인 분석 (Root Cause Analysis)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-5 w-5 text-orange-500" />
                <span>Lessons Learned 정리</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Lightbulb className="h-5 w-5 text-orange-500" />
                <span>개선 가이드 및 권장 사항</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={isGenerating}
          className="gap-2"
        >
          <Sparkles className="h-5 w-5" />
          {isGenerating ? "리포트 생성 중..." : "리포트 생성하기"}
        </Button>
      </div>

      {/* 생성된 리포트가 있으면 보기 버튼 */}
      {hasGeneratedReport && (
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onViewReport}>
            <FileText className="h-4 w-4 mr-2" />
            리포트 보기
          </Button>
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            다운로드
          </Button>
        </div>
      )}
    </motion.div>
  )
}

