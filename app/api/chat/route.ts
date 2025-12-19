import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "google/gemini-4-flash-thinking-preview",
    prompt,
    maxOutputTokens: 8192,
    temperature: 1.0,
  })

  return result.toUIMessageStreamResponse()
}
