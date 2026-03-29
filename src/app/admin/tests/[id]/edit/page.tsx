"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { toTashkentLocal, toTashkentISO } from "@/lib/utils";
import {
  buildDefaultBands,
  calculateBandsTotal,
  type TestScoringMode,
  validateScoreBands,
} from "@/lib/scoring";
import {
  TestScoringConfigurator,
  type TestQuestionEditorItem,
} from "@/components/admin/TestScoringConfigurator";

interface TestData {
  id: string;
  name: string;
  subjectId: string;
  totalQuestions: number;
  durationMinutes: number;
  totalScore: number;
  scoringMode: TestScoringMode;
  isRandomOrder: boolean;
  isShuffleOptions: boolean;
  startsAt: string | null;
  endsAt: string | null;
  accessPin: string | null;
  status: string;
  subject: { id: string; name: string; emoji: string };
  _count: { testAttempts: number };
  scoreBands: {
    fromQuestion: number;
    toQuestion: number;
    scorePerQuestion: number;
  }[];
  testQuestions: {
    questionId: string;
    displayOrder: number;
    question: { id: string; questionText: string; difficulty: string };
  }[];
}

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    totalQuestions: "",
    durationMinutes: "",
    totalScore: "",
    scoringMode: "distributed" as TestScoringMode,
    isRandomOrder: true,
    isShuffleOptions: true,
    startsAt: "",
    endsAt: "",
    accessPin: "",
    status: "draft",
    scoreBands: buildDefaultBands(30),
    testQuestions: [] as TestQuestionEditorItem[],
  });

  useEffect(() => {
    fetch(`/api/admin/tests/${testId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.test) return;

        const test = d.test as TestData;
        setTestData(test);
        setForm({
          name: test.name,
          totalQuestions: String(test.totalQuestions),
          durationMinutes: String(test.durationMinutes),
          totalScore: String(test.totalScore),
          scoringMode: test.scoringMode || "distributed",
          isRandomOrder: test.isRandomOrder,
          isShuffleOptions: test.isShuffleOptions,
          startsAt: toTashkentLocal(test.startsAt),
          endsAt: toTashkentLocal(test.endsAt),
          accessPin: test.accessPin || "",
          status: test.status,
          scoreBands:
            test.scoringMode === "banded_fixed_variant" && test.scoreBands.length
              ? test.scoreBands.map((band) => ({
                  fromQuestion: band.fromQuestion,
                  toQuestion: band.toQuestion,
                  scorePerQuestion: band.scorePerQuestion,
                }))
              : buildDefaultBands(test.totalQuestions),
          testQuestions: (test.testQuestions || []).map((question) => ({
            questionId: question.questionId,
            displayOrder: question.displayOrder,
            questionText: question.question.questionText,
            difficulty: question.question.difficulty,
          })),
        });
      })
      .catch(() => toast.error("Testni yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, [testId]);

  const hasAttempts = (testData?._count.testAttempts || 0) > 0;
  const totalQuestions = Math.max(1, Number(form.totalQuestions) || 0);
  const isFixedVariant = form.scoringMode === "banded_fixed_variant";
  const fixedVariantValidation = useMemo(
    () => validateScoreBands(totalQuestions, form.scoreBands),
    [form.scoreBands, totalQuestions]
  );
  const fixedVariantTotal = useMemo(
    () => calculateBandsTotal(form.scoreBands),
    [form.scoreBands]
  );
  const canSubmit =
    !!form.name &&
    !!form.durationMinutes &&
    (!isFixedVariant ||
      (form.testQuestions.length === totalQuestions && fixedVariantValidation.ok));

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTotalQuestionsChange = (value: string) => {
    const nextTotal = Math.max(1, Number(value) || 0);
    setForm((prev) => ({
      ...prev,
      totalQuestions: value,
      scoreBands:
        prev.scoringMode === "banded_fixed_variant" ? buildDefaultBands(nextTotal) : prev.scoreBands,
      testQuestions:
        prev.scoringMode === "banded_fixed_variant"
          ? prev.testQuestions.slice(0, nextTotal).map((question, index) => ({
              ...question,
              displayOrder: index + 1,
            }))
          : prev.testQuestions,
    }));
  };

  const handleScoringModeChange = (mode: TestScoringMode) => {
    setForm((prev) => ({
      ...prev,
      scoringMode: mode,
      isRandomOrder: mode === "banded_fixed_variant" ? false : prev.isRandomOrder,
      scoreBands:
        mode === "banded_fixed_variant"
          ? prev.scoreBands.length
            ? prev.scoreBands
            : buildDefaultBands(totalQuestions)
          : prev.scoreBands,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Formani to'g'ri to'ldiring");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalQuestions,
          durationMinutes: parseInt(form.durationMinutes),
          totalScore: isFixedVariant ? fixedVariantTotal : parseFloat(form.totalScore),
          startsAt: toTashkentISO(form.startsAt),
          endsAt: toTashkentISO(form.endsAt),
        }),
      });

      if (res.ok) {
        toast.success("Test yangilandi!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Testni o'chirishga ishonchingiz komilmi?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Test o'chirildi!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!testData) {
    return <div className="py-20 text-center text-slate-500">Test topilmadi</div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800">Testni tahrirlash</h1>
            <p className="text-sm text-slate-400">
              {testData.subject.emoji} {testData.subject.name}
            </p>
          </div>
        </div>

        {!hasAttempts && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="text-red-500 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-1 h-4 w-4" /> O&apos;chirish
          </Button>
        )}
      </div>

      {hasAttempts && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Bu testda {testData._count.testAttempts} ta urinish mavjud
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Savollar soni o&apos;zgarmaydi, lekin scoring mode, diapazon va fixed variant savollari yangilansa,
              bu o&apos;zgarishlar faqat keyin boshlanadigan attemptlarga ta&apos;sir qiladi.
            </p>
          </div>
        </div>
      )}

      <Card variant="light" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Test nomi"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Savollar soni"
              type="number"
              min={1}
              value={form.totalQuestions}
              onChange={(e) => handleTotalQuestionsChange(e.target.value)}
              disabled={hasAttempts}
            />
            <Input
              label="Vaqt (daqiqa)"
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setField("durationMinutes", e.target.value)}
            />
            <Input
              label="Umumiy ball"
              type="number"
              value={isFixedVariant ? fixedVariantTotal.toFixed(1) : form.totalScore}
              onChange={(e) => setField("totalScore", e.target.value)}
              disabled={isFixedVariant}
            />
          </div>

          <TestScoringConfigurator
            subjectId={testData.subjectId}
            totalQuestions={totalQuestions}
            scoringMode={form.scoringMode}
            isRandomOrder={form.isRandomOrder}
            scoreBands={form.scoreBands}
            testQuestions={form.testQuestions}
            onScoringModeChange={handleScoringModeChange}
            onRandomOrderChange={(value) => setField("isRandomOrder", value)}
            onScoreBandsChange={(bands) => setField("scoreBands", bands)}
            onTestQuestionsChange={(questions) => setField("testQuestions", questions)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-button border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={form.isShuffleOptions}
                onChange={(e) => setField("isShuffleOptions", e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm text-slate-600">Variantlar shuffle</span>
            </label>
            <Select
              label="Holat"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              options={[
                { value: "draft", label: "Qoralama" },
                { value: "active", label: "Faol" },
                { value: "closed", label: "Yopilgan" },
              ]}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Ochilish vaqti"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setField("startsAt", e.target.value)}
            />
            <div>
              <Input
                label="Oxirgi boshlash vaqti"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setField("endsAt", e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                Bu vaqtdan keyin yangi o&apos;quvchilar testni boshlay olmaydi.
              </p>
            </div>
          </div>

          <div>
            <Input
              label="Kirish kodi (PIN)"
              value={form.accessPin}
              onChange={(e) => setField("accessPin", e.target.value)}
              placeholder="Masalan: 1234"
              maxLength={6}
            />
            <p className="mt-1 text-xs text-slate-400">Bo&apos;sh qoldirilsa, PIN so&apos;ralmaydi.</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Ishtirokchilar:</span>
            <Badge variant="info">{testData._count.testAttempts}</Badge>
          </div>

          {isFixedVariant && !fixedVariantValidation.ok && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {fixedVariantValidation.error}
            </div>
          )}

          <Button type="submit" disabled={saving || !canSubmit} className="w-full" size="lg">
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Saqlash
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
