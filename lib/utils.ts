import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a hour code to UTC ISO string (e.g., "12" -> "2025-05-19T12:00:00.000Z")
 */
export function hourToUtc(code: string): string {
  const hour = parseInt(code, 10);
  if (isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid hour code: ${code}`);
  }

  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour)
  );
  return utcDate.toISOString();
}

/**
 * Converts a UTC ISO string back to hour code (e.g., "2025-05-19T12:00:00.000Z" -> "12")
 */
export function utcToHour(isoString: string): string {
  const date = new Date(isoString);
  const hour = date.getUTCHours(); // always UTC
  return hour.toString().padStart(2, '0');
} 

/**
 * Converts a UTC ISO string to Dhaka time (Asia/Dhaka)
 */
export function convertUTCToBDTime(isoString: string): string {
  const utcDate = new Date(isoString);

  // Get the time in Dhaka by adding UTC+6 offset (6 * 60 * 60 * 1000 ms)
  const dhakaOffsetMs = 6 * 60 * 60 * 1000;
  const dhakaDate = new Date(utcDate.getTime() + dhakaOffsetMs);

  return dhakaDate.toISOString();
}