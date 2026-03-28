"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  Trophy,
  Medal,
  Search,
  Loader2,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";

interface Result {
  rank: number;
  firstName: string;
  lastName: string;
  school: string;
  region: string;
  subjectName: string;
  subjectSlug: string;
  subjectEmoji: string;
  totalScore: number;
}

interface Subject {
  name: string;
  slug: string;
  emoji: string;
}

export default function PublicResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubject]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeSubject) params.set("subject", activeSubject);
      if (search) params.set("search", search);
      const res = await fetch(`/api/results/public?${params}`);
      const data = await res.json();
      setResults(data.results || []);
      if (data.subjects) setSubjects(data.subjects);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchResults();

  const top3 = results.slice(0, 3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2, 1, 3

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-green-900">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient">
              Natijalar
            </h1>
            <p className="mt-3 text-white/50">
              Fan Olimpiadasi umumiy reyting jadvali
            </p>
          </div>

          {/* Fan filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button
              variant={activeSubject === "" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveSubject("")}
            >
              Barchasi
            </Button>
            {subjects.map((s) => (
              <Button
                key={s.slug}
                variant={activeSubject === s.slug ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveSubject(s.slug)}
              >
                {s.emoji} {s.name}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-10 flex gap-2">
            <Input
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="secondary" onClick={handleSearch}>
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
              <p className="text-white/50">Hali natijalar yo&apos;q</p>
            </Card>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {top3.length >= 3 && (
                <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12 max-w-2xl mx-auto">
                  {podiumOrder.map((r, idx) => {
                    if (!r) return null;
                    const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                    const heights = ["h-28 sm:h-36", "h-40 sm:h-52", "h-24 sm:h-28"];
                    const colors = [
                      "from-gray-400 to-gray-300",
                      "from-gold-500 to-gold-300",
                      "from-amber-700 to-amber-500",
                    ];
                    return (
                      <motion.div
                        key={r.rank}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="flex-1 max-w-[180px] text-center"
                      >
                        <div className="mb-2">
                          {place === 1 && <Crown className="w-6 h-6 text-gold-400 mx-auto mb-1" />}
                          <p className="text-sm font-semibold text-white truncate">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-xs text-white/40">{r.region}</p>
                          <p className="font-mono font-bold text-gold-400 mt-1">
                            {r.totalScore.toFixed(1)}
                          </p>
                        </div>
                        <div
                          className={`${heights[idx]} rounded-t-xl bg-gradient-to-b ${colors[idx]} flex items-start justify-center pt-3`}
                        >
                          <span className="text-xl font-display font-bold text-green-900">
                            {place}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Table */}
              <Card variant="glass" className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-white/50">O&apos;rin</th>
                      <th className="text-left py-3 px-3 text-white/50">Ism</th>
                      <th className="text-left py-3 px-3 text-white/50 hidden sm:table-cell">Fan</th>
                      <th className="text-left py-3 px-3 text-white/50 hidden md:table-cell">Viloyat</th>
                      <th className="text-left py-3 px-3 text-white/50 hidden md:table-cell">Maktab</th>
                      <th className="text-center py-3 px-3 text-white/50">Ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr
                        key={`${r.rank}-${r.firstName}`}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-3">
                          {r.rank <= 3 ? (
                            <Medal
                              className={`w-5 h-5 ${
                                r.rank === 1
                                  ? "text-gold-400"
                                  : r.rank === 2
                                    ? "text-gray-300"
                                    : "text-amber-600"
                              }`}
                            />
                          ) : (
                            <span className="font-mono text-white/40">
                              {r.rank}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {r.firstName} {r.lastName}
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <Badge variant="default">
                            {r.subjectEmoji} {r.subjectName}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-white/60 hidden md:table-cell">
                          {r.region}
                        </td>
                        <td className="py-3 px-3 text-white/60 hidden md:table-cell">
                          {r.school}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-gold-400">
                            {r.totalScore.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
