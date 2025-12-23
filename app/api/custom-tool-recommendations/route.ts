// app/api/custom-tool-recommendations/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { CUSTOM_TOOL_RECOMMENDATION_PROMPT } from "@/lib/data/prompts";
import { customToolRecommendationSchema } from "@/lib/schemas";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planData, ganttItems, tasks } = body;

    if (!apiKey) {
      console.error("ERROR: GOOGLE_API_KEY is missing");
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    // 프로젝트 컨텍스트 생성
    const contextParts = [];

    if (planData) {
      contextParts.push("## 📋 프로젝트 기획안");
      if (planData.reason) contextParts.push(`**배경**: ${planData.reason}`);
      if (planData.goal) contextParts.push(`**목표**: ${planData.goal}`);
      if (planData.detailedPlan) contextParts.push(`**계획**: ${planData.detailedPlan}`);
      if (planData.resources) contextParts.push(`**필요 자원**: ${planData.resources}`);
    }

    if (ganttItems && ganttItems.length > 0) {
      contextParts.push("\n## 📅 프로젝트 일정");
      contextParts.push(`총 ${ganttItems.length}개의 업무가 예정되어 있습니다:`);
      ganttItems.slice(0, 10).forEach((item: any) => {
        contextParts.push(`- ${item.title} (${item.startDate} ~ ${item.endDate})`);
      });
    }

    if (tasks && tasks.length > 0) {
      contextParts.push("\n## ✅ 현재 TO-DO");
      tasks.slice(0, 10).forEach((task: any) => {
        contextParts.push(`- ${task.title} ${task.completed ? "(완료)" : ""}`);
      });
    }

    const context = contextParts.join("\n");

    const prompt = `다음은 사용자의 프로젝트 정보입니다:

${context}

위 프로젝트를 성공적으로 수행하기 위해 필요한 도구 5-10개를 추천해주세요. 각 도구가 왜 이 프로젝트에 적합한지 설명해주세요.`;

    console.log("DEBUG: Generating custom tool recommendations...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: CUSTOM_TOOL_RECOMMENDATION_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: customToolRecommendationSchema,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("DEBUG: Custom tool recommendations generated");

    // JSON 파싱
    try {
      const parsedResponse = JSON.parse(text);
      return NextResponse.json({
        tools: parsedResponse.tools || [],
      });
    } catch (parseError) {
      console.warn("JSON parse failed:", parseError);
      return NextResponse.json({ tools: [] });
    }

  } catch (error: any) {
    console.error("Detailed API Error (Custom Tool Recommendations):", error);

    const errorMessage = error.message?.includes("not found")
      ? "모델명을 찾을 수 없습니다"
      : "AI 응답 생성 중 오류가 발생했습니다.";

    return NextResponse.json({
      error: errorMessage,
      details: error.message
    }, { status: 500 });
  }
}
