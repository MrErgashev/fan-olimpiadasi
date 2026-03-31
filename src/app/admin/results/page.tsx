"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";
import { Loader2, Search, Download, Eye } from "lucide-react";
import { TrophyIcon, MedalIcon } from "@/components/ui/Icon3D";
import Link from "next/link";
import toast from "react-hot-toast";

interface Result {
  attemptId: string;
  rank: number;
  studentId: string;
  studentName: string;
  phone: string;
  school: string;
  region: string;
  subjectName: string;
  subjectEmoji: string;
  testName: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  finishedAt: string;
}

interface SubjectOption { value: string; label: string; }
interface TestOption { value: string; label: string; }

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [tests, setTests] = useState<TestOption[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [testId, setTestId] = useState("");
  const [search, setSearch] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectId) params.set("subjectId", subjectId);
      if (testId) params.set("testId", testId);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/results?${params}`);
      const d = await res.json();
      setResults(d.results || []);
    } catch {
      toast.error("Xatolik");
    } finally {
      setLoading(false);
    }
  }, [subjectId, testId, search]);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => {
        const subs = (d.subjects || []).map((s: { id: string; name: string }) => ({
          value: s.id,
          label: s.name,
        }));
        setSubjects(subs);
      });
    fetch("/api/admin/tests")
      .then((r) => r.json())
      .then((d) => {
        const ts = (d.tests || []).map((t: { id: string; name: string; subject: { emoji: string } }) => ({
          value: t.id,
          label: `${t.subject.emoji} ${t.name}`,
        }));
        setTests(ts);
      });
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const [exporting, setExporting] = useState(false);

  const exportXLSX = async () => {
    if (results.length === 0) return;
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (subjectId) params.set("subjectId", subjectId);
      if (testId) params.set("testId", testId);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/results/export?${params}`);
      if (!res.ok) throw new Error("Export xatosi");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `natijalar_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("XLSX yuklab olindi");
    } catch {
      toast.error("Export xatosi");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Natijalar" subtitle={!loading ? `${results.length} ta natija` : undefined}>
        <Button variant="secondary" size="sm" onClick={exportXLSX} disabled={results.length === 0 || exporting} loading={exporting} icon={<Download className="w-4 h-4" />}>
          XLSX export
        </Button>
      </PageHeader>

      {/* Filtrlar */}
      <Card variant="light" className="rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Fan"
            value={subjectId}
            onChange={(e) => { setSubjectId(e.target.value); setTestId(""); }}
            placeholder="Barchasi"
            options={subjects}
          />
          <Select
            label="Test"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder="Barchasi"
            options={tests}
          />
          <div className="relative">
            <Input
              label="Qidiruv"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism yoki telefon..."
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-9" />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : results.length === 0 ? (
        <Card variant="light" className="rounded-xl text-center py-16">
          <TrophyIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-400 text-sm">Natijalar topilmadi</p>
          <p className="text-slate-300 text-xs mt-1">Filtrlarni o&apos;zgartirib ko&apos;ring</p>
        </Card>
      ) : (
        <Card variant="light" className="rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">O&apos;quvchi</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Fan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Test</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Viloyat</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Maktab</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ball</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">To&apos;g&apos;ri</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Noto&apos;g&apos;ri</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.studentId}-${r.testName}`} className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-4">
                      {r.rank <= 3 ? (
                        <MedalIcon className="w-5 h-5" />
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">{r.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/students/${r.studentId}`} className="font-medium text-slate-800 hover:text-primary-600 transition-colors">
                        {r.studentName}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono">{r.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{r.subjectEmoji} {r.subjectName}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{r.testName}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell">{r.region}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden xl:table-cell max-w-[140px] truncate">{r.school}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center font-mono font-bold text-sm text-primary-700 bg-primary-50 rounded-md px-2 py-0.5">
                        {r.totalScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      <span className="font-mono text-xs text-emerald-600">{r.correctCount}</span>
                    </td>
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      <span className="font-mono text-xs text-red-500">{r.wrongCount}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link href={`/admin/results/${r.attemptId}`}>
                        <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
