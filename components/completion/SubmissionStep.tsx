"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Upload } from "lucide-react"

export type SubmissionMethod = "ai" | "upload" | null

interface SubmissionStepProps {
  submissionMethod: SubmissionMethod
  onSelect: (method: SubmissionMethod) => void
  uploadedContent: string
  onUploadedContentChange: (content: string) => void
}

export function SubmissionStep({ 
  submissionMethod, 
  onSelect, 
  uploadedContent, 
  onUploadedContentChange 
}: SubmissionStepProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">결과물 제출 방식</h2>
        <p className="text-muted-foreground">리포트를 어떻게 작성하시겠습니까?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* AI 자동 생성 */}
        <button
          onClick={() => onSelect("ai")}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            submissionMethod === "ai"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className={`h-8 w-8 ${submissionMethod === "ai" ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xl font-semibold">AI 자동 생성</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Phase 1의 대화 내용과 프로젝트 정보를 바탕으로 AI가 자동으로 리포트를 생성합니다.
          </p>
        </button>

        {/* 직접 업로드 */}
        <button
          onClick={() => onSelect("upload")}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            submissionMethod === "upload"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Upload className={`h-8 w-8 ${submissionMethod === "upload" ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xl font-semibold">직접 업로드</span>
          </div>
          <p className="text-sm text-muted-foreground">
            직접 작성한 결과물이나 회고 내용을 입력하여 구조화된 리포트로 변환합니다.
          </p>
        </button>
      </div>

      {/* 직접 업로드 선택 시 텍스트 입력 영역 */}
      <AnimatePresence>
        {submissionMethod === "upload" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <label className="text-sm font-medium">결과물 / 회고 내용</label>
            <textarea
              value={uploadedContent}
              onChange={(e) => onUploadedContentChange(e.target.value)}
              placeholder="프로젝트 결과, 배운 점, 개선할 점 등을 자유롭게 작성해주세요..."
              className="w-full h-40 p-4 rounded-xl border border-border bg-muted/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

