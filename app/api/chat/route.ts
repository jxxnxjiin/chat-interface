import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

// Google AI SDK 설정
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

const google = createGoogleGenerativeAI({
  apiKey: apiKey || "",
})

export async function POST(req: Request) {
  try {
    // 1. API 키 확인
    if (!apiKey) {
      console.error("DEBUG: GOOGLE_API_KEY is missing")
      return new Response(JSON.stringify({ error: "API key is missing on server" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 2. Request body 파싱 및 검증
    const body = await req.json()
    console.log("DEBUG: Received body:", JSON.stringify(body))

    const { messages } = body

    // messages가 없거나 배열이 아닌 경우 처리
    if (!messages || !Array.isArray(messages)) {
      console.error("DEBUG: messages is not an array:", messages)
      return new Response(JSON.stringify({ 
        error: "Invalid request format", 
        details: "messages must be an array" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("DEBUG: Received messages count:", messages.length)

    // 3. 스트리밍 실행
    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    // 4. 상세 에러 로깅
    console.error("DEBUG: Detailed API Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    })
    
    return new Response(JSON.stringify({ 
      error: "AI SDK Error", 
      details: error.message,
      name: error.name,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
