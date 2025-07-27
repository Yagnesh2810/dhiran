"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Download, HandCoins, Receipt, Plus, Minus, Filter, FileSpreadsheet } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateHistoryExcel, generateFundHistoryExcel } from "@/lib/excel-utils"
import { formatAmount } from "@/lib/utils"

export default function HistoryPage() {
  const { history, customers } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Get unique years and months from history
  const years = [...new Set(history.map((item) => new Date(item.date).getFullYear()))].sort((a, b) => b - a)
  const months = [
    { value: "01", label: "જાન્યુઆરી" },
    { value: "02", label: "ફેબ્રુઆરી" },
    { value: "03", label: "માર્ચ" },
    { value: "04", label: "એપ્રિલ" },
    { value: "05", label: "મે" },
    { value: "06", label: "જૂન" },
    { value: "07", label: "જુલાઈ" },
    { value: "08", label: "ઓગસ્ટ" },
    { value: "09", label: "સપ્ટેમ્બર" },
    { value: "10", label: "ઓક્ટોબર" },
    { value: "11", label: "નવેમ્બર" },
    { value: "12", label: "ડિસેમ્બર" },
  ]

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.customerName && item.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.customerId && item.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const itemDate = new Date(item.date)
    const matchesYear = selectedYear === "all" || itemDate.getFullYear().toString() === selectedYear
    const matchesMonth =
      selectedMonth === "all" || (itemDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonth
    const matchesCustomer = selectedCustomer === "all" || item.customerId === selectedCustomer

    return matchesSearch && matchesYear && matchesMonth && matchesCustomer
  })

  const handlePrint = () => {
    const dateFilter =
      selectedYear !== "all" && selectedMonth !== "all"
        ? `_${selectedYear}_${selectedMonth}`
        : selectedYear !== "all"
          ? `_${selectedYear}`
          : ""
    const customerFilter =
      selectedCustomer !== "all" ? `_${customers.find((c) => c.id === selectedCustomer)?.name}` : ""

    const content = `
સંપૂર્ણ ઇતિહાસ${dateFilter ? ` - ${selectedYear}${selectedMonth !== "all" ? `/${selectedMonth}` : ""}` : ""}${customerFilter ? ` - ${customers.find((c) => c.id === selectedCustomer)?.name}` : ""}
તારીખ: ${new Date().toLocaleDateString("gu-IN")}

ધિરાણ આઇટમ: ધિરાણ

${filteredHistory
  .map(
    (item, index) => `
${index + 1}. ID: ${item.id}
   પ્રકાર: ${item.type}
   ગ્રાહક: ${item.customerName || "સિસ્ટમ"}
   રકમ: ₹${formatAmount(item.amount)}
   તારીખ: ${item.date}
   સ્થિતિ: ${item.status}
   વર્ણન: ${item.description}
   
`,
  )
  .join("")}

કુલ એન્ટ્રીઓ: ${filteredHistory.length}
કુલ રકમ: ₹${formatAmount(filteredHistory.reduce((sum, item) => sum + item.amount, 0))}
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>ઇતિહાસ રિપોર્ટ</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;700&display=swap');
                body {
                    font-family: 'Noto Sans Gujarati', Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .content {
                    white-space: pre-line;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    border-top: 1px solid #ccc;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ધિરાણ સોફ્ટવેર</h1>
                <p>વિશ્વસનીય ધિરાણ સેવા</p>
            </div>
            <div class="content">${content}</div>
            <div class="footer">
                <p>આભાર! - ધિરાણ સોફ્ટવેર</p>
                <p>સંપર્ક: +91 98765 43210 | ઇમેઇલ: info@dhiran.com</p>
            </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const clearFilters = () => {
    setSelectedYear("all")
    setSelectedMonth("all")
    setSelectedCustomer("all")
    setSearchTerm("")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "લોન આપેલ":
        return <HandCoins className="h-4 w-4 text-primary" />
      case "ચુકવણી મળેલ":
        return <Receipt className="h-4 w-4 text-success" />
      case "ભંડોળ ઉમેર્યું":
        return <Plus className="h-4 w-4 text-success" />
      case "ભંડોળ કાઢ્યું":
        return <Minus className="h-4 w-4 text-warning" />
      default:
        return null
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "લોન આપેલ":
        return "bg-primary"
      case "ચુકવણી મળેલ":
        return "bg-success"
      case "ભંડોળ ઉમેર્યું":
        return "bg-success"
      case "ભંડોળ કાઢ્યું":
        return "bg-warning"
      default:
        return "bg-muted"
    }
  }

  const handlePrintFunds = () => {
    const fundHistory = filteredHistory.filter((item) => item.type === "ભંડોળ ઉમેર્યું" || item.type === "ભંડોળ કાઢ્યું")

    const content = `
ભંડોળ ઇતિહાસ
તારીખ: ${new Date().toLocaleDateString("gu-IN")}

ધિરાણ આઇટમ: ધિરાણ

${fundHistory
  .map(
    (item, index) => `
${index + 1}. ID: ${item.id}
   પ્રકાર: ${item.type}
   રકમ: ₹${formatAmount(item.amount)}
   તારીખ: ${item.date}
   સ્થિતિ: ${item.status}
   વર્ણન: ${item.description}
   
`,
  )
  .join("")}

કુલ એન્ટ્રીઓ: ${fundHistory.length}
કુલ રકમ: ₹${formatAmount(fundHistory.reduce((sum, item) => sum + (item.type === "ભંડોળ ઉમેર્યું" ? item.amount : -item.amount), 0))}
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>ભંડોળ ઇતિહાસ રિપોર્ટ</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;700&display=swap');
                body {
                    font-family: 'Noto Sans Gujarati', Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .content {
                    white-space: pre-line;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    border-top: 1px solid #ccc;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ધિરાણ સોફ્ટવેર</h1>
                <p>વિશ્વસનીય ધિરાણ સેવા</p>
            </div>
            <div class="content">${content}</div>
            <div class="footer">
                <p>આભાર! - ધિરાણ સોફ્ટવેર</p>
                <p>સંપર્ક: +91 98765 43210 | ઇમેઇલ: info@dhiran.com</p>
            </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">ઇતિહાસ</h1>
          <p className="text-muted-foreground">તમામ વ્યવહારોનો સંપૂર્ણ ઇતિહાસ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            પ્રિન્ટ કરો
          </Button>
          <Button
            onClick={() => generateHistoryExcel(filteredHistory)}
            variant="outline"
            className="border-success text-success hover:bg-success hover:text-white"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel ડાઉનલોડ
          </Button>
        </div>
      </div>

      <Card className="border-2 border-accent/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
          <CardTitle className="text-accent">સંપૂર્ણ ઇતિહાસ</CardTitle>
          <CardDescription>તમામ લોન, ચુકવણી અને ભંડોળ વ્યવહારોનો ઇતિહાસ</CardDescription>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ગ્રાહક, ID, પ્રકાર અથવા વર્ણન શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-accent/30 focus:border-accent"
              />
            </div>

            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-info text-info hover:bg-info hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  ફિલ્ટર
                  {(selectedYear !== "all" || selectedMonth !== "all" || selectedCustomer !== "all") && (
                    <Badge variant="secondary" className="ml-2">
                      {
                        [
                          selectedYear !== "all" ? "1" : "",
                          selectedMonth !== "all" ? "1" : "",
                          selectedCustomer !== "all" ? "1" : "",
                        ].filter(Boolean).length
                      }
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-info">ઇતિહાસ ફિલ્ટર</DialogTitle>
                  <DialogDescription>વર્ષ, મહિના અને ગ્રાહક પ્રમાણે ડેટા ફિલ્ટર કરો</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer">ગ્રાહક</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="ગ્રાહક પસંદ કરો" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">બધા ગ્રાહકો</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.id} - {customer.name}
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
                        <SelectItem value="all">બધા વર્ષો</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="month">મહિનો</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="મહિનો પસંદ કરો" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">બધા મહિનાઓ</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={clearFilters}>
                    ક્લિયર કરો
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="bg-info hover:bg-info/90">
                    લાગુ કરો
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {(selectedYear !== "all" || selectedMonth !== "all" || selectedCustomer !== "all" || searchTerm) && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                બધા ફિલ્ટર ક્લિયર કરો
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">સંપૂર્ણ ઇતિહાસ</TabsTrigger>
              <TabsTrigger value="transactions">વ્યવહાર ઇતિહાસ</TabsTrigger>
              <TabsTrigger value="funds">ભંડોળ ઇતિહાસ</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">કોઈ ઇતિહાસ મળ્યો નથી</div>
              ) : (
                filteredHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <div>
                        <p className="font-medium">
                          {item.customerName ? `${item.customerName} - ` : ""}
                          {item.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.date} - ₹{formatAmount(item.amount)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className={getBadgeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {filteredHistory.filter((item) => item.type === "લોન આપેલ" || item.type === "ચુકવણી મળેલ").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">કોઈ વ્યવહાર ઇતિહાસ મળ્યો નથી</div>
              ) : (
                filteredHistory
                  .filter((item) => item.type === "લોન આપેલ" || item.type === "ચુકવણી મળેલ")
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        {getIcon(item.type)}
                        <div>
                          <p className="font-medium">
                            {item.customerName ? `${item.customerName} - ` : ""}
                            {item.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.date} - ₹{formatAmount(item.amount)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className={getBadgeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="funds" className="space-y-4">
              {filteredHistory.filter((item) => item.type === "ભંડોળ ઉમેર્યું" || item.type === "ભંડોળ કાઢ્યું").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">કોઈ રકમ ઇતિહાસ મળ્યો નથી</div>
              ) : (
                filteredHistory
                  .filter((item) => item.type === "ભંડોળ ઉમેર્યું" || item.type === "ભંડોળ કાઢ્યું")
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        {getIcon(item.type)}
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.date} - ₹{formatAmount(item.amount)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className={getBadgeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  ))
              )}
              <div className="mt-4 flex gap-2">
                <Button onClick={handlePrintFunds} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  ભંડોળ ઇતિહાસ પ્રિન્ટ કરો
                </Button>
                <Button
                  onClick={() => generateFundHistoryExcel(history)}
                  variant="outline"
                  className="flex-1 border-success text-success hover:bg-success hover:text-white"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  ભંડોળ Excel ડાઉનલોડ
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
