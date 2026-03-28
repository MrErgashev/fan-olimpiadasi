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
      <h1 className="font-display text-2xl font-bold text-slate-800">Natijalar</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : results.length === 0 ? (
        <Card variant="light" className="text-center py-12">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Hali natijalar yo&apos;q</p>
        </Card>
      ) : (
        <Card variant="light" className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500">#</th>
                <th className="text-left py-3 px-4 text-slate-500">O&apos;quvchi</th>
                <th className="text-left py-3 px-4 text-slate-500">Fan</th>
                <th className="text-left py-3 px-4 text-slate-500">Viloyat</th>
                <th className="text-left py-3 px-4 text-slate-500">Maktab</th>
                <th className="text-center py-3 px-4 text-slate-500">Ball</th>
                <th className="text-center py-3 px-4 text-slate-500">To&apos;g&apos;ri</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={`${r.studentName}-${r.subjectName}`} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    {r.rank <= 3 ? (
                      <Medal className={`w-5 h-5 ${r.rank === 1 ? "text-yellow-500" : r.rank === 2 ? "text-slate-400" : "text-amber-600"}`} />
                    ) : (
                      <span className="text-slate-400 font-mono">{r.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.studentName}</td>
                  <td className="py-3 px-4 text-slate-600">{r.subjectEmoji} {r.subjectName}</td>
                  <td className="py-3 px-4 text-slate-500">{r.region}</td>
                  <td className="py-3 px-4 text-slate-500">{r.school}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-primary-600">{r.totalScore.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
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
