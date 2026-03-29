"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  Plus, Search, Loader2, Trash2, Upload, Pencil,
  ChevronDown, ChevronRight, ChevronLeft,
} from "lucide-react";
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

interface SubjectCount {
  subjectId: string;
  name: string;
  emoji: string;
  count: number;
}

// Fan ichidagi savollar + pagination
interface SubjectData {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
}

export default function QuestionsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Accordion rejimi — "Barcha fanlar"
  const [subjectCounts, setSubjectCounts] = useState<SubjectCount[]>([]);
  const [openSubjectId, setOpenSubjectId] = useState<string | null>(null);
  const [subjectDataMap, setSubjectDataMap] = useState<Record<string, SubjectData>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Oddiy ro'yxat rejimi — bitta fan tanlanganda
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fan bo'yicha savol sonlarini olish (accordion rejim)
  const fetchSubjectCounts = useCallback(async (searchVal?: string) => {
    setLoadingCounts(true);
    try {
      const params = new URLSearchParams({ grouped: "true" });
      const s = searchVal !== undefined ? searchVal : search;
      if (s) params.set("search", s);
      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      setSubjectCounts(data.subjectCounts || []);
      setTotalQuestions(data.totalQuestions || 0);

      // Birinchi savollar bor fanni avtomatik ochish
      if (!openSubjectId) {
        const first = (data.subjectCounts || []).find((sc: SubjectCount) => sc.count > 0);
        if (first) setOpenSubjectId(first.subjectId);
      }
    } catch {
      toast.error("Savollarni yuklashda xatolik");
    } finally {
      setLoadingCounts(false);
    }
  }, [search, openSubjectId]);

  // Bitta fan ichidagi savollarni olish (accordion uchun)
  const fetchSubjectQuestions = useCallback(async (subjectId: string, pageNum: number = 1) => {
    setSubjectDataMap((prev) => ({
      ...prev,
      [subjectId]: { ...(prev[subjectId] || { questions: [], total: 0, page: 1, totalPages: 1 }), loading: true },
    }));
    try {
      const params = new URLSearchParams({ subjectId, page: String(pageNum), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      setSubjectDataMap((prev) => ({
        ...prev,
        [subjectId]: {
          questions: data.questions || [],
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          loading: false,
        },
      }));
    } catch {
      toast.error("Savollarni yuklashda xatolik");
      setSubjectDataMap((prev) => ({
        ...prev,
        [subjectId]: { ...(prev[subjectId] || { questions: [], total: 0, page: 1, totalPages: 1 }), loading: false },
      }));
    }
  }, [search]);

  // Bitta fan tanlanganda — oddiy ro'yxat
  const fetchQuestions = useCallback(async (s?: string, subjectId?: string, p?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const searchVal = s !== undefined ? s : search;
      const sid = subjectId !== undefined ? subjectId : selectedSubjectId;
      const pageVal = p ?? page;
      if (searchVal) params.set("search", searchVal);
      if (sid) params.set("subjectId", sid);
      params.set("page", String(pageVal));
      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Savollarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubjectId, page]);

  // Boshlang'ich yuklash
  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []));
    fetchSubjectCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accordion ochilganda savollarni yuklash
  useEffect(() => {
    if (openSubjectId && !selectedSubjectId) {
      const existing = subjectDataMap[openSubjectId];
      if (!existing || existing.questions.length === 0) {
        fetchSubjectQuestions(openSubjectId, 1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSubjectId]);

  const isAccordionMode = !selectedSubjectId;

  const handleSubjectFilter = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setPage(1);
    if (subjectId) {
      fetchQuestions(search, subjectId, 1);
    } else {
      // "Barcha fanlar" ga qaytish — accordion
      setSubjectDataMap({});
      fetchSubjectCounts(search);
    }
  };

  const handleSearch = () => {
    setPage(1);
    if (isAccordionMode) {
      setSubjectDataMap({});
      setOpenSubjectId(null);
      fetchSubjectCounts(search);
    } else {
      fetchQuestions(search, selectedSubjectId, 1);
    }
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchQuestions(search, selectedSubjectId, p);
  };

  const handleAccordionPageChange = (subjectId: string, p: number) => {
    fetchSubjectQuestions(subjectId, p);
  };

  const toggleAccordion = (subjectId: string) => {
    if (openSubjectId === subjectId) {
      setOpenSubjectId(null);
    } else {
      setOpenSubjectId(subjectId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu savolni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Savol o'chirildi");
        if (isAccordionMode) {
          fetchSubjectCounts(search);
          if (openSubjectId) fetchSubjectQuestions(openSubjectId);
        } else {
          fetchQuestions(search, selectedSubjectId, page);
        }
      }
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleDeleteBySubject = async (subjectId?: string) => {
    const sid = subjectId || selectedSubjectId;
    if (!sid) return;
    const all = [...subjectCounts, ...subjects.map((s) => ({ subjectId: s.id, name: s.name }))];
    const subjectName = all.find((s) => ("subjectId" in s ? s.subjectId : s.id) === sid)?.name || "";
    if (!confirm(`"${subjectName}" fanidagi barcha savollarni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      const res = await fetch(`/api/admin/questions?subjectId=${sid}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count} ta savol o'chirildi`);
        if (isAccordionMode) {
          fetchSubjectCounts(search);
          setSubjectDataMap((prev) => {
            const next = { ...prev };
            delete next[sid];
            return next;
          });
        } else {
          fetchQuestions(search, selectedSubjectId, 1);
        }
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

  // Savol qatori
  const QuestionRow = ({ q }: { q: Question }) => (
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
  );

  // Pagination component
  const Pagination = ({ currentPage, total: totalItems, totalPages: tp, onPageChange }: {
    currentPage: number;
    total: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => {
    if (tp <= 1) return null;
    const from = (currentPage - 1) * 20 + 1;
    const to = Math.min(currentPage * 20, totalItems);
    return (
      <div className="flex items-center justify-center gap-4 pt-4">
        <span className="text-xs text-slate-400">
          {totalItems} ta savoldan {from}-{to}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600 font-mono">
            {currentPage} / {tp}
          </span>
          <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= tp}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Savollar bazasi</h1>
          <p className="text-sm text-slate-400 mt-1">
            Jami: {isAccordionMode ? totalQuestions : total} ta savol
          </p>
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
          <Button variant="danger" onClick={() => handleDeleteBySubject()}>
            <Trash2 className="w-4 h-4 mr-2" />
            Fan savollarini o&apos;chirish
          </Button>
        )}
      </div>

      {/* ========= ACCORDION REJIMI ========= */}
      {isAccordionMode && (
        loadingCounts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : subjectCounts.length === 0 ? (
          <Card variant="light" className="text-center py-12">
            <p className="text-slate-500">Fanlar topilmadi</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {subjectCounts.map((sc) => {
              const isOpen = openSubjectId === sc.subjectId;
              const data = subjectDataMap[sc.subjectId];

              return (
                <div key={sc.subjectId}>
                  {/* Accordion header */}
                  <button
                    onClick={() => sc.count > 0 && toggleAccordion(sc.subjectId)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isOpen
                        ? "bg-primary-50 border-primary-200 shadow-sm"
                        : sc.count > 0
                        ? "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        : "bg-slate-50 border-slate-100 opacity-60 cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {sc.count > 0 ? (
                        isOpen ? (
                          <ChevronDown className="w-4 h-4 text-primary-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      )}
                      <span className="text-xl">{sc.emoji}</span>
                      <span className={`text-sm font-semibold ${isOpen ? "text-primary-700" : "text-slate-700"}`}>
                        {sc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={sc.count > 0 ? "info" : "warning"} size="sm">
                        {sc.count} ta savol
                      </Badge>
                      {sc.count > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBySubject(sc.subjectId);
                          }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </button>

                  {/* Accordion body */}
                  {isOpen && sc.count > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-primary-100 pl-4">
                      {data?.loading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                        </div>
                      ) : data?.questions.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4 text-center">Savollar topilmadi</p>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {data?.questions.map((q) => (
                              <QuestionRow key={q.id} q={q} />
                            ))}
                          </div>
                          {data && (
                            <Pagination
                              currentPage={data.page}
                              total={data.total}
                              totalPages={data.totalPages}
                              onPageChange={(p) => handleAccordionPageChange(sc.subjectId, p)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ========= ODDIY RO'YXAT REJIMI (bitta fan tanlanganda) ========= */}
      {!isAccordionMode && (
        loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : questions.length === 0 ? (
          <Card variant="light" className="text-center py-12">
            <p className="text-slate-500">Savollar topilmadi</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {questions.map((q) => (
                <QuestionRow key={q.id} q={q} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )
      )}
    </div>
  );
}
