"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (s?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Bu savolni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Savol o'chirildi");
        fetchQuestions();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-gradient">Savollar bazasi</h1>
          <p className="text-sm text-white/40 mt-1">Jami: {total} ta savol</p>
        </div>
        <Link href="/admin/questions/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Yangi savol</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-2">
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

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      ) : questions.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-white/50">Savollar topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id} variant="glass" className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span>{q.subject.emoji}</span>
                  <span className="text-xs text-white/40">{q.subject.name}</span>
                  {diffBadge(q.difficulty)}
                </div>
                <p className="text-sm text-white/80 truncate">{q.questionText}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-gold-400 bg-gold-500/10 px-2 py-1 rounded">
                  {q.correctAnswer}
                </span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
