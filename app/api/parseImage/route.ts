import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
// import { OpenAIStream, StreamingTextResponse } from "ai"

// export const dynamic = "force-dynamic"
export const runtime = "edge"

export async function POST(request: NextRequest) {

    try {
        console.log("openai image parse api hit")
        const body = await request.json()

        console.log(body);

        const openai = new OpenAI({
        apiKey: `${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
        })

        const image = body.image

        const res = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            // temperature: 0.3,
            messages: [
                {
                    role: "user",
                    
                    content: [
                        {
                            type: "text",
                            text: "Parse the image properly and provide the text written in the image. Your response should only contain the written text in the image"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image
                            }
                        }
                    ]
                }        
            ],
            max_tokens: 500
        })


        return new Response(
            JSON.stringify({
            success: true,
            message: res.choices[0].message.content,
            })
        )
    } catch (error: any) {
      console.log(error)
  
      return new NextResponse(
        JSON.stringify({
          message: error.message,
          success: false,
        })
      )
    }
}
