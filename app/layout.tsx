import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Math Whiz",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
