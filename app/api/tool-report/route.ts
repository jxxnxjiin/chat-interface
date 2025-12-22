// app/api/tool-recommendations/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { TOOL_REPORT_PROMPT } from "@/lib/prompts";

// API 키 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. 모델 설정 
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      systemInstruction: TOOL_REPORT_PROMPT,
    });

    // 2. History 포맷
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 3. Gemini 제약사항 처리: 대화의 시작은 반드시 'user'여야 함
    if (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

    // 4. 채팅 세션 시작 및 메시지 전송
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    
    // 5. 결과 반환 
    return NextResponse.json({ 
      content: result.response.text() 
    });

  } catch (error: any) {
    console.error("Tool Rec Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" }, 
      { status: 500 }
    );
  }
}