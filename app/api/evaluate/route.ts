import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { CriticalThinking, Communication, Creativity, Cognitive, Collaboration, Character } from "@/app/utils/data"

// export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("openai api hit")
    const body = await request.json()

    const mssg: string = body.message
    const reqSkill: string = body.skill

    const openai = new OpenAI({
      apiKey: `${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
    })

    // console.log(reqSkill);
    // console.log(`${(reqSkill == "CriticalThinking")? CriticalThinking.skill_name: reqSkill == "Communication"? Communication.skill_name: reqSkill == "Creativity"? Creativity.skill_name: reqSkill == "Cognitive"? Cognitive.skill_name: reqSkill == "Collaboration"? Collaboration.skill_name: Character.skill_name}`);

    const currSkillObj = (reqSkill == "CriticalThinking")? CriticalThinking: reqSkill == "Communication"? Communication: reqSkill == "Creativity"? Creativity: reqSkill == "Cognitive"? Cognitive: reqSkill == "Collaboration"? Collaboration: Character

    // console.log(`${currSkillObj["sub skills"]}`);
    // console.log("------------------------------------------------------------");
    // console.log(currSkillObj.skill_name);
    // currSkillObj["sub skills"].forEach((val) => {console.log(val)})

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      // temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an expert Teaching assistant",
        },
        {
          role: "user",
          content: `You have to analyse and access student's assignment. In the next prompt you will be provided a detailed information about a skill. You have to analyse and understand the skill thoroughly. Later you will be provided an assignment description and you have to strictly score the assignment description out of 100% based on your knowledge and understanding gained about the provided skill. Your score should be out of 100%. Your scoring should strictly be based on your understanding of the skill. The response should only contain the percentage score of the assignment based on the current skill.
          `,
        },
        {
            role: "user",
            content: `
              skill :-
              skill name = ${currSkillObj.skill_name}
              skill explanation = ${currSkillObj.explanation}
            `,
        },
        {
            role: "user",
            content: `I am just describing the project`
        },
        {
            role: "assistant",
            content: '0%'
        },
        {
            role: "user",
            content: `I have come up with a new realtime chat application`
        },
        {
            role: "assistant",
            content: `${reqSkill == "CriticalThinking"? "23%": reqSkill == "Communication"? "0%": reqSkill == "Creativity"? "50%": reqSkill == "Cognitive"? "17%": reqSkill == "Collaboration"? "0%": "0%"}`
        },
        {
            role: "user",
            content: `Pioneered the implementation of this system, leading to 100% elimination of paper usage. Drove the entire front-end development, including 100% implementation of QR Code interface. Orchestrated a collaborative effort among a team of 3 student, hence maximizing productivity.`
        },
        {
            role: "assistant",
            content: `${reqSkill == "CriticalThinking"? "70%": reqSkill == "Communication"? "92%": reqSkill == "Creativity"? "97%": reqSkill == "Cognitive"? "87%": reqSkill == "Collaboration"? "100%": "60%"}`
        },
        {
            role: "user",
            content: `assignment description: ${mssg}`
        }
      ],
    })

    // console.log(res)

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
