"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { AlertTriangle, Trash2, Users, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  test: {
    id: string;
    name: string;
    totalQuestions: number;
    durationMinutes: number;
    subject: { name: string; emoji: string };
    _count: { testAttempts: number };
  } | null;
}

export function DeleteTestModal({ isOpen, onClose, onDone, test }: DeleteTestModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const isConfirmed = useMemo(() => {
    return confirmName.trim().toLowerCase() === test?.name.trim().toLowerCase();
  }, [confirmName, test]);

  if (!test) return null;

  const handleClose = () => {
    setConfirmName("");
    onClose();
  };

  const handleDelete = async () => {
    if (!isConfirmed) {
      toast.error("Tasdiqlash uchun test nomini to'g'ri yozing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tests/${test.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Xatolik");
        return;
      }

      const deletedAttempts = Number(data.deletedAttempts || 0);
      toast.success(
        deletedAttempts > 0
          ? `Test va ${deletedAttempts} ta urinish o'chirildi`
          : "Test o'chirildi"
      );
      setConfirmName("");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Testni o'chirish"
      size="md"
      theme="light"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span>{test.subject.emoji}</span>
            <p className="font-semibold text-slate-800">{test.name}</p>
          </div>
          <p className="text-sm text-slate-500">{test.subject.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-lg font-bold font-mono text-slate-700">{test.totalQuestions}</p>
            <p className="text-xs text-slate-400">Savol</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-lg font-bold font-mono text-slate-700">{test.durationMinutes}</p>
            <p className="text-xs text-slate-400">Daqiqa</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-lg font-bold font-mono text-slate-700">{test._count.testAttempts}</p>
            <p className="text-xs text-slate-400">Urinish</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="space-y-1 text-sm text-red-700">
            <p>Bu amal testni butunlay o&apos;chiradi va qaytarib bo&apos;lmaydi.</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="warning">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                {test._count.testAttempts} ta urinish
              </Badge>
              <Badge variant="info">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Natijalar ham o&apos;chadi
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-600">
            Tasdiqlash uchun <span className="font-semibold text-red-600">{test.name}</span> nomini yozing:
          </p>
          <Input
            variant="light"
            value={confirmName}
            placeholder={test.name}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={!isConfirmed}
            icon={<Trash2 className="h-4 w-4" />}
            className="flex-1"
          >
            O&apos;chirish
          </Button>
        </div>
      </div>
    </Modal>
  );
}
