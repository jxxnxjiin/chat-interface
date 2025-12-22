// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const apiKey = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

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
    });

    // 대화 내역(history) 설정
    // 구글 API 규칙: 첫 번째 메시지는 반드시 'user'여야 함
    // AI의 첫 인사를 제외하기 위해 첫 번째 메시지가 'model'이면 필터링하거나 무시합니다.
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 첫 번째 메시지가 'model'인 경우 제거
    if (history.length > 0 && history[0].role === "model") {
      history = history.slice(1);
    }
    
    const lastMessage = messages[messages.length - 1].content;

    console.log(`DEBUG: Sending message to Gemini. Validated History: ${history.length} items`);

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    // 구글 API에서 보낸 상세 에러 로그 출력
    console.error("Detailed Gemini API Error:", error);
    
    // 모델명 오류인 경우 사용자가 알 수 있게 메시지 구성
    const errorMessage = error.message?.includes("not found") 
      ? "모델명을 찾을 수 없습니다 (gemini-2.5-flash 확인 필요)" 
      : "AI 응답 생성 중 오류가 발생했습니다.";

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 500 });
  }
}
