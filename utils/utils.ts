import { format } from "date-fns";

export function addressShort(address: string) {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

export const DAYS_TO_MS = 1000 * 60 * 60 * 24;

export function dateFormat(date: Date) {
  return format(date, "yyyy-MM-dd");
}
