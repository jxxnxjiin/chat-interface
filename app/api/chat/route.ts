// app/api/chat/route.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

// JSON 응답 스키마 정의
const responseSchema = {
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
  required: ["reply"],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!apiKey) {
      console.error("ERROR: GOOGLE_API_KEY is missing");
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // 대화 내역(history) 설정
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 첫 번째 메시지가 'model'인 경우 제거
    if (history.length > 0 && history[0].role === "model") {
      history = history.slice(1);
    }
    
    const lastMessage = messages[messages.length - 1].content;

    console.log(`DEBUG: Sending message to Gemini. History: ${history.length} items`);

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    // console.log("DEBUG: Raw Gemini response:", text);

    // JSON 파싱
    try {
      const parsedResponse = JSON.parse(text);
      
      // reply와 report를 분리하여 반환
      return NextResponse.json({
        reply: parsedResponse.reply || "응답을 생성하지 못했습니다.",
        report: parsedResponse.report || null,
      });
    } catch (parseError) {
      // JSON 파싱 실패 시 원본 텍스트를 reply로 반환
      console.warn("JSON parse failed, returning raw text:", parseError);
      return NextResponse.json({ reply: text, report: null });
    }

  } catch (error: any) {
    console.error("Detailed Gemini API Error:", error);
    
    const errorMessage = error.message?.includes("not found") 
      ? "모델명을 찾을 수 없습니다" 
      : "AI 응답 생성 중 오류가 발생했습니다.";

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 500 });
  }
}
