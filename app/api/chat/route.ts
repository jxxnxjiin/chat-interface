import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  console.log("[v0] API route called")

  try {
    const { messages }: { messages: UIMessage[] } = await req.json()
    console.log("[v0] Messages received:", messages.length)

    const prompt = convertToModelMessages(messages)

    const result = streamText({
      model: "google/gemini-2.5-flash-image",
      prompt,
      maxOutputTokens: 8192,
      temperature: 1.0,
      apiKey: process.env.GOOGLE_API_KEY,
    })

    console.log("[v0] Streaming response started")
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] API Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
