"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Edit3, ShieldBan, ShieldCheck, Trash2, KeyRound,
  Loader2, Phone, School, MapPin, Calendar, Trophy, Shield,
  Clock, RefreshCw, Copy, Eye, EyeOff, ArchiveRestore,
} from "lucide-react";
import toast from "react-hot-toast";
import { EditStudentModal } from "../_components/EditStudentModal";
import { BlockStudentModal } from "../_components/BlockStudentModal";
import { DeleteStudentModal } from "../_components/DeleteStudentModal";

interface StudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  grade: number;
  regionId: string | null;
  districtId: string | null;
  isBlocked: boolean;
  isArchived: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  blockedUntil: string | null;
  archivedAt: string | null;
  createdAt: string;
  region: { name: string } | null;
  district: { name: string } | null;
  subjects: { subject: { id: string; name: string; emoji: string; slug: string } }[];
  testAttempts: {
    id: string;
    startedAt: string;
    finishedAt: string | null;
    isSubmitted: boolean;
    totalScore: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    test: { name: string; subject: { name: string; emoji: string } };
  }[];
  blockHistory: {
    id: string;
    action: string;
    reason: string | null;
    duration: string | null;
    createdAt: string;
  }[];
  securityLogs: {
    id: string;
    eventType: string;
    createdAt: string;
    details: Record<string, unknown> | null;
  }[];
  _count: { testAttempts: number; subjects: number; securityLogs: number };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Password reset
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modals
  const [showEdit, setShowEdit] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${id}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik");
        router.push("/admin/students");
        return;
      }
      setStudent(data.student);
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResetPassword = async () => {
    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/students/${id}/reset-password`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik");
        return;
      }
      setNewPassword(data.password);
      setShowPassword(true);
      toast.success("Parol yangilandi");
    } catch {
      toast.error("Server xatosi");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleUnarchive = async () => {
    try {
      const res = await fetch(`/api/admin/students/${id}/archive`, { method: "PATCH" });
      if (!res.ok) {
        toast.error("Xatolik");
        return;
      }
      toast.success("Arxivdan chiqarildi");
      fetchStudent();
    } catch {
      toast.error("Server xatosi");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!student) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("uz-UZ", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/students")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-slate-800">
              {student.firstName} {student.lastName}
            </h1>
            {student.isBlocked && <Badge variant="error">Bloklangan</Badge>}
            {student.isArchived && <Badge variant="warning">Arxivlangan</Badge>}
            {!student.isBlocked && !student.isArchived && <Badge variant="success">Faol</Badge>}
          </div>
          <p className="text-sm text-slate-400 mt-1">O&apos;quvchi profili</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} icon={<Edit3 className="w-4 h-4" />}>
            Tahrirlash
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBlock(true)}
            icon={student.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
          >
            {student.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
          </Button>
          {student.isArchived && (
            <Button variant="outline" size="sm" onClick={handleUnarchive} icon={<ArchiveRestore className="w-4 h-4" />}>
              Arxivdan chiqarish
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<Trash2 className="w-4 h-4" />}>
            O&apos;chirish
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <Card variant="light" className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Asosiy ma&apos;lumotlar</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-sm text-slate-700">{student.phone}</span>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(student.phone)}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <School className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">{student.schoolName} &middot; {student.grade}-sinf</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">
                {student.region?.name || "—"}{student.district ? `, ${student.district.name}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">Ro&apos;yxatdan o&apos;tgan: {formatDate(student.createdAt)}</span>
            </div>
          </div>

          {/* Subjects */}
          {student.subjects.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Tanlangan fanlar:</p>
              <div className="flex flex-wrap gap-2">
                {student.subjects.map((s) => (
                  <Badge key={s.subject.slug} variant="default">
                    {s.subject.emoji} {s.subject.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Password Reset & Stats */}
        <Card variant="light" className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Parol boshqaruvi</h2>
          {newPassword ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600">Yangi parol:</p>
                  <p className="font-mono text-sm font-semibold text-emerald-800">
                    {showPassword ? newPassword : "********"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(newPassword)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-emerald-600">Parolni yozib oling!</p>
            </div>
          ) : (
            <Button variant="outline" onClick={handleResetPassword} loading={resettingPassword} icon={<RefreshCw className="w-4 h-4" />}>
              Yangi parol generatsiya qilish
            </Button>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold font-mono text-slate-700">{student._count.testAttempts}</p>
              <p className="text-xs text-slate-400">Testlar</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold font-mono text-slate-700">{student._count.subjects}</p>
              <p className="text-xs text-slate-400">Fanlar</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold font-mono text-slate-700">{student._count.securityLogs}</p>
              <p className="text-xs text-slate-400">Loglar</p>
            </div>
          </div>

          {/* Block info */}
          {student.isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm font-medium text-red-700">Bloklangan</p>
              {student.blockedReason && <p className="text-xs text-red-600 mt-1">Sabab: {student.blockedReason}</p>}
              {student.blockedAt && <p className="text-xs text-red-500 mt-1">Sana: {formatDateTime(student.blockedAt)}</p>}
              {student.blockedUntil && (
                <p className="text-xs text-red-500 mt-1">Muddati: {formatDateTime(student.blockedUntil)} gacha</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Test Results */}
      {student.testAttempts.length > 0 && (
        <Card variant="light" className="p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Test natijalari
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {student.testAttempts.map((ta) => (
              <div key={ta.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {ta.test.subject.emoji} {ta.test.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(ta.startedAt)}
                    {ta.isSubmitted ? "" : " — tugallanmagan"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold font-mono text-slate-800">{ta.totalScore.toFixed(1)}</p>
                  <p className="text-xs text-slate-400">
                    <span className="text-emerald-600">{ta.correctCount}</span>
                    {" / "}
                    <span className="text-red-500">{ta.wrongCount}</span>
                    {" / "}
                    <span className="text-slate-400">{ta.unansweredCount}</span>
                  </p>
                </div>
                <Badge variant={ta.isSubmitted ? "success" : "warning"} size="sm">
                  {ta.isSubmitted ? "Topshirilgan" : "Jarayonda"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Block History */}
      {student.blockHistory.length > 0 && (
        <Card variant="light" className="p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Bloklash tarixi
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {student.blockHistory.map((bh) => (
              <div key={bh.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge variant={bh.action === "block" ? "error" : "success"} size="sm">
                  {bh.action === "block" ? "Bloklandi" : "Ochildi"}
                </Badge>
                <div className="flex-1">
                  {bh.reason && <p className="text-sm text-slate-600">{bh.reason}</p>}
                  <p className="text-xs text-slate-400">
                    {formatDateTime(bh.createdAt)}
                    {bh.duration && bh.duration !== "permanent" && ` — ${bh.duration}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Logs */}
      {student.securityLogs.length > 0 && (
        <Card variant="light" className="p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Xavfsizlik loglari (oxirgi 20 ta)
          </h2>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {student.securityLogs.map((sl) => (
              <div key={sl.id} className="flex items-center gap-3 p-2 text-sm">
                <Badge variant="warning" size="sm">{sl.eventType.replace(/_/g, " ")}</Badge>
                <span className="text-xs text-slate-400">{formatDateTime(sl.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modals */}
      <EditStudentModal isOpen={showEdit} onClose={() => setShowEdit(false)} onDone={fetchStudent} student={student} />
      <BlockStudentModal isOpen={showBlock} onClose={() => setShowBlock(false)} onDone={fetchStudent} student={student} />
      <DeleteStudentModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onDone={() => router.push("/admin/students")}
        student={student}
      />
    </div>
  );
}
