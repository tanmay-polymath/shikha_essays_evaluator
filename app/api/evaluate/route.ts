import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"

// export const dynamic = "force-dynamic"
export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    console.log("openai api hit")
    const body = await request.json()

    console.log(body);

    const openai = new OpenAI({
      apiKey: `${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
    })

    const question = body.question
    const rubrik = body.rubrik
    const rubrikType = body.rubrikType
    // const answerType = body.answerType
    const answer = body.answer
    // const image = body.image

    const ielts_rubrik = `The International English Language Testing System (IELTS) utilizes a detailed scoring rubric to assess English language proficiency. The scoring is based on a 9-band scale, where each band corresponds to a specific level of English proficiency. Here is an overview of the scoring rubric for IELTS:

    ### Overall Band Scores
    Each band score represents a specific skill level:
    - **Band 9 (Expert)**: Full command of the language, accurate and fluent use, complete understanding.
    - **Band 8 (Very Good)**: Fully operational command with only occasional inaccuracies.
    - **Band 7 (Good)**: Operational command with some inaccuracies and misunderstandings.
    - **Band 6 (Competent)**: Effective command despite inaccuracies and misunderstandings.
    - **Band 5 (Modest)**: Partial command and can cope with overall meaning in most situations.
    - **Band 4 (Limited)**: Basic competence is limited to familiar situations.
    - **Band 3 (Extremely Limited)**: Conveys and understands only general meaning in very familiar situations.
    - **Band 2 (Intermittent)**: Great difficulty understanding spoken and written English.
    - **Band 1 (Non-user)**: Essentially no ability to use the language beyond a few isolated words.
    - **Band 0**: Did not attempt the test.
    
    ### Section Band Scores
    The IELTS test comprises four sections: Listening, Reading, Writing, and Speaking. Each section has its scoring criteria:
    
    - **Listening and Reading**: 
      - Each section contains 40 questions.
      - Each correct answer is awarded 1 mark.
      - Scores out of 40 are then converted to the IELTS 9-band scale.
      - The number of marks required for each band score can vary slightly.
    
    - **Writing**: 
      - Assessed based on four criteria: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.
      - Each criterion is weighted equally.
      - Task 2 carries more weight in marking than Task 1.
    
    - **Speaking**:
      - Assessed based on four areas: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation.
      - Each criterion is equally weighted.
      - The overall average gives the IELTS score for Speaking.
    
    ### Scoring Details for Each Section:
    - **Listening and Reading**:
      - The average number of marks required for different band scores is specified, for example, a certain number of marks for a Band Score of 5, 6, etc.
    - **Writing and Speaking**:
      - Specific descriptors are used for each band score level, detailing the expected performance in each of the assessment criteria.
    
    The IELTS scoring system ensures fair and accurate assessment of test takers' language abilities. For a more detailed breakdown of the scoring rubric and to understand the specific requirements for each band score, you can refer to the official IELTS websites ([IELTS Scoring in Detail](https://ielts.org/about-the-test/how-ielts-is-scored) and [IELTS Writing Band Descriptors and Key Assessment Criteria](https://ielts.org/news-and-insights/ielts-writing-band-descriptors-and-key-assessment-criteria)).`

    // const img_arr = [
    //     {
    //         type: "text", 
    //         text: `Question:-
    //     ${question}
    //     Response: the response has been uploaded as an image. Parse the image properly to extract the written text, then evaluate and score the extracted text.
    //     `},
    //     {
    //         type: "image_url",
    //         image_url: {
    //           url: image,
    //         },
    //     }
    // ]

    const text_arr = [
        {
            type: "text", 
            text: `Question:-
        ${question}
        Response:-
        ${answer}
        `}
      ]

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      stream: true,
      // temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an english language expert capable of an overall evaluation of texts and essays in all aspects",
        },
        {
          role: "user",
          content: `you have to evaluate and score a student\'s response to a given question based on the evaluation and scoring rubrik provided below enclosed in triple quotes
          '''${rubrikType === "default"? ielts_rubrik: rubrik}'''
          in the next prompt you will be provided the question and the response to the question. Your evaluation and scoring should strictly be based on the provided rubrik. Make sure that your evaluation and scoring is paired with proper explanation, evidence and include snippets from the response to justify the scoring and results. Provide your response strictly in markdown format. You must ensure that the response answers the question asked. Your final evaluation and scoring should strictly be based on the provided rubrik. Your response should be properly formatted according to markdown format for better user readability that is you should highlight the headings and scores by making them bold, you can also create tables and lists for better representation of the results.
          `,
        },
        // {
        //   role: "user",
        //   content: `forget any pervious response.you have to evaluate and score a student\'s response to a given question based on the evaluation and scoring rubrik provided below enclosed in triple quotes
        //   '''${rubrikType === "default"? ielts_rubrik: rubrik}'''
        //   in the next prompt you will be provided the question and the response to the question. Your evaluation and scoring should strictly be based on the provided rubrik. Make sure that your evaluation and scoring is paired with proper explanation and evidance to justify the scoring and results. Provide your response strictly in markdown format. You must ensure that the response answers the question asked. Your final evaluation and scoring should strictly be based on the provided rubrik. Your response should be properly formatted according to markdown format for better user readability that is you should highlight the headings and scores by making them bold, you can also create tables and lists for better representation of the results.
        //   `,
        // },
        {
          role: "user",
          //@ts-ignore
          content: [...text_arr]
        },
        
      ],
      max_tokens: 1500
    })

    // console.log(res)

    const stream = OpenAIStream(res)
    return new StreamingTextResponse(stream)

  } catch (error: any) {
    console.log(error)
  }
}
