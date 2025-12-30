// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/data/prompts";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

const REPORT_DELIMITER = "---REPORT_START---";

// 타임아웃 방지 (Vercel: 최대 60초, Pro는 300초)
export const maxDuration = 60;

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
    const response = result.response;
    const text = response.text();

    console.log("DEBUG: Raw Gemini response received");

    // 구분자로 분리
    const parts = text.split(REPORT_DELIMITER);
    const reply = parts[0].trim();
    let report = null;

    if (parts.length > 1) {
      const reportText = parts[1].trim();
      try {
        report = JSON.parse(reportText);
        console.log("DEBUG: Parsed report:", JSON.stringify(report, null, 2));
      } catch (parseError) {
        console.warn("Report JSON parse failed:", parseError);
      }
    }

    // reply와 report를 분리하여 반환
    return NextResponse.json({
      reply: reply || "응답을 생성하지 못했습니다.",
      report: report || null,
    });

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
