import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { PomodoroProvider } from "@/context/pomodoro-context"
import { ThemeProvider } from "@/context/theme-context"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bat Pomodoro - The Dark Knight Timer",
  description: "Focus like the Dark Knight with this Batman-themed Pomodoro timer",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <PomodoroProvider>
            {children}
            <NavigationWrapper />
          </PomodoroProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


