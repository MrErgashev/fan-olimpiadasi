"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  FileQuestion,
  ClipboardList,
  Trophy,
  Loader2,
  BarChart3,
  Plus,
  KeyRound,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

interface Stats {
  totalStudents: number;
  totalQuestions: number;
  totalTests: number;
  activeTests: number;
  totalAttempts: number;
  submittedAttempts: number;
  subjectStats: {
    name: string;
    emoji: string;
    questions: number;
    tests: number;
    students: number;
  }[];
}

// Subject accent colors for table
const SUBJECT_BAR_COLORS: Record<string, string> = {
  Matematika: "bg-blue-500",
  Informatika: "bg-cyan-500",
  Tarix: "bg-amber-500",
  "Ingliz tili": "bg-red-500",
  Biologiya: "bg-emerald-500",
  "Ona tili va adabiyoti": "bg-violet-500",
  "Jismoniy tarbiya": "bg-orange-500",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => toast.error("Statistika yuklanmadi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

  if (!stats) return null;

  const maxQuestions = Math.max(...stats.subjectStats.map((s) => s.questions), 1);

  const cards = [
    {
      label: "Jami o'quvchilar",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/15",
    },
    {
      label: "Savollar bazasi",
      value: stats.totalQuestions,
      icon: FileQuestion,
      color: "text-green-400",
      bgColor: "bg-green-500/15",
    },
    {
      label: "Faol testlar",
      value: stats.activeTests,
      icon: ClipboardList,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/15",
    },
    {
      label: "Topshirilgan testlar",
      value: stats.submittedAttempts,
      icon: Trophy,
      color: "text-gold-400",
      bgColor: "bg-gold-500/15",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white/40">Bugun</span>
        </div>
      </div>

      {/* Stats cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {cards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <Card variant="glass" className="rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">{card.label}</p>
                  <p className="mt-2 text-3xl sm:text-4xl font-mono font-bold text-white">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center`}
                >
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/tests/new">
          <Card
            variant="interactive"
            className="flex items-center gap-4 rounded-2xl"
          >
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-900" />
            </div>
            <div>
              <p className="font-semibold text-white">Yangi test yaratish</p>
              <p className="text-sm text-white/40">
                Test konfiguratsiyasi va sozlamalari
              </p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/access-codes">
          <Card
            variant="interactive"
            className="flex items-center gap-4 rounded-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Kod generatsiya qilish</p>
              <p className="text-sm text-white/40">
                Access kodlarni boshqarish
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Subject statistics */}
      <Card variant="glass" className="rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gold-400" />
          <h2 className="text-lg font-semibold">
            Fan bo&apos;yicha statistika
          </h2>
        </div>

        <div className="space-y-4">
          {stats.subjectStats.map((s) => {
            const barColor =
              SUBJECT_BAR_COLORS[s.name] || "bg-green-500";
            const percentage = (s.questions / maxQuestions) * 100;

            return (
              <div key={s.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-sm font-medium text-white/80">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>
                      <span className="font-mono text-gold-400 text-sm">
                        {s.questions}
                      </span>{" "}
                      savol
                    </span>
                    <span>
                      <span className="font-mono text-sm">{s.tests}</span>{" "}
                      test
                    </span>
                    <span>
                      <span className="font-mono text-sm">{s.students}</span>{" "}
                      ishtirokchi
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${barColor} opacity-60 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
