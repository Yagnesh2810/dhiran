"use client"

import { create } from "zustand"
import {
  createCustomer,
  getCustomers,
  updateCustomer as updateCustomerDb,
  deleteCustomer as deleteCustomerDb,
  createLoan as createLoanDb,
  getLoans,
  updateLoan as updateLoanDb,
  deleteLoan as deleteLoanDb,
  createRepayment as createRepaymentDb,
  getRepayments,
  updateRepayment as updateRepaymentDb,
  deleteRepayment as deleteRepaymentDb,
  createFundTransaction as createFundTransactionDb,
  getFundTransactions,
  createHistoryItem,
  getHistory,
  convertDatabaseCustomerToApp,
  convertAppCustomerToDatabase,
  convertDatabaseRepaymentToApp,
  convertDatabaseLoanToApp,
  convertAppLoanToDatabase,
  type DatabaseCustomer,
  type DatabaseLoan,
  type DatabaseRepayment,
  type DatabaseFundTransaction,
  type DatabaseHistory,
} from "@/lib/supabase/database"

export interface Customer {
  id: string
  name: string
  city: string
  mobile: string
  firstLoanDate: string
  totalLoanAmount: number
  totalInterest: number
  loanItem: string
  notes: string
  interestRate: number
  paidAmount: number
  remainingAmount: number
}

export interface Loan {
  id: string
  customerId: string
  customerName: string
  amount: number
  interestRate: number
  startDate: string
  status: string
  totalInterest: number
  paidAmount: number
  remainingAmount: number
  loanItem: string
  notes: string
}

export interface Repayment {
  id: string
  customerId: string
  customerName: string
  amount: number
  interestInfo: number
  discountGiven: number
  date: string
  receiptId: string
  notes: string
  verificationImages?: string[]
}

export interface FundTransaction {
  id: string
  type: "add" | "remove"
  amount: number
  reason: string
  date: string
}

export interface HistoryItem {
  id: string
  type: "લોન આપેલ" | "ચુકવણી મળેલ" | "ભંડોળ ઉમેર્યું" | "ભંડોળ કાઢ્યું"
  customerId?: string
  customerName?: string
  amount: number
  date: string
  status: string
  description: string
}

interface AppState {
  customers: Customer[]
  loans: Loan[]
  repayments: Repayment[]
  fundTransactions: FundTransaction[]
  history: HistoryItem[]
  totalFunds: number
  isDataLoaded: boolean

  // Actions
  fetchInitialData: () => Promise<void>
  addCustomer: (customer: Omit<Customer, "id" | "totalInterest" | "paidAmount" | "remainingAmount">) => Promise<void>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>

  addLoan: (loan: Omit<Loan, "id" | "totalInterest" | "paidAmount" | "remainingAmount">) => Promise<void>
  updateLoan: (id: string, loan: Partial<Loan>) => Promise<void>
  deleteLoan: (id: string) => Promise<void>
  completeLoan: (id: string) => Promise<void>

  addRepayment: (repayment: Omit<Repayment, "id" | "receiptId">) => Promise<void>
  updateRepayment: (id: string, repayment: Partial<Repayment>) => Promise<void>
  deleteRepayment: (id: string) => Promise<void>

  addFundTransaction: (transaction: Omit<FundTransaction, "id">) => Promise<void>

  calculateInterest: (principal: number, rate: number, startDate: string) => number
  recalculateCustomerTotals: () => void
  addLoanToExistingCustomer: (
    customerId: string,
    amount: number,
    interestRate: number,
    startDate: string,
    loanItem: string,
    notes: string,
  ) => Promise<void>
  calculateAvailableFunds: () => number
}

const calculateMinutesBetween = (startDate: string, endDate: string = new Date().toISOString()) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return diffTime / (1000 * 60) // Return float for minutes
}

// Helper to generate sequential IDs
const generateNextId = (prefix: string, existingIds: string[]) => {
  let maxNum = 0
  existingIds.forEach((id) => {
    const num = Number.parseInt(id.replace(prefix, ""), 10)
    if (!isNaN(num) && num > maxNum) {
      maxNum = num
    }
  })
  return `${prefix}${(maxNum + 1).toString().padStart(3, "0")}`
}

export const useAppStore = create<AppState>()((set, get) => ({
  customers: [],
  loans: [],
  repayments: [],
  fundTransactions: [],
  history: [],
  totalFunds: 0,
  isDataLoaded: false,

  fetchInitialData: async () => {
    try {
      const [dbCustomers, dbLoans, dbRepayments, dbFundTransactions, dbHistory] = await Promise.all([
        getCustomers(),
        getLoans(),
        getRepayments(),
        getFundTransactions(),
        getHistory(),
      ])

      const appCustomers = dbCustomers.map(convertDatabaseCustomerToApp)
      const appRepayments = dbRepayments.map(convertDatabaseRepaymentToApp)
      const appLoans = dbLoans.map(convertDatabaseLoanToApp)

      set({
        customers: appCustomers,
        loans: appLoans,
        repayments: appRepayments,
        fundTransactions: dbFundTransactions.map((t) => ({
          id: t.id,
          type: t.transaction_type,
          amount: t.amount,
          reason: t.reason,
          date: t.transaction_date,
        })),
        history: dbHistory.map((h) => ({
          id: h.id,
          type: h.activity_type as any,
          customerId: h.customer_id,
          customerName: h.customer_name,
          amount: h.amount,
          date: h.activity_date,
          status: h.status,
          description: h.description,
        })),
        isDataLoaded: true,
      })
      get().recalculateCustomerTotals()
    } catch (error) {
      console.error("Error fetching initial data:", error)
    }
  },

  calculateInterest: (principal: number, rate: number, startDate: string) => {
    const minutes = calculateMinutesBetween(startDate)
    // Annual rate / 100 / 365 days / 24 hours / 60 minutes
    const interest = (principal * rate * minutes) / (100 * 365 * 24 * 60)
    return Math.ceil(interest) // Round up to next whole number
  },

  calculateAvailableFunds: () => {
    const state = get()

    let availableFunds = 15000000 // Initial amount

    state.fundTransactions.forEach((transaction) => {
      if (transaction.type === "add") {
        availableFunds += transaction.amount
      } else {
        availableFunds -= transaction.amount
      }
    })

    const totalLoansGiven = state.loans.reduce((sum, loan) => sum + loan.amount, 0)
    availableFunds -= totalLoansGiven

    const totalRepaymentsReceived = state.repayments.reduce((sum, repayment) => sum + repayment.amount, 0)
    availableFunds += totalRepaymentsReceived

    return availableFunds
  },

  recalculateCustomerTotals: () => {
    set((state) => {
      const updatedCustomers = state.customers.map((customer) => {
        const customerLoans = state.loans.filter((loan) => loan.customerId === customer.id)
        const customerRepayments = state.repayments.filter((repayment) => repayment.customerId === customer.id)

        const totalLoanAmount = customerLoans.reduce((sum, loan) => sum + loan.amount, 0)
        // Recalculate total interest for each loan based on current time (skip completed loans)
        const totalInterestAccrued = customerLoans.reduce(
          (sum, loan) => sum + (loan.status === "પૂર્ણ" ? 0 : get().calculateInterest(loan.amount, loan.interestRate, loan.startDate)),
          0,
        )
        const paidAmount = customerRepayments.reduce((sum, repayment) => sum + repayment.amount, 0)
        const totalDiscountGiven = customerRepayments.reduce((sum, repayment) => sum + repayment.discountGiven, 0)

        // Remaining amount considers both cash payments and discounts given
        const remainingAmount = totalLoanAmount + totalInterestAccrued - (paidAmount + totalDiscountGiven)

        return {
          ...customer,
          totalLoanAmount,
          totalInterest: totalInterestAccrued, // Whole number
          paidAmount,
          remainingAmount: Math.ceil(remainingAmount), // Round up to next whole number
        }
      })

      const updatedLoans = state.loans.map((loan) => {
        const loanRepayments = state.repayments.filter((repayment) => repayment.customerId === loan.customerId) // Repayments are linked to customer, not specific loan
        const totalPaidForLoan = loanRepayments.reduce((sum, repayment) => sum + repayment.amount, 0)
        const totalDiscountForLoan = loanRepayments.reduce((sum, repayment) => sum + repayment.discountGiven, 0)

        // Don't calculate interest for completed loans
        const currentLoanInterest = loan.status === "પૂર્ણ" ? 0 : get().calculateInterest(loan.amount, loan.interestRate, loan.startDate)

        // Remaining amount considers both cash payments and discounts given
        const remainingAmount = loan.status === "પૂર્ણ" ? 0 : loan.amount + currentLoanInterest - (totalPaidForLoan + totalDiscountForLoan)

        return {
          ...loan,
          totalInterest: currentLoanInterest,
          paidAmount: totalPaidForLoan,
          remainingAmount: loan.status === "પૂર્ણ" ? 0 : Math.ceil(remainingAmount),
          status: loan.status === "પૂર્ણ" ? "પૂર્ણ" : (remainingAmount <= 0 ? "પૂર્ણ" : "સક્રિય"),
        }
      })

      const calculatedFunds = get().calculateAvailableFunds()

      return {
        customers: updatedCustomers,
        loans: updatedLoans,
        totalFunds: calculatedFunds,
      }
    })
  },

  addLoanToExistingCustomer: async (customerId, amount, interestRate, startDate, loanItem, notes) => {
    const state = get()
    const customer = state.customers.find((c) => c.id === customerId)
    if (!customer) return

    const existingLoanIds = state.loans.map((l) => l.id)
    const id = generateNextId("L", existingLoanIds)
    const totalInterest = state.calculateInterest(amount, interestRate, startDate)

    const loan: Omit<DatabaseLoan, "created_at" | "updated_at"> = {
      id,
      customer_id: customerId,
      customer_name: customer.name,
      amount,
      interest_rate: interestRate,
      start_date: startDate,
      status: "સક્રિય",
      total_interest: totalInterest,
      paid_amount: 0,
      remaining_amount: amount + totalInterest,
      loan_item: loanItem,
      notes,
    }

    const existingHistoryIds = state.history.map((h) => h.id)
    const historyId = generateNextId("H", existingHistoryIds)
    const historyItem: Omit<DatabaseHistory, "created_at" | "updated_at"> = {
      id: historyId,
      activity_type: "લોન આપેલ",
      customer_id: customerId,
      customer_name: customer.name,
      amount,
      activity_date: startDate,
      status: "સક્રિય",
      description: "નવી લોન ઉમેરાઈ",
    }

    try {
      await createLoanDb(loan)
      await createHistoryItem(historyItem)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error adding loan to existing customer:", error)
    }
  },

  addCustomer: async (customerData) => {
    const state = get()
    const existingCustomerIds = state.customers.map((c) => c.id)
    const customerId = generateNextId("CID", existingCustomerIds)

    const totalInterest = state.calculateInterest(
      customerData.totalLoanAmount,
      customerData.interestRate,
      customerData.firstLoanDate,
    )

    const dbCustomer: Omit<DatabaseCustomer, "created_at" | "updated_at"> = {
      id: customerId,
      name: customerData.name,
      city: customerData.city,
      mobile: customerData.mobile,
      first_loan_date: customerData.firstLoanDate,
      total_loan_amount: customerData.totalLoanAmount,
      total_interest: totalInterest,
      loan_item: customerData.loanItem,
      notes: customerData.notes,
      interest_rate: customerData.interestRate,
      paid_amount: 0,
      remaining_amount: customerData.totalLoanAmount + totalInterest,
    }

    const existingLoanIds = state.loans.map((l) => l.id)
    const loanId = generateNextId("L", existingLoanIds)
    const dbLoan: Omit<DatabaseLoan, "created_at" | "updated_at"> = {
      id: loanId,
      customer_id: customerId,
      customer_name: customerData.name,
      amount: customerData.totalLoanAmount,
      interest_rate: customerData.interestRate,
      start_date: customerData.firstLoanDate,
      status: "સક્રિય",
      total_interest: totalInterest,
      paid_amount: 0,
      remaining_amount: customerData.totalLoanAmount + totalInterest,
      loan_item: customerData.loanItem,
      notes: customerData.notes,
    }

    const existingHistoryIds = state.history.map((h) => h.id)
    const historyId = generateNextId("H", existingHistoryIds)
    const dbHistoryItem: Omit<DatabaseHistory, "created_at" | "updated_at"> = {
      id: historyId,
      activity_type: "લોન આપેલ",
      customer_id: customerId,
      customer_name: customerData.name,
      amount: customerData.totalLoanAmount,
      activity_date: customerData.firstLoanDate,
      status: "સક્રિય",
      description: "નવો ગ્રાહક અને લોન",
    }

    try {
      await createCustomer(dbCustomer)
      await createLoanDb(dbLoan)
      await createHistoryItem(dbHistoryItem)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error adding customer:", error)
    }
  },

  updateCustomer: async (id, updates) => {
    const state = get()
    const customerToUpdate = state.customers.find((c) => c.id === id)
    if (!customerToUpdate) return

    const updatedCustomerData = { ...customerToUpdate, ...updates }

    // Recalculate totalInterest and remainingAmount if relevant fields are updated
    if (updates.firstLoanDate || updates.totalLoanAmount || updates.interestRate) {
      updatedCustomerData.totalInterest = state.calculateInterest(
        updatedCustomerData.totalLoanAmount,
        updatedCustomerData.interestRate,
        updatedCustomerData.firstLoanDate,
      )
      updatedCustomerData.remainingAmount =
        updatedCustomerData.totalLoanAmount + updatedCustomerData.totalInterest - updatedCustomerData.paidAmount
    }

    const dbUpdates = convertAppCustomerToDatabase(updatedCustomerData)

    try {
      await updateCustomerDb(id, dbUpdates)
      // If interest rate changed, update all associated loans' total interest
      if (updates.interestRate !== undefined) {
        const customerLoans = state.loans.filter((loan) => loan.customerId === id)
        for (const loan of customerLoans) {
          const updatedLoanTotalInterest = state.calculateInterest(loan.amount, updates.interestRate, loan.startDate)
          await updateLoanDb(loan.id, {
            interest_rate: updates.interestRate,
            total_interest: updatedLoanTotalInterest,
            remaining_amount: loan.amount + updatedLoanTotalInterest - loan.paidAmount,
          })
        }
      }
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error updating customer:", error)
    }
  },

  deleteCustomer: async (id) => {
    try {
      await deleteCustomerDb(id)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error deleting customer:", error)
    }
  },

  addLoan: async (loanData) => {
    const state = get()
    const existingLoanIds = state.loans.map((l) => l.id)
    const id = generateNextId("L", existingLoanIds)
    const totalInterest = state.calculateInterest(loanData.amount, loanData.interestRate, loanData.startDate)

    const dbLoan: Omit<DatabaseLoan, "created_at" | "updated_at"> = {
      id,
      customer_id: loanData.customerId,
      customer_name: loanData.customerName,
      amount: loanData.amount,
      interest_rate: loanData.interestRate,
      start_date: loanData.startDate,
      status: "સક્રિય",
      total_interest: totalInterest,
      paid_amount: 0,
      remaining_amount: loanData.amount + totalInterest,
      loan_item: loanData.loanItem,
      notes: loanData.notes,
    }

    const existingHistoryIds = state.history.map((h) => h.id)
    const historyId = generateNextId("H", existingHistoryIds)
    const dbHistoryItem: Omit<DatabaseHistory, "created_at" | "updated_at"> = {
      id: historyId,
      activity_type: "લોન આપેલ",
      customer_id: loanData.customerId,
      customer_name: loanData.customerName,
      amount: loanData.amount,
      activity_date: loanData.startDate,
      status: "સક્રિય",
      description: "નવી લોન",
    }

    try {
      await createLoanDb(dbLoan)
      await createHistoryItem(dbHistoryItem)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error adding loan:", error)
    }
  },

  updateLoan: async (id, updates) => {
    const state = get()
    const loanToUpdate = state.loans.find((l) => l.id === id)
    if (!loanToUpdate) return

    const updatedLoanData = { ...loanToUpdate, ...updates }

    if (updates.startDate || updates.amount || updates.interestRate) {
      updatedLoanData.totalInterest = state.calculateInterest(
        updatedLoanData.amount,
        updatedLoanData.interestRate,
        updatedLoanData.startDate,
      )
      updatedLoanData.remainingAmount =
        updatedLoanData.amount + updatedLoanData.totalInterest - updatedLoanData.paidAmount
    }

    const dbUpdates: Partial<DatabaseLoan> = convertAppLoanToDatabase(updatedLoanData)

    try {
      await updateLoanDb(id, dbUpdates)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error updating loan:", error)
    }
  },

  deleteLoan: async (id) => {
    try {
      await deleteLoanDb(id)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error deleting loan:", error)
    }
  },

  addRepayment: async (repaymentData) => {
    const state = get()
    const existingRepaymentIds = state.repayments.map((r) => r.id)
    const id = generateNextId("R", existingRepaymentIds)
    const receiptId = generateNextId("RCP", existingRepaymentIds) // Using repayment IDs for receipt IDs too

    const customer = state.customers.find((c) => c.id === repaymentData.customerId)
    if (!customer) return

    const customerLoans = state.loans.filter((l) => l.customerId === repaymentData.customerId)
    const totalAccruedInterest = customerLoans.reduce((sum, loan) => sum + loan.totalInterest, 0)
    const totalPaidInterestSoFar = state.repayments
      .filter((r) => r.customerId === repaymentData.customerId)
      .reduce((sum, r) => sum + r.interestInfo, 0)

    const outstandingInterest = totalAccruedInterest - totalPaidInterestSoFar

    // Total value applied by this repayment (cash payment + discount given)
    const effectiveValueApplied = repaymentData.amount + repaymentData.discountGiven

    // How much of this effective value goes towards interest?
    let interestPortionOfThisPayment = Math.min(effectiveValueApplied, outstandingInterest)

    // Ensure interestInfo is not negative
    if (interestPortionOfThisPayment < 0) interestPortionOfThisPayment = 0

    const dbRepayment: Omit<DatabaseRepayment, "created_at" | "updated_at"> = {
      id,
      customer_id: repaymentData.customerId,
      customer_name: repaymentData.customerName,
      amount: repaymentData.amount, // Total cash amount paid by customer
      interest_info: Math.ceil(interestPortionOfThisPayment), // Round up to next whole number
      discount_given: repaymentData.discountGiven, // Discount given, separate from cash payment
      payment_date: repaymentData.date,
      receipt_id: receiptId,
      notes: repaymentData.notes,
      verification_images: repaymentData.verificationImages || [],
    }

    const existingHistoryIds = state.history.map((h) => h.id)
    const historyId = generateNextId("H", existingHistoryIds)
    const dbHistoryItem: Omit<DatabaseHistory, "created_at" | "updated_at"> = {
      id: historyId,
      activity_type: "ચુકવણી મળેલ",
      customer_id: repaymentData.customerId,
      customer_name: repaymentData.customerName,
      amount: repaymentData.amount, // History should reflect actual cash received
      activity_date: repaymentData.date,
      status: "પૂર્ણ",
      description: `લોન ચુકવણી${repaymentData.discountGiven > 0 ? ` (છૂટ: ₹${repaymentData.discountGiven})` : ""}`,
    }

    try {
      await createRepaymentDb(dbRepayment)
      await createHistoryItem(dbHistoryItem)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error adding repayment:", error)
    }
  },

  updateRepayment: async (id, updates) => {
    const state = get()
    const repaymentToUpdate = state.repayments.find((r) => r.id === id)
    if (!repaymentToUpdate) return

    const updatedRepaymentData = { ...repaymentToUpdate, ...updates }

    // Recalculate interestInfo if amount or discount changes
    if (updates.amount !== undefined || updates.discountGiven !== undefined) {
      const customerLoans = state.loans.filter((l) => l.customerId === updatedRepaymentData.customerId)
      const totalAccruedInterest = customerLoans.reduce(
        (sum, loan) => sum + get().calculateInterest(loan.amount, loan.interestRate, loan.startDate),
        0,
      )
      const totalPaidInterestExcludingThis = state.repayments
        .filter((r) => r.customerId === updatedRepaymentData.customerId && r.id !== id)
        .reduce((sum, r) => sum + r.interestInfo, 0)

      const outstandingInterestBeforeThisRepayment = totalAccruedInterest - totalPaidInterestExcludingThis

      // Total value applied by this repayment (cash payment + discount given)
      const effectiveValueApplied = updatedRepaymentData.amount + updatedRepaymentData.discountGiven

      let newInterestPortionOfThisPayment = Math.min(effectiveValueApplied, outstandingInterestBeforeThisRepayment)

      // Ensure interestInfo is not negative
      if (newInterestPortionOfThisPayment < 0) newInterestPortionOfThisPayment = 0

      updatedRepaymentData.interestInfo = Math.ceil(newInterestPortionOfThisPayment)
    }

    const dbUpdates: Partial<DatabaseRepayment> = {
      amount: updatedRepaymentData.amount,
      interest_info: updatedRepaymentData.interestInfo, // Use the recalculated value
      discount_given: updatedRepaymentData.discountGiven,
      payment_date: updatedRepaymentData.date,
      notes: updatedRepaymentData.notes,
      verification_images: updatedRepaymentData.verificationImages,
    }

    try {
      await updateRepaymentDb(id, dbUpdates)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error updating repayment:", error)
    }
  },

  deleteRepayment: async (id) => {
    try {
      await deleteRepaymentDb(id)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error deleting repayment:", error)
    }
  },

  addFundTransaction: async (transactionData) => {
    const state = get()
    const existingFundIds = state.fundTransactions.map((f) => f.id)
    const id = generateNextId("F", existingFundIds)

    const dbTransaction: Omit<DatabaseFundTransaction, "created_at" | "updated_at"> = {
      id,
      transaction_type: transactionData.type,
      amount: transactionData.amount,
      reason: transactionData.reason,
      transaction_date: transactionData.date,
    }

    const existingHistoryIds = state.history.map((h) => h.id)
    const historyId = generateNextId("H", existingHistoryIds)
    const dbHistoryItem: Omit<DatabaseHistory, "created_at" | "updated_at"> = {
      id: historyId,
      activity_type: transactionData.type === "add" ? "ભંડોળ ઉમેર્યું" : "ભંડોળ કાઢ્યું",
      amount: transactionData.amount,
      activity_date: transactionData.date,
      status: "પૂર્ણ",
      description: transactionData.reason,
    }

    try {
      await createFundTransactionDb(dbTransaction)
      await createHistoryItem(dbHistoryItem)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error adding fund transaction:", error)
    }
  },

  completeLoan: async (id) => {
    const state = get()
    const loanToComplete = state.loans.find((l) => l.id === id)
    if (!loanToComplete || loanToComplete.status === "પૂર્ણ") return

    // Mark loan as completed with current paid amount, zero interest and remaining
    const dbUpdates: Partial<DatabaseLoan> = {
      status: "પૂર્ણ",
      total_interest: 0,
      remaining_amount: 0,
      paid_amount: loanToComplete.amount, // Mark full principal as paid
    }

    const existingHistoryIds = state.history.map((h) => h.id)
    const historyId = generateNextId("H", existingHistoryIds)
    const dbHistoryItem: Omit<DatabaseHistory, "created_at" | "updated_at"> = {
      id: historyId,
      activity_type: "લોન આપેલ",
      customer_id: loanToComplete.customerId,
      customer_name: loanToComplete.customerName,
      amount: loanToComplete.amount,
      activity_date: new Date().toISOString().split('T')[0],
      status: "પૂર્ણ",
      description: "લોન પૂર્ણ કરવામાં આવ્યું",
    }

    try {
      await updateLoanDb(id, dbUpdates)
      await createHistoryItem(dbHistoryItem)
      await get().fetchInitialData()
    } catch (error) {
      console.error("Error completing loan:", error)
    }
  },
}))
