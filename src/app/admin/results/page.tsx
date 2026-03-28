"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Trophy, Medal } from "lucide-react";
import toast from "react-hot-toast";

interface Result {
  rank: number;
  studentName: string;
  phone: string;
  school: string;
  region: string;
  subjectName: string;
  subjectEmoji: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/results")
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .catch(() => toast.error("Xatolik"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-blue-gradient">Natijalar</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
      ) : results.length === 0 ? (
        <Card variant="glass-blue" className="text-center py-12">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Hali natijalar yo&apos;q</p>
        </Card>
      ) : (
        <Card variant="glass-blue" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-white/50">#</th>
                <th className="text-left py-3 px-2 text-white/50">O&apos;quvchi</th>
                <th className="text-left py-3 px-2 text-white/50">Fan</th>
                <th className="text-left py-3 px-2 text-white/50">Viloyat</th>
                <th className="text-left py-3 px-2 text-white/50">Maktab</th>
                <th className="text-center py-3 px-2 text-white/50">Ball</th>
                <th className="text-center py-3 px-2 text-white/50">To&apos;g&apos;ri</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={`${r.studentName}-${r.subjectName}`} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2">
                    {r.rank <= 3 ? (
                      <Medal className={`w-5 h-5 ${r.rank === 1 ? "text-yellow-400" : r.rank === 2 ? "text-gray-300" : "text-amber-600"}`} />
                    ) : (
                      <span className="text-white/40 font-mono">{r.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-2 font-medium">{r.studentName}</td>
                  <td className="py-3 px-2">{r.subjectEmoji} {r.subjectName}</td>
                  <td className="py-3 px-2 text-white/60">{r.region}</td>
                  <td className="py-3 px-2 text-white/60">{r.school}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-mono font-bold text-primary-400">{r.totalScore.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant="success">{r.correctCount}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
