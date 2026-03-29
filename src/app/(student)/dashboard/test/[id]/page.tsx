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
    <div className="fixed inset-0 z-50 flex flex-col test-content select-none bg-gradient-to-br from-slate-100 via-white to-primary-50">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-10 h-56 w-56 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200/70 z-10">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="relative shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Test sessiyasi
              </p>
              <div className="mt-2 flex items-start gap-3">
                <span className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 items-center justify-center shadow-sm">
                  <UserRound className="w-5 h-5 text-primary-600" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-[30px] font-semibold tracking-tight text-slate-900 truncate">
                    {studentName || "O'quvchi"}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
                      <BookOpen className="w-4 h-4" />
                      {subjectName || "Fan yuklanmoqda"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                      <span className="font-mono text-primary-600">
                        {currentQ}
                      </span>
                      / {totalQuestions} savol
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[430px] space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)_116px] gap-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Vaqt
                  </p>
                  <div className="mt-2">
                    {timerReady && (
                      <TestTimer
                        seconds={seconds}
                        isWarning={isWarning}
                        isCritical={isCritical}
                        theme="light"
                      />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Ball
                  </p>
                  <p className="mt-2 font-mono font-bold text-primary-600 text-2xl">
                    {questionData?.score}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Javob berildi
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {answeredCount} / {totalQuestions}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Qoldi
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {remainingCount} ta
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Holat
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                    {statusContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {questionData && (
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6 lg:items-start">
              <div className="min-w-0">
                <div className="mb-6 rounded-[26px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)] p-5 sm:p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 font-mono font-bold text-sm border border-primary-100 shadow-sm">
                      {currentQ}
                    </span>
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Savol matni
                      </p>
                      <h2 className="text-base sm:text-lg text-slate-900 leading-7 sm:leading-8">
                        {questionData.question.text}
                      </h2>
                    </div>
                  </div>

                  {questionData.question.imageUrl && (
                    <div className="ml-0 sm:ml-[3.5rem] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={questionData.question.imageUrl}
                        alt="Savol rasmi"
                        className="max-h-60 object-contain"
                      />
                    </div>
                  )}
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

              <aside className="hidden lg:block">
                <div className="sticky top-6 rounded-[26px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)] p-4">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Savollar paneli
                    </p>
                    <p className="mt-2 text-sm text-slate-600 leading-6">
                      Ko&apos;k rang joriy savolni, belgi tushganlari javob
                      berilgan savollarni bildiradi.
                    </p>
                  </div>

                  <QuestionNav
                    total={totalQuestions}
                    current={currentQ}
                    answeredQuestions={answeredQuestions}
                    onNavigate={goToQuestion}
                    theme="light"
                    orientation="vertical"
                    compact
                    className="max-h-[calc(100vh-19rem)] pr-1"
                  />
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <footer className="relative shrink-0 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
          <div className="lg:hidden">
            <QuestionNav
              total={totalQuestions}
              current={currentQ}
              answeredQuestions={answeredQuestions}
              onNavigate={goToQuestion}
              theme="light"
              orientation="horizontal"
              compact
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Javob berildi: {answeredCount} / {totalQuestions}
              </p>
              <p className="text-sm text-slate-500 leading-6">
                {canManualSubmit
                  ? "Barcha savollar javoblandi. Testni yakunlashingiz mumkin."
                  : "Barcha savollarga javob berganingizdan keyin testni yakunlashingiz mumkin"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToQuestion(currentQ - 1)}
                disabled={currentQ <= 1 || isSubmitting || isSavingAnswer}
                className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Oldingi
              </Button>

              <Button
                variant="blue-premium"
                size="sm"
                onClick={handleOpenSubmitModal}
                icon={<Send className="w-4 h-4" />}
                disabled={!canManualSubmit || isSubmitting || isSavingAnswer}
                className="disabled:bg-slate-200 disabled:text-slate-500 disabled:border disabled:border-slate-300 disabled:shadow-none"
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
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
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
