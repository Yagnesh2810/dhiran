import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format amount as whole number (round up decimals like 2.5 to 3, keep whole numbers like 2 as 2)
export function formatAmount(amount: number): string {
  const roundedAmount = Math.ceil(amount)
  return roundedAmount.toLocaleString()
}
