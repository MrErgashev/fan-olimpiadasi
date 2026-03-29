"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { TestTimer } from "@/components/test/TestTimer";
import { OptionButton } from "@/components/test/OptionButton";
import { QuestionNav } from "@/components/test/QuestionNav";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTimer } from "@/hooks/useTimer";
import { useSecurity } from "@/hooks/useSecurity";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDotDashed,
  Loader2,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

interface AttemptProgressMeta {
  answeredCount: number;
  answeredQuestionNumbers: number[];
  remainingCount: number;
  canManualSubmit: boolean;
}

interface QuestionData extends AttemptProgressMeta {
  questionNumber: number;
  totalQuestions: number;
  score: number;
  question: {
    id: string;
    text: string;
    imageUrl: string | null;
    hasFormula: boolean;
  };
  options: Record<string, { text: string; imageUrl: string | null }>;
  selectedAnswer: string | null;
  timeRemaining: number;
}

interface AnswerResponse extends AttemptProgressMeta {
  saved: boolean;
}

interface StartTestResponse {
  attemptId: string;
  totalQuestions: number;
  durationMinutes: number;
  startedAt: string;
  studentName: string;
  subjectName: string;
  resumed?: boolean;
}

type SubmissionMode = "manual" | "auto_timeout";
type SaveStatus = "idle" | "saving" | "saved" | "error";

function getRemainingSeconds(startedAt: string, durationMinutes: number) {
  const startedMs = new Date(startedAt).getTime();
  if (Number.isNaN(startedMs)) {
    return durationMinutes * 60;
  }

  const elapsedSeconds = Math.floor((Date.now() - startedMs) / 1000);
  return Math.max(0, durationMinutes * 60 - elapsedSeconds);
}

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(1);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );
  const [answeredCount, setAnsweredCount] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0);
  const [canManualSubmit, setCanManualSubmit] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode | null>(
    null
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timerReady, setTimerReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [studentName, setStudentName] = useState("");
  const [subjectName, setSubjectName] = useState("");

  const fetchingRef = useRef(false);
  const submittingRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const saveStatusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const syncProgress = useCallback((meta: AttemptProgressMeta) => {
    setAnsweredCount(meta.answeredCount);
    setRemainingCount(meta.remainingCount);
    setCanManualSubmit(meta.canManualSubmit);
    setAnsweredQuestions(new Set(meta.answeredQuestionNumbers));
  }, []);

  const setTransientSaveStatus = useCallback((status: SaveStatus) => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = null;
    }

    setSaveStatus(status);

    if (status === "saved" || status === "error") {
      saveStatusTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
        saveStatusTimerRef.current = null;
      }, 1600);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveStatusTimerRef.current) {
        clearTimeout(saveStatusTimerRef.current);
      }
    };
  }, []);

  const submitTest = useCallback(
    async (nextSubmissionMode: SubmissionMode) => {
      if (submittingRef.current) return;

      submittingRef.current = true;
      setSubmissionMode(nextSubmissionMode);

      if (nextSubmissionMode === "auto_timeout") {
        setShowTimeWarning(false);
      }

      try {
        const res = await fetch(`/api/student/test/${testId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionMode: nextSubmissionMode }),
        });
        const data = await res.json();

        if (res.ok) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }

          toast.success(`Test yakunlandi! Ball: ${data.totalScore}`);
          router.push("/dashboard/results");
          return;
        }

        if (data.answeredCount !== undefined) {
          syncProgress(data as AttemptProgressMeta);
        }

        toast.error(data.error || "Topshirishda xatolik");
      } catch {
        toast.error("Tarmoq xatosi");
      } finally {
        submittingRef.current = false;
        setSubmissionMode(null);
        setShowSubmitModal(false);
      }
    },
    [router, syncProgress, testId]
  );

  const handleTimeExpire = useCallback(async () => {
    toast.error("Vaqt tugadi! Test avtomatik topshirilmoqda...");
    await submitTest("auto_timeout");
  }, [submitTest]);

  const { seconds, isWarning, isCritical } = useTimer({
    initialSeconds: timerReady ? initialSeconds : 0,
    onExpire: handleTimeExpire,
  });

  const { requestFullscreen } = useSecurity({
    attemptId: attemptId || "",
    enabled: !!attemptId,
  });

  useEffect(() => {
    if (isCritical && !showTimeWarning && seconds > 0) {
      setShowTimeWarning(true);
    }
  }, [isCritical, showTimeWarning, seconds]);

  const fetchQuestion = useCallback(
    async (num: number) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const res = await fetch(`/api/student/test/${testId}/question/${num}`);
        const data = await res.json();

        if (res.ok) {
          setQuestionData(data);
          setTotalQuestions(data.totalQuestions);
          setSelected(data.selectedAnswer);
          setCurrentQ(num);
          syncProgress(data);

          if (!timerReady && data.timeRemaining > 0) {
            setInitialSeconds(data.timeRemaining);
            setTimerReady(true);
          }
        } else {
          toast.error(data.error || "Savolni yuklashda xatolik");
        }
      } catch {
        toast.error("Tarmoq xatosi");
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [syncProgress, testId, timerReady]
  );

  const startTest = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/test/${testId}/start`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        const startData = data as StartTestResponse;
        setAttemptId(startData.attemptId);
        setTotalQuestions(startData.totalQuestions);
        setStudentName(startData.studentName);
        setSubjectName(startData.subjectName);
        setInitialSeconds(
          getRemainingSeconds(startData.startedAt, startData.durationMinutes)
        );
        setTimerReady(true);
        requestFullscreen();
        await fetchQuestion(1);
      } else {
        toast.error(data.error || "Testni boshlashda xatolik");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Tarmoq xatosi");
      router.push("/dashboard");
    }
  }, [fetchQuestion, requestFullscreen, router, testId]);

  useEffect(() => {
    startTest();
  }, [startTest]);

  const handleAnswer = async (answer: string) => {
    if (!questionData || saveInFlightRef.current || submissionMode) return;

    const previousSelected = questionData.selectedAnswer;
    saveInFlightRef.current = true;
    setSelected(answer);
    setTransientSaveStatus("saving");

    try {
      const res = await fetch(`/api/student/test/${testId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questionData.question.id,
          answer,
        }),
      });
      const data = (await res.json()) as AnswerResponse & { error?: string };

      if (!res.ok) {
        setSelected(previousSelected);
        setTransientSaveStatus("error");
        toast.error(data.error || "Javob saqlanmadi");
        return;
      }

      syncProgress(data);
      setQuestionData((prev) =>
        prev ? { ...prev, selectedAnswer: answer, ...data } : prev
      );
      setTransientSaveStatus("saved");
    } catch {
      setSelected(previousSelected);
      setTransientSaveStatus("error");
      toast.error("Javob saqlanmadi");
    } finally {
      saveInFlightRef.current = false;
    }
  };

  const goToQuestion = (num: number) => {
    if (
      num >= 1 &&
      num <= totalQuestions &&
      num !== currentQ &&
      !submissionMode
    ) {
      setLoading(true);
      fetchQuestion(num);
    }
  };

  const handleOpenSubmitModal = () => {
    if (saveStatus === "saving") {
      toast.error("Javob saqlanishini kuting");
      return;
    }

    if (!canManualSubmit) {
      toast.error(
        "Barcha savollarga javob berganingizdan keyin testni yakunlashingiz mumkin"
      );
      return;
    }

    setShowSubmitModal(true);
  };

  const progress = totalQuestions > 0 ? (currentQ / totalQuestions) * 100 : 0;
  const completionProgress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isSavingAnswer = saveStatus === "saving";
  const isSubmitting = submissionMode !== null;
  const statusContent =
    saveStatus === "saving" ? (
      <>
        <CircleDotDashed className="w-4 h-4 text-amber-500 animate-spin" />
        <span className="text-amber-700">Saqlanmoqda...</span>
      </>
    ) : saveStatus === "saved" ? (
      <>
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="text-emerald-700">Saqlandi</span>
      </>
    ) : saveStatus === "error" ? (
      <>
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-red-600">Saqlanmadi</span>
      </>
    ) : (
      <>
        <ShieldCheck className="w-4 h-4 text-primary-500" />
        <span className="text-slate-700">Jarayon nazoratda</span>
      </>
    );

  if (loading && !questionData) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex items-center justify-center z-50">
        <div className="text-center rounded-3xl bg-white border border-slate-200 shadow-xl px-8 py-10">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-medium">
            Test yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col test-content select-none bg-gradient-to-br from-slate-100 via-slate-50 to-primary-50/60">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-10 h-48 w-48 rounded-full bg-primary-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-50 blur-3xl" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200/70 z-10">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="relative shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:py-5">
          <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:px-5 sm:py-[18px]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Test sessiyasi
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                  {timerReady && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                      <TestTimer
                        seconds={seconds}
                        isWarning={isWarning}
                        isCritical={isCritical}
                        theme="light"
                      />
                    </div>
                  )}

                  <div className="min-w-[92px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Ball
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold text-primary-600">
                      {questionData?.score}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 xl:flex-1">
                  <div className="flex items-start gap-3">
                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 shadow-sm sm:flex">
                      <UserRound className="h-5 w-5 text-primary-600" />
                    </span>
                    <div className="min-w-0">
                      <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                        {studentName || "O'quvchi"}
                      </h1>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
                          <BookOpen className="h-4 w-4" />
                          {subjectName || "Fan yuklanmoqda"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                          Test jarayoni faol
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 xl:w-auto xl:min-w-[620px]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Savol
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">
                      <span className="font-mono text-primary-600">{currentQ}</span> / {totalQuestions}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Javob
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">
                      {answeredCount} / {totalQuestions}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Qoldi
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">
                      {remainingCount} ta
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Holat
                    </p>
                    <div className="mt-1 flex min-h-6 items-center gap-2 text-sm font-medium">
                      {statusContent}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
          {questionData && (
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
              <div className="min-w-0">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 font-mono text-sm font-bold text-primary-600 shadow-sm">
                        {currentQ}
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Savol matni
                        </p>
                        <h2 className="break-words whitespace-pre-line text-base leading-7 text-slate-900 sm:text-lg sm:leading-8">
                          {questionData.question.text}
                        </h2>
                      </div>
                    </div>

                    {questionData.question.imageUrl && (
                      <div className="ml-0 inline-block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:ml-[3.5rem]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={questionData.question.imageUrl}
                          alt="Savol rasmi"
                          className="max-h-60 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Javob variantlari
                      </p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        Bitta javob tanlanadi
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(["A", "B", "C", "D"] as const).map((key) => {
                        const opt = questionData.options[key];
                        if (!opt) return null;

                        return (
                          <OptionButton
                            key={key}
                            label={key}
                            text={opt.text}
                            imageUrl={opt.imageUrl}
                            selected={selected === key}
                            onClick={() => handleAnswer(key)}
                            theme="light"
                            disabled={isSavingAnswer || isSubmitting}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="hidden xl:block">
                <div className="sticky top-5 space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Savollar paneli
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Faol savol ko&apos;k, javob berilgan savollar belgilangan.
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
                        {answeredCount}/{totalQuestions}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-500"
                          style={{ width: `${completionProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {canManualSubmit
                          ? "Barcha savollar javoblangan, testni yakunlash mumkin."
                          : `${remainingCount} ta savol hali ochiq.`}
                      </p>
                    </div>
                  </div>

                  <QuestionNav
                    total={totalQuestions}
                    current={currentQ}
                    answeredQuestions={answeredQuestions}
                    onNavigate={goToQuestion}
                    theme="light"
                    orientation="vertical"
                    compact
                    className="max-h-[calc(100vh-24rem)] content-start pr-1"
                  />

                  <div className="border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => goToQuestion(currentQ - 1)}
                        disabled={currentQ <= 1 || isSubmitting || isSavingAnswer}
                        className="justify-center bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Oldingi
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => goToQuestion(currentQ + 1)}
                        disabled={
                          currentQ >= totalQuestions || isSubmitting || isSavingAnswer
                        }
                        className="justify-center bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      >
                        Keyingi
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="blue-premium"
                      size="sm"
                      onClick={handleOpenSubmitModal}
                      icon={<Send className="h-4 w-4" />}
                      disabled={!canManualSubmit || isSubmitting || isSavingAnswer}
                      className="mt-2.5 w-full justify-center text-white [&_svg]:text-white disabled:bg-slate-200 disabled:text-white disabled:[&_svg]:text-white disabled:opacity-100 disabled:border disabled:border-slate-300 disabled:shadow-none"
                    >
                      Yakunlash
                    </Button>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Yakunlash faqat barcha savollarga javob berilgandan keyin faollashadi.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <footer className="relative shrink-0 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl xl:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="space-y-3">
            <QuestionNav
              total={totalQuestions}
              current={currentQ}
              answeredQuestions={answeredQuestions}
              onNavigate={goToQuestion}
              theme="light"
              orientation="horizontal"
              compact
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <p className="font-semibold text-slate-800">
                  Javob berildi: {answeredCount} / {totalQuestions}
                </p>
                <span className="text-slate-500">{remainingCount} ta qoldi</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => goToQuestion(currentQ - 1)}
                  disabled={currentQ <= 1 || isSubmitting || isSavingAnswer}
                  className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Oldingi
                </Button>

                <Button
                  variant="blue-premium"
                  size="sm"
                  onClick={handleOpenSubmitModal}
                  icon={<Send className="h-4 w-4" />}
                  disabled={!canManualSubmit || isSubmitting || isSavingAnswer}
                  className="text-white [&_svg]:text-white disabled:bg-slate-200 disabled:text-white disabled:[&_svg]:text-white disabled:opacity-100 disabled:border disabled:border-slate-300 disabled:shadow-none"
                >
                  Yakunlash
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => goToQuestion(currentQ + 1)}
                  disabled={
                    currentQ >= totalQuestions || isSubmitting || isSavingAnswer
                  }
                  className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Keyingi
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Testni yakunlash"
        size="sm"
        theme="light"
      >
        <div className="space-y-5">
          <p className="text-slate-700">
            Siz{" "}
            <span className="text-primary-600 font-mono font-bold text-lg">
              {answeredCount}
            </span>{" "}
            ta savolga javob berdingiz. Barcha savollar to&apos;liq bajarildi.
          </p>
          <p className="text-slate-500 text-sm">
            Haqiqatan testni yakunlaysizmi? Bu amalni qaytarib bo&apos;lmaydi.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              onClick={() => setShowSubmitModal(false)}
            >
              Bekor qilish
            </Button>
            <Button
              variant="blue-premium"
              className="flex-1"
              loading={submissionMode === "manual"}
              onClick={() => submitTest("manual")}
            >
              Ha, yakunlash
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTimeWarning}
        onClose={() => setShowTimeWarning(false)}
        title="Ogohlantirish"
        size="sm"
        theme="light"
      >
        <div className="space-y-5 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-slate-800 text-lg">
            Test vaqti tugashiga{" "}
            <strong className="text-red-500">1 daqiqa</strong> qoldi.
          </p>
          <p className="text-sm text-slate-500">
            Javoblaringiz saqlanib boryapti. Vaqt tugasa test avtomatik
            yakunlanadi.
          </p>
          <Button
            variant="blue-premium"
            onClick={() => setShowTimeWarning(false)}
            className="w-full"
          >
            Tushundim
          </Button>
        </div>
      </Modal>
    </div>
  );
}
