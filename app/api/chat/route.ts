import { convertToModelMessages, streamText, consumeStream, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    console.log("[v0] Received messages:", JSON.stringify(messages, null, 2))

    const prompt = convertToModelMessages(messages)

    console.log("[v0] Converted prompt:", JSON.stringify(prompt, null, 2))

    const result = streamText({
      model: "google/gemini-2.5-flash",
      prompt,
      maxOutputTokens: 8192,
      temperature: 1.0,
      apiKey: process.env.GOOGLE_API_KEY,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
