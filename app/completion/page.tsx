"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepNavigation, SlidePanel } from "@/components/shared"
import { 
  EvaluationStep, 
  SubmissionStep, 
  ReportStep,
  ProjectResult,
  SubmissionMethod 
} from "@/components/completion"
import { generateSuccessReport, generateFailureReport } from "@/lib/data/report-templates"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type WizardStep = 1 | 2 | 3

export default function CompletionPage() {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [projectResult, setProjectResult] = useState<ProjectResult>(null)
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>(null)
  const [uploadedContent, setUploadedContent] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReportPanel, setShowReportPanel] = useState(false)

  const canProceedToStep2 = projectResult !== null
  const canProceedToStep3 = 
    submissionMethod === "ai" || 
    (submissionMethod === "upload" && (uploadedContent.trim() !== "" || uploadedFile !== null))

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
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const report = projectResult === "success" 
      ? generateSuccessReport()
      : generateFailureReport()
    
    setGeneratedReport(report)
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
        <StepNavigation currentStep={4} />
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
            {wizardStep === 1 && (
              <EvaluationStep 
                projectResult={projectResult} 
                onSelect={setProjectResult} 
              />
            )}

            {wizardStep === 2 && (
              <SubmissionStep
                submissionMethod={submissionMethod}
                onSelect={setSubmissionMethod}
                uploadedContent={uploadedContent}
                onUploadedContentChange={setUploadedContent}
                uploadedFile={uploadedFile}
                onUploadedFileChange={setUploadedFile}
              />
            )}

            {wizardStep === 3 && (
              <ReportStep
                projectResult={projectResult}
                submissionMethod={submissionMethod}
                isGenerating={isGenerating}
                hasGeneratedReport={!!generatedReport}
                onGenerate={handleGenerateReport}
                onViewReport={() => setShowReportPanel(true)}
                onDownload={handleDownloadReport}
              />
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

      {/* Report Panel */}
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
