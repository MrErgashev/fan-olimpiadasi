"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
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
      <main className="min-h-screen pt-24 pb-16 bg-green-900">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Link href="/results" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-gold-400 mb-4">
              <ArrowLeft className="w-4 h-4" /> Barcha natijalar
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold-gradient">
              {subjectInfo.emoji} {subjectInfo.name || subject} natijalari
            </h1>
          </div>

          <div className="max-w-md mb-8 flex gap-2">
            <Input
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchResults()}
            />
            <Button variant="secondary" onClick={fetchResults}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
            </div>
          ) : results.length === 0 ? (
            <Card variant="glass" className="text-center py-16">
              <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">Bu fan bo&apos;yicha natijalar yo&apos;q</p>
            </Card>
          ) : (
            <Card variant="glass" className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-white/50">O&apos;rin</th>
                    <th className="text-left py-3 px-3 text-white/50">Ism</th>
                    <th className="text-left py-3 px-3 text-white/50 hidden sm:table-cell">Viloyat</th>
                    <th className="text-left py-3 px-3 text-white/50 hidden md:table-cell">Maktab</th>
                    <th className="text-center py-3 px-3 text-white/50">Ball</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.rank} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-3">
                        {r.rank <= 3 ? (
                          <Medal className={`w-5 h-5 ${r.rank === 1 ? "text-gold-400" : r.rank === 2 ? "text-gray-300" : "text-amber-600"}`} />
                        ) : (
                          <span className="font-mono text-white/40">{r.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium">{r.firstName} {r.lastName}</td>
                      <td className="py-3 px-3 text-white/60 hidden sm:table-cell">{r.region}</td>
                      <td className="py-3 px-3 text-white/60 hidden md:table-cell">{r.school}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-gold-400">{r.totalScore.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
