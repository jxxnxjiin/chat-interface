// app/api/tool-recommendations/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { TOOL_RECOMMENDATION_PROMPT } from "@/lib/prompts";
import { toolRecommendationSchema } from "@/lib/schemas";

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
      systemInstruction: TOOL_RECOMMENDATION_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: toolRecommendationSchema,
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

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    const text = response.text();

    // JSON 파싱
    try {
      const parsedResponse = JSON.parse(text);

      // reply와 tools를 분리하여 반환
      return NextResponse.json({
        reply: parsedResponse.reply || "응답을 생성하지 못했습니다.",
        tools: parsedResponse.tools || [],
      });
    } catch (parseError) {
      // JSON 파싱 실패 시 원본 텍스트를 reply로 반환
      console.warn("JSON parse failed, returning raw text:", parseError);
      return NextResponse.json({ reply: text, tools: [] });
    }

  } catch (error: any) {
    console.error("Detailed Gemini API Error (Tool Recommendations):", error);

    const errorMessage = error.message?.includes("not found")
      ? "모델명을 찾을 수 없습니다"
      : "AI 응답 생성 중 오류가 발생했습니다.";

    return NextResponse.json({
      error: errorMessage,
      details: error.message
    }, { status: 500 });
  }
}
