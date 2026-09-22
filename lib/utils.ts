import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(timestamp: number, options?: { addSuffix?: boolean }): string {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  let text = "";
  if (diff < minute) {
    return "just now";
  } else if (diff < hour) {
    const mins = Math.floor(diff / minute);
    text = `${mins}m`;
  } else if (diff < day) {
    const hrs = Math.floor(diff / hour);
    text = `${hrs}h`;
  } else {
    const days = Math.floor(diff / day);
    text = `${days}d`;
  }

  return options?.addSuffix ? `${text} ago` : text;
}
