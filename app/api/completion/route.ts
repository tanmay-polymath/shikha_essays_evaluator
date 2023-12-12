import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "edge"

export async function POST(req: Request) {
  const { prompt, link } = await req.json()
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: link,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  })
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
