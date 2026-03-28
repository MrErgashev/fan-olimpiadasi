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
  BookOpen,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
        return (
          <Badge variant="info" size="md">
            Kutilmoqda
          </Badge>
        );
      case "active":
        return (
          <Badge variant="success" size="md">
            Faol
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="gold" size="md">
            Tugatilgan
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="error" size="md">
            Yopilgan
          </Badge>
        );
    }
  };

  // Stats
  const completedTests = tests.filter((t) => t.status === "completed").length;
  const activeTests = tests.filter((t) => t.status === "active").length;
  const avgScore =
    completedTests > 0
      ? tests
          .filter((t) => t.status === "completed" && t.score !== undefined)
          .reduce((sum, t) => sum + (t.score || 0), 0) / completedTests
      : 0;

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient">
          Assalomu alaykum!
        </h1>
        <p className="mt-3 text-lg text-white/50">
          Olimpiada testlaringiz quyida ko&apos;rsatilgan
        </p>
      </motion.div>

      {/* Quick Stats */}
      {!loading && tests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
        >
          <div className="glass-subtle rounded-2xl p-4 sm:p-5 text-center">
            <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {tests.length}
            </p>
            <p className="text-xs sm:text-sm text-white/40 mt-1">Jami testlar</p>
          </div>
          <div className="glass-subtle rounded-2xl p-4 sm:p-5 text-center">
            <Target className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {completedTests}
            </p>
            <p className="text-xs sm:text-sm text-white/40 mt-1">Tugatilgan</p>
          </div>
          <div className="glass-subtle rounded-2xl p-4 sm:p-5 text-center">
            <Trophy className="w-5 h-5 text-gold-400 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-mono font-bold text-gold-400">
              {avgScore > 0 ? avgScore.toFixed(1) : "—"}
            </p>
            <p className="text-xs sm:text-sm text-white/40 mt-1">O&apos;rtacha ball</p>
          </div>
        </motion.div>
      )}

      {/* Tests Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        </div>
      ) : tests.length === 0 ? (
        <Card variant="glass" className="text-center py-20 rounded-2xl">
          <FileText className="w-16 h-16 text-white/10 mx-auto mb-6" />
          <p className="text-xl text-white/50 font-medium">
            Hozircha testlar mavjud emas
          </p>
          <p className="text-sm text-white/30 mt-2 max-w-sm mx-auto">
            Testlar admin tomonidan faollashtirilganda bu yerda ko&apos;rinadi
          </p>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {tests.map((test) => (
            <motion.div key={test.id} variants={item}>
              <Card
                variant="glass"
                hover
                className={`relative rounded-2xl ${
                  test.status === "active"
                    ? "border border-green-500/30 shadow-glow-green"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{test.subjectEmoji}</span>
                  {getStatusBadge(test.status)}
                </div>

                <h3 className="text-xl font-semibold text-white mb-1">
                  {test.subjectName}
                </h3>
                <p className="text-sm text-white/50 mb-5">{test.name}</p>

                <div className="flex items-center gap-4 text-sm text-white/40 mb-5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    {test.totalQuestions} savol
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {test.durationMinutes} daqiqa
                  </span>
                </div>

                {test.status === "completed" && test.score !== undefined && (
                  <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-gold-500/10 border border-gold-500/20">
                    <Trophy className="w-6 h-6 text-gold-400" />
                    <span className="font-mono text-2xl font-bold text-gold-400 text-glow-gold">
                      {test.score.toFixed(1)}
                    </span>
                    <span className="text-sm text-white/40">/ 100 ball</span>
                  </div>
                )}

                {test.status === "active" && (
                  <Button
                    variant="premium"
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
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Diqqat!"
        size="md"
      >
        {confirmModal && (
          <div className="space-y-5">
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <p>
                  Test boshlanganidan keyin uni to&apos;xtatish yoki qayta
                  boshlash{" "}
                  <strong className="text-white">MUMKIN EMAS</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <p>
                  Boshqa tab/ilovaga o&apos;tish qayd etiladi va admin
                  tomonidan ko&apos;riladi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl glass-subtle space-y-2 text-sm">
              <p className="text-white/60">
                Test vaqti:{" "}
                <span className="text-white font-mono font-bold">
                  {confirmModal.durationMinutes} daqiqa
                </span>
              </p>
              <p className="text-white/60">
                Savollar soni:{" "}
                <span className="text-white font-mono font-bold">
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
                variant="premium"
                className="flex-1"
                loading={!!startingTest}
                onClick={() => handleStartTest(confirmModal)}
              >
                TESTNI BOSHLASH
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
