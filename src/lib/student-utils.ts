export function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("998") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  if (cleaned.startsWith("8") && cleaned.length === 10) {
    cleaned = "+998" + cleaned.slice(1);
  }
  if (cleaned.startsWith("9") && cleaned.length === 9) {
    cleaned = "+998" + cleaned;
  }
  return cleaned;
}

export interface ParsedStudentRow {
  rowIndex: number;
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  grade: number;
  regionName?: string;
  errors: string[];
  isValid: boolean;
}

export function validateStudentRow(row: ParsedStudentRow): ParsedStudentRow {
  const errors: string[] = [];

  if (!row.firstName || row.firstName.trim().length < 2) {
    errors.push("Ism kamida 2 harf bo'lishi kerak");
  }
  if (!row.lastName || row.lastName.trim().length < 2) {
    errors.push("Familiya kamida 2 harf bo'lishi kerak");
  }
  if (!row.phone) {
    errors.push("Telefon raqam kiritilmagan");
  } else {
    const formatted = formatPhone(row.phone);
    if (!/^\+998\d{9}$/.test(formatted)) {
      errors.push("Telefon raqam +998XXXXXXXXX formatda bo'lishi kerak");
    } else {
      row.phone = formatted;
    }
  }
  if (!row.schoolName || row.schoolName.trim().length < 1) {
    errors.push("Maktab nomi kiritilmagan");
  }

  row.errors = errors;
  row.isValid = errors.length === 0;
  return row;
}
