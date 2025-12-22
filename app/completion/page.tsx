"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Upload, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  Download,
  BookOpen,
  Lightbulb,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepNavigation, SlidePanel } from "@/components/shared"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ProjectResult = "success" | "failure" | null
type SubmissionMethod = "ai" | "upload" | null
type WizardStep = 1 | 2 | 3

export default function CompletionPage() {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [projectResult, setProjectResult] = useState<ProjectResult>(null)
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>(null)
  const [uploadedContent, setUploadedContent] = useState("")
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReportPanel, setShowReportPanel] = useState(false)

  const canProceedToStep2 = projectResult !== null
  const canProceedToStep3 = submissionMethod !== null

  const handleNextStep = () => {
    if (wizardStep === 1 && canProceedToStep2) {
      setWizardStep(2)
    } else if (wizardStep === 2 && canProceedToStep3) {
      setWizardStep(3)
    }
  }

  const handlePrevStep = () => {
    if (wizardStep === 2) {
      setWizardStep(1)
    } else if (wizardStep === 3) {
      setWizardStep(2)
    }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    
    // TODO: 실제 AI API 연동
    // 임시로 딜레이 후 샘플 리포트 생성
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const sampleReport = projectResult === "success" 
      ? generateSuccessReport()
      : generateFailureReport()
    
    setGeneratedReport(sampleReport)
    setIsGenerating(false)
    setShowReportPanel(true)
  }

  const handleDownloadReport = () => {
    if (!generatedReport) return
    
    const blob = new Blob([generatedReport], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${projectResult === "success" ? "success_report" : "lessons_learned"}_${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-center px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <StepNavigation currentStep={3} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Wizard Progress */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    wizardStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-sm font-semibold">{step}</span>
                </div>
                <span className={`hidden sm:inline text-sm ${wizardStep >= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {step === 1 && "평가"}
                  {step === 2 && "제출 방식"}
                  {step === 3 && "리포트"}
                </span>
                {step < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {/* Step 1: 프로젝트 결과 평가 */}
            {wizardStep === 1 && (
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
                    onClick={() => setProjectResult("success")}
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
                    onClick={() => setProjectResult("failure")}
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
            )}

            {/* Step 2: 제출 방식 선택 */}
            {wizardStep === 2 && (
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
                    onClick={() => setSubmissionMethod("ai")}
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
                    onClick={() => setSubmissionMethod("upload")}
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
                        onChange={(e) => setUploadedContent(e.target.value)}
                        placeholder="프로젝트 결과, 배운 점, 개선할 점 등을 자유롭게 작성해주세요..."
                        className="w-full h-40 p-4 rounded-xl border border-border bg-muted/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 3: 리포트 생성 */}
            {wizardStep === 3 && (
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
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    {isGenerating ? "리포트 생성 중..." : "리포트 생성하기"}
                  </Button>
                </div>

                {/* 생성된 리포트가 있으면 보기 버튼 */}
                {generatedReport && (
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => setShowReportPanel(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      리포트 보기
                    </Button>
                    <Button variant="outline" onClick={handleDownloadReport}>
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <Button
              variant="ghost"
              onClick={handlePrevStep}
              disabled={wizardStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            
            {wizardStep < 3 && (
              <Button
                onClick={handleNextStep}
                disabled={
                  (wizardStep === 1 && !canProceedToStep2) ||
                  (wizardStep === 2 && !canProceedToStep3)
                }
                className="gap-2"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Report Panel (SlidePanel 재사용) */}
      <AnimatePresence>
        {showReportPanel && generatedReport && (
          <SlidePanel
            isOpen={showReportPanel}
            onClose={() => setShowReportPanel(false)}
            title={projectResult === "success" ? "성공 리포트" : "Lessons Learned"}
            titleIcon={<FileText className="h-5 w-5" />}
            headerActions={
              <Button onClick={handleDownloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            }
          >
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedReport}
              </ReactMarkdown>
            </div>
          </SlidePanel>
        )}
      </AnimatePresence>
    </div>
  )
}

// 임시 샘플 리포트 생성 함수들
function generateSuccessReport(): string {
  return `# 🎉 프로젝트 성공 리포트

## 📊 프로젝트 개요
| 항목 | 내용 |
|------|------|
| **프로젝트명** | [프로젝트명] |
| **기간** | 2024.12.01 ~ 2024.12.22 |
| **결과** | ✅ 성공 |

---

## ✨ 성공 요인 분석

### 1. 명확한 목표 설정
- 초기 단계에서 구체적인 KPI와 성공 기준을 정의함
- 모든 팀원이 동일한 목표를 공유함

### 2. 효과적인 AI 활용
- 적절한 프롬프트 엔지니어링으로 원하는 결과물 도출
- 반복적인 피드백을 통한 결과물 개선

### 3. 체계적인 프로세스
- 단계별 진행 상황 관리
- 정기적인 검토 및 수정

---

## 💡 추출된 프롬프트 자산

### 효과적이었던 프롬프트 패턴
\`\`\`
[역할 부여] + [구체적 맥락] + [원하는 출력 형식] + [제약 조건]
\`\`\`

---

## 📚 SOP 등록 대상

- [ ] 프로젝트 킥오프 템플릿
- [ ] AI 프롬프트 가이드라인
- [ ] 결과물 검토 체크리스트

---

*생성 시각: ${new Date().toLocaleString("ko-KR")}*
`
}

function generateFailureReport(): string {
  return `# 📝 Lessons Learned 리포트

## 📊 프로젝트 개요
| 항목 | 내용 |
|------|------|
| **프로젝트명** | [프로젝트명] |
| **기간** | 2024.12.01 ~ 2024.12.22 |
| **결과** | ❌ 실패/보류 |

---

## 🔍 실패 원인 분석 (Root Cause Analysis)

### 1. 목표 설정 문제
- **현상**: 프로젝트 범위가 명확하지 않았음
- **원인**: 초기 요구사항 분석 부족
- **영향**: 방향성 혼란, 리소스 낭비

### 2. 일정 관리 문제
- **현상**: 예정된 마감일을 지키지 못함
- **원인**: 작업량 과소 추정
- **영향**: 품질 저하, 팀 피로도 증가

### 3. 커뮤니케이션 문제
- **현상**: 이해관계자 간 기대치 불일치
- **원인**: 정기적인 싱크 미팅 부재
- **영향**: 최종 결과물 불만족

---

## 📚 Lessons Learned

### 반드시 기억해야 할 것
1. **범위 정의를 먼저, 확실하게** - Out-of-Scope을 명시적으로 정의
2. **버퍼 타임 확보** - 예상 일정의 20% 이상 여유 확보
3. **주간 체크인 필수** - 이해관계자와의 정기 미팅 설정

### 다음에는 다르게 할 것
- 프로젝트 시작 전 체크리스트 작성
- 중간 점검 마일스톤 설정
- 위험 요소 사전 식별 및 대응 계획 수립

---

## 💡 개선 권장 사항

| 영역 | 현재 | 개선 방향 |
|------|------|----------|
| 기획 | 구두 합의 | 문서화된 PRD 작성 |
| 일정 | 단일 마감일 | 단계별 마일스톤 |
| 소통 | 필요시 연락 | 정기 미팅 설정 |

---

*생성 시각: ${new Date().toLocaleString("ko-KR")}*
`
}

