"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  buildAssignedScoresFromBands,
  calculateBandsTotal,
  type ScoreBandInput,
  type TestScoringMode,
  validateScoreBands,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";

export interface TestQuestionEditorItem {
  questionId: string;
  displayOrder: number;
  questionText: string;
  difficulty?: string;
}

interface QuestionOption {
  id: string;
  questionText: string;
  difficulty: string;
}

interface TestScoringConfiguratorProps {
  subjectId: string;
  totalQuestions: number;
  scoringMode: TestScoringMode;
  isRandomOrder: boolean;
  scoreBands: ScoreBandInput[];
  testQuestions: TestQuestionEditorItem[];
  onScoringModeChange: (mode: TestScoringMode) => void;
  onRandomOrderChange: (value: boolean) => void;
  onScoreBandsChange: (bands: ScoreBandInput[]) => void;
  onTestQuestionsChange: (questions: TestQuestionEditorItem[]) => void;
}

function reindexQuestions(questions: TestQuestionEditorItem[]) {
  return questions.map((question, index) => ({
    ...question,
    displayOrder: index + 1,
  }));
}

function difficultyLabel(value?: string) {
  switch (value) {
    case "easy":
      return "Oson";
    case "hard":
      return "Qiyin";
    default:
      return "O'rta";
  }
}

export function TestScoringConfigurator({
  subjectId,
  totalQuestions,
  scoringMode,
  isRandomOrder,
  scoreBands,
  testQuestions,
  onScoringModeChange,
  onRandomOrderChange,
  onScoreBandsChange,
  onTestQuestionsChange,
}: TestScoringConfiguratorProps) {
  const [availableQuestions, setAvailableQuestions] = useState<QuestionOption[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!subjectId || scoringMode !== "banded_fixed_variant") return;

    let cancelled = false;
    setLoadingQuestions(true);

    fetch(`/api/admin/questions?subjectId=${subjectId}&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAvailableQuestions(
          (data.questions || []).map((question: QuestionOption) => ({
            id: question.id,
            questionText: question.questionText,
            difficulty: question.difficulty,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setAvailableQuestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingQuestions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId, scoringMode]);

  const filteredAvailableQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedIds = new Set(testQuestions.map((question) => question.questionId));

    return availableQuestions.filter((question) => {
      if (selectedIds.has(question.id)) return false;
      if (!query) return true;
      return question.questionText.toLowerCase().includes(query);
    });
  }, [availableQuestions, search, testQuestions]);

  const bandValidation = useMemo(
    () => validateScoreBands(totalQuestions, scoreBands),
    [scoreBands, totalQuestions]
  );

  const assignedScores = useMemo(() => {
    if (!bandValidation.ok) return [];
    return buildAssignedScoresFromBands(totalQuestions, scoreBands);
  }, [bandValidation, scoreBands, totalQuestions]);

  const totalBandScore = useMemo(
    () => calculateBandsTotal(scoreBands),
    [scoreBands]
  );

  const upsertQuestion = (question: QuestionOption) => {
    if (testQuestions.some((item) => item.questionId === question.id)) return;
    if (testQuestions.length >= totalQuestions) return;

    onTestQuestionsChange(
      reindexQuestions([
        ...testQuestions,
        {
          questionId: question.id,
          displayOrder: testQuestions.length + 1,
          questionText: question.questionText,
          difficulty: question.difficulty,
        },
      ])
    );
  };

  const removeQuestion = (questionId: string) => {
    onTestQuestionsChange(
      reindexQuestions(testQuestions.filter((question) => question.questionId !== questionId))
    );
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= testQuestions.length) return;

    const nextQuestions = [...testQuestions];
    [nextQuestions[index], nextQuestions[nextIndex]] = [nextQuestions[nextIndex], nextQuestions[index]];
    onTestQuestionsChange(reindexQuestions(nextQuestions));
  };

  const updateBand = (
    index: number,
    key: keyof ScoreBandInput,
    value: number
  ) => {
    onScoreBandsChange(
      scoreBands.map((band, bandIndex) =>
        bandIndex === index ? { ...band, [key]: value } : band
      )
    );
  };

  const addBand = () => {
    const lastBand = scoreBands[scoreBands.length - 1];
    const nextFrom = lastBand ? Math.min(totalQuestions, lastBand.toQuestion + 1) : 1;

    onScoreBandsChange([
      ...scoreBands,
      {
        fromQuestion: nextFrom,
        toQuestion: nextFrom,
        scorePerQuestion: 1,
      },
    ]);
  };

  const removeBand = (index: number) => {
    onScoreBandsChange(scoreBands.filter((_, bandIndex) => bandIndex !== index));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <Select
        label="Scoring mode"
        value={scoringMode}
        onChange={(e) => onScoringModeChange(e.target.value as TestScoringMode)}
        options={[
          { value: "distributed", label: "Standart taqsimlangan" },
          { value: "banded_fixed_variant", label: "Fixed variant + diapazonli ball" },
        ]}
      />

      {scoringMode === "distributed" ? (
        <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            Hozirgi standart rejimda savollar subject bazasidan olinadi va ball avtomatik taqsimlanadi.
          </p>
          <label className="flex items-center gap-3 rounded-button border border-slate-200 bg-white p-3">
            <input
              type="checkbox"
              checked={isRandomOrder}
              onChange={(e) => onRandomOrderChange(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm text-slate-600">Savollar random tartibda tanlansin</span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              Fixed variant rejimida savollar studentga aynan admin bergan tartibda tushadi.
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Savollar random qilinmaydi. Faqat javob variantlarini alohida shuffle qilish mumkin.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Tanlangan savollar</p>
                  <p className="text-xs text-slate-400">
                    {testQuestions.length} / {totalQuestions} ta tanlandi
                  </p>
                </div>
                <Badge variant={testQuestions.length === totalQuestions ? "success" : "warning"}>
                  {testQuestions.length === totalQuestions ? "Tayyor" : "To'ldiring"}
                </Badge>
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {testQuestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
                    Hali savol tanlanmagan.
                  </div>
                ) : (
                  testQuestions.map((question, index) => (
                    <div
                      key={question.questionId}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="info">#{index + 1}</Badge>
                            <Badge variant="default">{difficultyLabel(question.difficulty)}</Badge>
                            {assignedScores[index] !== undefined && (
                              <Badge variant="gold">{assignedScores[index].toFixed(1)} ball</Badge>
                            )}
                          </div>
                          <p className="line-clamp-3 text-sm text-slate-700">{question.questionText}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button type="button" variant="ghost" size="sm" onClick={() => moveQuestion(index, -1)}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => moveQuestion(index, 1)}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.questionId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Savollar bazasi</p>
                  <p className="text-xs text-slate-400">Fan bo&apos;yicha faol savollar</p>
                </div>
                <Badge variant="default">{availableQuestions.length} ta</Badge>
              </div>

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Savoldan qidirish..."
              />

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {loadingQuestions ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
                    Savollar yuklanmoqda...
                  </div>
                ) : filteredAvailableQuestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
                    Mos savol topilmadi.
                  </div>
                ) : (
                  filteredAvailableQuestions.map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => upsertQuestion(question)}
                      disabled={testQuestions.length >= totalQuestions}
                      className={cn(
                        "w-full rounded-xl border border-slate-200 p-3 text-left transition",
                        "hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="default">{difficultyLabel(question.difficulty)}</Badge>
                          </div>
                          <p className="line-clamp-3 text-sm text-slate-700">{question.questionText}</p>
                        </div>
                        <Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Ball diapazonlari</p>
                <p className="text-xs text-slate-400">
                  Jami: <span className="font-mono">{totalBandScore.toFixed(1)}</span> / 100
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={addBand}>
                  <Plus className="h-4 w-4" /> Diapazon qo&apos;shish
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {scoreBands.map((band, index) => (
                <div
                  key={`${index}-${band.fromQuestion}-${band.toQuestion}`}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr,1fr,1fr,auto]"
                >
                  <Input
                    label="Boshlanish savoli"
                    type="number"
                    min={1}
                    value={band.fromQuestion}
                    onChange={(e) => updateBand(index, "fromQuestion", Number(e.target.value))}
                  />
                  <Input
                    label="Tugash savoli"
                    type="number"
                    min={1}
                    value={band.toQuestion}
                    onChange={(e) => updateBand(index, "toQuestion", Number(e.target.value))}
                  />
                  <Input
                    label="Har savol uchun ball"
                    type="number"
                    min={0}
                    step="0.1"
                    value={band.scorePerQuestion}
                    onChange={(e) => updateBand(index, "scorePerQuestion", Number(e.target.value))}
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBand(index)}
                      disabled={scoreBands.length === 1}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!bandValidation.ok && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {bandValidation.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
