import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
// Format a date to a readable string
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) {
    console.warn("formatDate: Received null or undefined date");
    return "Invalid Date";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.warn("formatDate: Invalid date object", date);
      return "Invalid Date";
    }
    return format(dateObj, "MMMM d, yyyy");
  } catch (error) {
    console.error("formatDate: Error formatting date", error, date);
    return "Invalid Date";
  }
}

// Truncate text to a specified length
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
