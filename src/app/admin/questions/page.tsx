"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Loader2, Trash2, Upload, Pencil } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Question {
  id: string;
  questionText: string;
  difficulty: string;
  correctAnswer: string;
  subject: { name: string; emoji: string };
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
  emoji?: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [subjectsRes, questionsRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/admin/questions"),
        ]);
        const [subjectsData, questionsData] = await Promise.all([
          subjectsRes.json(),
          questionsRes.json(),
        ]);
        setSubjects(subjectsData.subjects || []);
        setQuestions(questionsData.questions || []);
        setTotal(questionsData.total || 0);
      } catch {
        toast.error("Savollarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, []);

  const fetchQuestions = async (s?: string, subjectId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      const sid = subjectId !== undefined ? subjectId : selectedSubjectId;
      if (sid) params.set("subjectId", sid);
      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Savollarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchQuestions(search);

  const handleSubjectFilter = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    fetchQuestions(search, subjectId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu savolni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Savol o'chirildi");
        fetchQuestions(search);
      }
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleDeleteBySubject = async () => {
    if (!selectedSubjectId) return;
    const subjectName = subjects.find((s) => s.id === selectedSubjectId)?.name || "";
    if (!confirm(`"${subjectName}" fanidagi barcha savollarni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      const res = await fetch(`/api/admin/questions?subjectId=${selectedSubjectId}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count} ta savol o'chirildi`);
        fetchQuestions(search);
      }
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const diffBadge = (d: string) => {
    switch (d) {
      case "easy": return <Badge variant="success">Oson</Badge>;
      case "hard": return <Badge variant="error">Qiyin</Badge>;
      default: return <Badge variant="warning">O&apos;rta</Badge>;
    }
  };

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: `${s.emoji || ""} ${s.name}`.trim(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Savollar bazasi</h1>
          <p className="text-sm text-slate-400 mt-1">Jami: {total} ta savol</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/questions/import">
            <Button variant="secondary"><Upload className="w-4 h-4 mr-2" /> Import</Button>
          </Link>
          <Link href="/admin/questions/new">
            <Button><Plus className="w-4 h-4 mr-2" /> Yangi savol</Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-64">
          <Select
            options={subjectOptions}
            placeholder="Barcha fanlar"
            value={selectedSubjectId}
            onChange={(e) => handleSubjectFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Savol qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        {selectedSubjectId && (
          <Button variant="danger" onClick={handleDeleteBySubject}>
            <Trash2 className="w-4 h-4 mr-2" />
            Fan savollarini o&apos;chirish
          </Button>
        )}
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : questions.length === 0 ? (
        <Card variant="light" className="text-center py-12">
          <p className="text-slate-500">Savollar topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id} variant="light" className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span>{q.subject.emoji}</span>
                  <span className="text-xs text-slate-400">{q.subject.name}</span>
                  {diffBadge(q.difficulty)}
                </div>
                <p className="text-sm text-slate-700 truncate">{q.questionText}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {q.correctAnswer}
                </span>
                <Link href={`/admin/questions/${q.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4 text-slate-500" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
