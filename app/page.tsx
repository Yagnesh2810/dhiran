"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const userSession = localStorage.getItem("user_session")

      if (userSession) {
        // User is logged in, redirect to dashboard
        router.replace("/dashboard")
      } else {
        // User is not logged in, redirect to login
        router.replace("/login")
      }
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">લોડ કરી રહ્યા છીએ...</p>
        </div>
      </div>
    )
  }

  return null
}
