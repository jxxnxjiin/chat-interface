// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Critical: GOOGLE_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    console.log("Received messages count:", messages?.length);

    if (!apiKey) {
      return NextResponse.json({ error: "서버 설정 오류: API 키가 없습니다." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 대화 내역(history) 설정
    const history = (messages || []).slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    
    const lastMessage = messages[messages.length - 1].content;

    console.log("Starting chat with history length:", history.length);

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response success");
    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Gemini API Detailed Error:", error);
    return NextResponse.json({ 
      error: "메시지 생성 중 오류가 발생했습니다.",
      details: error.message 
    }, { status: 500 });
  }
}
