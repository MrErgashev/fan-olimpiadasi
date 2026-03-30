"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Upload, FileSpreadsheet, Download, ArrowLeft, ArrowRight, CheckCircle2,
  XCircle, Trash2, AlertTriangle, Edit3, Save, X, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { type ParsedStudentRow, validateStudentRow, formatPhone } from "@/lib/student-utils";

type Step = 1 | 2 | 3;
type FilterType = "all" | "errors" | "valid";

interface ImportResult {
  created: number;
  skipped: number;
  errored: number;
  passwords: { phone: string; password: string; name: string }[];
  errors: { row: number; phone: string; reason: string }[];
  skippedRows: { row: number; phone: string; reason: string }[];
}

const BATCH_SIZE = 500;

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  // Step 2 state
  const [rows, setRows] = useState<ParsedStudentRow[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ParsedStudentRow>>({});

  // Step 3 state
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });

  // ===== STEP 1: File Upload =====

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Faqat .xlsx, .xls yoki .csv fayl yuklang");
      return;
    }
    setFileName(file.name);
    setProgress({ current: 0, total: 0, label: "Fayl o'qilmoqda..." });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setProgress({ current: 30, total: 100, label: "Ma'lumotlar tahlil qilinmoqda..." });
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

        if (jsonData.length === 0) {
          toast.error("Fayl bo'sh");
          setProgress({ current: 0, total: 0, label: "" });
          return;
        }

        setProgress({ current: 60, total: 100, label: "Validatsiya qilinmoqda..." });

        // Map columns - try common headers
        const parsed: ParsedStudentRow[] = jsonData.map((row, idx) => {
          const firstName =
            row["Ism"] || row["ism"] || row["FirstName"] || row["first_name"] || row["FISH"]?.split(" ")[0] || "";
          const lastName =
            row["Familiya"] || row["familiya"] || row["LastName"] || row["last_name"] || row["FISH"]?.split(" ").slice(1).join(" ") || "";
          const rawPhone = String(row["Telefon"] || row["telefon"] || row["Phone"] || row["phone"] || "");
          const phone = formatPhone(rawPhone);
          const schoolName =
            row["Maktab"] || row["maktab"] || row["School"] || row["school"] || row["Maktab nomi"] || "";
          const gradeStr = row["Sinf"] || row["sinf"] || row["Grade"] || row["grade"] || "11";
          const grade = parseInt(String(gradeStr).replace(/\D/g, "")) || 11;
          const regionName = row["Viloyat"] || row["viloyat"] || row["Region"] || row["region"] || "";
          const subjectName = row["Fan"] || row["fan"] || row["Subject"] || row["subject"] || row["Fan nomi"] || "";

          return validateStudentRow({
            rowIndex: idx + 1,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone,
            schoolName: schoolName.trim(),
            grade,
            regionName: regionName.trim() || undefined,
            subjectName: subjectName.trim() || undefined,
            errors: [],
            isValid: true,
          });
        });

        // Check for duplicate phones within file
        const phoneCount = new Map<string, number>();
        parsed.forEach((r) => {
          if (r.phone && /^\+998\d{9}$/.test(r.phone)) {
            phoneCount.set(r.phone, (phoneCount.get(r.phone) || 0) + 1);
          }
        });
        parsed.forEach((r) => {
          if ((phoneCount.get(r.phone) || 0) > 1) {
            r.errors.push("Faylda takroriy telefon raqam");
            r.isValid = false;
          }
        });

        setProgress({ current: 100, total: 100, label: "Tayyor!" });
        setRows(parsed);
        setStep(2);
        setTimeout(() => setProgress({ current: 0, total: 0, label: "" }), 500);
      } catch {
        toast.error("Faylni o'qib bo'lmadi");
        setProgress({ current: 0, total: 0, label: "" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Ism", "Familiya", "Telefon", "Maktab", "Sinf", "Viloyat", "Fan"],
      ["Ali", "Valiyev", "+998901234567", "1-maktab", "11", "Toshkent", "Matematika"],
      ["Vali", "Aliyev", "+998901234568", "2-maktab", "10", "Samarqand", "Fizika"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "O'quvchilar");
    ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 8 }, { wch: 15 }, { wch: 18 }];
    XLSX.writeFile(wb, "oquvchilar_shablon.xlsx");
  };

  // ===== STEP 2: Validate & Edit =====

  const validCount = rows.filter((r) => r.isValid).length;
  const errorCount = rows.filter((r) => !r.isValid).length;

  const filteredRows =
    filter === "all" ? rows : filter === "valid" ? rows.filter((r) => r.isValid) : rows.filter((r) => !r.isValid);

  const startEdit = (idx: number) => {
    const row = rows[idx];
    setEditingIndex(idx);
    setEditForm({ firstName: row.firstName, lastName: row.lastName, phone: row.phone, schoolName: row.schoolName });
  };

  const saveEdit = (idx: number) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx], ...editForm } as ParsedStudentRow;
      next[idx] = validateStudentRow(row);
      return next;
    });
    setEditingIndex(null);
    setEditForm({});
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeAllErrors = () => {
    setRows((prev) => prev.filter((r) => r.isValid));
    setFilter("all");
  };

  const downloadErrors = () => {
    const errorRows = rows.filter((r) => !r.isValid);
    if (errorRows.length === 0) return;
    const data = errorRows.map((r) => ({
      "Qator": r.rowIndex,
      "Ism": r.firstName,
      "Familiya": r.lastName,
      "Telefon": r.phone,
      "Maktab": r.schoolName,
      "Sinf": r.grade,
      "Viloyat": r.regionName || "",
      "Fan": r.subjectName || "",
      "Xatolar": r.errors.join("; "),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 6 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 8 }, { wch: 15 }, { wch: 18 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Xatolar");
    XLSX.writeFile(wb, "import_xatolar.xlsx");
    toast.success("Xatoli qatorlar yuklab olindi");
  };

  // ===== STEP 3: Save with batch support =====

  const handleSave = async () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("Saqlash uchun to'g'ri qatorlar yo'q");
      return;
    }

    setSaving(true);
    const totalBatches = Math.ceil(validRows.length / BATCH_SIZE);
    const combinedResult: ImportResult = {
      created: 0,
      skipped: 0,
      errored: 0,
      passwords: [],
      errors: [],
      skippedRows: [],
    };

    try {
      for (let i = 0; i < totalBatches; i++) {
        const batch = validRows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        setProgress({
          current: i + 1,
          total: totalBatches,
          label: totalBatches > 1 ? `Batch ${i + 1}/${totalBatches} yuborilmoqda...` : "Yuborilmoqda...",
        });

        const res = await fetch("/api/admin/students/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            students: batch.map((r) => ({
              firstName: r.firstName,
              lastName: r.lastName,
              phone: r.phone,
              schoolName: r.schoolName,
              grade: r.grade,
              regionName: r.regionName,
              subjectName: r.subjectName,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || `Batch ${i + 1} xatosi`);
          continue;
        }
        combinedResult.created += data.created || 0;
        combinedResult.skipped += data.skipped || 0;
        combinedResult.errored += data.errored || 0;
        combinedResult.passwords.push(...(data.passwords || []));
        combinedResult.errors.push(...(data.errors || []));
        combinedResult.skippedRows.push(...(data.skippedRows || []));
      }

      setResult(combinedResult);
      setStep(3);
      toast.success(`${combinedResult.created} ta o'quvchi import qilindi`);
    } catch {
      toast.error("Server xatosi");
    } finally {
      setSaving(false);
      setProgress({ current: 0, total: 0, label: "" });
    }
  };

  const downloadPasswords = () => {
    if (!result) return;
    const ws = XLSX.utils.aoa_to_sheet([
      ["Ism", "Telefon", "Parol"],
      ...result.passwords.map((p) => [p.name, p.phone, p.password]),
    ]);
    ws["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parollar");
    XLSX.writeFile(wb, "oquvchi_parollar.xlsx");
  };

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/students")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">O&apos;quvchilarni import qilish</h1>
          <p className="text-sm text-slate-400 mt-1">Excel yoki CSV fayldan ommaviy yuklash</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Fayl yuklash" },
          { n: 2, label: "Tekshirish" },
          { n: 3, label: "Natija" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s.n
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-sm hidden sm:block ${step >= s.n ? "text-slate-800 font-medium" : "text-slate-400"}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`w-8 h-0.5 ${step > s.n ? "bg-primary-600" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {progress.label && (
        <Card variant="light" className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-primary-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-slate-600">{progress.label}</p>
              {progress.total > 0 && (
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.total > 1 ? (progress.current / progress.total) * 100 : progress.current}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 1: File Upload */}
      {step === 1 && !progress.label && (
        <div className="space-y-4">
          {/* Shablon namuna */}
          <Card variant="light" className="p-4 border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Namuna fayl</p>
                  <p className="text-xs text-slate-400">Excel shablonni yuklab oling va ma&apos;lumotlarni to&apos;ldiring</p>
                </div>
              </div>
              <Button variant="blue" size="sm" onClick={downloadTemplate} icon={<Download className="w-4 h-4" />}>
                Shablonni yuklab olish
              </Button>
            </div>
            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Fayl tarkibi (ustunlar):</p>
              <div className="flex flex-wrap gap-2">
                {["Ism", "Familiya", "Telefon", "Maktab", "Sinf", "Viloyat", "Fan"].map((col) => (
                  <span key={col} className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">{col}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Fayl yuklash */}
          <Card
            variant="light"
            className={`p-8 border-2 border-dashed transition-all cursor-pointer ${
              isDragging ? "border-primary-400 bg-primary-50/50" : "border-slate-200 hover:border-slate-300"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <p className="text-slate-700 font-medium">
                  Faylni bu yerga tashlang yoki bosing
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  .xlsx, .xls yoki .csv formatdagi fayllar qabul qilinadi
                </p>
              </div>
              {fileName && (
                <Badge variant="info">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  {fileName}
                </Badge>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </Card>
        </div>
      )}

      {/* STEP 2: Validate & Preview */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card variant="light" className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-800 font-mono">{rows.length}</p>
              <p className="text-xs text-slate-400">Jami qatorlar</p>
            </Card>
            <Card variant="light" className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600 font-mono">{validCount}</p>
              <p className="text-xs text-slate-400">To&apos;g&apos;ri</p>
            </Card>
            <Card variant="light" className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500 font-mono">{errorCount}</p>
              <p className="text-xs text-slate-400">Xatoli</p>
            </Card>
          </div>

          {/* Filter Tabs + Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {(["all", "valid", "errors"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    filter === f ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f === "all" ? "Barchasi" : f === "valid" ? "To'g'ri" : "Xatolar"}
                </button>
              ))}
            </div>
            {errorCount > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadErrors} icon={<Download className="w-3.5 h-3.5" />}>
                  Xatolarni yuklab olish
                </Button>
                <Button variant="outline" size="sm" onClick={removeAllErrors} icon={<Trash2 className="w-3.5 h-3.5" />}>
                  Xatoli qatorlarni olib tashlash
                </Button>
              </div>
            )}
          </div>

          {/* Rows List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredRows.map((row) => {
              const realIdx = rows.indexOf(row);
              const isEditing = editingIndex === realIdx;

              return (
                <Card key={realIdx} variant="light" className={`p-3 ${!row.isValid ? "border-red-200 bg-red-50/30" : ""}`}>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Input
                          variant="light"
                          placeholder="Ism"
                          value={editForm.firstName || ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                        />
                        <Input
                          variant="light"
                          placeholder="Familiya"
                          value={editForm.lastName || ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                        />
                        <Input
                          variant="light"
                          placeholder="Telefon"
                          value={editForm.phone || ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                        <Input
                          variant="light"
                          placeholder="Maktab"
                          value={editForm.schoolName || ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, schoolName: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setEditingIndex(null)} icon={<X className="w-3.5 h-3.5" />}>
                          Bekor
                        </Button>
                        <Button variant="blue" size="sm" onClick={() => saveEdit(realIdx)} icon={<Save className="w-3.5 h-3.5" />}>
                          Saqlash
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono w-6">{row.rowIndex}</span>
                      {row.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-slate-800 font-medium">
                          {row.firstName} {row.lastName}
                        </span>
                        <span className="text-xs text-slate-400 ml-2 font-mono">{row.phone}</span>
                        <span className="text-xs text-slate-400 ml-2">{row.schoolName}</span>
                        {row.subjectName && (
                          <Badge variant="info" size="sm" className="ml-2">{row.subjectName}</Badge>
                        )}
                        {!row.isValid && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.errors.map((err, ei) => (
                              <Badge key={ei} variant="error" size="sm">{err}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(realIdx)}>
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeRow(realIdx)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setStep(1); setRows([]); setFileName(""); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ortga
            </Button>
            <Button
              variant="blue"
              onClick={handleSave}
              loading={saving}
              disabled={validCount === 0}
              icon={<ArrowRight className="w-4 h-4" />}
              className="ml-auto"
            >
              {validCount} ta o&apos;quvchini import qilish
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Results */}
      {step === 3 && result && (
        <div className="space-y-4">
          <Card variant="light" className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-slate-800 mb-2">Import yakunlandi</h2>
            <div className="flex justify-center gap-6 mt-4">
              <div>
                <p className="text-2xl font-bold text-emerald-600 font-mono">{result.created}</p>
                <p className="text-xs text-slate-400">Qo&apos;shildi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500 font-mono">{result.skipped}</p>
                <p className="text-xs text-slate-400">O&apos;tkazildi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500 font-mono">{result.errored}</p>
                <p className="text-xs text-slate-400">Xato</p>
              </div>
            </div>
          </Card>

          {/* Errors & Skipped details */}
          {(result.errors.length > 0 || result.skippedRows.length > 0) && (
            <Card variant="light" className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Muammolar
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <div key={`e-${i}`} className="text-sm text-red-600 flex gap-2">
                    <span className="font-mono text-slate-400">#{e.row}</span>
                    <span>{e.phone}</span>
                    <span className="text-slate-400">— {e.reason}</span>
                  </div>
                ))}
                {result.skippedRows.map((e, i) => (
                  <div key={`s-${i}`} className="text-sm text-amber-600 flex gap-2">
                    <span className="font-mono text-slate-400">#{e.row}</span>
                    <span>{e.phone}</span>
                    <span className="text-slate-400">— {e.reason}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Download passwords */}
          {result.passwords.length > 0 && (
            <Card variant="light" className="p-4 border-primary-200 bg-primary-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Parollar tayyor</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    O&apos;quvchilarga tarqatish uchun parollar ro&apos;yxatini yuklab oling
                  </p>
                </div>
                <Button variant="blue" onClick={downloadPasswords} icon={<Download className="w-4 h-4" />}>
                  Yuklab olish
                </Button>
              </div>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setStep(1); setRows([]); setFileName(""); setResult(null); }}>
              Yana import qilish
            </Button>
            <Button variant="blue" onClick={() => router.push("/admin/students")} className="ml-auto">
              O&apos;quvchilar ro&apos;yxatiga qaytish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
