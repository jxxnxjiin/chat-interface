// app/api/custom-tool-recommendations/route.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

// JSON 응답 스키마 정의 (기존 tool-recommendations와 동일)
const responseSchema = {
  type: SchemaType.OBJECT as const,
  properties: {
    tools: {
      type: SchemaType.ARRAY as const,
      description: "프로젝트에 필요한 도구 목록",
      items: {
        type: SchemaType.OBJECT as const,
        properties: {
          tool_name: { type: SchemaType.STRING as const, description: "도구 이름" },
          description: { type: SchemaType.STRING as const, description: "도구에 대한 1-2문장 설명" },
          url: { type: SchemaType.STRING as const, description: "도구의 공식 웹사이트 URL만 입력 (설명 제외, 모를 경우 빈 문자열)" },
          category: { type: SchemaType.STRING as const, description: "도구 카테고리 (예: 프로젝트 관리, 디자인, 개발, 협업 등)" },
        },
        required: ["tool_name", "description", "category"],
      },
    },
  },
  required: ["tools"],
};

// 시스템 프롬프트
const CUSTOM_TOOL_RECOMMENDATION_PROMPT = `
# Role
당신은 **프로젝트 맞춤형 도구 추천 전문가**입니다. 사용자의 프로젝트 정보를 분석하여 실제로 유용한 도구들을 추천하는 것이 당신의 임무입니다.

# Task
사용자가 제공한 프로젝트 기획안, 일정, TO-DO 리스트를 바탕으로 **프로젝트 수행에 필요한 도구 5-10개**를 추천하세요.

# Recommendation Logic
1. **프로젝트 성격 파악**: 기획안에서 프로젝트의 성격(개발, 디자인, 마케팅, 콘텐츠 제작 등)을 파악
2. **업무 단계 고려**: 간트차트의 업무 항목들을 보고 어떤 단계의 도구가 필요한지 판단
3. **실용성 우선**: 실제로 존재하고 널리 사용되는 도구만 추천
4. **카테고리 다양성**: 프로젝트 관리, 디자인, 개발, 협업, 문서작성 등 다양한 카테고리의 도구를 균형있게 추천

# Output Format
- 'tools' 배열에 추천 도구 목록을 담아 반환
- 각 도구는 tool_name, description, url, category 필드를 포함
- category는 한국어로 작성 (예: "프로젝트 관리", "디자인", "개발", "협업")
- URL은 정확히 알고 있을 때만 포함

# Important Notes
- 한국어 지원이 좋은 도구를 우선 고려
- 무료 또는 저렴한 도구를 먼저 추천
- 최신 AI 도구도 적극 추천
- 도구 설명은 "왜 이 프로젝트에 적합한지" 중심으로 작성
`;

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
        responseSchema: responseSchema,
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
