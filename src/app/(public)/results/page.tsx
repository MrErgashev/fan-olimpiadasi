"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

const SUBJECT_FILTER_COLORS: Record<string, string> = {
  matematika: "bg-blue-50 text-blue-700 border-blue-200",
  informatika: "bg-cyan-50 text-cyan-700 border-cyan-200",
  tarix: "bg-amber-50 text-amber-700 border-amber-200",
  "ingliz-tili": "bg-red-50 text-red-700 border-red-200",
  biologiya: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "ona-tili": "bg-violet-50 text-violet-700 border-violet-200",
  "jismoniy-tarbiya": "bg-orange-50 text-orange-700 border-orange-200",
};

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
  const podiumOrder = [top3[1], top3[0], top3[2]];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-slate-50">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-navy-950"
            >
              Natijalar
            </motion.h1>
            <p className="mt-3 text-lg text-slate-500">
              Fan Olimpiadasi umumiy reyting jadvali
            </p>
          </div>

          {/* Subject filter pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveSubject("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeSubject === ""
                  ? "bg-navy-950 text-white border-navy-950"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Barchasi
            </button>
            {subjects.map((s) => {
              const isActive = activeSubject === s.slug;
              const colors = isActive
                ? SUBJECT_FILTER_COLORS[s.slug] || "bg-navy-950 text-white border-navy-950"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300";
              return (
                <button
                  key={s.slug}
                  onClick={() => setActiveSubject(s.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${colors}`}
                >
                  {s.emoji} {s.name}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-12 flex gap-3">
            <Input
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              icon={<Search className="w-4 h-4" />}
              variant="light"
            />
            <Button variant="secondary" onClick={handleSearch} className="shrink-0 px-5">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-navy-950 mb-2">
                Natijalar tez orada e&apos;lon qilinadi
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Olimpiada yakunlangandan so&apos;ng natijalar ushbu sahifada chop etiladi
              </p>
            </div>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {top3.length >= 3 && (
                <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 mb-14 max-w-3xl mx-auto">
                  {podiumOrder.map((r, idx) => {
                    if (!r) return null;
                    const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                    const heights = ["h-36 sm:h-48", "h-48 sm:h-64", "h-28 sm:h-36"];
                    const bgColors = [
                      "from-slate-300 to-slate-200",
                      "from-gold-500 to-gold-300",
                      "from-amber-600 to-amber-400",
                    ];
                    const initials = `${r.firstName.charAt(0)}${r.lastName.charAt(0)}`;

                    return (
                      <motion.div
                        key={r.rank}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15, duration: 0.5 }}
                        className="flex-1 max-w-[220px] text-center"
                      >
                        <div className="mb-3">
                          {place === 1 && (
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex justify-center mb-1"
                            >
                              <Crown className="w-7 h-7 text-gold-500" />
                            </motion.div>
                          )}

                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b ${bgColors[idx]} flex items-center justify-center mx-auto mb-2 shadow-lg`}
                          >
                            <span className="text-sm sm:text-base font-bold text-white">
                              {initials}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base font-semibold text-navy-950 truncate">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{r.region}</p>
                          <p className="font-mono font-bold text-gold-600 text-lg mt-1">
                            {r.totalScore.toFixed(1)}
                          </p>
                        </div>
                        <div
                          className={`${heights[idx]} rounded-t-2xl bg-gradient-to-b ${bgColors[idx]} flex items-start justify-center pt-4 sm:pt-5 relative overflow-hidden`}
                        >
                          <span className="text-2xl sm:text-3xl font-bold text-white/90">
                            {place}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left py-4 px-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                          O&apos;rin
                        </th>
                        <th className="text-left py-4 px-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                          Ism
                        </th>
                        <th className="text-left py-4 px-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                          Fan
                        </th>
                        <th className="text-left py-4 px-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                          Viloyat
                        </th>
                        <th className="text-left py-4 px-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                          Maktab
                        </th>
                        <th className="text-center py-4 px-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                          Ball
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <motion.tr
                          key={`${r.rank}-${r.firstName}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.5) }}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-5">
                            {r.rank <= 3 ? (
                              <Medal
                                className={`w-5 h-5 ${
                                  r.rank === 1
                                    ? "text-gold-500"
                                    : r.rank === 2
                                      ? "text-slate-400"
                                      : "text-amber-600"
                                }`}
                              />
                            ) : (
                              <span className="font-mono text-slate-400">
                                {r.rank}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 font-medium text-navy-950">
                            {r.firstName} {r.lastName}
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              {r.subjectEmoji} {r.subjectName}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-500">
                            {r.region}
                          </td>
                          <td className="py-4 px-5 text-slate-500">
                            {r.school}
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="font-mono font-bold text-gold-600 text-base">
                              {r.totalScore.toFixed(1)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {results.map((r, i) => (
                  <motion.div
                    key={`${r.rank}-${r.firstName}-mobile`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.5) }}
                    className="bg-white rounded-xl border border-slate-100 shadow-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50">
                          {r.rank <= 3 ? (
                            <Medal
                              className={`w-5 h-5 ${
                                r.rank === 1
                                  ? "text-gold-500"
                                  : r.rank === 2
                                    ? "text-slate-400"
                                    : "text-amber-600"
                              }`}
                            />
                          ) : (
                            <span className="font-mono text-sm text-slate-400">
                              {r.rank}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-navy-950 text-sm">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {r.subjectEmoji} {r.subjectName} · {r.region}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gold-600 text-lg">
                        {r.totalScore.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
