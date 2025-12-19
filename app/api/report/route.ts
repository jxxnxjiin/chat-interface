// app/api/report/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT 
    });

    // 대화 내역을 하나의 텍스트로 정리
    const chatHistory = messages
      .map((msg: any) => `${msg.role === "user" ? "사용자" : "AI"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `
다음은 사용자와 AI의 대화 내역입니다. 
이 내용을 바탕으로 시스템 프롬프트에 정의된 [프로젝트 정의서(Project Charter)] 양식에 맞춰 최종 보고서를 작성해주세요.
반드시 마크다운 형식을 사용하고, 대화에서 파악되지 않은 정보는 '추후 논의 필요' 또는 대화 내용을 바탕으로 최선의 추측을 하여 작성하십시오.

대화 내역:
${chatHistory}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ report: text });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ error: "보고서 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

