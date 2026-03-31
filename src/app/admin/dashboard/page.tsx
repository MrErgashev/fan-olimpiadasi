"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Plus, RefreshCw, Trash2, Clock, Users } from "lucide-react";
import {
  UsersIcon, QuestionIcon, ClipboardIcon, TrophyIcon,
  ChartIcon, KeyIcon, TrendingIcon,
} from "@/components/ui/Icon3D";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell,
} from "recharts";

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

interface AnalyticsData {
  scoreDistribution: { range: string; count: number }[];
  subjectStats: { subject: string; avgScore: number; attempts: number }[];
  monthlyAttempts: { month: string; count: number }[];
  topStudents: { name: string; avgScore: number; tests: number }[];
}

interface ActiveAttempt {
  studentName: string;
  phone: string;
  testName: string;
  subjectEmoji: string;
  remainingMinutes: number;
  durationMinutes: number;
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
  const [activeAttempts, setActiveAttempts] = useState<ActiveAttempt[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("API xato qaytardi");
        return r.json();
      })
      .then(setStats)
      .catch(() => toast.error("Statistika yuklanmadi"))
      .finally(() => setLoading(false));

    fetchActiveAttempts();

    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setAnalytics(d); })
      .catch(() => {});
  }, []);

  const fetchActiveAttempts = () => {
    fetch("/api/admin/active-attempts")
      .then((r) => r.json())
      .then((d) => setActiveAttempts(d.activeAttempts || []))
      .catch(() => {});
  };

  const handleCleanup = async () => {
    setCleaning(true);
    try {
      const res = await fetch("/api/admin/cleanup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchActiveAttempts();
        // Statistikani yangilash
        fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
      } else {
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setCleaning(false);
    }
  };

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

      {/* Active attempts - hozir test ishlayotganlar */}
      <Card variant="light" className="rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-800">
              Hozir test ishlayotganlar
            </h2>
            {activeAttempts.length > 0 && (
              <Badge variant="warning">{activeAttempts.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchActiveAttempts}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCleanup}
              loading={cleaning}
              className="text-red-500 hover:bg-red-50"
              title="Vaqti tugagan testlarni avtomatik baholash"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Tozalash
            </Button>
          </div>
        </div>
        {activeAttempts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Hozir hech kim test ishlamayapti
          </p>
        ) : (
          <div className="space-y-2">
            {activeAttempts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xl">{a.subjectEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.studentName}</p>
                  <p className="text-xs text-slate-400">{a.testName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className={`text-sm font-mono font-bold ${a.remainingMinutes <= 5 ? "text-red-500" : "text-amber-600"}`}>
                    {a.remainingMinutes} daq
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ball taqsimoti */}
          <Card variant="light" className="rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Ball taqsimoti</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" fontSize={12} tick={{ fill: "#64748b" }} />
                <YAxis fontSize={12} tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} ta`, "Soni"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Oylik faollik */}
          <Card variant="light" className="rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Oylik test urinishlari</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.monthlyAttempts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "#64748b" }} />
                <YAxis fontSize={12} tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} ta`, "Urinishlar"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Fanlar bo'yicha o'rtacha ball */}
          <Card variant="light" className="rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Fanlar bo&apos;yicha o&apos;rtacha ball</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.subjectStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} tick={{ fill: "#64748b" }} />
                <YAxis type="category" dataKey="subject" width={120} fontSize={11} tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} ball`, "O'rtacha"]}
                />
                <Bar dataKey="avgScore" fill="#22c55e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top 10 o'quvchi */}
          <Card variant="light" className="rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Top 10 o&apos;quvchi</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.topStudents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: "#64748b" }} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} fontSize={12} tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} ball`, "O'rtacha"]}
                />
                <Bar dataKey="avgScore" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

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
