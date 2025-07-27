"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, BarChart3, Users, Printer, FileSpreadsheet } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { generatePrintableContent } from "@/lib/pdf-utils"
import { generateCustomersExcel, generateLoansExcel, generateRepaymentsExcel } from "@/lib/excel-utils"
import { formatAmount } from "@/lib/utils"

const REPORT_PASSWORD = "admin123"

export default function ReportsPage() {
  const { customers, loans, repayments, history } = useAppStore()
  const [reportType, setReportType] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(true)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handlePasswordSubmit = () => {
    if (password === REPORT_PASSWORD) {
      setIsAuthenticated(true)
      setShowPasswordDialog(false)
      setPasswordError("")
    } else {
      setPasswordError("ખોટો પાસવર્ડ")
    }
  }

  const handleGenerateReport = () => {
    if (!reportType) {
      alert("કૃપા કરીને રિપોર્ટનો પ્રકાર પસંદ કરો")
      return
    }

    let reportData: any = null
    let reportTitle = ""

    // Generate report based on type
    switch (reportType) {
      case "monthly-summary":
        if (!selectedMonth || !selectedYear) {
          alert("કૃપા કરીને મહિનો અને વર્ષ પસંદ કરો")
          return
        }
        reportData = generateMonthlySummary(selectedMonth, selectedYear)
        reportTitle = `માસિક સારાંશ - ${selectedMonth}/${selectedYear}`
        break
      case "yearly-summary":
        if (!selectedYear) {
          alert("કૃપા કરીને વર્ષ પસંદ કરો")
          return
        }
        reportData = generateYearlySummary(selectedYear)
        reportTitle = `વાર્ષિક સારાંશ - ${selectedYear}`
        break
      case "customer-wise":
        if (!selectedCustomer) {
          alert("કૃપા કરીને ગ્રાહક પસંદ કરો")
          return
        }
        reportData = generateCustomerReport(selectedCustomer)
        reportTitle = `ગ્રાહક રિપોર્ટ - ${customers.find((c) => c.id === selectedCustomer)?.name}`
        break
      case "interest-report":
        reportData = generateInterestReport()
        reportTitle = "વ્યાજ રિપોર્ટ"
        break
      case "outstanding-loans":
        reportData = generateOutstandingLoansReport()
        reportTitle = "બાકી લોન રિપોર્ટ"
        break
      case "completed-loans":
        reportData = generateCompletedLoansReport()
        reportTitle = "પૂર્ણ લોન રિપોર્ટ"
        break
      case "cash-flow":
        reportData = generateCashFlowReport()
        reportTitle = "રોકડ પ્રવાહ રિપોર્ટ"
        break
      default:
        alert("અમાન્ય રિપોર્ટ પ્રકાર")
        return
    }

    setGeneratedReport({ ...reportData, title: reportTitle })
  }

  const handlePrintReport = () => {
    if (!generatedReport) {
      alert("પહેલા રિપોર્ટ જનરેટ કરો")
      return
    }

    let content = `
<div class="header-info">
<strong>${generatedReport.title}</strong><br>
તારીખ: ${new Date().toLocaleDateString("gu-IN")}<br>
આઇટમ:
</div>
`

    if (generatedReport.customer) {
      content += `
<div class="summary">
<strong>ગ્રાહકની માહિતી:</strong><br>
નામ: ${generatedReport.customer.name} | ID: ${generatedReport.customer.id}<br>
શહેર: ${generatedReport.customer.city} | મોબાઇલ: ${generatedReport.customer.mobile}
</div>
`
    }

    // Summary statistics
    if (generatedReport.totalLoansGiven !== undefined || generatedReport.totalRepayments !== undefined) {
      content += `
<div class="summary">
<strong>સારાંશ:</strong><br>
${generatedReport.totalLoansGiven !== undefined ? `કુલ રકમ આપેલ: ₹${formatAmount(generatedReport.totalLoansGiven)}<br>` : ""}
${generatedReport.totalRepayments !== undefined ? `કુલ ચુકવણી: ₹${formatAmount(generatedReport.totalRepayments)}<br>` : ""}
${generatedReport.totalInterestEarned !== undefined ? `કુલ વ્યાજ: ₹${formatAmount(generatedReport.totalInterestEarned)}<br>` : ""}
${generatedReport.totalDiscountGiven !== undefined ? `કુલ છૂટ: ₹${formatAmount(generatedReport.totalDiscountGiven)}` : ""}
</div>
`
    }

    if (generatedReport.loans && generatedReport.loans.length > 0) {
      content += `
<strong>વિગતો:</strong>
<table>
<tr>
<th>ID</th>
<th>ગ્રાહક</th>
<th>રકમ</th>
<th>વ્યાજ દર</th>
<th>તારીખ</th>
<th>સ્થિતિ</th>
<th>બાકી રકમ</th>
</tr>
${generatedReport.loans.map((loan: any) => `
<tr>
<td>${loan.id}</td>
<td>${loan.customerName}</td>
<td>₹${formatAmount(loan.amount)}</td>
<td>${loan.interestRate}%</td>
<td>${loan.startDate}</td>
<td>${loan.status}</td>
<td>₹${formatAmount(loan.remainingAmount)}</td>
</tr>`).join("")}
</table>
`
    }

    if (generatedReport.repayments && generatedReport.repayments.length > 0) {
      content += `
<strong>ચુકવણી વિગતો:</strong>
<table>
<tr>
<th>ચુકવણી ID</th>
<th>ગ્રાહક</th>
<th>રકમ</th>
<th>વ્યાજ માહિતી</th>
<th>તારીખ</th>
<th>રસીદ ID</th>
</tr>
${generatedReport.repayments.map((repayment: any) => `
<tr>
<td>${repayment.id}</td>
<td>${repayment.customerName}</td>
<td>₹${formatAmount(repayment.amount)}</td>
<td>₹${formatAmount(repayment.interestInfo)}</td>
<td>${repayment.date}</td>
<td>${repayment.receiptId}</td>
</tr>`).join("")}
</table>
`
    }

    generatePrintableContent(content, generatedReport.title)
  }

  const handleExcelDownload = () => {
    if (!generatedReport) {
      alert("પહેલા રિપોર્ટ જનરેટ કરો")
      return
    }

    if (generatedReport.loans && generatedReport.loans.length > 0) {
      generateLoansExcel(generatedReport.loans)
    } else if (generatedReport.repayments && generatedReport.repayments.length > 0) {
      generateRepaymentsExcel(generatedReport.repayments)
    } else if (generatedReport.customer) {
      generateCustomersExcel([generatedReport.customer])
    }
  }

  const generateMonthlySummary = (month: string, year: string) => {
    const monthlyLoans = loans.filter((loan) => {
      const loanDate = new Date(loan.startDate)
      return loanDate.getMonth() + 1 === Number.parseInt(month) && loanDate.getFullYear() === Number.parseInt(year)
    })

    const monthlyRepayments = repayments.filter((repayment) => {
      const repaymentDate = new Date(repayment.date)
      return (
        repaymentDate.getMonth() + 1 === Number.parseInt(month) && repaymentDate.getFullYear() === Number.parseInt(year)
      )
    })

    return {
      loans: monthlyLoans,
      repayments: monthlyRepayments,
      totalLoansGiven: monthlyLoans.reduce((sum, loan) => sum + loan.amount, 0),
      totalRepayments: monthlyRepayments.reduce((sum, repayment) => sum + repayment.amount, 0),
      totalInterestEarned: monthlyRepayments.reduce((sum, repayment) => sum + repayment.interestInfo, 0),
      totalDiscountGiven: monthlyRepayments.reduce((sum, repayment) => sum + repayment.discountGiven, 0),
    }
  }

  const generateYearlySummary = (year: string) => {
    const yearlyLoans = loans.filter((loan) => new Date(loan.startDate).getFullYear() === Number.parseInt(year))
    const yearlyRepayments = repayments.filter(
      (repayment) => new Date(repayment.date).getFullYear() === Number.parseInt(year),
    )

    return {
      loans: yearlyLoans,
      repayments: yearlyRepayments,
      totalLoansGiven: yearlyLoans.reduce((sum, loan) => sum + loan.amount, 0),
      totalRepayments: yearlyRepayments.reduce((sum, repayment) => sum + repayment.amount, 0),
      totalInterestEarned: yearlyRepayments.reduce((sum, repayment) => sum + repayment.interestInfo, 0),
      totalDiscountGiven: yearlyRepayments.reduce((sum, repayment) => sum + repayment.discountGiven, 0),
    }
  }

  const generateCustomerReport = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    const customerLoans = loans.filter((loan) => loan.customerId === customerId)
    const customerRepayments = repayments.filter((repayment) => repayment.customerId === customerId)

    return {
      customer,
      loans: customerLoans,
      repayments: customerRepayments,
      totalLoansGiven: customerLoans.reduce((sum, loan) => sum + loan.amount, 0),
      totalRepayments: customerRepayments.reduce((sum, repayment) => sum + repayment.amount, 0),
      totalInterestEarned: customerRepayments.reduce((sum, repayment) => sum + repayment.interestInfo, 0),
    }
  }

  const generateInterestReport = () => {
    const interestData = customers.map((customer) => ({
      customer,
      totalInterest: customer.totalInterest,
      interestPaid: repayments.filter((r) => r.customerId === customer.id).reduce((sum, r) => sum + r.interestInfo, 0),
      pendingInterest:
        customer.totalInterest -
        repayments.filter((r) => r.customerId === customer.id).reduce((sum, r) => sum + r.interestInfo, 0),
    }))

    return {
      interestData,
      totalInterestGenerated: customers.reduce((sum, c) => sum + c.totalInterest, 0),
      totalInterestCollected: repayments.reduce((sum, r) => sum + r.interestInfo, 0),
    }
  }

  const generateOutstandingLoansReport = () => {
    const outstandingLoans = loans.filter((loan) => loan.status === "સક્રિય" && loan.remainingAmount > 0)
    return {
      loans: outstandingLoans,
      totalOutstanding: outstandingLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0),
      count: outstandingLoans.length,
    }
  }

  const generateCompletedLoansReport = () => {
    const completedLoans = loans.filter((loan) => loan.status === "પૂર્ણ" || loan.remainingAmount <= 0)
    return {
      loans: completedLoans,
      totalCompleted: completedLoans.reduce((sum, loan) => sum + loan.amount, 0),
      count: completedLoans.length,
    }
  }

  const generateCashFlowReport = () => {
    const inflow = repayments.reduce((sum, repayment) => sum + repayment.amount, 0)
    const outflow = loans.reduce((sum, loan) => sum + loan.amount, 0)

    return {
      inflow,
      outflow,
      netFlow: inflow - outflow,
      repayments,
      loans,
    }
  }

  const reportTypes = [
    { value: "monthly-summary", label: "માસિક સારાંશ" },
    { value: "yearly-summary", label: "વાર્ષિક સારાંશ" },
    { value: "customer-wise", label: "ગ્રાહક પ્રમાણે" },
    { value: "interest-report", label: "વ્યાજ રિપોર્ટ" },
    { value: "outstanding-loans", label: "બાકી લોન" },
    { value: "completed-loans", label: "પૂર્ણ લોન" },
    { value: "cash-flow", label: "રોકડ પ્રવાહ" },
  ]

  const months = [
    { value: "1", label: "જાન્યુઆરી" },
    { value: "2", label: "ફેબ્રુઆરી" },
    { value: "3", label: "માર્ચ" },
    { value: "4", label: "એપ્રિલ" },
    { value: "5", label: "મે" },
    { value: "6", label: "જૂન" },
    { value: "7", label: "જુલાઈ" },
    { value: "8", label: "ઓગસ્ટ" },
    { value: "9", label: "સપ્ટેમ્બર" },
    { value: "10", label: "ઓક્ટોબર" },
    { value: "11", label: "નવેમ્બર" },
    { value: "12", label: "ડિસેમ્બર" },
  ]

  // Generate years dynamically from 2020 to current year + 5
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2019 + 6 }, (_, i) => (2020 + i).toString()).reverse()

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={() => {}} modal={true}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>રિપોર્ટ એક્સેસ</DialogTitle>
            <DialogDescription>રિપોર્ટ સેક્શન એક્સેસ કરવા માટે પાસવર્ડ દાખલ કરો</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">પાસવર્ડ *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="border-primary/30 focus:border-primary"
              />
              {passwordError && (
                <p className="text-sm text-destructive mt-1">{passwordError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit} className="bg-primary hover:bg-primary/90">
              એક્સેસ કરો
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">રિપોર્ટ્સ</h1>
          <p className="text-muted-foreground">વિવિધ પ્રકારની રિપોર્ટ્સ જનરેટ કરો અને પ્રિન્ટ કરો</p>
        </div>
        <div className="flex gap-2">
          {generatedReport && (
            <>
              <Button onClick={handlePrintReport} className="bg-primary hover:bg-primary/90">
                <Printer className="h-4 w-4 mr-2" />
                પ્રિન્ટ કરો
              </Button>
              <Button
                onClick={handleExcelDownload}
                variant="outline"
                className="border-success text-success hover:bg-success hover:text-white bg-transparent"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel ડાઉનલોડ
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-accent flex items-center gap-2">
              <FileText className="h-5 w-5" />
              રિપોર્ટ જનરેટ કરો
            </CardTitle>
            <CardDescription>વિવિધ પ્રકારની રિપોર્ટ્સ જનરેટ કરો અને પ્રિન્ટ કરો</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reportType">રિપોર્ટનો પ્રકાર *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="border-primary/30 focus:border-primary">
                  <SelectValue placeholder="રિપોર્ટનો પ્રકાર પસંદ કરો" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === "monthly-summary" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">મહિનો</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="મહિનો પસંદ કરો" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">વર્ષ</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="વર્ષ પસંદ કરો" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {reportType === "yearly-summary" && (
              <div>
                <Label htmlFor="year">વર્ષ</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="વર્ષ પસંદ કરો" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "customer-wise" && (
              <div>
                <Label htmlFor="customer">ગ્રાહક</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="ગ્રાહક પસંદ કરો" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.id} - {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={handleGenerateReport} className="w-full bg-primary hover:bg-primary/90">
                <BarChart3 className="h-4 w-4 mr-2" />
                રિપોર્ટ જનરેટ કરો
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-warning/10">
            <CardTitle className="text-accent flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              ઝડપી આંકડા
            </CardTitle>
            <CardDescription>મુખ્ય બિઝનેસ મેટ્રિક્સ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  ₹{formatAmount(loans.reduce((sum, loan) => sum + loan.amount, 0))}
                </div>
                <div className="text-sm text-muted-foreground">કુલ આપેલ</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-secondary">
                  ₹{formatAmount(repayments.reduce((sum, payment) => sum + payment.interestInfo, 0))}
                </div>
                <div className="text-sm text-muted-foreground">કુલ વ્યાજ મળેલ</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">
                  ₹{formatAmount(repayments.reduce((sum, payment) => sum + payment.amount, 0))}
                </div>
                <div className="text-sm text-muted-foreground">કુલ ચુકવણી</div>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">
                  ₹{formatAmount(loans.reduce((sum, loan) => sum + loan.remainingAmount, 0))}
                </div>
                <div className="text-sm text-muted-foreground">બાકી રકમ</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center">
                <Button onClick={() => generateCustomersExcel(customers)} variant="outline" className="flex-1 mr-2">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  ગ્રાહકો Excel
                </Button>
                <Button onClick={() => generateLoansExcel(loans)} variant="outline" className="flex-1 ml-2">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <Card className="border-2 border-accent/20">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-info/10">
            <CardTitle className="text-accent flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {generatedReport.title}
            </CardTitle>
            <CardDescription>જનરેટ કરેલ રિપોર્ટની વિગતો</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedReport.customer && (
              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">ગ્રાહકની માહિતી</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>નામ: {generatedReport.customer.name}</div>
                  <div>ID: {generatedReport.customer.id}</div>
                  <div>શહેર: {generatedReport.customer.city}</div>
                  <div>મોબાઇલ: {generatedReport.customer.mobile}</div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-4 mb-6">
              {generatedReport.totalLoansGiven !== undefined && (
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <div className="text-xl font-bold text-secondary">
                    ₹{formatAmount(generatedReport.totalLoansGiven)}
                  </div>
                  <div className="text-sm text-muted-foreground">કુલ આપેલ</div>
                </div>
              )}
              {generatedReport.totalRepayments !== undefined && (
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-xl font-bold text-success">
                    ₹{formatAmount(generatedReport.totalRepayments)}
                  </div>
                  <div className="text-sm text-muted-foreground">કુલ ચુકવણી</div>
                </div>
              )}
              {generatedReport.totalInterestEarned !== undefined && (
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-xl font-bold text-warning">
                    ₹{formatAmount(generatedReport.totalInterestEarned)}
                  </div>
                  <div className="text-sm text-muted-foreground">કુલ વ્યાજ</div>
                </div>
              )}
              {generatedReport.totalDiscountGiven !== undefined && (
                <div className="text-center p-4 bg-info/10 rounded-lg">
                  <div className="text-xl font-bold text-info">
                    ₹{formatAmount(generatedReport.totalDiscountGiven)}
                  </div>
                  <div className="text-sm text-muted-foreground">કુલ છૂટ આપેલ</div>
                </div>
              )}
            </div>

            {generatedReport.loans && generatedReport.loans.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-accent mb-3">વિગતો</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>ગ્રાહક</TableHead>
                        <TableHead>રકમ</TableHead>
                        <TableHead>તારીખ</TableHead>
                        <TableHead>સ્થિતિ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedReport.loans.map((loan: any) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.id}</TableCell>
                          <TableCell>{loan.customerName}</TableCell>
                          <TableCell>₹{formatAmount(loan.amount)}</TableCell>
                          <TableCell>{loan.startDate}</TableCell>
                          <TableCell>{loan.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {generatedReport.repayments && generatedReport.repayments.length > 0 && (
              <div>
                <h3 className="font-semibold text-accent mb-3">ચુકવણી વિગતો</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ચુકવણી ID</TableHead>
                        <TableHead>ગ્રાહક</TableHead>
                        <TableHead>રકમ</TableHead>
                        <TableHead>વ્યાજ માહિતી</TableHead>
                        <TableHead>તારીખ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedReport.repayments.map((repayment: any) => (
                        <TableRow key={repayment.id}>
                          <TableCell className="font-medium">{repayment.id}</TableCell>
                          <TableCell>{repayment.customerName}</TableCell>
                          <TableCell>₹{formatAmount(repayment.amount)}</TableCell>
                          <TableCell>₹{formatAmount(repayment.interestInfo)}</TableCell>
                          <TableCell>{repayment.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-info/20">
        <CardHeader className="bg-gradient-to-r from-info/10 to-primary/10">
          <CardTitle className="text-accent flex items-center gap-2">
            <Users className="h-5 w-5" />
            ગ્રાહક ડેટા સારાંશ
          </CardTitle>
          <CardDescription>તમામ ગ્રાહકોની સંક્ષિપ્ત માહિતી</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ગ્રાહક ID</TableHead>
                  <TableHead>નામ</TableHead>
                  <TableHead>કુલ</TableHead>
                  <TableHead>ચુકવેલ</TableHead>
                  <TableHead>બાકી</TableHead>
                  <TableHead>સ્થિતિ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-primary">{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell className="text-secondary">₹{formatAmount(customer.totalLoanAmount)}</TableCell>
                    <TableCell className="text-success">₹{formatAmount(customer.paidAmount)}</TableCell>
                    <TableCell className="text-destructive">₹{formatAmount(customer.remainingAmount)}</TableCell>
                    <TableCell>
                      <span className={customer.remainingAmount > 0 ? "text-warning" : "text-success"}>
                        {customer.remainingAmount > 0 ? "બાકી" : "પૂર્ણ"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
