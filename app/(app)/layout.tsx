"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Home, Users, HandCoins, Receipt, BarChart3, History, Menu, LogOut } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { useAppStore } from "@/lib/store" // Import useAppStore

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { fetchInitialData, isDataLoaded } = useAppStore() // Get fetchInitialData and isDataLoaded

  useEffect(() => {
    // Check authentication status
    const userSession = localStorage.getItem("user_session")

    if (!userSession) {
      // User is not logged in, redirect to login
      router.push("/login")
      return
    }

    setIsAuthenticated(true)
    setIsLoading(false)
    fetchInitialData() // Fetch data when component mounts
  }, [router, fetchInitialData])

  const navItems = [
    { href: "/dashboard", label: "ડેશબોર્ડ", icon: Home },
    { href: "/customers", label: "ગ્રાહકો", icon: Users },
    { href: "/loans", label: "લોન", icon: HandCoins },
    { href: "/repayments", label: "ચુકવણી", icon: Receipt },
    { href: "/reports", label: "રિપોર્ટ્સ", icon: BarChart3 },
    { href: "/history", label: "ઇતિહાસ", icon: History },
  ]

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    router.push("/login")
  }

  if (isLoading || !isDataLoaded) {
    // Show loading until authenticated AND data is loaded
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">લોડ કરી રહ્યા છીએ...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
        <aside className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Image src="/logo.png" alt="Dhiran Software Logo" width={32} height={32} />
                <span className="text-primary">ધિરાણ સોફ્ટવેર</span>
              </Link>
            </div>
            <nav className="flex-1 overflow-auto py-4 grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                લૉગ આઉટ
              </Button>
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">ટૉગલ નેવિગેશન મેનૂ</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Image src="/logo.png" alt="Dhiran Software Logo" width={24} height={24} />
                    <span className="text-primary">ધિરાણ સોફ્ટવેર</span>
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 text-lg"
                  >
                    <LogOut className="h-5 w-5" />
                    લૉગ આઉટ
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1"></div>
            <ModeToggle />
          </header>
          <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}
