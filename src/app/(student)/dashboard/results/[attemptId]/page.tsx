"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Loader2, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Answer {
  order: number;
  questionText: string;
  questionImageUrl: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  score: number;
  explanation: string | null;
}

interface AttemptDetail {
  id: string;
  testName: string;
  subjectName: string;
  subjectEmoji: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  startedAt: string;
  finishedAt: string | null;
  answers: Answer[];
}

export default function StudentAttemptDetailPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/results/${attemptId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.attempt) setAttempt(d.attempt);
        else toast.error(d.error || "Natija topilmadi");
      })
      .catch(() => toast.error("Xatolik"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <Card variant="light" className="text-center py-12">
        <p className="text-slate-500">Natija topilmadi</p>
      </Card>
    );
  }

  const getOptionText = (answer: Answer, key: string) => {
    const map: Record<string, string> = {
      A: answer.optionA,
      B: answer.optionB,
      C: answer.optionC,
      D: answer.optionD,
    };
    return map[key] || "";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/results">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="font-display text-2xl font-bold text-slate-800">Batafsil natija</h1>
      </div>

      {/* Test ma'lumotlari */}
      <Card variant="light" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-slate-800">{attempt.subjectEmoji} {attempt.testName}</p>
            <p className="text-sm text-slate-400">{attempt.subjectName}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-bold text-primary-600">{attempt.totalScore.toFixed(1)}</p>
            <div className="flex gap-2 mt-1 justify-end">
              <Badge variant="success">{attempt.correctCount} to&apos;g&apos;ri</Badge>
              <Badge variant="error">{attempt.wrongCount} noto&apos;g&apos;ri</Badge>
              {attempt.unansweredCount > 0 && (
                <Badge variant="info">{attempt.unansweredCount} javobsiz</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Savolma-savol */}
      <div className="space-y-3">
        {attempt.answers.map((a) => (
          <Card
            key={a.order}
            variant="light"
            className={`p-4 border-l-4 ${
              a.isCorrect === true
                ? "border-l-emerald-500"
                : a.isCorrect === false
                ? "border-l-red-500"
                : "border-l-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {a.isCorrect === true ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : a.isCorrect === false ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <MinusCircle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-400">#{a.order}</span>
                  <span className="text-xs font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                    {a.score.toFixed(1)} ball
                  </span>
                </div>
                <p className="text-sm text-slate-800 mb-3">{a.questionText}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((key) => {
                    const isCorrect = key === a.correctAnswer;
                    const isSelected = key === a.selectedAnswer;
                    let bg = "bg-slate-50";
                    if (isCorrect) bg = "bg-emerald-50 border-emerald-200";
                    if (isSelected && !isCorrect) bg = "bg-red-50 border-red-200";

                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${bg}`}
                      >
                        <span className={`font-mono font-bold ${isCorrect ? "text-emerald-600" : isSelected ? "text-red-600" : "text-slate-400"}`}>
                          {key}
                        </span>
                        <span className={`${isCorrect ? "text-emerald-700" : isSelected && !isCorrect ? "text-red-700" : "text-slate-600"}`}>
                          {getOptionText(a, key)}
                        </span>
                        {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />}
                        {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {a.explanation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700"><span className="font-medium">Izoh:</span> {a.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
