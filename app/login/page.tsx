"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const emailOrPhone = formData.get("email_phone") as string
    const password = formData.get("password") as string

    // TODO: Implement actual Supabase authentication
    try {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock validation
      if (emailOrPhone === "admin@dhiran.com" && password === "admin123") {
        localStorage.setItem(
          "user_session",
          JSON.stringify({
            id: "1",
            email: emailOrPhone,
            name: "ધિરાણ એડમિન",
            loginTime: new Date().toISOString(),
          }),
        )
        window.location.href = "/"
      } else {
        setError("ખોટું ઇમેઇલ/ફોન અથવા પાસવર્ડ")
      }
    } catch (err) {
      setError("લૉગિન કરવામાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <Image src="/logo.png" alt="Dhiran Software Logo" width={80} height={80} className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-primary">ધિરાણ સોફ્ટવેરમાં આપનું સ્વાગત છે</CardTitle>
          <CardDescription className="text-accent">
            તમારા એકાઉન્ટમાં લૉગ ઇન કરવા માટે તમારું ઇમેઇલ/ફોન અને પાસવર્ડ દાખલ કરો
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_phone" className="text-accent">
                ઇમેઇલ / ફોન નંબર
              </Label>
              <Input
                id="email_phone"
                name="email_phone"
                type="text"
                placeholder="તમારું ઇમેઇલ અથવા ફોન"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-accent">
                  પાસવર્ડ
                </Label>
                <Link href="#" className="ml-auto inline-block text-sm text-primary hover:underline">
                  પાસવર્ડ ભૂલી ગયા?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="તમારો પાસવર્ડ"
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "લૉગ ઇન કરી રહ્યા છીએ..." : "લૉગ ઇન કરો"}
            </Button>
          </form>

        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          એકાઉન્ટ નથી?{" "}
          <Link href="#" className="text-primary hover:underline">
            અહીં નોંધણી કરો
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
