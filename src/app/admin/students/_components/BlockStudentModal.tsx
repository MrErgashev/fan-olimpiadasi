"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShieldBan, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface BlockStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  student: { id: string; firstName: string; lastName: string; isBlocked: boolean } | null;
}

export function BlockStudentModal({ isOpen, onClose, onDone, student }: BlockStudentModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!student) return null;

  const isBlocking = !student.isBlocked;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBlocked: isBlocking,
          reason: isBlocking ? reason : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
        return;
      }
      toast.success(isBlocking ? "O'quvchi bloklandi" : "O'quvchi blokdan chiqarildi");
      setReason("");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isBlocking ? "O'quvchini bloklash" : "Blokdan chiqarish"} size="sm" theme="light">
      <div className="space-y-4">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span>
          {isBlocking
            ? " — bu o'quvchini bloklashni xohlaysizmi? Bloklangan o'quvchi tizimga kira olmaydi."
            : " — bu o'quvchini blokdan chiqarmoqchimisiz?"
          }
        </p>

        {isBlocking && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Sabab <span className="text-slate-400">(ixtiyoriy)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bloklash sababini yozing..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant={isBlocking ? "danger" : "blue"}
            onClick={handleSubmit}
            loading={loading}
            icon={isBlocking ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            className="flex-1"
          >
            {isBlocking ? "Bloklash" : "Blokdan chiqarish"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
