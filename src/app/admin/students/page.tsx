"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  Search, Loader2, UserPlus, Upload, ShieldBan, ShieldCheck, Trash2,
  ChevronLeft, ChevronRight, CheckSquare, Square, Edit3, Download,
  Archive, ArchiveRestore, ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
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

  // Filters
  const [regionId, setRegionId] = useState("");
  const [grade, setGrade] = useState("");
  const [sort, setSort] = useState("date");
  const [regions, setRegions] = useState<Region[]>([]);
  const [exporting, setExporting] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [blockStudent, setBlockStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkActionType | null>(null);

  // Load regions
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
      const data = await res.json();
      if (!data.students || data.students.length === 0) {
        toast.error("Export uchun ma'lumot yo'q");
        return;
      }
      const ws = XLSX.utils.json_to_sheet(data.students);
      ws["!cols"] = [
        { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 8 },
        { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 12 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "O'quvchilar");
      XLSX.writeFile(wb, `oquvchilar_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`${data.total} ta o'quvchi eksport qilindi`);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">O&apos;quvchilar</h1>
          <p className="text-sm text-slate-400 mt-1">Jami: {total} ta</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={handleExport} loading={exporting} icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="secondary" onClick={() => router.push("/admin/students/import")} icon={<Upload className="w-4 h-4" />}>
            Import
          </Button>
          <Button variant="blue" onClick={() => setShowAddModal(true)} icon={<UserPlus className="w-4 h-4" />}>
            Qo&apos;shish
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
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

        {/* Status Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                status === tab.key
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <Card variant="light" className="p-3 flex flex-wrap items-center gap-3">
          <Badge variant="info">{selectedIds.size} ta tanlandi</Badge>
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

      {/* Students List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : students.length === 0 ? (
        <Card variant="light" className="p-12 text-center">
          <p className="text-slate-400">O&apos;quvchilar topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-2 px-1">
            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary-600 transition-colors">
              {selectedIds.size === students.length ? (
                <CheckSquare className="w-5 h-5 text-primary-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm text-slate-400">Barchasini tanlash</span>
          </div>

          {students.map((s) => (
            <Card key={s.id} variant="light" className={`p-4 ${s.isArchived ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button onClick={() => toggleSelect(s.id)} className="mt-1 text-slate-400 hover:text-primary-600 transition-colors shrink-0">
                  {selectedIds.has(s.id) ? (
                    <CheckSquare className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <button
                      onClick={() => router.push(`/admin/students/${s.id}`)}
                      className="font-semibold text-slate-800 hover:text-primary-600 transition-colors text-left"
                    >
                      {s.firstName} {s.lastName}
                    </button>
                    {s.isBlocked && (
                      <Badge variant="error" title={s.blockedReason || undefined}>
                        Bloklangan
                      </Badge>
                    )}
                    {s.isArchived && <Badge variant="warning">Arxivlangan</Badge>}
                  </div>
                  <p className="text-sm text-slate-400">
                    <span className="font-mono">{s.phone}</span> &middot; {s.region?.name || "—"} &middot; {s.schoolName} &middot; {s.grade}-sinf
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {s.subjects.map((sub) => (
                      <Badge key={sub.subject.name} variant="default">
                        {sub.subject.emoji} {sub.subject.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {new Date(s.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm text-slate-400 hidden sm:block">{s._count.testAttempts} test</span>
                  <Button variant="ghost" size="sm" onClick={() => setEditStudent(s)} title="Tahrirlash">
                    <Edit3 className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBlockStudent(s)}
                    title={s.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                  >
                    {s.isBlocked ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldBan className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteStudent(s)} title="O'chirish">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
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
