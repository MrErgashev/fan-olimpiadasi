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
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

interface QuestionData {
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
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timerReady, setTimerReady] = useState(false);

  const fetchingRef = useRef(false);

  // Timer
  const handleTimeExpire = useCallback(async () => {
    toast.error("Vaqt tugadi! Test avtomatik topshirilmoqda...");
    await submitTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { seconds, isWarning, isCritical } = useTimer({
    initialSeconds: timerReady ? initialSeconds : 0,
    onExpire: handleTimeExpire,
  });

  // Security
  const { requestFullscreen } = useSecurity({
    attemptId: attemptId || "",
    enabled: !!attemptId,
  });

  // Oxirgi 1 daqiqada ogohlantirish
  useEffect(() => {
    if (isCritical && !showTimeWarning && seconds > 0) {
      setShowTimeWarning(true);
    }
  }, [isCritical, showTimeWarning, seconds]);

  // Test boshlash
  useEffect(() => {
    startTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTest = async () => {
    try {
      const res = await fetch(`/api/student/test/${testId}/start`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setAttemptId(data.attemptId);
        setTotalQuestions(data.totalQuestions);
        setInitialSeconds(data.durationMinutes * 60);
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
  };

  const fetchQuestion = async (num: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const res = await fetch(
        `/api/student/test/${testId}/question/${num}`
      );
      const data = await res.json();

      if (res.ok) {
        setQuestionData(data);
        setSelected(data.selectedAnswer);
        setCurrentQ(num);

        // Vaqtni yangilash (server-side)
        if (!timerReady && data.timeRemaining > 0) {
          setInitialSeconds(data.timeRemaining);
          setTimerReady(true);
        }

        // Javob berilgan savollarni kuzatish
        if (data.selectedAnswer) {
          setAnsweredQuestions((prev) => { const next = new Set(Array.from(prev)); next.add(num); return next; });
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
  };

  const handleAnswer = async (answer: string) => {
    if (!questionData) return;

    setSelected(answer);
    setAnsweredQuestions((prev) => (() => { const next = new Set(Array.from(prev)); next.add(currentQ); return next; })());

    try {
      await fetch(`/api/student/test/${testId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questionData.question.id,
          answer,
        }),
      });
    } catch {
      toast.error("Javob saqlanmadi");
    }
  };

  const goToQuestion = (num: number) => {
    if (num >= 1 && num <= totalQuestions && num !== currentQ) {
      setLoading(true);
      fetchQuestion(num);
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/test/${testId}/submit`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        // Fullscreen dan chiqish
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        toast.success(
          `Test yakunlandi! Ball: ${data.totalScore}`
        );
        router.push("/dashboard/results");
      } else {
        toast.error(data.error || "Topshirishda xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading && !questionData) {
    return (
      <div className="fixed inset-0 bg-green-900 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold-400 mx-auto mb-4" />
          <p className="text-white/60">Test yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-green-900 z-50 flex flex-col test-content select-none">
      {/* Header */}
      <header className="shrink-0 border-b border-white/5 bg-green-900/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-white/60">
            <span className="font-mono text-gold-400">
              {currentQ}/{totalQuestions}
            </span>
          </div>

          {timerReady && (
            <TestTimer
              seconds={seconds}
              isWarning={isWarning}
              isCritical={isCritical}
            />
          )}

          <div className="text-sm text-white/40">
            Ball:{" "}
            <span className="font-mono text-gold-400">
              {questionData?.score}
            </span>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          {questionData && (
            <>
              {/* Savol */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 font-mono font-bold text-sm">
                    {currentQ}
                  </span>
                  <h2 className="text-base sm:text-lg text-white/90 leading-relaxed">
                    {questionData.question.text}
                  </h2>
                </div>

                {questionData.question.imageUrl && (
                  <div className="ml-11 rounded-xl overflow-hidden bg-white/5 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={questionData.question.imageUrl}
                      alt="Savol rasmi"
                      className="max-h-64 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Variantlar */}
              <div className="space-y-3">
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
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="shrink-0 border-t border-white/5 bg-green-900/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {/* Question nav dots */}
          <QuestionNav
            total={totalQuestions}
            current={currentQ}
            answeredQuestions={answeredQuestions}
            onNavigate={goToQuestion}
          />

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => goToQuestion(currentQ - 1)}
              disabled={currentQ <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Oldingi
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
            >
              <Send className="w-4 h-4 mr-1" />
              Yakunlash
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => goToQuestion(currentQ + 1)}
              disabled={currentQ >= totalQuestions}
            >
              Keyingi
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </footer>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Testni yakunlash"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Siz{" "}
            <span className="text-green-400 font-mono font-bold">
              {answeredQuestions.size}
            </span>{" "}
            ta savolga javob berdingiz.{" "}
            <span className="text-yellow-400 font-mono font-bold">
              {totalQuestions - answeredQuestions.size}
            </span>{" "}
            ta javobsiz qoldi.
          </p>
          <p className="text-white/50 text-sm">
            Haqiqatan yakunlaysizmi? Bu amalni qaytarib bo&apos;lmaydi.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowSubmitModal(false)}
            >
              Bekor qilish
            </Button>
            <Button
              className="flex-1"
              disabled={submitting}
              onClick={submitTest}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "HA, YAKUNLASH"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Time Warning Modal */}
      <Modal
        isOpen={showTimeWarning}
        onClose={() => setShowTimeWarning(false)}
        title="Ogohlantirish!"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white/80">
            Test vaqti tugashiga <strong className="text-red-400">1 daqiqa</strong> qoldi!
          </p>
          <Button onClick={() => setShowTimeWarning(false)} className="w-full">
            Tushundim
          </Button>
        </div>
      </Modal>
    </div>
  );
}
