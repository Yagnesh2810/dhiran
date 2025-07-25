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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Search, Eye, HandCoins, Receipt, FileText } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { generateCustomersPrint, generateCustomerReceiptPrint } from "@/lib/pdf-utils"

export default function CustomersPage() {
  const {
    customers,
    loans,
    repayments,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addLoanToExistingCustomer,
    addRepayment,
  } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [viewingCustomer, setViewingCustomer] = useState<any>(null)
  const [addingLoanCustomer, setAddingLoanCustomer] = useState<any>(null)
  const [addingPaymentCustomer, setAddingPaymentCustomer] = useState<any>(null)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm),
  )

  const handleAddCustomer = (formData: FormData) => {
    addCustomer({
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      mobile: formData.get("mobile") as string,
      firstLoanDate: formData.get("firstLoanDate") as string,
      totalLoanAmount: Number(formData.get("loanAmount")),
      loanItem: formData.get("loanItem") as string,
      notes: formData.get("notes") as string,
      interestRate: Number(formData.get("interestRate")),
    })
    setIsAddDialogOpen(false)
  }

  const handleEditCustomer = (formData: FormData) => {
    updateCustomer(editingCustomer.id, {
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      mobile: formData.get("mobile") as string,
      notes: formData.get("notes") as string,
    })
    setEditingCustomer(null)
  }

  const handleAddLoan = (formData: FormData) => {
    const amount = Number(formData.get("amount"))
    const interestRate = Number(formData.get("interestRate"))
    const startDate = formData.get("startDate") as string
    const loanItem = formData.get("loanItem") as string
    const notes = formData.get("notes") as string

    addLoanToExistingCustomer(addingLoanCustomer.id, amount, interestRate, startDate, loanItem, notes)
    setAddingLoanCustomer(null)
  }

  const handleAddPayment = (formData: FormData) => {
    const amount = Number(formData.get("amount"))
    const discountGiven = Number(formData.get("discountGiven")) || 0
    const date = formData.get("date") as string
    const notes = formData.get("notes") as string

    addRepayment({
      customerId: addingPaymentCustomer.id,
      customerName: addingPaymentCustomer.name,
      amount,
      discountGiven,
      date,
      notes,
      interestInfo: 0, // Will be calculated in store
    })
    setAddingPaymentCustomer(null)
  }

  const handlePrint = () => {
    generateCustomersPrint(filteredCustomers)
  }

  const handleCustomerReceipt = (customer: any) => {
    const customerLoans = loans.filter((loan) => loan.customerId === customer.id)
    const customerRepayments = repayments.filter((repayment) => repayment.customerId === customer.id)
    generateCustomerReceiptPrint(customer, customerLoans, customerRepayments)
  }

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("શું તમે ખરેખર આ ગ્રાહકને કાઢી નાખવા માંગો છો?")) {
      deleteCustomer(customerId)
    }
  }

  const getCustomerLoans = (customerId: string) => {
    return loans.filter((loan) => loan.customerId === customerId)
  }

  const getCustomerRepayments = (customerId: string) => {
    return repayments.filter((repayment) => repayment.customerId === customerId)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">ગ્રાહક જાળવો</h1>
          <p className="text-muted-foreground">તમામ ગ્રાહકોની માહિતી અને લોન વિગતો</p>
        </div>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
          <FileText className="h-4 w-4 mr-2" />
          પ્રિન્ટ કરો
        </Button>
      </div>

      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-accent">ગ્રાહકોની યાદી</CardTitle>
              <CardDescription>તમામ ગ્રાહકોની માહિતી અને તેમના લોનની વિગતો</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  નવો ગ્રાહક ઉમેરો
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-primary">નવો ગ્રાહક ઉમેરો</DialogTitle>
                  <DialogDescription>નવા ગ્રાહકની માહિતી દાખલ કરો</DialogDescription>
                </DialogHeader>
                <form action={handleAddCustomer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">નામ *</Label>
                      <Input id="name" name="name" required className="border-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <Label htmlFor="city">શહેર *</Label>
                      <Input id="city" name="city" required className="border-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <Label htmlFor="mobile">મોબાઇલ નંબર *</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstLoanDate">પ્રથમ લોનની તારીખ *</Label>
                      <Input
                        id="firstLoanDate"
                        name="firstLoanDate"
                        type="date"
                        required
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loanAmount">લોનની રકમ (₹) *</Label>
                      <Input
                        id="loanAmount"
                        name="loanAmount"
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
                        step="0.1"
                        required
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="loanItem">લોન આઇટમ (ધિરાણ આઇટમ) *</Label>
                    <Input
                      id="loanItem"
                      name="loanItem"
                      required
                      placeholder="જેમ કે: સોનું, ચાંદી, રોકડ, વગેરે"
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">નોંધ</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="કોઈ વિશેષ નોંધ..."
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      રદ કરો
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      ગ્રાહક ઉમેરો
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ગ્રાહકનું નામ, ID અથવા મોબાઇલ નંબર શોધો..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm border-secondary/30 focus:border-secondary"
            />
          </div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-muted to-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">ગ્રાહક ID</TableHead>
                  <TableHead className="font-semibold">નામ</TableHead>
                  <TableHead className="font-semibold">શહેર</TableHead>
                  <TableHead className="font-semibold">મોબાઇલ</TableHead>
                  <TableHead className="font-semibold">બાકી રકમ</TableHead>
                  <TableHead className="font-semibold">બાકી વ્યાજ</TableHead>
                  <TableHead className="font-semibold">ક્રિયાઓ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => {
                  const remainingInterest =
                    customer.totalInterest -
                    repayments.filter((r) => r.customerId === customer.id).reduce((sum, r) => sum + r.interestInfo, 0)

                  return (
                    <TableRow key={customer.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                      <TableCell className="font-medium text-primary">{customer.id}</TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell className="text-destructive font-medium">
                        ₹{customer.remainingAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-warning font-medium">₹{remainingInterest.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingCustomer(customer)}
                            className="border-info text-info hover:bg-info hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCustomer(customer)}
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCustomerReceipt(customer)}
                            className="border-success text-success hover:bg-success hover:text-white"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">ગ્રાહકની વિગતો</DialogTitle>
            <DialogDescription>
              {viewingCustomer?.name} ({viewingCustomer?.id}) ની સંપૂર્ણ માહિતી
            </DialogDescription>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-6">
              {/* Customer Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">નામ</Label>
                  <p className="font-medium text-primary">{viewingCustomer.name}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">ગ્રાહક ID</Label>
                  <p className="font-medium text-secondary">{viewingCustomer.id}</p>
                </div>
                <div className="p-3 bg-info/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">શહેર</Label>
                  <p className="font-medium text-info">{viewingCustomer.city}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">મોબાઇલ</Label>
                  <p className="font-medium text-accent">{viewingCustomer.mobile}</p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">કુલ લોન રકમ</Label>
                  <p className="font-medium text-warning text-xl">
                    ₹{viewingCustomer.totalLoanAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">ચુકવેલ રકમ</Label>
                  <p className="font-medium text-success text-xl">₹{viewingCustomer.paidAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <Label className="text-sm text-muted-foreground">બાકી રકમ</Label>
                  <p className="font-medium text-destructive text-xl">
                    ₹{viewingCustomer.remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Loans Details */}
              <div>
                <h3 className="font-semibold text-accent mb-3">લોન વિગતો</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>લોન ID</TableHead>
                        <TableHead>રકમ</TableHead>
                        <TableHead>વ્યાજ દર</TableHead>
                        <TableHead>તારીખ</TableHead>
                        <TableHead>કુલ વ્યાજ</TableHead>
                        <TableHead>બાકી રકમ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCustomerLoans(viewingCustomer.id).map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.id}</TableCell>
                          <TableCell>₹{loan.amount.toLocaleString()}</TableCell>
                          <TableCell>{loan.interestRate}%</TableCell>
                          <TableCell>{loan.startDate}</TableCell>
                          <TableCell>₹{loan.totalInterest.toLocaleString()}</TableCell>
                          <TableCell>₹{loan.remainingAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Repayments Details */}
              <div>
                <h3 className="font-semibold text-accent mb-3">ચુકવણી વિગતો</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ચુકવણી ID</TableHead>
                        <TableHead>રકમ</TableHead>
                        <TableHead>વ્યાજ માહિતી</TableHead>
                        <TableHead>તારીખ</TableHead>
                        <TableHead>રસીદ ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCustomerRepayments(viewingCustomer.id).map((repayment) => (
                        <TableRow key={repayment.id}>
                          <TableCell className="font-medium">{repayment.id}</TableCell>
                          <TableCell>₹{repayment.amount.toLocaleString()}</TableCell>
                          <TableCell>₹{repayment.interestInfo.toLocaleString()}</TableCell>
                          <TableCell>{repayment.date}</TableCell>
                          <TableCell>{repayment.receiptId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingCustomer(null)} className="bg-primary hover:bg-primary/90">
              બંધ કરો
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">ગ્રાહક ઉમેરો</DialogTitle>
            <DialogDescription>ગ્રાહકની માહિતી અપડેટ કરો</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-6">
              <form action={handleEditCustomer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">નામ *</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={editingCustomer.name}
                      required
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">શહેર *</Label>
                    <Input
                      id="edit-city"
                      name="city"
                      defaultValue={editingCustomer.city}
                      required
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-mobile">મોબાઇલ નંબર *</Label>
                    <Input
                      id="edit-mobile"
                      name="mobile"
                      type="tel"
                      defaultValue={editingCustomer.mobile}
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
                    defaultValue={editingCustomer.notes}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>
                    રદ કરો
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    અપડેટ કરો
                  </Button>
                </DialogFooter>
              </form>

              {/* Quick Actions */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-accent">ઝડપી ક્રિયાઓ</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setAddingLoanCustomer(editingCustomer)
                      setEditingCustomer(null)
                    }}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    <HandCoins className="h-4 w-4 mr-2" />
                    નવી લોન ઉમેરો
                  </Button>
                  <Button
                    onClick={() => {
                      setAddingPaymentCustomer(editingCustomer)
                      setEditingCustomer(null)
                    }}
                    className="bg-success hover:bg-success/90"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    ચુકવણી ઉમેરો
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Loan Dialog */}
      <Dialog open={!!addingLoanCustomer} onOpenChange={() => setAddingLoanCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-secondary">નવી લોન ઉમેરો</DialogTitle>
            <DialogDescription>
              {addingLoanCustomer?.name} ({addingLoanCustomer?.id}) માટે નવી લોન ઉમેરો
            </DialogDescription>
          </DialogHeader>
          {addingLoanCustomer && (
            <form action={handleAddLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan-amount">લોન રકમ (₹) *</Label>
                  <Input
                    id="loan-amount"
                    name="amount"
                    type="number"
                    required
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="loan-interestRate">વ્યાજ દર (વાર્ષિક %) *</Label>
                  <Input
                    id="loan-interestRate"
                    name="interestRate"
                    type="number"
                    step="0.1"
                    defaultValue={addingLoanCustomer.interestRate}
                    required
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="loan-startDate">લોનની તારીખ *</Label>
                  <Input
                    id="loan-startDate"
                    name="startDate"
                    type="date"
                    required
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="loan-loanItem">લોન આઇટમ *</Label>
                  <Input
                    id="loan-loanItem"
                    name="loanItem"
                    defaultValue={addingLoanCustomer.loanItem}
                    required
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="loan-notes">નોંધ</Label>
                <Textarea
                  id="loan-notes"
                  name="notes"
                  placeholder="લોન વિશે કોઈ વિશેષ નોંધ..."
                  className="border-secondary/30 focus:border-secondary"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddingLoanCustomer(null)}>
                  રદ કરો
                </Button>
                <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                  લોન ઉમેરો
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={!!addingPaymentCustomer} onOpenChange={() => setAddingPaymentCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-success">ચુકવણી ઉમેરો</DialogTitle>
            <DialogDescription>
              {addingPaymentCustomer?.name} ({addingPaymentCustomer?.id}) માટે ચુકવણી ઉમેરો
            </DialogDescription>
          </DialogHeader>
          {addingPaymentCustomer && (
            <form action={handleAddPayment} className="space-y-4">
              <div className="p-4 bg-info/10 rounded-lg">
                <h4 className="font-medium mb-2 text-info">વર્તમાન સ્થિતિ</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>કુલ લોન: ₹{addingPaymentCustomer.totalLoanAmount.toLocaleString()}</div>
                  <div>કુલ વ્યાજ: ₹{addingPaymentCustomer.totalInterest.toLocaleString()}</div>
                  <div>ચુકવેલ: ₹{addingPaymentCustomer.paidAmount.toLocaleString()}</div>
                  <div>બાકી: ₹{addingPaymentCustomer.remainingAmount.toLocaleString()}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-amount">ચુકવણી રકમ (₹) *</Label>
                  <Input
                    id="payment-amount"
                    name="amount"
                    type="number"
                    required
                    className="border-success/30 focus:border-success"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-discount">છૂટ આપેલ (₹)</Label>
                  <Input
                    id="payment-discount"
                    name="discountGiven"
                    type="number"
                    defaultValue={0}
                    className="border-success/30 focus:border-success"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="payment-date">ચુકવણીની તારીખ *</Label>
                  <Input
                    id="payment-date"
                    name="date"
                    type="date"
                    required
                    className="border-success/30 focus:border-success"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="payment-notes">નોંધ</Label>
                <Textarea
                  id="payment-notes"
                  name="notes"
                  placeholder="ચુકવણી વિશે કોઈ વિશેષ નોંધ..."
                  className="border-success/30 focus:border-success"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddingPaymentCustomer(null)}>
                  રદ કરો
                </Button>
                <Button type="submit" className="bg-success hover:bg-success/90">
                  ચુકવણી ઉમેરો
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
