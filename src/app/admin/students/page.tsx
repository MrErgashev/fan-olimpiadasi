"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Search, Loader2, UserPlus, Upload, ShieldBan, ShieldCheck, Trash2,
  ChevronLeft, ChevronRight, CheckSquare, Square, Edit3, Download,
  Archive, ArchiveRestore, ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { AddStudentModal } from "./_components/AddStudentModal";
import { EditStudentModal } from "./_components/EditStudentModal";
import { BlockStudentModal } from "./_components/BlockStudentModal";
import { DeleteStudentModal } from "./_components/DeleteStudentModal";
import { BulkActionModal } from "./_components/BulkActionModal";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  grade: number;
  regionId: string | null;
  districtId: string | null;
  passwordText: string | null;
  isBlocked: boolean;
  isArchived?: boolean;
  blockedReason: string | null;
  createdAt: string;
  region: { name: string } | null;
  subjects: { subject: { id: string; name: string; emoji: string } }[];
  _count: { testAttempts: number; subjects?: number; securityLogs?: number };
}

interface Region {
  id: string;
  name: string;
}

type StatusFilter = "all" | "active" | "blocked" | "archived";
type BulkActionType = "block" | "unblock" | "delete" | "archive" | "unarchive";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [regionId, setRegionId] = useState("");
  const [grade, setGrade] = useState("");
  const [sort, setSort] = useState("date");
  const [regions, setRegions] = useState<Region[]>([]);
  const [exporting, setExporting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [blockStudent, setBlockStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkActionType | null>(null);

  useEffect(() => {
    fetch("/api/admin/regions")
      .then((r) => r.json())
      .then((d) => setRegions(d.regions || []))
      .catch(() => {});
  }, []);

  const fetchStudents = useCallback(async (s?: string, p?: number, st?: StatusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const searchVal = s ?? search;
      const pageVal = p ?? page;
      const statusVal = st ?? status;
      if (searchVal) params.set("search", searchVal);
      if (statusVal !== "all") params.set("status", statusVal);
      if (regionId) params.set("regionId", regionId);
      if (grade) params.set("grade", grade);
      if (sort) params.set("sort", sort);
      params.set("page", String(pageVal));
      const res = await fetch(`/api/admin/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Xatolik");
    } finally {
      setLoading(false);
    }
  }, [search, page, status, regionId, grade, sort]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = () => {
    setPage(1);
    setSelectedIds(new Set());
    fetchStudents(search, 1, status);
  };

  const handleStatusChange = (s: StatusFilter) => {
    setStatus(s);
    setPage(1);
    setSelectedIds(new Set());
    fetchStudents(search, 1, s);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    setSelectedIds(new Set());
    fetchStudents(search, p, status);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  const refresh = () => {
    setSelectedIds(new Set());
    fetchStudents();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (regionId) params.set("regionId", regionId);
      const res = await fetch(`/api/admin/students/export?${params}`);
      if (!res.ok) throw new Error("Export xatosi");
      const blob = await res.blob();
      if (blob.size < 100) {
        toast.error("Export uchun ma'lumot yo'q");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oquvchilar_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("XLSX yuklab olindi");
    } catch {
      toast.error("Export xatosi");
    } finally {
      setExporting(false);
    }
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Barchasi" },
    { key: "active", label: "Faol" },
    { key: "blocked", label: "Bloklangan" },
    { key: "archived", label: "Arxivlangan" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="O'quvchilar" subtitle={`Jami: ${total} ta`}>
        <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting} icon={<Download className="w-4 h-4" />}>
          Export
        </Button>
        <Button variant="secondary" size="sm" onClick={() => router.push("/admin/students/import")} icon={<Upload className="w-4 h-4" />}>
          Import
        </Button>
        <Button variant="blue" size="sm" onClick={() => setShowAddModal(true)} icon={<UserPlus className="w-4 h-4" />}>
          Qo&apos;shish
        </Button>
      </PageHeader>

      {/* Search + Filters toolbar */}
      <Card variant="light" className="rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <Input
              variant="light"
              placeholder="Ism, familiya yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Select
              variant="light"
              placeholder="Viloyat"
              value={regionId}
              onChange={(e) => { setRegionId(e.target.value); setPage(1); }}
              options={[{ value: "", label: "Barcha viloyatlar" }, ...regions.map((r) => ({ value: r.id, label: r.name }))]}
            />
            <Select
              variant="light"
              placeholder="Sinf"
              value={grade}
              onChange={(e) => { setGrade(e.target.value); setPage(1); }}
              options={[{ value: "", label: "Barcha sinflar" }, ...Array.from({ length: 11 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}-sinf` }))]}
            />
            <Button
              variant="ghost"
              onClick={() => setSort(sort === "date" ? "name" : "date")}
              title={sort === "date" ? "Sana bo'yicha" : "Ism bo'yicha"}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusChange(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              status === tab.key
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <Card variant="light" className="rounded-xl p-3 flex flex-wrap items-center gap-3 border-primary-200 bg-primary-50/30">
          <Badge variant="info" size="sm">{selectedIds.size} ta tanlandi</Badge>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setBulkAction("block")} icon={<ShieldBan className="w-3.5 h-3.5" />}>
              Bloklash
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBulkAction("unblock")} icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Blokdan chiqarish
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBulkAction("archive")} icon={<Archive className="w-3.5 h-3.5" />}>
              Arxivlash
            </Button>
            {status === "archived" && (
              <Button variant="outline" size="sm" onClick={() => setBulkAction("unarchive")} icon={<ArchiveRestore className="w-3.5 h-3.5" />}>
                Arxivdan chiqarish
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => setBulkAction("delete")} icon={<Trash2 className="w-3.5 h-3.5" />}>
              O&apos;chirish
            </Button>
          </div>
        </Card>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : students.length === 0 ? (
        <Card variant="light" className="rounded-xl p-16 text-center">
          <p className="text-slate-400 text-sm">O&apos;quvchilar topilmadi</p>
          <p className="text-slate-300 text-xs mt-1">Qidiruv yoki filtrlarni o&apos;zgartirib ko&apos;ring</p>
        </Card>
      ) : (
        <Card variant="light" className="rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-3 px-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary-600 transition-colors">
                      {selectedIds.size === students.length ? (
                        <CheckSquare className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ism</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Viloyat</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Maktab</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Sinf</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Fanlar</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Holat</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Testlar</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${s.isArchived ? "opacity-50" : ""} ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelect(s.id)} className="text-slate-400 hover:text-primary-600 transition-colors">
                        {selectedIds.has(s.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Name + Phone */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => router.push(`/admin/students/${s.id}`)}
                        className="font-medium text-slate-800 hover:text-primary-600 transition-colors text-left block"
                      >
                        {s.firstName} {s.lastName}
                      </button>
                      <span className="text-xs text-slate-400 font-mono">{s.phone}</span>
                    </td>

                    {/* Region */}
                    <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">
                      {s.region?.name || "—"}
                    </td>

                    {/* School */}
                    <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell max-w-[160px] truncate">
                      {s.schoolName}
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-4 text-center text-slate-600 font-mono text-xs hidden sm:table-cell">
                      {s.grade}
                    </td>

                    {/* Subjects */}
                    <td className="py-3 px-4 hidden xl:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {s.subjects.slice(0, 3).map((sub) => (
                          <span key={sub.subject.name} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                            {sub.subject.emoji}
                          </span>
                        ))}
                        {s.subjects.length > 3 && (
                          <span className="text-[11px] text-slate-400">+{s.subjects.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      {s.isBlocked ? (
                        <Badge variant="error" size="sm">Bloklangan</Badge>
                      ) : s.isArchived ? (
                        <Badge variant="warning" size="sm">Arxiv</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Faol</Badge>
                      )}
                    </td>

                    {/* Test count */}
                    <td className="py-3 px-4 text-center text-slate-500 font-mono text-xs hidden md:table-cell">
                      {s._count.testAttempts}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => setEditStudent(s)} title="Tahrirlash">
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBlockStudent(s)}
                          title={s.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                        >
                          {s.isBlocked ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldBan className="w-3.5 h-3.5 text-slate-400" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteStudent(s)} title="O'chirish">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {total} ta dan {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} ko&apos;rsatilmoqda
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 font-mono px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddStudentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onCreated={refresh} />
      <EditStudentModal isOpen={!!editStudent} onClose={() => setEditStudent(null)} onDone={refresh} student={editStudent} />
      <BlockStudentModal isOpen={!!blockStudent} onClose={() => setBlockStudent(null)} onDone={refresh} student={blockStudent} />
      <DeleteStudentModal isOpen={!!deleteStudent} onClose={() => setDeleteStudent(null)} onDone={refresh} student={deleteStudent} />
      {bulkAction && (
        <BulkActionModal
          isOpen={!!bulkAction}
          onClose={() => setBulkAction(null)}
          onDone={refresh}
          action={bulkAction}
          count={selectedIds.size}
          studentIds={Array.from(selectedIds)}
        />
      )}
    </div>
  );
}
