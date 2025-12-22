// app/api/report/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { REPORT_TEMPLATE } from "@/lib/prompts";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { messages, planData } = await req.json();
    if (!apiKey) return NextResponse.json({ error: "API Key Missing" }, { status: 500 });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 대화 내역을 텍스트로 변환
    const chatHistory = messages
      .map((msg: any) => `${msg.role === "user" ? "사용자" : "AI"}: ${msg.content}`)
      .join("\n\n");

    // 현재 기획안 데이터
    const currentPlan = planData ? `
현재까지 정리된 기획안:
- 기획 배경: ${planData.reason || "(미정)"}
- 목표: ${planData.goal || "(미정)"}
- 상세 계획: ${planData.detailedPlan || "(미정)"}
- 필요 자원: ${planData.resources || "(미정)"}
` : "";

    const prompt = `
당신은 비즈니스 문서 전문가입니다. 아래의 대화 내용과 기획안을 바탕으로, 
주어진 템플릿 양식에 맞춰 **승인 가능한 수준의 업무 정의서**를 작성해주세요.

${currentPlan}

[대화 내역]
${chatHistory}

[보고서 템플릿]
${REPORT_TEMPLATE}

[작성 지침]
1. 템플릿의 모든 항목을 빠짐없이 채워주세요.
2. 대화에서 언급되지 않은 내용은 합리적으로 추론하거나 "(추후 확정 필요)"로 표기하세요.
3. 마크다운 형식을 유지하며, 가독성 있게 작성하세요.
4. [프로젝트명]은 대화 내용에서 추론하여 적절한 이름으로 작성하세요.

위 내용을 바탕으로 완성된 보고서를 마크다운 형식으로 출력하세요.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Report generated successfully");

    return NextResponse.json({ report: responseText });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ 
      error: "보고서 생성 중 오류가 발생했습니다.", 
      details: error.message 
    }, { status: 500 });
  }
}
