"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
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

  const [subjectCounts, setSubjectCounts] = useState<SubjectCount[]>([]);
  const [openSubjectId, setOpenSubjectId] = useState<string | null>(null);
  const [subjectDataMap, setSubjectDataMap] = useState<Record<string, SubjectData>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []));
    fetchSubjectCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const fromCounts = subjectCounts.find((s) => s.subjectId === sid);
    const fromSubjects = subjects.find((s) => s.id === sid);
    const subjectName = fromCounts?.name || fromSubjects?.name || "";
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
      case "easy": return <Badge variant="success" size="sm">Oson</Badge>;
      case "hard": return <Badge variant="error" size="sm">Qiyin</Badge>;
      default: return <Badge variant="warning" size="sm">O&apos;rta</Badge>;
    }
  };

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: `${s.emoji || ""} ${s.name}`.trim(),
  }));

  const QuestionRow = ({ q }: { q: Question }) => (
    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2">
          <span>{q.subject.emoji}</span>
          <span className="text-xs text-slate-400">{q.subject.name}</span>
        </div>
      </td>
      <td className="py-2.5 px-4">{diffBadge(q.difficulty)}</td>
      <td className="py-2.5 px-4 text-sm text-slate-700 max-w-sm truncate">{q.questionText}</td>
      <td className="py-2.5 px-4">
        <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
          {q.correctAnswer}
        </span>
      </td>
      <td className="py-2.5 px-4">
        <div className="flex items-center justify-end gap-0.5">
          <Link href={`/admin/questions/${q.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );

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
      <div className="flex items-center justify-between pt-3 px-4">
        <span className="text-xs text-slate-400">
          {totalItems} ta dan {from}-{to}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600 font-mono">
            {currentPage} / {tp}
          </span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= tp}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Savollar bazasi" subtitle={`Jami: ${isAccordionMode ? totalQuestions : total} ta savol`}>
        <Link href="/admin/questions/import">
          <Button variant="secondary" size="sm"><Upload className="w-4 h-4 mr-2" /> Import</Button>
        </Link>
        <Link href="/admin/questions/new">
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Yangi savol</Button>
        </Link>
      </PageHeader>

      {/* Filter & Search */}
      <Card variant="light" className="rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-56">
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
            <Button variant="danger" size="sm" onClick={() => handleDeleteBySubject()}>
              <Trash2 className="w-4 h-4 mr-1" />
              Hammasini o&apos;chirish
            </Button>
          )}
        </div>
      </Card>

      {/* ACCORDION REJIMI */}
      {isAccordionMode && (
        loadingCounts ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : subjectCounts.length === 0 ? (
          <Card variant="light" className="rounded-xl text-center py-16">
            <p className="text-slate-400 text-sm">Fanlar topilmadi</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {subjectCounts.map((sc) => {
              const isOpen = openSubjectId === sc.subjectId;
              const data = subjectDataMap[sc.subjectId];

              return (
                <Card key={sc.subjectId} variant="light" className="rounded-xl overflow-hidden">
                  {/* Accordion header */}
                  <button
                    onClick={() => sc.count > 0 && toggleAccordion(sc.subjectId)}
                    className={`w-full flex items-center justify-between p-4 transition-all ${
                      isOpen
                        ? "bg-primary-50/50 border-b border-primary-100"
                        : sc.count > 0
                        ? "hover:bg-slate-50"
                        : "opacity-50 cursor-default"
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
                      <span className="text-lg">{sc.emoji}</span>
                      <span className={`text-sm font-semibold ${isOpen ? "text-primary-700" : "text-slate-700"}`}>
                        {sc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={sc.count > 0 ? "info" : "default"} size="sm">
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
                    <div className="pb-3">
                      {data?.loading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                        </div>
                      ) : data?.questions.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center">Savollar topilmadi</p>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-400">Fan</th>
                                  <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-400">Qiyinlik</th>
                                  <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-400">Savol matni</th>
                                  <th className="text-left py-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-400">Javob</th>
                                  <th className="text-right py-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-400">Amallar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data?.questions.map((q) => (
                                  <QuestionRow key={q.id} q={q} />
                                ))}
                              </tbody>
                            </table>
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
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* ODDIY RO'YXAT REJIMI */}
      {!isAccordionMode && (
        loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : questions.length === 0 ? (
          <Card variant="light" className="rounded-xl text-center py-16">
            <p className="text-slate-400 text-sm">Savollar topilmadi</p>
          </Card>
        ) : (
          <>
            <Card variant="light" className="rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Fan</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Qiyinlik</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Savol matni</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Javob</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q) => (
                      <QuestionRow key={q.id} q={q} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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
