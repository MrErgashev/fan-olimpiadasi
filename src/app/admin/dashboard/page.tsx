"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Loader2, Plus } from "lucide-react";
import {
  UsersIcon, QuestionIcon, ClipboardIcon, TrophyIcon,
  ChartIcon, KeyIcon, TrendingIcon,
} from "@/components/ui/Icon3D";
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
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!stats) return null;

  const maxQuestions = Math.max(...stats.subjectStats.map((s) => s.questions), 1);

  const cards = [
    {
      label: "Jami o'quvchilar",
      value: stats.totalStudents,
      icon: UsersIcon,
      bgColor: "bg-blue-50",
    },
    {
      label: "Savollar bazasi",
      value: stats.totalQuestions,
      icon: QuestionIcon,
      bgColor: "bg-green-50",
    },
    {
      label: "Faol testlar",
      value: stats.activeTests,
      icon: ClipboardIcon,
      bgColor: "bg-yellow-50",
    },
    {
      label: "Topshirilgan testlar",
      value: stats.submittedAttempts,
      icon: TrophyIcon,
      bgColor: "bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <TrendingIcon className="w-4 h-4" />
          <span className="text-sm text-slate-400">Bugun</span>
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
            <Card variant="light" className="rounded-2xl">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl sm:text-4xl font-mono font-bold text-slate-800">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center`}
                >
                  <card.icon className="w-6 h-6" />
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
            variant="light"
            hover
            className="flex items-center gap-4 rounded-2xl p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Yangi test yaratish</p>
              <p className="text-sm text-slate-400">
                Test konfiguratsiyasi va sozlamalari
              </p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/access-codes">
          <Card
            variant="light"
            hover
            className="flex items-center gap-4 rounded-2xl p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <KeyIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Kod generatsiya qilish</p>
              <p className="text-sm text-slate-400">
                Access kodlarni boshqarish
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Subject statistics */}
      <Card variant="light" className="rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <ChartIcon className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-slate-800">
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
                    <span className="text-sm font-medium text-slate-700">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      <span className="font-mono text-primary-600 text-sm">
                        {s.questions}
                      </span>{" "}
                      savol
                    </span>
                    <span>
                      <span className="font-mono text-sm text-slate-600">{s.tests}</span>{" "}
                      test
                    </span>
                    <span>
                      <span className="font-mono text-sm text-slate-600">{s.students}</span>{" "}
                      ishtirokchi
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${barColor} opacity-70 group-hover:opacity-100 transition-opacity`}
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
