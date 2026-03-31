"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Loader2, Search, Download, Users, Eye } from "lucide-react";
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
    // Fanlarni olish
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => {
        const subs = (d.subjects || []).map((s: { id: string; name: string }) => ({
          value: s.id,
          label: s.name,
        }));
        setSubjects(subs);
      });
    // Testlarni olish
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-800">Natijalar</h1>
        <Button variant="ghost" size="sm" onClick={exportXLSX} disabled={results.length === 0 || exporting} loading={exporting}>
          <Download className="w-4 h-4 mr-2" /> XLSX export
        </Button>
      </div>

      {/* Filtrlar */}
      <Card variant="light" className="p-4">
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

      {/* Natijalar soni */}
      {!loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users className="w-4 h-4" />
          <span>{results.length} ta natija</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : results.length === 0 ? (
        <Card variant="light" className="text-center py-12">
          <TrophyIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-slate-500">Natijalar topilmadi</p>
        </Card>
      ) : (
        <Card variant="light" className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500">#</th>
                <th className="text-left py-3 px-4 text-slate-500">O&apos;quvchi</th>
                <th className="text-left py-3 px-4 text-slate-500">Fan</th>
                <th className="text-left py-3 px-4 text-slate-500">Test</th>
                <th className="text-left py-3 px-4 text-slate-500">Viloyat</th>
                <th className="text-left py-3 px-4 text-slate-500">Maktab</th>
                <th className="text-center py-3 px-4 text-slate-500">Ball</th>
                <th className="text-center py-3 px-4 text-slate-500">To&apos;g&apos;ri</th>
                <th className="text-center py-3 px-4 text-slate-500">Noto&apos;g&apos;ri</th>
                <th className="text-center py-3 px-4 text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={`${r.studentId}-${r.testName}`} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    {r.rank <= 3 ? (
                      <MedalIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-slate-400 font-mono">{r.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/students/${r.studentId}`} className="font-medium text-slate-800 hover:text-primary-600">
                      {r.studentName}
                    </Link>
                    <p className="text-xs text-slate-400">{r.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{r.subjectEmoji} {r.subjectName}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{r.testName}</td>
                  <td className="py-3 px-4 text-slate-500">{r.region}</td>
                  <td className="py-3 px-4 text-slate-500">{r.school}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-primary-600">{r.totalScore.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success">{r.correctCount}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="error">{r.wrongCount}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link href={`/admin/results/${r.attemptId}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
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
