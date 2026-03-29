"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Pencil,
  Loader2,
  Save,
  Trash2,
  X,
  Check,
  ArrowRight,
  ClipboardPaste,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { parseQuestions, validateQuestion } from "@/lib/question-parser";
import type { ParsedQuestion } from "@/lib/question-parser";

interface Subject {
  id: string;
  name: string;
  emoji?: string;
}

type Step = 1 | 2 | 3;
type FilterType = "all" | "errors" | "valid";
type InputMode = "file" | "paste";

const STEPS = [
  { num: 1, label: "Matn kiritish" },
  { num: 2, label: "Tekshirish" },
  { num: 3, label: "Saqlash" },
];

const EXAMPLE_FORMAT = `1. O'zbekiston Respublikasining poytaxti qaysi shahar?
a) Samarqand
*b) Toshkent
c) Buxoro
d) Namangan

2. Kimyo fanida suvning formulasi qanday yoziladi?
a) CO2
b) NaCl
*c) H2O
d) O2`;

export default function ImportQuestionsPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [rawText, setRawText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ParsedQuestion | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Step 3 state
  const [saving, setSaving] = useState(false);

  // Load subjects
  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => toast.error("Fanlarni yuklashda xatolik"));
  }, []);

  // Stats
  const validCount = questions.filter((q) => q.isValid).length;
  const errorCount = questions.filter((q) => !q.isValid).length;

  // Filtered questions
  const filteredQuestions =
    filter === "all"
      ? questions
      : filter === "errors"
        ? questions.filter((q) => !q.isValid)
        : questions.filter((q) => q.isValid);

  // File handling
  const handleFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fayl hajmi 5MB dan oshmasligi kerak");
      return;
    }
    if (!file.name.endsWith(".txt")) {
      toast.error("Faqat .txt fayllar qo'llab-quvvatlanadi");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) setRawText(text);
    };
    reader.onerror = () => toast.error("Faylni o'qishda xatolik");
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Parse and go to step 2
  const handleParse = () => {
    if (!rawText.trim()) {
      toast.error("Matn kiritilmagan");
      return;
    }
    const parsed = parseQuestions(rawText);
    if (parsed.length === 0) {
      toast.error(
        "Savollar topilmadi. Format to'g'ri ekanligini tekshiring"
      );
      return;
    }
    setQuestions(parsed);
    setFilter("all");
    setStep(2);
    toast.success(`${parsed.length} ta savol topildi`);
  };

  // Inline editing
  const startEdit = (q: ParsedQuestion) => {
    setEditingIndex(q.index);
    setEditForm({ ...q });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    const revalidated = validateQuestion(editForm);
    setQuestions((prev) =>
      prev.map((q) => (q.index === revalidated.index ? revalidated : q))
    );
    setEditingIndex(null);
    setEditForm(null);
    if (revalidated.isValid) {
      toast.success(`${revalidated.index}-savol tuzatildi`);
    }
  };

  const removeErrorQuestions = () => {
    const valid = questions.filter((q) => q.isValid);
    const removed = questions.length - valid.length;
    setQuestions(valid);
    toast.success(`${removed} ta xatoli savol olib tashlandi`);
  };

  // Save to database
  const handleSave = async () => {
    const validQuestions = questions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      toast.error("Saqlash uchun to'g'ri savollar yo'q");
      return;
    }
    if (!subjectId) {
      toast.error("Fanni tanlang");
      return;
    }

    setSaving(true);
    setStep(3);

    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          ...(difficulty && { difficulty }),
          questions: validQuestions.map((q) => ({
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count} ta savol muvaffaqiyatli saqlandi!`);
        router.push("/admin/questions");
      } else {
        const data = await res.json();
        toast.error(data.error || "Saqlashda xatolik");
        setStep(2);
      }
    } catch {
      toast.error("Tarmoq xatosi");
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">
            Savollarni import qilish
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Txt fayldan yoki matn orqali ommaviy yuklash
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s.num
                    ? "bg-primary-500 text-white"
                    : step > s.num
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {step > s.num ? (
                  <Check className="w-4 h-4" />
                ) : (
                  s.num
                )}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  step === s.num
                    ? "text-primary-600 font-medium"
                    : step > s.num
                      ? "text-emerald-600"
                      : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-3 ${
                  step > s.num ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Input mode tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode("paste")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                inputMode === "paste"
                  ? "bg-primary-50 text-primary-600 border border-primary-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:text-slate-700"
              }`}
            >
              <ClipboardPaste className="w-4 h-4" />
              Matn joylashtirish
            </button>
            <button
              onClick={() => setInputMode("file")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                inputMode === "file"
                  ? "bg-primary-50 text-primary-600 border border-primary-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:text-slate-700"
              }`}
            >
              <Upload className="w-4 h-4" />
              Fayl yuklash
            </button>
          </div>

          {inputMode === "paste" ? (
            <Card variant="light" className="p-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Savollar matnini joylashtiring
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 hover:border-slate-300 resize-y leading-relaxed"
                placeholder={EXAMPLE_FORMAT}
              />
              <p className="text-xs text-slate-400">
                * belgisi to&apos;g&apos;ri javob oldiga qo&apos;yiladi.
                Savollar raqamlangan bo&apos;lishi kerak (1., 2., ...)
              </p>
            </Card>
          ) : (
            <Card variant="light" className="p-4 space-y-3">
              {/* Drag and drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <Upload
                  className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-primary-600" : "text-slate-400"}`}
                />
                <p className="text-slate-600 text-sm">
                  Faylni shu yerga tashlang yoki{" "}
                  <span className="text-primary-600 underline">tanlang</span>
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Faqat .txt fayllar, maksimum 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              {/* Show loaded text preview */}
              {rawText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-slate-600">
                        Fayl yuklandi
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRawText("")}
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                  <pre className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs max-h-40 overflow-auto">
                    {rawText.slice(0, 500)}
                    {rawText.length > 500 && "..."}
                  </pre>
                </div>
              )}
            </Card>
          )}

          {/* Format example */}
          <Card variant="light" className="p-4">
            <p className="text-xs text-primary-600 font-medium mb-2">
              Format namunasi:
            </p>
            <pre className="text-xs text-slate-500 font-mono leading-relaxed whitespace-pre-wrap">
              {EXAMPLE_FORMAT}
            </pre>
          </Card>

          <Button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="w-full"
            size="lg"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Davom etish
          </Button>
        </div>
      )}

      {/* Step 2: Preview & Edit */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Stats */}
          <Card variant="light" className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="text-slate-800 font-medium">
                  {questions.length} ta savol
                </span>
              </div>
              <Badge variant="success" size="md">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                {validCount} ta to&apos;g&apos;ri
              </Badge>
              {errorCount > 0 && (
                <Badge variant="error" size="md">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {errorCount} ta xatolik
                </Badge>
              )}
            </div>
          </Card>

          {/* Subject & Difficulty */}
          <Card variant="light" className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Fan"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                placeholder="Fanni tanlang"
                options={subjects.map((s) => ({
                  value: s.id,
                  label: `${s.emoji || ""} ${s.name}`.trim(),
                }))}
              />
              <Select
                label="Qiyinlik darajasi (ixtiyoriy)"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[
                  { value: "", label: "Tanlanmagan (O'rta)" },
                  { value: "easy", label: "Oson" },
                  { value: "medium", label: "O'rta" },
                  { value: "hard", label: "Qiyin" },
                ]}
              />
            </div>
          </Card>

          {/* Filter & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(
                [
                  { key: "all", label: "Barchasi" },
                  { key: "errors", label: "Xatoliklar" },
                  { key: "valid", label: "To'g'ri" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f.key
                      ? "bg-primary-50 text-primary-600 border border-primary-200"
                      : "bg-white text-slate-400 border border-slate-200 hover:text-slate-600"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {errorCount > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={removeErrorQuestions}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Xatoli savollarni olib tashlash
              </Button>
            )}
          </div>

          {/* Questions list */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => (
              <Card
                key={q.index}
                variant="light"
                className={`p-4 ${!q.isValid ? "border-red-200" : ""}`}
              >
                {editingIndex === q.index && editForm ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary-600">
                        #{q.index}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          <Check className="w-4 h-4 mr-1" />
                          Saqlash
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500">
                        Savol matni
                      </label>
                      <textarea
                        value={editForm.questionText}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            questionText: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 hover:border-slate-300 resize-y"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(["A", "B", "C", "D"] as const).map((letter) => {
                        const key =
                          `option${letter}` as keyof ParsedQuestion;
                        return (
                          <Input
                            key={letter}
                            label={`${letter} variant`}
                            value={editForm[key] as string}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                [key]: e.target.value,
                              })
                            }
                            placeholder={`${letter} variant`}
                          />
                        );
                      })}
                    </div>
                    <Select
                      label="To'g'ri javob"
                      value={editForm.correctAnswer}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          correctAnswer: e.target.value,
                        })
                      }
                      options={[
                        { value: "A", label: "A" },
                        { value: "B", label: "B" },
                        { value: "C", label: "C" },
                        { value: "D", label: "D" },
                      ]}
                    />
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                            #{q.index}
                          </span>
                          {q.isValid ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mb-2">
                          {q.questionText || (
                            <span className="text-red-500 italic">
                              Savol matni yo&apos;q
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {(
                            [
                              ["A", q.optionA],
                              ["B", q.optionB],
                              ["C", q.optionC],
                              ["D", q.optionD],
                            ] as const
                          ).map(([letter, text]) => (
                            <div
                              key={letter}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                                q.correctAnswer === letter
                                  ? "bg-primary-50 text-primary-600 border border-primary-200"
                                  : "bg-slate-50 text-slate-500"
                              }`}
                            >
                              <span className="font-bold">{letter})</span>
                              <span className="truncate">
                                {text || (
                                  <span className="text-red-500 italic">
                                    bo&apos;sh
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(q)}
                      >
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>

                    {/* Errors */}
                    {q.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {q.errors.map((err, i) => (
                          <p
                            key={i}
                            className="text-xs text-red-500 flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {err.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setStep(1);
                setEditingIndex(null);
                setEditForm(null);
                setFilter("all");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Orqaga
            </Button>
            <Button
              onClick={handleSave}
              disabled={validCount === 0 || !subjectId}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {validCount} ta savolni saqlash
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Saving */}
      {step === 3 && saving && (
        <Card variant="light" className="p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-800 font-medium text-lg">Saqlanmoqda...</p>
          <p className="text-slate-400 text-sm mt-1">
            {validCount} ta savol bazaga yozilmoqda
          </p>
        </Card>
      )}
    </div>
  );
}
