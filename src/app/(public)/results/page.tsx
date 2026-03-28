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

// Subject filter colors
const SUBJECT_FILTER_COLORS: Record<string, string> = {
  matematika: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  informatika: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  tarix: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "ingliz-tili": "bg-red-500/20 text-red-400 border-red-500/30",
  biologiya: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "ona-tili": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "jismoniy-tarbiya": "bg-orange-500/20 text-orange-400 border-orange-500/30",
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
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2, 1, 3

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-green-900 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gold-500/[0.03] blur-[150px]" />

        <div className="relative max-w-container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gold-gradient"
            >
              Natijalar
            </motion.h1>
            <div className="ornamental-line mt-5 mb-5" />
            <p className="text-lg text-white/50">
              Fan Olimpiadasi umumiy reyting jadvali
            </p>
          </div>

          {/* Subject filter pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveSubject("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
                activeSubject === ""
                  ? "bg-gold-500/20 text-gold-400 border-gold-500/30 shadow-glow-gold"
                  : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
              }`}
            >
              Barchasi
            </button>
            {subjects.map((s) => {
              const isActive = activeSubject === s.slug;
              const colors = isActive
                ? SUBJECT_FILTER_COLORS[s.slug] ||
                  "bg-gold-500/20 text-gold-400 border-gold-500/30"
                : "bg-white/5 text-white/60 border-white/10 hover:border-white/20";
              return (
                <button
                  key={s.slug}
                  onClick={() => setActiveSubject(s.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${colors}`}
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
            />
            <Button variant="secondary" onClick={handleSearch} className="shrink-0 px-5">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
            </div>
          ) : results.length === 0 ? (
            <Card
              variant="glass"
              className="text-center py-20 rounded-2xl"
            >
              <Trophy className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <p className="text-xl text-white/50">
                Hali natijalar yo&apos;q
              </p>
            </Card>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {top3.length >= 3 && (
                <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 mb-14 sm:mb-16 max-w-3xl mx-auto">
                  {podiumOrder.map((r, idx) => {
                    if (!r) return null;
                    const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                    const heights = [
                      "h-36 sm:h-48",
                      "h-48 sm:h-64",
                      "h-28 sm:h-36",
                    ];
                    const colors = [
                      "from-gray-400 to-gray-300",
                      "from-gold-500 to-gold-300",
                      "from-amber-700 to-amber-500",
                    ];
                    const initials = `${r.firstName.charAt(0)}${r.lastName.charAt(0)}`;

                    return (
                      <motion.div
                        key={r.rank}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.2,
                          duration: 0.6,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex-1 max-w-[220px] text-center"
                      >
                        <div className="mb-3">
                          {/* Crown for 1st */}
                          {place === 1 && (
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="flex justify-center mb-1"
                            >
                              <Crown className="w-7 h-7 text-gold-400" />
                            </motion.div>
                          )}

                          {/* Avatar */}
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b ${colors[idx]} flex items-center justify-center mx-auto mb-2 shadow-lg`}
                          >
                            <span className="text-sm sm:text-base font-bold text-green-900">
                              {initials}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base font-semibold text-white truncate">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-xs text-white/40">{r.region}</p>
                          <p className="font-mono font-bold text-gold-400 text-lg mt-1 text-glow-gold">
                            {r.totalScore.toFixed(1)}
                          </p>
                        </div>
                        <div
                          className={`${heights[idx]} rounded-t-2xl bg-gradient-to-b ${colors[idx]} flex items-start justify-center pt-4 sm:pt-5 relative overflow-hidden`}
                        >
                          <span className="text-2xl sm:text-3xl font-display font-bold text-green-900">
                            {place}
                          </span>
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine opacity-60" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Card variant="glass" className="overflow-x-auto rounded-2xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-white/50 font-medium">
                          O&apos;rin
                        </th>
                        <th className="text-left py-4 px-4 text-white/50 font-medium">
                          Ism
                        </th>
                        <th className="text-left py-4 px-4 text-white/50 font-medium">
                          Fan
                        </th>
                        <th className="text-left py-4 px-4 text-white/50 font-medium">
                          Viloyat
                        </th>
                        <th className="text-left py-4 px-4 text-white/50 font-medium">
                          Maktab
                        </th>
                        <th className="text-center py-4 px-4 text-white/50 font-medium">
                          Ball
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <motion.tr
                          key={`${r.rank}-${r.firstName}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.5) }}
                          className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                            i % 2 === 0 ? "" : "bg-white/[0.01]"
                          }`}
                        >
                          <td className="py-4 px-4">
                            {r.rank <= 3 ? (
                              <div className="flex items-center gap-1">
                                <Medal
                                  className={`w-5 h-5 ${
                                    r.rank === 1
                                      ? "text-gold-400"
                                      : r.rank === 2
                                        ? "text-gray-300"
                                        : "text-amber-600"
                                  }`}
                                />
                              </div>
                            ) : (
                              <span className="font-mono text-white/40">
                                {r.rank}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-medium">
                            {r.firstName} {r.lastName}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="default" size="md">
                              {r.subjectEmoji} {r.subjectName}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-white/60">
                            {r.region}
                          </td>
                          <td className="py-4 px-4 text-white/60">
                            {r.school}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono font-bold text-gold-400 text-base">
                              {r.totalScore.toFixed(1)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {results.map((r, i) => (
                  <motion.div
                    key={`${r.rank}-${r.firstName}-mobile`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <Card variant="glass" className="p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5">
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
                              <span className="font-mono text-sm text-white/40">
                                {r.rank}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">
                              {r.firstName} {r.lastName}
                            </p>
                            <p className="text-xs text-white/40">
                              {r.subjectEmoji} {r.subjectName} · {r.region}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-gold-400 text-lg">
                          {r.totalScore.toFixed(1)}
                        </span>
                      </div>
                    </Card>
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
