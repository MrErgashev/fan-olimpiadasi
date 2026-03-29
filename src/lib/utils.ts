import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }
  return phone;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Toshkent (UTC+5) timezone funksiyalari
const TASHKENT_OFFSET = 5 * 60 * 60 * 1000; // +5 soat millisekund

// datetime-local qiymatni Toshkent vaqti sifatida ISO ga aylantirish
export function toTashkentISO(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  return datetimeLocal + ":00+05:00";
}

// UTC ISO → Toshkent datetime-local (input uchun)
export function toTashkentLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const tashkent = new Date(d.getTime() + TASHKENT_OFFSET);
  return tashkent.toISOString().slice(0, 16);
}

// Toshkent vaqtini formatlash (display uchun)
export function formatTashkentDateTime(iso: string): string {
  const d = new Date(iso);
  const tashkent = new Date(d.getTime() + TASHKENT_OFFSET);
  const day = tashkent.getUTCDate().toString().padStart(2, "0");
  const month = (tashkent.getUTCMonth() + 1).toString().padStart(2, "0");
  const hours = tashkent.getUTCHours().toString().padStart(2, "0");
  const minutes = tashkent.getUTCMinutes().toString().padStart(2, "0");
  return `${day}.${month} ${hours}:${minutes}`;
}
