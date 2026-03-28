"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface TestInfo {
  id: string;
  name: string;
  subjectName: string;
  subjectEmoji: string;
  totalQuestions: number;
  durationMinutes: number;
  status: "waiting" | "active" | "completed" | "closed";
  score?: number;
  startsAt?: string;
  endsAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<TestInfo | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch("/api/student/tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch {
      toast.error("Testlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (test: TestInfo) => {
    setStartingTest(test.id);
    try {
      const res = await fetch(`/api/student/test/${test.id}/start`, {
        method: "POST",
      });

      if (res.ok) {
        router.push(`/dashboard/test/${test.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Testni boshlashda xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setStartingTest(null);
      setConfirmModal(null);
    }
  };

  const getStatusBadge = (status: TestInfo["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge variant="warning">Kutilmoqda</Badge>;
      case "active":
        return <Badge variant="success">Faol</Badge>;
      case "completed":
        return <Badge variant="gold">Tugatilgan</Badge>;
      case "closed":
        return <Badge variant="error">Yopilgan</Badge>;
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
          Assalomu alaykum!
        </h1>
        <p className="mt-2 text-white/50">
          Olimpiada testlaringiz quyida ko&apos;rsatilgan
        </p>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        </div>
      ) : tests.length === 0 ? (
        <Card variant="glass" className="text-center py-16">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Hozircha testlar mavjud emas</p>
          <p className="text-sm text-white/30 mt-1">
            Testlar admin tomonidan faollashtirilganda ko&apos;rinadi
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tests.map((test) => (
            <Card key={test.id} variant="glass" hover className="relative">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{test.subjectEmoji}</span>
                {getStatusBadge(test.status)}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">
                {test.subjectName}
              </h3>
              <p className="text-sm text-white/50 mb-4">{test.name}</p>

              <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {test.totalQuestions} savol
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {test.durationMinutes} daqiqa
                </span>
              </div>

              {test.status === "completed" && test.score !== undefined && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-gold-500/10 border border-gold-500/20">
                  <Trophy className="w-5 h-5 text-gold-400" />
                  <span className="font-mono text-lg font-bold text-gold-400">
                    {test.score.toFixed(1)}
                  </span>
                  <span className="text-sm text-white/40">/ 100 ball</span>
                </div>
              )}

              {test.status === "active" && (
                <Button
                  className="w-full"
                  onClick={() => setConfirmModal(test)}
                >
                  Testni boshlash
                </Button>
              )}

              {test.status === "waiting" && (
                <Button className="w-full" variant="secondary" disabled>
                  Hali boshlanmagan
                </Button>
              )}

              {test.status === "completed" && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push("/dashboard/results")}
                >
                  Natijalarni ko&apos;rish
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Diqqat!"
        size="md"
      >
        {confirmModal && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <p>
                  Test boshlanganidan keyin uni to&apos;xtatish yoki qayta
                  boshlash <strong className="text-white">MUMKIN EMAS</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <p>
                  Boshqa tab/ilovaga o&apos;tish qayd etiladi va admin tomonidan
                  ko&apos;riladi.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 space-y-1 text-sm">
              <p className="text-white/60">
                Test vaqti:{" "}
                <span className="text-white font-mono">
                  {confirmModal.durationMinutes} daqiqa
                </span>
              </p>
              <p className="text-white/60">
                Savollar soni:{" "}
                <span className="text-white font-mono">
                  {confirmModal.totalQuestions}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmModal(null)}
              >
                Bekor qilish
              </Button>
              <Button
                className="flex-1"
                disabled={!!startingTest}
                onClick={() => handleStartTest(confirmModal)}
              >
                {startingTest ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "TESTNI BOSHLASH"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
