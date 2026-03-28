"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  student: { id: string; firstName: string; lastName: string; _count: { testAttempts: number } } | null;
}

export function DeleteStudentModal({ isOpen, onClose, onDone, student }: DeleteStudentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!student) return null;

  const hasAttempts = student._count.testAttempts > 0;

  const handleDelete = async () => {
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
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O'quvchini o'chirish" size="sm" theme="light">
      <div className="space-y-4">
        {hasAttempts && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              Bu o&apos;quvchining <Badge variant="warning">{student._count.testAttempts} ta</Badge> test natijasi bor. O&apos;chirilganda barcha natijalar ham yo&apos;qoladi!
            </div>
          </div>
        )}

        <p className="text-slate-600">
          <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span> ni butunlay o&apos;chirmoqchimisiz?
          <span className="text-red-500 font-medium"> Bu amalni qaytarib bo&apos;lmaydi!</span>
        </p>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
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
