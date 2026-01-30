import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities (twitter-clone)
const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en-gb', {
  style: 'short',
  numeric: 'auto'
});

type Units = Readonly<Partial<Record<Intl.RelativeTimeFormatUnit, number>>>;

const UNITS: Units = {
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000
};

function isToday(date: Date): boolean {
  return new Date().toDateString() === date.toDateString()
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
  return yesterday.toDateString() === date.toDateString()
}

function isCurrentYear(date: Date): boolean {
  return new Date().getFullYear() === date.getFullYear()
}

function getRelativeTime(date: Date): string {
  const elapsed = new Date().getTime() - date.getTime() // Fixed: now - date (positive for past)
  
  // Handle seconds
  if (Math.abs(elapsed) < 60 * 1000) {
    const seconds = Math.floor(elapsed / 1000)
    if (seconds < 1) return 'now'
    if (seconds === 1) return '1s ago'
    return `${seconds}s ago`
  }
  
  // Handle minutes, hours, days
  for (const [unit, ms] of Object.entries(UNITS)) {
    if (unit === 'second') continue // Already handled
    if (Math.abs(elapsed) >= ms) {
      const value = Math.round(elapsed / ms)
      return RELATIVE_TIME_FORMATTER.format(-value, unit as Intl.RelativeTimeFormatUnit)
    }
  }
  return 'now'
}

function getFullTime(date: Date): string {
  const fullDate = new Intl.DateTimeFormat('en-gb', {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);

  const splittedDate = fullDate.split(', ');

  const formattedDate =
    splittedDate.length === 2
      ? [...splittedDate].reverse().join(' · ')
      : [splittedDate.slice(0, 2).join(', '), splittedDate.slice(-1)]
          .reverse()
          .join(' · ');

  return formattedDate;
}

function getPostTime(date: Date): string {
  if (isToday(date)) return getRelativeTime(date);
  if (isYesterday(date))
    return new Intl.DateTimeFormat('en-gb', {
      day: 'numeric',
      month: 'short'
    }).format(date);

  return new Intl.DateTimeFormat('en-gb', {
    day: 'numeric',
    month: 'short',
    year: isCurrentYear(date) ? undefined : 'numeric'
  }).format(date);
}

function getJoinedTime(date: Date): string {
  return new Intl.DateTimeFormat('en-gb', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatDate(
  date: Date | string,
  mode: 'tweet' | 'message' | 'full' | 'joined' = 'tweet'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (mode === 'full') return getFullTime(dateObj);
  if (mode === 'tweet') return getPostTime(dateObj);
  if (mode === 'joined') return getJoinedTime(dateObj);

  return getPostTime(dateObj);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-GB', {
    notation: number > 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1
  }).format(number);
}

// Animation helpers
export function preventBubbling(callback?: (() => void) | null, noPreventDefault?: boolean) {
  return (e: React.SyntheticEvent): void => {
    e.stopPropagation();
    if (!noPreventDefault) e.preventDefault();
    if (callback) callback();
  };
}

export function delayScroll(ms: number) {
  return (): NodeJS.Timeout => setTimeout(() => window.scrollTo(0, 0), ms);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isPlural(count: number): string {
  return count > 1 ? 's' : '';
}
