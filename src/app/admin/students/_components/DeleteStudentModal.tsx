"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Trash2, AlertTriangle, Archive } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    _count: { testAttempts: number; subjects?: number; securityLogs?: number };
  } | null;
}

export function DeleteStudentModal({ isOpen, onClose, onDone, student }: DeleteStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  if (!student) return null;

  const fullName = `${student.firstName} ${student.lastName}`;
  const hasAttempts = student._count.testAttempts > 0;
  const isConfirmed = confirmName.trim().toLowerCase() === fullName.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) {
      toast.error("Tasdiqlash uchun ismni to'g'ri yozing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
        return;
      }
      toast.success("O'quvchi o'chirildi");
      setConfirmName("");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/archive`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
        return;
      }
      toast.success("O'quvchi arxivlandi");
      setConfirmName("");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setConfirmName(""); onClose(); }} title="O'quvchini o'chirish" size="md" theme="light">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-bold font-mono text-slate-700">{student._count.testAttempts}</p>
            <p className="text-xs text-slate-400">Test natijasi</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-bold font-mono text-slate-700">{student._count.subjects || 0}</p>
            <p className="text-xs text-slate-400">Fan</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-bold font-mono text-slate-700">{student._count.securityLogs || 0}</p>
            <p className="text-xs text-slate-400">Xav. log</p>
          </div>
        </div>

        {hasAttempts && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              Bu o&apos;quvchining <Badge variant="warning">{student._count.testAttempts} ta</Badge> test natijasi bor. O&apos;chirilganda barcha ma&apos;lumotlar yo&apos;qoladi!
            </div>
          </div>
        )}

        {/* Archive option */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Archive className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-700">
              O&apos;chirish o&apos;rniga <strong>arxivlash</strong> mumkin — ma&apos;lumotlar saqlanadi, lekin o&apos;quvchi yashiriladi.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleArchive}
              loading={archiving}
              icon={<Archive className="w-3.5 h-3.5" />}
            >
              Arxivlash
            </Button>
          </div>
        </div>

        {/* Confirm delete */}
        <div>
          <p className="text-sm text-slate-600 mb-2">
            Butunlay o&apos;chirish uchun <span className="font-semibold text-red-600">{fullName}</span> ismini yozing:
          </p>
          <Input
            variant="light"
            placeholder={fullName}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={() => { setConfirmName(""); onClose(); }} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={!isConfirmed}
            icon={<Trash2 className="w-4 h-4" />}
            className="flex-1"
          >
            O&apos;chirish
          </Button>
        </div>
      </div>
    </Modal>
  );
}
