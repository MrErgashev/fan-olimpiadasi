"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { toTashkentISO } from "@/lib/utils";
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

interface Subject {
  id: string;
  name: string;
}

export default function NewTestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    name: "",
    totalQuestions: "30",
    durationMinutes: "90",
    totalScore: "100",
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
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []));
  }, []);

  const totalQuestions = Math.max(1, Number(form.totalQuestions) || 0);
  const fixedVariantValidation = useMemo(
    () => validateScoreBands(totalQuestions, form.scoreBands),
    [form.scoreBands, totalQuestions]
  );
  const fixedVariantTotal = useMemo(
    () => calculateBandsTotal(form.scoreBands),
    [form.scoreBands]
  );
  const isFixedVariant = form.scoringMode === "banded_fixed_variant";
  const canSubmit =
    !!form.subjectId &&
    !!form.name &&
    !!form.durationMinutes &&
    (!isFixedVariant ||
      (form.testQuestions.length === totalQuestions && fixedVariantValidation.ok));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Formani to'liq va to'g'ri to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
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
        toast.success("Test yaratildi!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/tests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="font-display text-2xl font-bold text-slate-800">Yangi test</h1>
      </div>

      <Card variant="light" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Fan"
              value={form.subjectId}
              onChange={(e) => setField("subjectId", e.target.value)}
              placeholder="Fanni tanlang"
              options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
            />
            <Input
              label="Test nomi"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder='Masalan: "Matematika — I tur"'
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Savollar soni"
              type="number"
              min={1}
              value={form.totalQuestions}
              onChange={(e) => handleTotalQuestionsChange(e.target.value)}
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
            subjectId={form.subjectId}
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
                Bu vaqtdan keyin yangi o&apos;quvchilar testni boshlay olmaydi, lekin boshlaganlar davom etadi.
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
            <p className="mt-1 text-xs text-slate-400">
              Bo&apos;sh qoldirilsa, PIN so&apos;ralmaydi.
            </p>
          </div>

          {isFixedVariant && !fixedVariantValidation.ok && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {fixedVariantValidation.error}
            </div>
          )}

          <Button type="submit" disabled={loading || !canSubmit} className="w-full" size="lg">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 w-4 h-4" /> Yaratish
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
