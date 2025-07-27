"use client"

export const generatePrintableContent = (content: string, title: string, isThermalReceipt = false) => {
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;700&display=swap');
              @page {
                  size: ${isThermalReceipt ? "80mm 200mm" : "216mm 279mm"};
                  margin: ${isThermalReceipt ? "5mm" : "10mm"};
              }
              body {
                  font-family: 'Noto Sans Gujarati', Arial, sans-serif;
                  font-size: ${isThermalReceipt ? "16px" : "11px"};
                  line-height: ${isThermalReceipt ? "1.6" : "1.3"};
                  margin: 0;
                  padding: ${isThermalReceipt ? "10px" : "5px"};
                  max-width: ${isThermalReceipt ? "70mm" : "196mm"};
                  font-weight: ${isThermalReceipt ? "bold" : "normal"};
              }
              .content {
                  white-space: pre-line;
                  font-size: ${isThermalReceipt ? "16px" : "11px"};
                  line-height: ${isThermalReceipt ? "1.8" : "1.4"};
                  text-align: ${isThermalReceipt ? "center" : "left"};
              }
              .thermal-header {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  text-align: center;
              }
              .thermal-amount {
                  font-size: 20px;
                  font-weight: bold;
                  margin: 10px 0;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 5px 0;
                  font-size: ${isThermalReceipt ? "14px" : "10px"};
              }
              th, td {
                  border: 1px solid #333;
                  padding: ${isThermalReceipt ? "8px 5px" : "3px 5px"};
                  text-align: left;
                  vertical-align: top;
              }
              th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                  font-size: ${isThermalReceipt ? "12px" : "9px"};
              }
              .summary {
                  margin-top: 10px;
                  padding: ${isThermalReceipt ? "10px" : "5px"};
                  border: 1px solid #333;
                  background-color: #f9f9f9;
                  font-size: ${isThermalReceipt ? "14px" : "11px"};
              }
              .receipt-table {
                  width: 100%;
                  text-align: left;
                  margin: 10px 0;
                  border: none;
                  border-collapse: collapse;
              }
              .receipt-table td {
                  border: none;
                  padding: 4px 0;
                  vertical-align: top;
              }
              .receipt-table td:first-child {
                  font-weight: bold;
                  padding-right: 10px;
              }
              .notes {
                  text-align: left;
                  margin-top: 10px;
                  white-space: pre-wrap;
              }
              .header-info {
                  text-align: center;
                  margin-bottom: ${isThermalReceipt ? "15px" : "10px"};
                  font-size: ${isThermalReceipt ? "14px" : "10px"};
              }
          </style>
      </head>
      <body>
          <div class="content">${content}</div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

export const generateReceiptPrint = (data: any) => {
  // Check if this is a loan receipt (has loanId) or payment receipt
  const isLoanReceipt = data.loanId !== undefined

  let content = ""

  if (isLoanReceipt) {
    // Loan Receipt Format - Thermal Printer Optimized
    content = `
<div class="thermal-header">રસીદ</div>

<div class="thermal-amount">રકમ: ₹${data.amount.toLocaleString()}</div>

તારીખ: ${data.date}

આઇટમ: ${data.loanItem || "ધિરાણ"}

ID: ${data.loanId}

ગ્રાહક ID: ${data.customerId}

${data.notes ? `નોંધ: ${data.notes}` : ""}
    `
  } else {
    // Payment Receipt Format - Thermal Printer Optimized
    content = `


<table class="receipt-table">
  <tr>
    <td>રસીદ નંબર:</td>
    <td>${data.receiptId}</td>
  </tr>
  <tr>
    <td>તારીખ:</td>
    <td>${data.date}</td>
  </tr>
  <tr>
    <td>ગ્રાહક:</td>
    <td>${data.customerName}</td>
  </tr>
  <tr>
    <td>ગ્રાહક ID:</td>
    <td>${data.customerId}</td>
  </tr>
</table>

<div class="thermal-amount">ચુકવણી: ₹${data.amount.toLocaleString()}</div>

${data.notes ? `<div class="notes"><b>નોંધ:</b><br>${data.notes}</div>` : ""}
`
  }

  generatePrintableContent(
    content,
    isLoanReceipt ? `રસીદ ${data.loanId}` : `રસીદ ${data.receiptId}`,
    true,
  )
}

export const generateCustomerReceiptPrint = (customer: any, loans: any[], repayments: any[]) => {
  const content = `
<div class="header-info">
<strong>ગ્રાહક રિપોર્ટ</strong><br>
તારીખ: ${new Date().toLocaleDateString("gu-IN")}<br>
આઇટમ:
</div>

<strong>ગ્રાહકની માહિતી:</strong><br>
નામ: ${customer.name} | ID: ${customer.id} | શહેર: ${customer.city}<br>
મોબાઇલ: ${customer.mobile} | આઇટમ: ${customer.loanItem}<br><br>

<strong>વિગતો:</strong>
<table>
<tr>
<th>ID</th>
<th>રકમ</th>
<th>વ્યાજ દર</th>
<th>તારીખ</th>
<th>રેફરન્સ</th>
<th>કુલ વ્યાજ</th>
<th>બાકી રકમ</th>
</tr>
${loans
  .map(
    (loan) => `
<tr>
<td>${loan.id}</td>
<td>₹${loan.amount.toLocaleString()}</td>
<td>${loan.interestRate}%</td>
<td>${loan.startDate}</td>
<td>${loan.referenceNumber || '-'}</td>
<td>₹${loan.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
<td>₹${loan.remainingAmount.toLocaleString()}</td>
</tr>`,
  )
  .join("")}
</table>

<strong>ચુકવણી વિગતો:</strong>
<table>
<tr>
<th>ચુકવણી ID</th>
<th>ID</th>
<th>રકમ</th>
<th>તારીખ</th>
<th>રસીદ ID</th>
<th>નોંધ</th>
</tr>
${repayments
  .map(
    (payment) => `
<tr>
<td>${payment.id}</td>
<td>${payment.loanId || '-'}</td>
<td>₹${payment.amount.toLocaleString()}</td>
<td>${payment.date}</td>
<td>${payment.receiptId}</td>
<td>${payment.notes || '-'}</td>
</tr>`,
  )
  .join("")}
</table>

<div class="summary">
<strong>સારાંશ:</strong><br>
કુલ રકમ: ₹${customer.totalLoanAmount.toLocaleString()} | 
કુલ વ્યાજ: ₹${customer.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}<br>
કુલ ચુકવેલ: ₹${customer.paidAmount.toLocaleString()} | 
કુલ બાકી: ₹${customer.remainingAmount.toLocaleString()}
</div>
  `

  generatePrintableContent(content, `ગ્રાહક રિપોર્ટ - ${customer.name}`, false)
}

export const generateCustomersPrint = (customers: any[]) => {
  const content = `
<div class="header-info">
<strong>ગ્રાહકોની યાદી</strong><br>
તારીખ: ${new Date().toLocaleDateString("gu-IN")}<br>
આઇટમ:
</div>

<table>
<tr>
<th>ID</th>
<th>નામ</th>
<th>શહેર</th>
<th>મોબાઇલ</th>
<th>રકમ</th>
<th>વ્યાજ</th>
<th>ચુકવેલ</th>
<th>બાકી</th>
<th>આઇટમ</th>
</tr>
${customers
  .map(
    (customer) => `
<tr>
<td>${customer.id}</td>
<td>${customer.name}</td>
<td>${customer.city}</td>
<td>${customer.mobile}</td>
<td>₹${customer.totalLoanAmount.toLocaleString()}</td>
<td>₹${customer.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
<td>₹${customer.paidAmount.toLocaleString()}</td>
<td>₹${customer.remainingAmount.toLocaleString()}</td>
<td>${customer.loanItem}</td>
</tr>`,
  )
  .join("")}
</table>

<div class="summary">
કુલ ગ્રાહકો: ${customers.length} | 
કુલ રકમ: ₹${customers.reduce((sum, c) => sum + c.totalLoanAmount, 0).toLocaleString()} | 
કુલ બાકી રકમ: ₹${customers.reduce((sum, c) => sum + c.remainingAmount, 0).toLocaleString()}
</div>
  `

  generatePrintableContent(content, "ગ્રાહકોની યાદી", false)
}

export const generateLoansPrint = (loans: any[]) => {
  const content = `
<div class="header-info">
<strong>યાદી</strong><br>
તારીખ: ${new Date().toLocaleDateString("gu-IN")}<br>
આઇટમ:
</div>

<table>
<tr>
<th>ID</th>
<th>ગ્રાહક</th>
<th>રકમ</th>
<th>વ્યાજ દર</th>
<th>તારીખ</th>
<th>રેફરન્સ</th>
<th>કુલ વ્યાજ</th>
<th>ચુકવેલ</th>
<th>બાકી</th>
<th>આઇટમ</th>
</tr>
${loans
  .map(
    (loan) => `
<tr>
<td>${loan.id}</td>
<td>${loan.customerName} (${loan.customerId})</td>
<td>₹${loan.amount.toLocaleString()}</td>
<td>${loan.interestRate}%</td>
<td>${loan.startDate}</td>
<td>${loan.referenceNumber || '-'}</td>
<td>₹${loan.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
<td>₹${loan.paidAmount.toLocaleString()}</td>
<td>₹${loan.remainingAmount.toLocaleString()}</td>
<td>${loan.loanItem}</td>
</tr>`,
  )
  .join("")}
</table>

<div class="summary">
કુલ: ${loans.length} | 
કુલ રકમ: ₹${loans.reduce((sum, l) => sum + l.amount, 0).toLocaleString()} | 
કુલ બાકી રકમ: ₹${loans.reduce((sum, l) => sum + l.remainingAmount, 0).toLocaleString()}
</div>
  `

  generatePrintableContent(content, "લોનની યાદી", false)
}

export const generateExcelData = (data: any[], headers: string[]) => {
  const csvContent = [headers.join(","), ...data.map((row) => row.join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  return url
}
