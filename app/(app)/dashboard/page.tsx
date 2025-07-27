"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Users, HandCoins, ReceiptText, Banknote, Plus, Minus, Wallet, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatAmount } from "@/lib/utils"

export default function DashboardPage() {
  const { customers, loans, repayments, history, calculateAvailableFunds, addFundTransaction } = useAppStore()

  const [isAddFundOpen, setIsAddFundOpen] = useState(false)
  const [isRemoveFundOpen, setIsRemoveFundOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>("All") // State for year filter

  // Generate years for the filter
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearsArray = ["All"]
    for (let i = 0; i < 5; i++) {
      // Last 5 years including current
      yearsArray.push(String(currentYear - i))
    }
    return yearsArray
  }, [])

  // Filtered data based on selected year
  const filteredCustomers = useMemo(() => {
    if (selectedYear === "All") return customers
    return customers.filter((customer) => new Date(customer.firstLoanDate).getFullYear().toString() === selectedYear)
  }, [customers, selectedYear])

  const filteredLoans = useMemo(() => {
    if (selectedYear === "All") return loans
    return loans.filter((loan) => new Date(loan.startDate).getFullYear().toString() === selectedYear)
  }, [loans, selectedYear])

  const filteredRepayments = useMemo(() => {
    if (selectedYear === "All") return repayments
    return repayments.filter((repayment) => new Date(repayment.date).getFullYear().toString() === selectedYear)
  }, [repayments, selectedYear])

  const filteredHistory = useMemo(() => {
    if (selectedYear === "All") return history
    return history.filter((item) => new Date(item.date).getFullYear().toString() === selectedYear)
  }, [history, selectedYear])

  // Calculate real-time statistics using filtered data
  const activeCustomers = filteredCustomers.length
  const totalLoanGiven = filteredLoans.reduce((sum, loan) => sum + loan.amount, 0)

  // Calculate total interest earned from repayments (actual interest received)
  const totalInterestEarned = filteredRepayments.reduce((sum, payment) => sum + payment.interestInfo, 0)

  // Calculate total repaid (actual cash received)
  const totalRepaid = filteredRepayments.reduce((sum, payment) => sum + payment.amount, 0)

  // Calculate total outstanding (including pending interest)
  const totalOutstanding = filteredLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0)

  // Calculate total interest generated (whether collected or not)
  const totalInterestGenerated = filteredLoans.reduce((sum, loan) => sum + loan.totalInterest, 0)

  // Calculate pending interest (generated but not yet collected)
  const pendingInterest = Math.max(0, totalInterestGenerated - totalInterestEarned)

  // Calculate total discount given
  const totalDiscountGiven = filteredRepayments.reduce((sum, payment) => sum + payment.discountGiven, 0)

  // Get available funds using the new calculation method (not filtered by year)
  const availableFunds = calculateAvailableFunds()

  const handleAddFund = (formData: FormData) => {
    const amount = Number(formData.get("amount"))
    const reason = formData.get("reason") as string

    addFundTransaction({
      type: "add",
      amount,
      reason,
      date: new Date().toISOString().split("T")[0],
    })

    setIsAddFundOpen(false)
  }

  const handleRemoveFund = (formData: FormData) => {
    const amount = Number(formData.get("amount"))
    const reason = formData.get("reason") as string

    addFundTransaction({
      type: "remove",
      amount,
      reason,
      date: new Date().toISOString().split("T")[0],
    })

    setIsRemoveFundOpen(false)
  }

  // Get recent activities (filtered by year)
  const recentActivities = filteredHistory.slice(-5).reverse()

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="gradient-bg p-6 rounded-lg text-white flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">ડેશબોર્ડ</h1>
          <p className="text-white/80">તમારા બિઝનેસની સંપૂર્ણ માહિતી</p>
        </div>
        <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
          <SelectTrigger className="w-[180px] bg-white text-gray-800">
            <SelectValue placeholder="વર્ષ પસંદ કરો" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year === "All" ? "બધા વર્ષ" : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent">સક્રિય ગ્રાહકો</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">કુલ રજિસ્ટર્ડ ગ્રાહકો</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent">કુલ લોન આપેલ</CardTitle>
            <HandCoins className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{formatAmount(totalLoanGiven)}</div>
            <p className="text-xs text-muted-foreground">કુલ આપેલ લોન રકમ</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent">કુલ વ્યાજ મળેલ</CardTitle>
            <Banknote className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹{formatAmount(totalInterestEarned)}</div>
            <p className="text-xs text-muted-foreground">વાસ્તવિક વ્યાજની આવક</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent">કુલ ચુકવણી</CardTitle>
            <ReceiptText className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{formatAmount(totalRepaid)}</div>
            <p className="text-xs text-muted-foreground">કુલ પરત મળેલ રકમ</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent">બાકી વ્યાજ</CardTitle>
            <Banknote className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">₹{formatAmount(pendingInterest)}</div>
            <p className="text-xs text-muted-foreground">બાકી વ્યાજ રકમ</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent">ઉપલબ્ધ રકમ</CardTitle>
            <Wallet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{formatAmount(availableFunds)}</div>
            <p className="text-xs text-muted-foreground">વર્તમાન ઉપલબ્ધ રકમ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card className="card-gradient border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-accent flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            ઝડપી ક્રિયાઓ
          </CardTitle>
          <CardDescription>સામાન્ય કાર્યો માટે ઝડપી એક્સેસ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              className="h-20 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg"
              onClick={() => (window.location.href = "/customers")}
            >
              <Users className="h-6 w-6" />
              <span>નવો ગ્રાહક ઉમેરો</span>
            </Button>

            <Dialog open={isAddFundOpen} onOpenChange={setIsAddFundOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 flex flex-col gap-2 bg-success hover:bg-success/90 text-white shadow-lg">
                  <Plus className="h-6 w-6" />
                  <span>રકમ ઉમેરો</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-success">રકમ ઉમેરો</DialogTitle>
                  <DialogDescription>નવું રકમ ઉમેરવાની વિગતો દાખલ કરો</DialogDescription>
                </DialogHeader>
                <form action={handleAddFund} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">રકમ (₹) *</Label>
                    <Input id="amount" name="amount" type="number" required placeholder="રકમ દાખલ કરો" />
                  </div>
                  <div>
                    <Label htmlFor="reason">કારણ *</Label>
                    <Textarea id="reason" name="reason" required placeholder="ભંડોળ ઉમેરવાનું કારણ" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddFundOpen(false)}>
                      રદ કરો
                    </Button>
                    <Button type="submit" className="bg-success hover:bg-success/90">
                      રકમ ઉમેરો
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isRemoveFundOpen} onOpenChange={setIsRemoveFundOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 flex flex-col gap-2 bg-warning hover:bg-warning/90 text-white shadow-lg">
                  <Minus className="h-6 w-6" />
                  <span>રકમ કાઢો</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-warning">રકમ કાઢો</DialogTitle>
                  <DialogDescription>રકમ કાઢવાની વિગતો દાખલ કરો</DialogDescription>
                </DialogHeader>
                <form action={handleRemoveFund} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">રકમ (₹) *</Label>
                    <Input id="amount" name="amount" type="number" required placeholder="રકમ દાખલ કરો" />
                  </div>
                  <div>
                    <Label htmlFor="reason">કારણ *</Label>
                    <Textarea id="reason" name="reason" required placeholder="ભંડોળ કાઢવાનું કારણ" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRemoveFundOpen(false)}>
                      રદ કરો
                    </Button>
                    <Button type="submit" className="bg-warning hover:bg-warning/90">
                      રકમ કાઢો
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              className="h-20 flex flex-col gap-2 bg-accent hover:bg-accent/90 text-white shadow-lg"
              onClick={() => (window.location.href = "/customers")}
            >
              <Users className="h-6 w-6" />
              <span>ગ્રાહકો જાળવો</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Work Section */}
      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-accent flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            તાજેતરનું કામ
          </CardTitle>
          <CardDescription>છેલ્લી કેટલીક પ્રવૃત્તિઓ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {activity.type === "લોન આપેલ" && <HandCoins className="h-5 w-5 text-primary" />}
                  {activity.type === "ચુકવણી મળેલ" && <ReceiptText className="h-5 w-5 text-success" />}
                  {activity.type === "ભંડોળ ઉમેર્યું" && <Plus className="h-5 w-5 text-success" />}
                  {activity.type === "ભંડોળ કાઢ્યું" && <Minus className="h-5 w-5 text-warning" />}
                  <div>
                    <p className="font-medium">
                      {activity.customerName ? `${activity.customerName} - ` : ""}
                      {activity.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.date} - ₹{formatAmount(activity.amount)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={activity.status === "સક્રિય" ? "default" : "secondary"}
                  className={
                    activity.type === "લોન આપેલ"
                      ? "bg-primary"
                      : activity.type === "ચુકવણી મળેલ"
                        ? "bg-success"
                        : activity.type === "ભંડોળ ઉમેર્યું"
                          ? "bg-success"
                          : "bg-warning"
                  }
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-info/20">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Banknote className="h-5 w-5 text-info" />
              બિઝનેસ સારાંશ
            </CardTitle>
            <CardDescription>મુખ્ય આર્થિક માહિતી</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-info/10 rounded">
                <span className="text-sm">કુલ બાકી રકમ:</span>
                <span className="font-bold text-info">₹{formatAmount(totalOutstanding)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-success/10 rounded">
                <span className="text-sm">કુલ વ્યાજ કમાણી:</span>
                <span className="font-bold text-success">₹{formatAmount(totalInterestEarned)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-warning/10 rounded">
                <span className="text-sm">બાકી વ્યાજ:</span>
                <span className="font-bold text-warning">₹{formatAmount(pendingInterest)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                <span className="text-sm">કુલ છૂટ આપેલ:</span>
                <span className="font-bold text-destructive">₹{formatAmount(totalDiscountGiven)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                <span className="text-sm">ઉપલબ્ધ રકમ:</span>
                <span className="font-bold text-primary">₹{formatAmount(availableFunds)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-warning/20">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Activity className="h-5 w-5 text-warning" />
              આજના આંકડા
            </CardTitle>
            <CardDescription>આજની પ્રવૃત્તિ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-warning/10 rounded">
                <span className="text-sm">આજની ચુકવણીઓ:</span>
                <span className="font-bold text-warning">
                  {filteredRepayments.filter((r) => r.date === new Date().toISOString().split("T")[0]).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                <span className="text-sm">આજની લોન:</span>
                <span className="font-bold text-secondary">
                  {filteredLoans.filter((l) => l.startDate === new Date().toISOString().split("T")[0]).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-accent/10 rounded">
                <span className="text-sm">કુલ પ્રવૃત્તિઓ:</span>
                <span className="font-bold text-accent">{filteredHistory.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-info/10 rounded">
                <span className="text-sm">કુલ વ્યાજ જનરેટ:</span>
                <span className="font-bold text-info">₹{formatAmount(totalInterestGenerated)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
