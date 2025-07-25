import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ધિરાણ સોફ્ટવેર - Dhiran Software",
  description: "વિશ્વસનીય ધિરાણ સેવા - Reliable Loan Management System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
