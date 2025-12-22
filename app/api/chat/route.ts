// app/api/chat/route.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, REPORT_TEMPLATE } from "@/lib/prompts";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

<<<<<<< HEAD
// 1. 반환받을 JSON의 구조(Schema)를 정의합니다.
const schema = {
  description: "Chat response and report updates",
=======
// JSON 응답 스키마 정의
const responseSchema = {
>>>>>>> 53b65b0db487f30eb459750411c61e5536bab84b
  type: SchemaType.OBJECT as const,
  properties: {
    reply: {
      type: SchemaType.STRING as const,
      description: "사용자에게 보여줄 대화 답변",
    },
    report: {
      type: SchemaType.OBJECT as const,
      description: "실시간 기획안에 반영할 데이터",
      properties: {
        reason: { type: SchemaType.STRING as const, description: "기획 배경" },
        goal: { type: SchemaType.STRING as const, description: "목표" },
        detailedPlan: { type: SchemaType.STRING as const, description: "상세 계획" },
        resources: { type: SchemaType.STRING as const, description: "필요 자원" },
      },
    },
  },
  required: ["reply"], // reply는 필수, report는 선택적으로 생성 가능
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!apiKey) return NextResponse.json({ error: "API Key Missing" }, { status: 500 });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // 최신 모델
      systemInstruction: SYSTEM_PROMPT,
      // 2. 생성 설정에 JSON 모드와 스키마를 추가합니다.
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // 히스토리 구성 (기존 코드 로직 유지)
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    if (history.length > 0 && history[0].role === "model") history = history.slice(1);

    const lastMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    
    // 3. 결과값을 파싱하여 JSON으로 반환합니다.
    const responseText = result.response.text();
    console.log("Raw Gemini Response:", responseText); // 디버깅용 로그
    
    const parsedResponse = JSON.parse(responseText);

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    console.error("Error details:", error.message);
    return NextResponse.json({ 
      error: "에러가 발생했습니다.", 
      details: error.message 
    }, { status: 500 });
  }
}