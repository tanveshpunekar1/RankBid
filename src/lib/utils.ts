import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount in paise or rupees into standard Indian numbering format (e.g. ₹1,00,000)
 * @param amount Number in INR (or if isPaise=true, in paise)
 * @param isPaise Whether the input is in paise
 */
export function formatINR(amount: number, isPaise: boolean = false): string {
  const rupees = isPaise ? Math.floor(amount / 100) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Formats a plain number with Indian comma separators (e.g. 1,00,000)
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format relative or short date
 */
export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTimeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

/**
 * Mask phone number for public display (e.g. +91 98****1234)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    const last4 = cleaned.slice(-4);
    const first2 = cleaned.slice(-10, -8);
    return `+91 ${first2}****${last4}`;
  }
  return phone;
}
