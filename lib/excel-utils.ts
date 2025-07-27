"use client"

export const generateExcelData = (data: any[], headers: string[], filename: string) => {
  // Convert data to CSV format
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header, index) => {
          const value = Array.isArray(row) ? row[index] : row[header.toLowerCase().replace(/\s+/g, "_")]
          // Escape commas and quotes in values
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ""
        })
        .join(","),
    ),
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "application/octet-stream" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const generateHistoryExcel = (history: any[]) => {
  const headers = ["ID", "Type", "Customer_ID", "Customer_Name", "Amount", "Date", "Status", "Description"]

  const data = history.map((item) => [
    item.id,
    item.type,
    item.customerId || "",
    item.customerName || "System",
    item.amount,
    item.date,
    item.status,
    item.description,
  ])

  generateExcelData(data, headers, "history_report")
}

export const generateCustomersExcel = (customers: any[]) => {
  const headers = [
    "Customer_ID",
    "Name",
    "City",
    "Mobile",
    "Total_Loan",
    "Total_Interest",
    "Paid_Amount",
    "Remaining_Amount",
    "Loan_Item",
  ]

  const data = customers.map((customer) => [
    customer.id,
    customer.name,
    customer.city,
    customer.mobile,
    customer.totalLoanAmount,
    customer.totalInterest,
    customer.paidAmount,
    customer.remainingAmount,
    customer.loanItem,
  ])

  generateExcelData(data, headers, "customers_report")
}

export const generateLoansExcel = (loans: any[]) => {
  const headers = [
    "ID",
    "Customer_ID",
    "Customer_Name",
    "Amount",
    "Interest_Rate",
    "Start_Date",
    "Reference_Number",
    "Status",
    "Total_Interest",
    "Paid_Amount",
    "Remaining_Amount",
    "Loan_Item",
  ]

  const data = loans.map((loan) => [
    loan.id,
    loan.customerId,
    loan.customerName,
    loan.amount,
    loan.interestRate,
    loan.startDate,
    loan.referenceNumber || "-",
    loan.status,
    loan.totalInterest,
    loan.paidAmount,
    loan.remainingAmount,
    loan.loanItem,
  ])

  generateExcelData(data, headers, "report")
}

export const generateRepaymentsExcel = (repayments: any[]) => {
  const headers = [
    "ID",
    "Customer_ID",
    "Customer_Name",
    "Amount",
    "Interest_Info",
    "Discount_Given",
    "Date",
    "Receipt_ID",
    "Notes",
  ]

  const data = repayments.map((repayment) => [
    repayment.id,
    repayment.customerId,
    repayment.customerName,
    repayment.amount,
    repayment.interestInfo,
    repayment.discountGiven,
    repayment.date,
    repayment.receiptId,
    repayment.notes,
  ])

  generateExcelData(data, headers, "repayments_report")
}

export const generateFundHistoryExcel = (history: any[]) => {
  const fundHistory = history.filter((item) => item.type === "ભંડોળ ઉમેર્યું" || item.type === "ભંડોળ કાઢ્યું")

  const headers = ["ID", "Type", "Amount", "Date", "Status", "Description"]

  const data = fundHistory.map((item) => [
    item.id,
    item.type === "ભંડોળ ઉમેર્યું" ? "Fund_Added" : "Fund_Removed",
    item.amount,
    item.date,
    item.status,
    item.description,
  ])

  generateExcelData(data, headers, "fund_history_report")
}
