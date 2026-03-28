"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  Users,
  FileQuestion,
  ClipboardList,
  Trophy,
  Loader2,
  BarChart3,
} from "lucide-react";
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

  const cards = [
    { label: "Jami o'quvchilar", value: stats.totalStudents, icon: Users, color: "text-blue-400" },
    { label: "Savollar bazasi", value: stats.totalQuestions, icon: FileQuestion, color: "text-green-400" },
    { label: "Faol testlar", value: stats.activeTests, icon: ClipboardList, color: "text-yellow-400" },
    { label: "Topshirilgan testlar", value: stats.submittedAttempts, icon: Trophy, color: "text-gold-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-gradient">
        Admin Dashboard
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} variant="glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">{card.label}</p>
                <p className="mt-1 text-3xl font-mono font-bold text-white">
                  {card.value}
                </p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color} opacity-60`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Fan bo'yicha statistika */}
      <Card variant="glass">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gold-400" />
          <h2 className="text-lg font-semibold">Fan bo&apos;yicha statistika</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/50 font-medium">Fan</th>
                <th className="text-center py-2 text-white/50 font-medium">Savollar</th>
                <th className="text-center py-2 text-white/50 font-medium">Testlar</th>
                <th className="text-center py-2 text-white/50 font-medium">Ishtirokchilar</th>
              </tr>
            </thead>
            <tbody>
              {stats.subjectStats.map((s) => (
                <tr key={s.name} className="border-b border-white/5">
                  <td className="py-3">
                    <span className="mr-2">{s.emoji}</span>
                    {s.name}
                  </td>
                  <td className="text-center font-mono text-gold-400">{s.questions}</td>
                  <td className="text-center font-mono">{s.tests}</td>
                  <td className="text-center font-mono">{s.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
