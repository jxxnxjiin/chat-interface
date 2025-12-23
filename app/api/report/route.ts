// app/api/report/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { REPORT_TEMPLATE } from "@/lib/prompts";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, planData } = body;

    if (!apiKey) {
      console.error("ERROR: GOOGLE_API_KEY is missing");
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "대화 내역이 필요합니다." }, { status: 400 });
    }

    // 시스템 프롬프트: 템플릿과 역할 정의
    const systemInstruction = `당신은 업무 정의서 작성 전문가입니다.

사용자와의 대화 내역과 현재 기획안을 바탕으로 다음 템플릿에 맞춰 완성된 보고서를 작성하세요:

${REPORT_TEMPLATE}

**작성 규칙:**
1. 모든 섹션을 구체적이고 실행 가능하게 작성하세요.
2. 대화에서 언급된 내용을 최대한 반영하세요.
3. 정보가 부족한 부분은 대화 맥락에서 합리적으로 추론하세요.
4. 추론이 불가능한 경우에만 '[추가 논의 필요]'로 표시하세요.
5. 전문적이고 간결한 비즈니스 문서 톤을 유지하세요.
6. 마크다운 형식을 정확히 따르세요.`;

    // 유저 프롬프트: 실제 데이터
    const conversationHistory = messages
      .map((m: any) => `**${m.role === 'user' ? '사용자' : 'AI'}**: ${m.content}`)
      .join('\n\n');

    const userPrompt = `다음 정보를 바탕으로 업무 정의서를 작성해주세요:

## 대화 내역
${conversationHistory}

## 현재 기획안 데이터
- **기획 배경**: ${planData?.reason || '(미정)'}
- **목표**: ${planData?.goal || '(미정)'}
- **상세 계획**: ${planData?.detailedPlan || '(미정)'}
- **필요 자원**: ${planData?.resources || '(미정)'}

위 내용을 종합하여 완성된 마크다운 형식의 업무 정의서를 작성해주세요.`;

    console.log("DEBUG: Generating report with Gemini...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const result = await model.generateContent(userPrompt);
    const report = result.response.text();

    console.log("DEBUG: Report generated successfully");

    return NextResponse.json({ report });

  } catch (error: any) {
    console.error("Detailed Report API Error:", error);

    const errorMessage = error.message?.includes("not found")
      ? "모델명을 찾을 수 없습니다"
      : "보고서 생성 중 오류가 발생했습니다.";

    return NextResponse.json({
      error: errorMessage,
      details: error.message
    }, { status: 500 });
  }
}