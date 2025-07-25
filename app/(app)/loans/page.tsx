"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calculator, Eye, Receipt, Edit, Trash2, Printer } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { generateLoansPrint, generateReceiptPrint } from "@/lib/pdf-utils"

export default function LoansPage() {
  const { loans, customers, addLoan, updateLoan, deleteLoan, calculateInterest } = useAppStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewingLoan, setViewingLoan] = useState<any>(null)
  const [editingLoan, setEditingLoan] = useState<any>(null)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [calculatorResult, setCalculatorResult] = useState<any>(null)

  const handleAddLoan = (formData: FormData) => {
    const selectedCustomer = customers.find((c) => c.id === formData.get("customerId"))

    addLoan({
      customerId: formData.get("customerId") as string,
      customerName: selectedCustomer?.name || "",
      amount: Number(formData.get("amount")),
      interestRate: Number(formData.get("interestRate")),
      startDate: formData.get("startDate") as string,
      status: "સક્રિય",
      loanItem: formData.get("loanItem") as string,
      notes: formData.get("notes") as string,
    })

    setIsAddDialogOpen(false)
  }

  const handleEditLoan = (formData: FormData) => {
    updateLoan(editingLoan.id, {
      amount: Number(formData.get("amount")),
      interestRate: Number(formData.get("interestRate")),
      startDate: formData.get("startDate") as string,
      loanItem: formData.get("loanItem") as string,
      notes: formData.get("notes") as string,
    })

    setEditingLoan(null)
  }

  const handleCalculateInterest = (formData: FormData) => {
    const principal = Number(formData.get("principal"))
    const rate = Number(formData.get("rate"))
    const startDate = formData.get("startDate") as string

    const interest = calculateInterest(principal, rate, startDate)
    const total = principal + interest

    const startDateTime = new Date(startDate)
    const currentDateTime = new Date()
    const diffTime = Math.abs(currentDateTime.getTime() - startDateTime.getTime())
    const minutes = diffTime / (1000 * 60) // Use float minutes

    setCalculatorResult({
      principal,
      rate,
      startDate,
      interest,
      total,
      minutes,
    })
  }

  const handlePrint = () => {
    generateLoansPrint(loans)
  }

  const handleViewLoan = (loan: any) => {
    setViewingLoan(loan)
  }

  const handleGenerateReceipt = (loan: any) => {
    const receiptData = {
      loanId: loan.id,
      date: loan.startDate,
      customerId: loan.customerId,
      customerName: loan.customerName,
      amount: loan.amount,
      loanItem: loan.loanItem,
      notes: loan.notes,
    }
    generateReceiptPrint(receiptData)
  }

  const handleDeleteLoan = (loanId: string) => {
    if (confirm("શું તમે ખરેખર આ લોનને કાઢી નાખવા માંગો છો?")) {
      deleteLoan(loanId)
    }
  }

  // Calculate statistics
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalInterest = loans.reduce((sum, loan) => sum + loan.totalInterest, 0)
  const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">લોન વ્યવસ્થાપન</h1>
          <p className="text-muted-foreground">તમામ લોનની વિગતો અને સ્થિતિ</p>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
          <Printer className="h-4 w-4 mr-2" />
          પ્રિન્ટ કરો
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent">કુલ સક્રિય લોન</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{loans.length}</div>
            <p className="text-xs text-muted-foreground">કુલ લોન</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent">કુલ લોન રકમ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{totalLoanAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">કુલ આપેલ લોન રકમ</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent">કુલ વ્યાજ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ₹{totalInterest.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
            </div>
            <p className="text-xs text-muted-foreground">કુલ જનરેટ થયેલ વ્યાજ</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent">બાકી રકમ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">કુલ બાકી લોન રકમ</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-secondary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-accent">લોનની યાદી</CardTitle>
              <CardDescription>તમામ લોનની વિગતો અને તેમની સ્થિતિ</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-warning text-warning hover:bg-warning hover:text-white bg-transparent"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    વ્યાજ કેલ્ક્યુલેટર
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-warning">વ્યાજ કેલ્ક્યુલેટર</DialogTitle>
                    <DialogDescription>વ્યાજની ગણતરી કરો (વાર્ષિક દર, મિનિટવાર ગણતરી)</DialogDescription>
                  </DialogHeader>
                  <form action={handleCalculateInterest} className="space-y-4">
                    <div>
                      <Label htmlFor="principal">મૂળધન (₹) *</Label>
                      <Input
                        id="principal"
                        name="principal"
                        type="number"
                        required
                        className="border-warning/30 focus:border-warning"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate">વ્યાજ દર (વાર્ષિક %) *</Label>
                      <Input
                        id="rate"
                        name="rate"
                        type="number"
                        step="0.0001" // Allow more precision for input
                        required
                        className="border-warning/30 focus:border-warning"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">શરૂઆતની તારીખ *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        className="border-warning/30 focus:border-warning"
                      />
                    </div>
                    {calculatorResult && (
                      <div className="p-4 bg-warning/10 rounded-lg space-y-2">
                        <h4 className="font-medium text-warning">પરિણામ:</h4>
                        <div className="text-sm space-y-1">
                          <p>મૂળધન: ₹{calculatorResult.principal.toLocaleString()}</p>
                          <p>વ્યાજ દર: {calculatorResult.rate}% (વાર્ષિક)</p>
                          <p>મિનિટો: {calculatorResult.minutes.toFixed(2)}</p>
                          <p>
                            વ્યાજ: ₹
                            {calculatorResult.interest.toLocaleString(undefined, {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 4,
                            })}
                          </p>
                          <p className="font-bold">
                            કુલ રકમ: ₹
                            {calculatorResult.total.toLocaleString(undefined, {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 4,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCalculatorOpen(false)
                          setCalculatorResult(null)
                        }}
                      >
                        બંધ કરો
                      </Button>
                      <Button type="submit" className="bg-warning hover:bg-warning/90">
                        ગણતરી કરો
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    નવી લોન ઉમેરો
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-primary">નવી લોન ઉમેરો</DialogTitle>
                    <DialogDescription>નવી લોનની માહિતી દાખલ કરો</DialogDescription>
                  </DialogHeader>
                  <form action={handleAddLoan} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerId">ગ્રાહક પસંદ કરો *</Label>
                        <Select name="customerId" required>
                          <SelectTrigger className="border-primary/30 focus:border-primary">
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
                      <div>
                        <Label htmlFor="amount">લોન રકમ (₹) *</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          required
                          className="border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interestRate">વ્યાજ દર (વાર્ષિક %) *</Label>
                        <Input
                          id="interestRate"
                          name="interestRate"
                          type="number"
                          step="0.0001" // Allow more precision for input
                          required
                          className="border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="startDate">લોનની તારીખ *</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          required
                          className="border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loanItem">લોન આઇટમ *</Label>
                        <Input
                          id="loanItem"
                          name="loanItem"
                          required
                          placeholder="જેમ કે: સોનું, ચાંદી, રોકડ"
                          className="border-primary/30 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">નોંધ</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="લોન વિશે કોઈ વિશેષ નોંધ..."
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        રદ કરો
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        લોન ઉમેરો
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-muted to-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">લોન ID</TableHead>
                  <TableHead className="font-semibold">ગ્રાહક</TableHead>
                  <TableHead className="font-semibold">રકમ</TableHead>
                  <TableHead className="font-semibold">વ્યાજ દર</TableHead>
                  <TableHead className="font-semibold">તારીખ</TableHead>
                  <TableHead className="font-semibold">સ્થિતિ</TableHead>
                  <TableHead className="font-semibold">કુલ વ્યાજ</TableHead>
                  <TableHead className="font-semibold">બાકી રકમ</TableHead>
                  <TableHead className="font-semibold">ક્રિયાઓ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan, index) => (
                  <TableRow key={loan.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                    <TableCell className="font-medium text-primary">{loan.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{loan.customerName}</div>
                        <div className="text-sm text-muted-foreground">{loan.customerId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-secondary font-medium">₹{loan.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-info font-medium">{loan.interestRate}%</TableCell>
                    <TableCell>{loan.startDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={loan.status === "સક્રિય" ? "default" : "secondary"}
                        className={loan.status === "સક્રિય" ? "bg-success" : "bg-muted"}
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-warning font-medium">
                      ₹
                      {loan.totalInterest.toLocaleString(undefined, {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      })}
                    </TableCell>
                    <TableCell className="text-destructive font-medium">
                      ₹{loan.remainingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLoan(loan)}
                          className="border-info text-info hover:bg-info hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReceipt(loan)}
                          className="border-success text-success hover:bg-success hover:text-white"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLoan(loan)}
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLoan(loan.id)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Loan Dialog */}
      <Dialog open={!!viewingLoan} onOpenChange={() => setViewingLoan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">લોનની વિગતો</DialogTitle>
            <DialogDescription>લોન ID: {viewingLoan?.id}</DialogDescription>
          </DialogHeader>
          {viewingLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">ગ્રાહક</Label>
                  <p className="font-medium text-primary">
                    {viewingLoan.customerName} ({viewingLoan.customerId})
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">લોન રકમ</Label>
                  <p className="font-medium text-secondary">₹{viewingLoan.amount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-info/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">વ્યાજ દર</Label>
                  <p className="font-medium text-info">{viewingLoan.interestRate}% (વાર્ષિક)</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">તારીખ</Label>
                  <p className="font-medium text-accent">{viewingLoan.startDate}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">કુલ વ્યાજ</Label>
                  <p className="font-medium text-warning">
                    ₹
                    {viewingLoan.totalInterest.toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">ચુકવેલ રકમ</Label>
                  <p className="font-medium text-success">₹{viewingLoan.paidAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg col-span-2">
                  <Label className="text-sm text-muted-foreground">બાકી રકમ</Label>
                  <p className="font-medium text-destructive text-xl">
                    ₹{viewingLoan.remainingAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-muted/10 rounded-lg col-span-2">
                  <Label className="text-sm text-muted-foreground">લોન આઇટમ</Label>
                  <p className="font-medium">{viewingLoan.loanItem}</p>
                </div>
                {viewingLoan.notes && (
                  <div className="p-3 bg-muted/10 rounded-lg col-span-2">
                    <Label className="text-sm text-muted-foreground">નોંધ</Label>
                    <p className="font-medium">{viewingLoan.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingLoan(null)} className="bg-primary hover:bg-primary/90">
              બંધ કરો
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Loan Dialog */}
      <Dialog open={!!editingLoan} onOpenChange={() => setEditingLoan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">લોન સંપાદિત કરો</DialogTitle>
            <DialogDescription>લોનની માહિતી અપડેટ કરો</DialogDescription>
          </DialogHeader>
          {editingLoan && (
            <form action={handleEditLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-amount">લોન રકમ (₹) *</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    defaultValue={editingLoan.amount}
                    required
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-interestRate">વ્યાજ દર (વાર્ષિક %) *</Label>
                  <Input
                    id="edit-interestRate"
                    name="interestRate"
                    type="number"
                    step="0.0001" // Allow more precision for input
                    defaultValue={editingLoan.interestRate}
                    required
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-startDate">લોનની તારીખ *</Label>
                  <Input
                    id="edit-startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingLoan.startDate}
                    required
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-loanItem">લોન આઇટમ *</Label>
                  <Input
                    id="edit-loanItem"
                    name="loanItem"
                    defaultValue={editingLoan.loanItem}
                    required
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">નોંધ</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={editingLoan.notes}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingLoan(null)}>
                  રદ કરો
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  અપડેટ કરો
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
