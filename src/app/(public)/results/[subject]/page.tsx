"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Trophy, Medal, Search, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Result {
  rank: number;
  firstName: string;
  lastName: string;
  school: string;
  region: string;
  subjectName: string;
  subjectEmoji: string;
  totalScore: number;
}

export default function SubjectResultsPage() {
  const params = useParams();
  const subject = params.subject as string;
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectInfo, setSubjectInfo] = useState({ name: "", emoji: "" });

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ subject });
      if (search) params.set("search", search);
      const res = await fetch(`/api/results/public?${params}`);
      const data = await res.json();
      setResults(data.results || []);
      if (data.results?.[0]) {
        setSubjectInfo({
          name: data.results[0].subjectName,
          emoji: data.results[0].subjectEmoji,
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-slate-50">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Link href="/results" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-950 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Barcha natijalar
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-950">
              {subjectInfo.emoji} {subjectInfo.name || subject} natijalari
            </h1>
          </div>

          <div className="max-w-md mb-8 flex gap-2">
            <Input
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchResults()}
              variant="light"
            />
            <Button variant="secondary" onClick={fetchResults}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card text-center py-16">
              <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">Bu fan bo&apos;yicha natijalar yo&apos;q</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">O&apos;rin</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Ism</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Viloyat</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Maktab</th>
                    <th className="text-center py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Ball</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.rank} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        {r.rank <= 3 ? (
                          <Medal className={`w-5 h-5 ${r.rank === 1 ? "text-gold-500" : r.rank === 2 ? "text-slate-400" : "text-amber-600"}`} />
                        ) : (
                          <span className="font-mono text-slate-400">{r.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-navy-950">{r.firstName} {r.lastName}</td>
                      <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">{r.region}</td>
                      <td className="py-3 px-4 text-slate-500 hidden md:table-cell">{r.school}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-gold-600">{r.totalScore.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
