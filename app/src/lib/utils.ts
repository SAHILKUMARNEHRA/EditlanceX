import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MAX_BUDGET_INR = 10000000

export function formatINRCompact(amount: number) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return "₹0"

  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  if (abs >= 10000000) {
    const n = abs / 10000000
    const formatted = n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
    return `${sign}₹${formatted} Cr`
  }

  if (abs >= 100000) {
    const n = abs / 100000
    const formatted = n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
    return `${sign}₹${formatted} Lakh`
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(abs)

  return sign ? `${sign}${formatted}` : formatted
}
