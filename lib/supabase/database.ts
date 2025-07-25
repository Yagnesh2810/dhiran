import { getSupabaseBrowserClient } from "./client"

export interface DatabaseCustomer {
  id: string
  name: string
  city: string
  mobile: string
  first_loan_date: string
  total_loan_amount: number
  total_interest: number
  loan_item: string
  notes: string
  interest_rate: number
  paid_amount: number
  remaining_amount: number
  created_at?: string
  updated_at?: string
}

export interface DatabaseLoan {
  id: string
  customer_id: string
  customer_name: string
  amount: number
  interest_rate: number
  start_date: string
  status: string
  total_interest: number
  paid_amount: number
  remaining_amount: number
  loan_item: string
  notes: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseRepayment {
  id: string
  customer_id: string
  customer_name: string
  amount: number
  interest_info: number
  discount_given: number
  payment_date: string // Changed from 'date' to 'payment_date'
  receipt_id: string
  notes: string
  verification_images?: string[]
  created_at?: string
  updated_at?: string
}

export interface DatabaseFundTransaction {
  id: string
  transaction_type: "add" | "remove" // Changed from 'type' to 'transaction_type'
  amount: number
  reason: string
  transaction_date: string // Changed from 'date' to 'transaction_date'
  created_at?: string
  updated_at?: string
}

export interface DatabaseHistory {
  id: string
  activity_type: string // Changed from 'type' to 'activity_type'
  customer_id?: string
  customer_name?: string
  amount: number
  activity_date: string // Changed from 'date' to 'activity_date'
  status: string
  description: string
  created_at?: string
  updated_at?: string
}

// Customer operations
export const createCustomer = async (customer: Omit<DatabaseCustomer, "created_at" | "updated_at">) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("customers").insert([customer]).select().single()

  if (error) throw error
  return data
}

export const getCustomers = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export const updateCustomer = async (id: string, updates: Partial<DatabaseCustomer>) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("customers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCustomer = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) throw error
}

// Loan operations
export const createLoan = async (loan: Omit<DatabaseLoan, "created_at" | "updated_at">) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("loans").insert([loan]).select().single()

  if (error) throw error
  return data
}

export const getLoans = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export const updateLoan = async (id: string, updates: Partial<DatabaseLoan>) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("loans")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteLoan = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from("loans").delete().eq("id", id)

  if (error) throw error
}

// Repayment operations
export const createRepayment = async (repayment: Omit<DatabaseRepayment, "created_at" | "updated_at">) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("repayments").insert([repayment]).select().single()

  if (error) throw error
  return data
}

export const getRepayments = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("repayments").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export const updateRepayment = async (id: string, updates: Partial<DatabaseRepayment>) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("repayments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteRepayment = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from("repayments").delete().eq("id", id)

  if (error) throw error
}

// Fund transaction operations
export const createFundTransaction = async (
  transaction: Omit<DatabaseFundTransaction, "created_at" | "updated_at">,
) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("fund_transactions").insert([transaction]).select().single()

  if (error) throw error
  return data
}

export const getFundTransactions = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("fund_transactions").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// History operations
export const createHistoryItem = async (historyItem: Omit<DatabaseHistory, "created_at" | "updated_at">) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("history").insert([historyItem]).select().single()

  if (error) throw error
  return data
}

export const getHistory = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("history").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Image upload for verification
export const uploadVerificationImage = async (file: File, repaymentId: string) => {
  const supabase = getSupabaseBrowserClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${repaymentId}_${Date.now()}.${fileExt}`
  const filePath = `verification-images/${fileName}`

  const { data, error } = await supabase.storage.from("verification-images").upload(filePath, file)

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from("verification-images").getPublicUrl(filePath)

  return publicUrl
}

// Get total funds from fund transactions
export const getTotalFunds = async () => {
  const transactions = await getFundTransactions()
  return transactions.reduce((total, transaction) => {
    return transaction.transaction_type === "add" ? total + transaction.amount : total - transaction.amount
  }, 15000000) // Starting amount
}

// Utility functions to convert between database and app formats
export const convertDatabaseCustomerToApp = (dbCustomer: DatabaseCustomer) => ({
  id: dbCustomer.id,
  name: dbCustomer.name,
  city: dbCustomer.city,
  mobile: dbCustomer.mobile,
  firstLoanDate: dbCustomer.first_loan_date,
  totalLoanAmount: dbCustomer.total_loan_amount,
  totalInterest: dbCustomer.total_interest,
  loanItem: dbCustomer.loan_item,
  notes: dbCustomer.notes || "",
  interestRate: dbCustomer.interest_rate,
  paidAmount: dbCustomer.paid_amount,
  remainingAmount: dbCustomer.remaining_amount,
})

export const convertAppCustomerToDatabase = (
  appCustomer: any,
): Omit<DatabaseCustomer, "created_at" | "updated_at"> => ({
  id: appCustomer.id,
  name: appCustomer.name,
  city: appCustomer.city,
  mobile: appCustomer.mobile,
  first_loan_date: appCustomer.firstLoanDate,
  total_loan_amount: appCustomer.totalLoanAmount,
  total_interest: appCustomer.totalInterest,
  loan_item: appCustomer.loanItem,
  notes: appCustomer.notes || "",
  interest_rate: appCustomer.interestRate,
  paid_amount: appCustomer.paidAmount,
  remaining_amount: appCustomer.remainingAmount,
})

export const convertDatabaseLoanToApp = (dbLoan: DatabaseLoan) => ({
  id: dbLoan.id,
  customerId: dbLoan.customer_id,
  customerName: dbLoan.customer_name,
  amount: dbLoan.amount,
  interestRate: dbLoan.interest_rate,
  startDate: dbLoan.start_date,
  status: dbLoan.status,
  totalInterest: dbLoan.total_interest,
  paidAmount: dbLoan.paid_amount,
  remainingAmount: dbLoan.remaining_amount,
  loanItem: dbLoan.loan_item,
  notes: dbLoan.notes || "",
})

export const convertAppLoanToDatabase = (appLoan: any): Omit<DatabaseLoan, "created_at" | "updated_at"> => ({
  id: appLoan.id,
  customer_id: appLoan.customerId,
  customer_name: appLoan.customerName,
  amount: appLoan.amount,
  interest_rate: appLoan.interestRate,
  start_date: appLoan.startDate,
  status: appLoan.status,
  total_interest: appLoan.totalInterest,
  paid_amount: appLoan.paidAmount,
  remaining_amount: appLoan.remainingAmount,
  loan_item: appLoan.loanItem,
  notes: appLoan.notes || "",
})

export const convertDatabaseRepaymentToApp = (dbRepayment: DatabaseRepayment) => ({
  id: dbRepayment.id,
  customerId: dbRepayment.customer_id,
  customerName: dbRepayment.customer_name,
  amount: dbRepayment.amount,
  interestInfo: dbRepayment.interest_info,
  discountGiven: dbRepayment.discount_given,
  date: dbRepayment.payment_date,
  receiptId: dbRepayment.receipt_id,
  notes: dbRepayment.notes || "",
  verificationImages: dbRepayment.verification_images || [],
})

export const convertAppRepaymentToDatabase = (
  appRepayment: any,
): Omit<DatabaseRepayment, "created_at" | "updated_at"> => ({
  id: appRepayment.id,
  customer_id: appRepayment.customerId,
  customer_name: appRepayment.customerName,
  amount: appRepayment.amount,
  interest_info: appRepayment.interestInfo,
  discount_given: appRepayment.discountGiven,
  payment_date: appRepayment.date,
  receipt_id: appRepayment.receiptId,
  notes: appRepayment.notes || "",
  verification_images: appRepayment.verificationImages || [],
})
