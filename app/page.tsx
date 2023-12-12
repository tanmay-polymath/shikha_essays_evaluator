"use client"

import Loading from "@/components/loading/loading"
import LoadingDots from "@/components/loading/loading-dots"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import useAutosizeTextArea from "@/lib/autosizeTextarea"
import { useChat } from "ai/react"
import "katex/dist/katex.min.css"
import { CornerDownRight, SendHorizonal, Upload } from "lucide-react"
import Image from "next/image"
import { Suspense, useEffect, useRef, useState } from "react"
import Latex from "react-latex-next"

export default function Home() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [completion, setCompletion] = useState("")
  const [base64, setBase64] = useState<string | null>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const [displayOutput, setDisplayOutput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [converse, setConverse] = useState(false)
  const [followUp, setFollowUp] = useState(false)
  const [value, setValue] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  useAutosizeTextArea(textAreaRef.current, value)

  const questionRef = useRef<HTMLTextAreaElement>(null)
  const rubrikRef = useRef<HTMLTextAreaElement>(null)
  const answerRef = useRef<HTMLTextAreaElement>(null)
  const [rubrik, setRubrik] = useState<"default" | "custom">("default")
  const [answerType, setAnswerType] = useState<"text" | "image">("text")

  const prompt = `you are a friendly and encouraging maths assistant, capable of tackling a broad range of mathematical problems and analyzing user-uploaded images for solving or correcting problems. you ask for clarification on ambiguous queries to ensure accuracy. A key aspect of your interaction style is personalization. This approach helps in creating a more engaging and tailored learning experience. you maintain a helpful and patient demeanor, making mathematics approachable for users of all skill levels and fostering a positive learning environment.
  If the image only has a problem solve it. If the image has a problem and a solution, check if it the solution is correct. If the solution is not correct, suggest how they can correct it.

  Always use the specific LaTeX math mode delimiters for your response. LaTex math mode specific delimiters as following
  inline math mode : \( and \)
  display math mode: insert linebreak after opening $$, \[ and before closing $$, \]
  `

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: completion,
      },
    ],
  })
  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()

      fileReader.readAsDataURL(file)

      fileReader.onload = () => {
        resolve(fileReader.result)
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (!e.target.files) {
      return
    }

    setFile(e.target.files[0])
    setIsFileUploaded(true)
    const base64 = await toBase64(e.target.files[0])
    setBase64(base64 as string)
  }

  const handleDataSubmit = async (e: any) => {
    e.preventDefault()
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Uploaded!",
        description: "Please upload a file",
      })
      return
    } else {
      setLoading(true)
      setCompletion("")
      const base64 = await toBase64(file as File)

      setBase64(base64 as string)
      setDisplayOutput(true)
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          link: base64,
        }),
      })
      const data = response.body
      if (!data) {
        console.log("No data")
        return
      }
      const reader = data.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        setIsContentLoaded(true)
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        setCompletion((prev) => prev + chunkValue)
      }
      setLoading(false)
      setFollowUp(true)
      toast({
        variant: "success",
        title: "Eureka!",
        description: "Successfully solved the problem",
      })
    }
  }

  const changeRubrik = (event:any) => {
    setRubrik(event.target.value)
  }

  const changeAnswerType = (event:any) => {
    setAnswerType(event.target.value)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <main className="mt-12 flex w-full flex-col items-center justify-center px-4 text-center sm:mt-12">
      <h1 className="max-w-[708px] text-4xl font-bold tracking-tight text-slate-800 sm:text-6xl">
        Essay Whiz
      </h1>
      <div className="flex w-full max-w-xl flex-col gap-y-6 bg-white p-8 text-slate-800">
        <div className = "flex flex-col gap-y-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black p-3 text-sm text-white">
              1
            </span>
            <p className="text-xl font-semibold tracking-tight">Question</p>
          </div>
          <textarea 
            className = "w-full rounded-md"
            ref = {questionRef}
          />
        </div>
        <div className = "flex flex-col gap-y-4 items-start">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black p-3 text-sm text-white">
              2
            </span>
            <p className="text-xl font-semibold tracking-tight">Rubrik</p>
            {/* buttons */}
          </div>
          <div className = "flex items-center">
            <label
              className = "font-semibold mr-2 ml-2 text-lg" 
              htmlFor="def"
            >
              Default (IELTS):
            </label>
            <input 
              className="form-radio text-black border-black outline-none mr-5 cursor-pointer"
              type="radio"
              value = "default"
              checked = {rubrik === "default"}
              onChange={changeRubrik}
              id = "def"
            />

            <label
              className = "font-semibold mr-2 text-lg" 
              htmlFor="cust"
            >
              Custom:
            </label>
            <input 
              className="form-radio text-black border-black outline-none mr-5 cursor-pointer"
              type="radio"
              value = "custom"
              checked = {rubrik === "custom"}
              onChange={changeRubrik}
              id = "cust"
            />
          </div>
          {(rubrik === "custom") && 
            <textarea 
              className = "w-full rounded-md"
              ref = {rubrikRef}
            />
          }
        </div>
        <div id="image-div" className = "flex flex-col gap-y-4 items-start w-full">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black p-3 text-sm text-white">
              3
            </span>
            <p className="text-xl font-semibold tracking-tight">Answer</p>
          </div>
          <div className = "flex items-center">
            <label
              className = "font-semibold mr-2 ml-2 text-lg" 
              htmlFor="txt"
            >
              Text:
            </label>
            <input 
              className="form-radio text-black border-black outline-none mr-5 cursor-pointer"
              type="radio"
              value = "text"
              checked = {answerType === "text"}
              onChange={changeAnswerType}
              id = "txt"
            />

            <label
              className = "font-semibold mr-2 text-lg" 
              htmlFor="img"
            >
              Image:
            </label>
            <input 
              className="form-radio text-black border-black outline-none mr-5 cursor-pointer"
              type="radio"
              value = "image"
              checked = {answerType === "image"}
              onChange={changeAnswerType}
              id = "img"
            />
          </div>
          {(answerType === "text") &&
            <textarea 
              className = "w-full rounded-md"
              ref = {answerRef}
            />
          }
          {(answerType === "image") && 
            <label htmlFor="file-upload" className = "w-full">
              {isFileUploaded ? (
                base64 && (
                  <div className="mt-2 w-full flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-900/50 p-3">
                    <Image
                      src={base64 as string}
                      height={400}
                      width={400}
                      alt="Image"
                      className="rounded-md"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      {file?.name}
                    </span>
                  </div>
                )
              ) : (
                <div className="mt-2 w-full flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-900/50 p-6 hover:bg-zinc-200/70">
                  <Upload className="h-8 w-8 text-slate-800" strokeWidth={3} />
                  <div className="ml-5 text-left">
                    <p className="font-semibold text-slate-900">Upload a file</p>
                    <p className="text-xs font-medium text-slate-600">
                      PNG, JPG, GIF, JPEG, WEBP up to 10MB
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="sr-only h-full w-full"
                  />
                </div>
              )}
            </label>
          }
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled
              className="flex h-10 items-center justify-center gap-1 rounded-md bg-black py-1.5 text-lg font-semibold text-white shadow-sm hover:bg-black/80 focus:outline-none focus-visible:outline-none"
            >
              <LoadingDots color="white" style="large" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                handleDataSubmit(e)
              }}
              className="flex items-center justify-center gap-1 rounded-md bg-black py-1.5 text-lg font-semibold text-white shadow-sm hover:bg-black/80 focus:outline-none focus-visible:outline-none"
            >
              Evaluate
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                aria-hidden="true"
                height="25px"
                width="25px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        )}

        {displayOutput && (
          <div className="mt-2 text-left">
            <span className="flex items-center gap-2 text-2xl font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 448 512"
              >
                <path d="M288 64c0 17.7-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32H256c17.7 0 32 14.3 32 32zm0 256c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H256c17.7 0 32 14.3 32 32zM0 192c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
              </svg>
              Output
            </span>
            <Suspense fallback={<Loading />}>
              {isContentLoaded ? (
                <>
                  <ScrollArea
                    className="mt-3 max-h-[500px] overflow-auto"
                    ref={scrollAreaRef}
                  >
                    <div className="prose mt-3 flex flex-col items-start justify-center break-words text-left leading-5 dark:prose-invert prose-li:mb-0">
                      <span className=" py-1 font-bold text-black">
                        Assistant
                      </span>
                      <Latex>{completion}</Latex>

                      {messages.map(
                        (m) =>
                          m.id !== "1" && (
                            <>
                              {m.role === "user" && (
                                <>
                                  <span className="self-end py-1 text-base font-bold text-black">
                                    User
                                  </span>
                                  <div
                                    className="self-end rounded-b-xl rounded-l-xl bg-zinc-200 px-6 py-2 text-right text-black"
                                    key={m.id}
                                  >
                                    <Latex>{m.content}</Latex>
                                  </div>
                                </>
                              )}
                              {m.role === "assistant" && (
                                <>
                                  <span className="self-start py-1 text-base font-bold text-black">
                                    Assistant
                                  </span>
                                  <div
                                    className="mb-4 self-start rounded-b-xl rounded-r-xl bg-zinc-200 px-6 py-2 text-left leading-7 text-black"
                                    key={m.id}
                                  >
                                    <Latex>{m.content}</Latex>
                                  </div>
                                </>
                              )}
                            </>
                          )
                      )}
                    </div>
                  </ScrollArea>

                  {followUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setConverse(true)
                      }}
                      className="mt-5 flex items-center gap-2 rounded-full border-2 border-slate-900 bg-zinc-200/70 px-6 py-1.5 text-base font-semibold text-slate-900 shadow-sm hover:bg-zinc-300/70 focus-visible:outline-none"
                    >
                      <CornerDownRight strokeWidth={2.5} />
                      Ask a follow up
                    </button>
                  )}
                  {converse && (
                    <div className="mt-3 w-full">
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-3">
                          <CornerDownRight strokeWidth={2.5} />
                        </div>
                        <textarea
                          ref={textAreaRef}
                          onChange={(e) => {
                            handleInputChange(e)
                            setValue(e.target.value)
                          }}
                          value={input}
                          className="my-2 block min-h-[80px] w-full resize-none rounded-md border-2 border-slate-900 px-10 py-2.5 text-base text-slate-900 placeholder:font-medium placeholder:text-slate-500 focus:border-slate-900 focus:outline-none focus:ring-0 focus-visible:outline-none"
                          placeholder="Ask a follow up question"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-end pb-2 pr-3">
                          <button
                            onClick={(e: any) => {
                              handleSubmit(e)
                              setConverse(false)
                            }}
                            className="inline-flex items-center rounded-md bg-sky-500 px-2 py-1 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                          >
                            <SendHorizonal
                              className="h-5 w-5"
                              strokeWidth={2.2}
                            />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConverse(false)}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-base font-semibold text-white shadow-sm hover:bg-red-500/80 focus-visible:outline-none "
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Loading />
              )}
            </Suspense>
          </div>
        )}
      </div>
    </main>
  )
}
